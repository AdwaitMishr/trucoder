import { Router } from "express";
import { config } from "../config";
import {
  cookieFor,
  issueSession,
  publicUser,
  resolveToken,
  revokeSession,
  verifyPassword,
} from "../auth";
import { userByUsername } from "../db";

export const authRouter = Router();

authRouter.post("/login", (req, res) => {
  const { username, password } = (req.body ?? {}) as {
    username?: unknown;
    password?: unknown;
  };
  if (typeof username !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "username and password required" });
  }
  const user = userByUsername(username);
  if (!user || !verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ error: "invalid credentials" });
  }
  const token = issueSession(user.id);
  const c = cookieFor(token);
  res.cookie(c.cookieName, c.value, c.options);
  res.json({ user: publicUser(user.id) });
});

authRouter.post("/logout", (req, res) => {
  const token = req.cookies?.[config.cookieName];
  if (token) revokeSession(token);
  res.clearCookie(config.cookieName, { path: "/" });
  res.json({ ok: true });
});

authRouter.get("/me", (req, res) => {
  const userId = resolveToken(req.cookies?.[config.cookieName]);
  if (!userId) {
    return res.json({ authenticated: false, user: null });
  }
  res.json({ authenticated: true, user: publicUser(userId) });
});
