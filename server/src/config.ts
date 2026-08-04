import path from "path";

export const config = {
  port: parseInt(process.env.PORT || "3001", 10),
  sessionSecret: process.env.SESSION_SECRET || "trucoder-dev-secret-change-me",
  cookieName: "trucoder_session",
  dataDir: process.env.DATA_DIR || path.join(__dirname, "..", "data"),
  // Owner account seeded on first boot from env.
  ownerUsername: process.env.OWNER_USERNAME || "adith",
  ownerPassword: process.env.OWNER_PASSWORD || "changeme",
  // Agent-authored course content lives in <repo>/courses by default.
  coursesDir:
    process.env.COURSES_DIR || path.join(__dirname, "..", "..", "courses"),
};
