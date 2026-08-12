import path from "path";

export const config = {
  port: parseInt(process.env.PORT || "3001", 10),
  cookieName: "trucoder_session",
  // Sessions are opaque DB-backed tokens; no signing secret is involved.
  dataDir: process.env.DATA_DIR || path.join(__dirname, "..", "data"),
  // Owner account seeded on first boot from env.
  ownerUsername: process.env.OWNER_USERNAME || "admin",
  ownerPassword: process.env.OWNER_PASSWORD || "changeme",
  // Set when served over HTTPS (tunnel/reverse proxy) — marks the session
  // cookie Secure so it never travels over plain HTTP.
  secureCookies: process.env.COOKIE_SECURE === "1",
  // Agent-authored course content lives in <repo>/courses by default.
  coursesDir:
    process.env.COURSES_DIR || path.join(__dirname, "..", "..", "courses"),
};
