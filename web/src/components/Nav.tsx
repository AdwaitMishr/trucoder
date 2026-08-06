import { useState } from "react";
import { Link } from "react-router-dom";
import { PiTerminal, PiPalette, PiSignOut, PiCheck, PiGearSix } from "react-icons/pi";
import { api } from "../api";
import { THEMES, useTheme } from "../theme";
import type { User } from "../types";
import SettingsModal from "./SettingsModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Nav({
  user,
  onLogout,
}: {
  user: User;
  onLogout: () => void;
}) {
  const { themeId, setThemeId, theme } = useTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);

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

        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="ghost"
                onClick={() => setSettingsOpen(true)}
                title="settings"
              >
                <PiGearSix size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent>settings</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DropdownMenu>
          <DropdownMenuTrigger className="ghost" title="theme">
            <PiPalette size={16} />
            {theme.name}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="theme-menu">
            {THEMES.map((t) => (
              <DropdownMenuItem
                key={t.id}
                className="theme-swatch"
                onSelect={() => setThemeId(t.id)}
              >
                <span className="swatch-dots">
                  <span style={{ background: t.colors.bg }} />
                  <span style={{ background: t.colors.accent }} />
                </span>
                <span className="name">{t.name}</span>
                {t.id === themeId && <PiCheck size={14} />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="ghost"
                onClick={async () => {
                  await api.logout().catch(() => {});
                  onLogout();
                }}
                title="sign out"
              >
                <PiSignOut size={16} />
                sign out
              </button>
            </TooltipTrigger>
            <TooltipContent>sign out</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </header>
  );
}
