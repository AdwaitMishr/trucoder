import { useState } from "react";
import { PiTerminal, PiEye, PiEyeSlash } from "react-icons/pi";
import { api, ApiError } from "../api";
import type { User } from "../types";

export default function Login({ onLogin }: { onLogin: (user: User) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
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
        <div className="login-brand">
          <span className="brand-mark">
            <PiTerminal size={18} />
          </span>
          trucoder
        </div>
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
          <span className="pw-wrap">
            <input
              type={showPw ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="pw-toggle"
              onClick={() => setShowPw((s) => !s)}
              title={showPw ? "hide password" : "show password"}
              aria-label={showPw ? "hide password" : "show password"}
            >
              {showPw ? <PiEyeSlash size={16} /> : <PiEye size={16} />}
            </button>
          </span>
        </label>
        {error && <div className="form-error">{error}</div>}
        <button type="submit" disabled={busy || !username || !password}>
          {busy ? "signing in…" : "sign in"}
        </button>
      </form>
    </div>
  );
}
