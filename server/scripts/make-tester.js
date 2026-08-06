// One-off: create the shared test user + wipe adith's progress.
// NOTE: the live server runs with DATA_DIR=/home/adith/trucoder/data
// (systemd override) — run with DATA_DIR=<that path> to hit the real db.
// better-sqlite3 may abort at process exit; writes are synchronous and
// committed before the abort, so check output/state with the sqlite3 CLI.
const crypto = require("crypto");
const { createUser, db } = require("../dist/db.js");
const { hashPassword } = require("../dist/auth.js");

const pass = crypto.randomBytes(12).toString("base64url");
const hash = hashPassword(pass);
try {
  createUser("tester", hash);
  console.log("CREATED tester");
} catch (e) {
  if (!/UNIQUE/.test(e.message)) throw e;
  console.log("tester already exists");
}
console.log("TESTER_PASSWORD=" + pass);

const adith = db.prepare("SELECT id FROM users WHERE username = ?").get("adith");
if (adith) {
  const p = db.prepare("DELETE FROM progress WHERE user_id = ?").run(adith.id);
  const s = db.prepare("DELETE FROM submissions WHERE user_id = ?").run(adith.id);
  console.log(`adith progress: ${p.changes} rows, submissions: ${s.changes} rows deleted`);
} else {
  console.log("adith not found");
}

console.log("users:", db.prepare("SELECT username FROM users ORDER BY id").all().map((u) => u.username).join(", "));
