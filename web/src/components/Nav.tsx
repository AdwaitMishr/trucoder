import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PiPalette, PiSignOut, PiCheck, PiGearSix } from "react-icons/pi";
import { api } from "../api";
import { THEMES, useTheme } from "../theme";
import type { User } from "../types";
import Mascot from "./Mascot";
import SettingsModal from "./SettingsModal";

export default function Nav({
  user,
  onLogout,
}: {
  user: User;
  onLogout: () => void;
}) {
  const { themeId, setThemeId, theme } = useTheme();
  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // close the theme picker on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="nav">
      <Link to="/" className="brand">
        <Mascot size={22} />
        <span className="brand-tru">tru</span>
        <span className="brand-coder">coder</span>
      </Link>

      <div className="nav-right">
        <span className="nav-user">{user.username}</span>

        <button
          className="ghost"
          onClick={() => setSettingsOpen(true)}
          title="settings"
        >
          <PiGearSix size={16} />
        </button>

        <div style={{ position: "relative" }}>
          <button
            className="ghost theme-btn"
            onClick={() => setOpen((o) => !o)}
            title="theme"
            aria-expanded={open}
            aria-haspopup="menu"
          >
            <PiPalette size={16} />
            {theme.name}
          </button>
          {open && <div className="pop-backdrop" onClick={() => setOpen(false)} />}
          {open && (
            <div className="theme-pop" role="menu" aria-label="theme picker">
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
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </header>
  );
}
