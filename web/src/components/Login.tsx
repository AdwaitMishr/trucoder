import { useState } from "react";
import { api, ApiError } from "../api";
import type { User } from "../types";

export default function Login({ onLogin }: { onLogin: (user: User) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { user } = await api.login(username.trim(), password);
      onLogin(user);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={submit}>
        <div className="login-brand">trucoder</div>
        <p className="login-sub">a calm place to learn, properly</p>
        <label>
          <span>username</span>
          <input
            autoFocus
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>
        <label>
          <span>password</span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && <div className="form-error">{error}</div>}
        <button type="submit" disabled={busy || !username || !password}>
          {busy ? "signing in…" : "sign in"}
        </button>
      </form>
    </div>
  );
}
