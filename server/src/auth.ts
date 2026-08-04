import crypto from "crypto";
import { config } from "./config";
import { createSession, deleteSession, sessionByTokenHash, userById } from "./db";

/**
 * Proper authentication: passwords are hashed with scrypt (a strong, built-in
 * KDF — no external dependency), and logins issue opaque random session tokens
 * stored as hashes server-side in an httpOnly cookie. No plaintext secrets are
 * ever stored or transmitted in cookies.
 */

const SCRYPT_KEYLEN = 64;
const SESSION_DAYS = 30;
const SESSION_MS = 1000 * 60 * 60 * 24 * SESSION_DAYS;

// ---- password hashing (scrypt) ----

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, SCRYPT_KEYLEN);
  return `scrypt:${salt.toString("hex")}:${hash.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [algo, saltHex, hashHex] = stored.split(":");
    if (algo !== "scrypt") return false;
    const salt = Buffer.from(saltHex, "hex");
    const expected = Buffer.from(hashHex, "hex");
    const actual = crypto.scryptSync(password, salt, expected.length);
    return crypto.timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

// ---- session tokens ----

export function sha256hex(s: string): string {
  return crypto.createHash("sha256").update(s).digest("hex");
}

export function issueSession(userId: number): string {
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + SESSION_MS).toISOString();
  createSession(userId, sha256hex(token), expires);
  return token;
}

export function revokeSession(token: string): void {
  deleteSession(sha256hex(token));
}

/** Resolve a raw cookie token to a user id, or undefined if invalid/expired. */
export function resolveToken(token: string | undefined): number | undefined {
  if (!token) return undefined;
  const session = sessionByTokenHash(sha256hex(token));
  if (!session) return undefined;
  if (new Date(session.expires_at).getTime() < Date.now()) {
    revokeSession(token);
    return undefined;
  }
  return session.user_id;
}

export function cookieFor(token: string) {
  return {
    cookieName: config.cookieName,
    value: token,
    options: {
      httpOnly: true,
      sameSite: "lax" as const,
      maxAge: SESSION_MS,
      path: "/",
    },
  };
}

export function publicUser(userId: number) {
  const u = userById(userId);
  return u ? { id: u.id, username: u.username } : null;
}
