// One-off: create the shared test user + wipe the owner's progress.
// NOTE: run with DATA_DIR=<live data dir> to hit the real db.
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

const owner = process.env.OWNER_USERNAME || "admin";
const ownerRow = db.prepare("SELECT id FROM users WHERE username = ?").get(owner);
if (ownerRow) {
  const p = db.prepare("DELETE FROM progress WHERE user_id = ?").run(ownerRow.id);
  const s = db.prepare("DELETE FROM submissions WHERE user_id = ?").run(ownerRow.id);
  console.log(`owner '${owner}' progress: ${p.changes} rows, submissions: ${s.changes} rows deleted`);
} else {
  console.log(`owner '${owner}' not found`);
}

console.log("users:", db.prepare("SELECT username FROM users ORDER BY id").all().map((u) => u.username).join(", "));
