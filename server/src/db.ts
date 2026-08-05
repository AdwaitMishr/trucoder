import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { config } from "./config";

fs.mkdirSync(config.dataDir, { recursive: true });
const dbPath = path.join(config.dataDir, "trucoder.db");
export const db = new Database(dbPath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Drop legacy single-owner tables from the earlier version of TruCoder.
db.exec(`DROP TABLE IF EXISTS problem_progress; DROP TABLE IF EXISTS submissions;`);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token_hash TEXT UNIQUE NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS progress (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id TEXT NOT NULL,
    lesson_id TEXT NOT NULL,
    solved INTEGER NOT NULL DEFAULT 0,
    attempt_count INTEGER NOT NULL DEFAULT 0,
    last_code TEXT,
    last_language TEXT,
    solved_at TEXT,
    last_attempt_at TEXT,
    PRIMARY KEY (user_id, course_id, lesson_id)
  );

  CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id TEXT NOT NULL,
    lesson_id TEXT NOT NULL,
    language TEXT NOT NULL,
    code TEXT NOT NULL,
    verdict TEXT NOT NULL,
    public_passed INTEGER NOT NULL DEFAULT 0,
    public_total INTEGER NOT NULL DEFAULT 0,
    private_passed INTEGER NOT NULL DEFAULT 0,
    private_total INTEGER NOT NULL DEFAULT 0,
    compile_error TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// ---- users ----
export interface User {
  id: number;
  username: string;
  password_hash: string;
}

export function userByUsername(username: string): User | undefined {
  return db.prepare("SELECT * FROM users WHERE username = ?").get(username) as
    | User
    | undefined;
}

export function userById(id: number): User | undefined {
  return db.prepare("SELECT * FROM users WHERE id = ?").get(id) as
    | User
    | undefined;
}

export function countUsers(): number {
  return (db.prepare("SELECT COUNT(*) AS n FROM users").get() as { n: number }).n;
}

export function createUser(username: string, passwordHash: string): void {
  db.prepare("INSERT INTO users (username, password_hash) VALUES (?, ?)").run(
    username,
    passwordHash
  );
}

// ---- sessions ----
export interface Session {
  id: number;
  token_hash: string;
  user_id: number;
  expires_at: string;
}

export function createSession(userId: number, tokenHash: string, expiresAt: string): void {
  db.prepare(
    "INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)"
  ).run(tokenHash, userId, expiresAt);
}

export function sessionByTokenHash(tokenHash: string): Session | undefined {
  return db.prepare("SELECT * FROM sessions WHERE token_hash = ?").get(tokenHash) as
    | Session
    | undefined;
}

export function deleteSession(tokenHash: string): void {
  db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(tokenHash);
}

// ---- progress ----
export interface ProgressRow {
  user_id: number;
  course_id: string;
  lesson_id: string;
  solved: number;
  attempt_count: number;
  last_code: string | null;
  last_language: string | null;
  solved_at: string | null;
  last_attempt_at: string | null;
}

export function getProgress(
  userId: number,
  courseId: string,
  lessonId: string
): ProgressRow | undefined {
  return db
    .prepare(
      `SELECT * FROM progress WHERE user_id = ? AND course_id = ? AND lesson_id = ?`
    )
    .get(userId, courseId, lessonId) as ProgressRow | undefined;
}

/** Mark a content-only lesson as read (progress solved, no submission row). */
export function markLessonRead(
  userId: number,
  courseId: string,
  lessonId: string
): void {
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO progress
       (user_id, course_id, lesson_id, solved, attempt_count, solved_at, last_attempt_at)
     VALUES (?, ?, ?, 1, 0, ?, ?)
     ON CONFLICT(user_id, course_id, lesson_id) DO UPDATE SET
       solved = 1,
       solved_at = CASE WHEN progress.solved_at IS NULL
                        THEN excluded.solved_at ELSE progress.solved_at END,
       last_attempt_at = excluded.last_attempt_at`
  ).run(userId, courseId, lessonId, now, now);
}

export function recordSubmission(input: {
  userId: number;
  courseId: string;
  lessonId: string;
  language: string;
  code: string;
  verdict: "accepted" | "wrong" | "error" | "timeout";
  publicPassed: number;
  publicTotal: number;
  privatePassed: number;
  privateTotal: number;
  compileError?: string;
}): void {
  db.prepare(
    `INSERT INTO submissions
       (user_id, course_id, lesson_id, language, code, verdict,
        public_passed, public_total, private_passed, private_total, compile_error)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    input.userId,
    input.courseId,
    input.lessonId,
    input.language,
    input.code,
    input.verdict,
    input.publicPassed,
    input.publicTotal,
    input.privatePassed,
    input.privateTotal,
    input.compileError || null
  );

  const now = new Date().toISOString();
  const isSolved = input.verdict === "accepted" ? 1 : 0;

  db.prepare(
    `INSERT INTO progress
       (user_id, course_id, lesson_id, solved, attempt_count, last_code,
        last_language, solved_at, last_attempt_at)
     VALUES (?, ?, ?, ?, 1, ?, ?, ?, ?)
     ON CONFLICT(user_id, course_id, lesson_id) DO UPDATE SET
       solved = MAX(progress.solved, excluded.solved),
       attempt_count = progress.attempt_count + 1,
       last_code = excluded.last_code,
       last_language = excluded.last_language,
       solved_at = CASE WHEN excluded.solved = 1 AND progress.solved_at IS NULL
                        THEN excluded.solved_at ELSE progress.solved_at END,
       last_attempt_at = excluded.last_attempt_at`
  ).run(
    input.userId,
    input.courseId,
    input.lessonId,
    isSolved,
    input.code,
    input.language,
    now,
    now
  );
}
