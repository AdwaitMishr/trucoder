import crypto from "crypto";
import express from "express";
import fs from "fs";
import path from "path";

// GitHub push webhook → auto-deploy. The endpoint is public but HMAC-gated:
// only GitHub (holding DEPLOY_SECRET) can trigger a deploy, and only pushes
// to main are accepted. The app container cannot run host-side deploys (no
// sudo, no systemd), so it writes a trigger file that is bind-mounted into
// the repo (.deploy-trigger). A systemd path unit on the host
// (trucoder-deploy.path) notices the change and runs deploy.sh THERE —
// outside the container, so the container swap can never kill the deploy.
const DEPLOY_SECRET = process.env.DEPLOY_SECRET ?? "";
const REPO_DIR = process.env.DEPLOY_DIR ?? "/app";
const DEPLOY_LOG = path.join(REPO_DIR, "deploy.log");
const DEPLOY_TRIGGER = path.join(REPO_DIR, ".deploy-trigger");

function log(msg: string) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  try {
    fs.appendFileSync(DEPLOY_LOG, line);
  } catch {
    /* deploy.log unwritable — still surface to server log */
  }
  console.log(line.trim());
}

function sigMatches(header: string | undefined, secret: string, raw: Buffer): boolean {
  if (!header || !header.startsWith("sha256=")) return false;
  const got = header.slice(7);
  if (!/^[0-9a-f]{64}$/.test(got)) return false;
  const want = crypto.createHmac("sha256", secret).update(raw).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(got, "hex"), Buffer.from(want, "hex"));
}

export const deployRouter = express.Router();

// Raw body capture is REQUIRED: GitHub signs the exact bytes it sends, and
// re-serializing parsed JSON (key order / spacing) would break the HMAC.
// The global express.json middleware (index.ts) stores the raw bytes in
// req.rawBody via its verify hook — always present for application/json.
deployRouter.post("/_deploy", (req, res) => {
  const event = req.headers["x-github-event"] as string | undefined;
  const raw = (req as express.Request & { rawBody?: Buffer }).rawBody;
  if (!DEPLOY_SECRET || !raw || !sigMatches(req.headers["x-hub-signature-256"] as string | undefined, DEPLOY_SECRET, raw)) {
    log(`webhook rejected (event=${event ?? "?"}) — bad or missing signature`);
    return res.status(401).json({ error: "unauthorized" });
  }
    let payload: { ref?: string; after?: string };
    try {
      payload = JSON.parse(raw.toString("utf8"));
    } catch {
      return res.status(400).json({ error: "invalid json" });
    }
    if (event !== "push" || payload.ref !== "refs/heads/main") {
      log(`webhook ignored event=${event} ref=${payload.ref ?? "?"}`);
      return res.status(200).json({ ignored: true });
    }
    const head = (payload.after ?? "unknown").slice(0, 7);
    log(`webhook accepted push ${head} — writing deploy trigger`);
    try {
      fs.writeFileSync(DEPLOY_TRIGGER, `${payload.after ?? ""}\n`);
    } catch (err) {
      log(`deploy TRIGGER WRITE FAILED: ${(err as Error).message}`);
      return res.status(500).json({ error: "trigger write failed" });
    }
    res.status(202).json({ accepted: true, head });
  }
);
