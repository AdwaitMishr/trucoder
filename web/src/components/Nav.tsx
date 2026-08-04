import { useState } from "react";
import { Link } from "react-router-dom";
import { PiTerminal, PiPalette, PiSignOut, PiCheck } from "react-icons/pi";
import { api } from "../api";
import { THEMES, useTheme } from "../theme";
import type { User } from "../types";

export default function Nav({
  user,
  onLogout,
}: {
  user: User;
  onLogout: () => void;
}) {
  const { themeId, setThemeId, theme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <header className="nav">
      <Link to="/" className="brand">
        <span className="brand-mark">
          <PiTerminal size={16} />
        </span>
        trucoder
      </Link>

      <div className="nav-right">
        <span className="nav-user">{user.username}</span>

        <div style={{ position: "relative" }}>
          <button className="ghost" onClick={() => setOpen((o) => !o)} title="theme">
            <PiPalette size={16} />
            {theme.name}
          </button>
          {open && <div className="pop-backdrop" onClick={() => setOpen(false)} />}
          {open && (
            <div className="theme-pop">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  className={`theme-swatch ${t.id === themeId ? "active" : ""}`}
                  onClick={() => {
                    setThemeId(t.id);
                    setOpen(false);
                  }}
                >
                  <span className="swatch-dots">
                    <span style={{ background: t.colors.bg }} />
                    <span style={{ background: t.colors.accent }} />
                  </span>
                  <span className="name">{t.name}</span>
                  {t.id === themeId && <PiCheck size={14} />}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          className="ghost"
          onClick={async () => {
            await api.logout().catch(() => {});
            onLogout();
          }}
        >
          <PiSignOut size={16} />
          sign out
        </button>
      </div>
    </header>
  );
}
