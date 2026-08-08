import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import fs from "fs";
import path from "path";
import { config } from "./config";
import { hashPassword, resolveToken } from "./auth";
import { countUsers, createUser } from "./db";
import { scanCourses, watchCourses } from "./courses/loader";
import { preflightSandbox } from "./sandbox";
import { authRouter } from "./routes/auth";
import { coursesRouter } from "./routes/courses";
import { lessonsRouter } from "./routes/lessons";
import { deployRouter } from "./routes/deploy";

const app = express();
app.use(helmet({ contentSecurityPolicy: false })); // Monaco injects styles/workers
// verify hook captures the raw request bytes — the deploy webhook signs the
// exact payload (see routes/deploy.ts), so re-serialization is not an option
app.use(express.json({ limit: "1mb", verify: (req, _res, buf) => { (req as express.Request & { rawBody?: Buffer }).rawBody = buf; } }));
app.use(cookieParser());
app.use(morgan("short"));

// Seed the owner account on first boot (credentials come from env).
if (countUsers() === 0) {
  createUser(config.ownerUsername, hashPassword(config.ownerPassword));
  console.log(`[trucoder] seeded owner user '${config.ownerUsername}'`);
}

// Load courses from disk (agent-authored .mdx content).
scanCourses();
watchCourses();
// Non-fatal: warns in the logs if the sandbox image is missing.
preflightSandbox();

app.use("/api/auth", authRouter);

// GitHub push webhook → auto-deploy. Public but HMAC-gated; must be mounted
// BEFORE the /api session gate (it authenticates via signature, not cookie).
app.use(deployRouter);

// Public health/uptime endpoint.
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "trucoder", time: new Date().toISOString() });
});

// Course assets (images referenced by lesson blocks). Public — they are
// course content, not user data.
app.get("/api/assets/courses/:courseId/:file", (req, res) => {
  const courseId = path.basename(req.params.courseId);
  const file = path.basename(req.params.file);
  res.sendFile(path.join(config.coursesDir, courseId, "assets", file));
});

// Everything else under /api requires a valid session cookie.
app.use("/api", (req, res, next) => {
  const userId = resolveToken(req.cookies?.[config.cookieName]);
  if (!userId) return res.status(401).json({ error: "unauthorized" });
  req.userId = userId;
  next();
});

coursesRouter.use("/:courseId/lessons", lessonsRouter);
app.use("/api/courses", coursesRouter);

// Serve the built frontend (SPA). Locate the build output, which differs
// between host dev (<repo>/web/dist) and container (/app/web).
const webDir = [
  path.join(__dirname, "..", "..", "web", "dist"),
  path.join(__dirname, "..", "web"),
].find((d) => fs.existsSync(path.join(d, "index.html")));
if (webDir) {
  app.use(express.static(webDir));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(webDir, "index.html"));
  });
} else {
  app.get("/", (_req, res) =>
    res.send("TruCoder API is running. Build the frontend (web/dist).")
  );
}

const server = app.listen(config.port, () => {
  console.log(`[trucoder] listening on :${config.port}`);
});

function shutdown() {
  server.close(() => process.exit(0));
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
