import { createContext, useContext, useEffect, useState } from "react";
import { DEFAULT_THEME, THEME_KEY, THEMES, themeById, type ThemeDef } from "./themes";

/** The mascot chip as an SVG string with hardcoded colors — used for the
 *  favicon, which cannot read CSS variables. Chip = accent, face =
 *  accent-ink (the same contrast contract as the topbar chip). */
function mascotIconSvg(chip: string, face: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect x="2" y="2.5" width="20" height="19" rx="5.5" fill="${chip}"/><g stroke="${face}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M7.3 8.4 L9.7 10.3 L7.3 12.2"/><path d="M16.7 8.4 L14.3 10.3 L16.7 12.2"/><path d="M9.2 15.2 H14.8"/></g></svg>`;
}

function applyFavicon(theme: ThemeDef): void {
  const svg = mascotIconSvg(theme.colors.accent, theme.colors.accentInk);
  const url = `data:image/svg+xml,${encodeURIComponent(svg)}`;
  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.href = url;
}

interface ThemeCtx {
  theme: ThemeDef;
  themeId: string;
  setThemeId: (id: string) => void;
}

const Ctx = createContext<ThemeCtx | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeId] = useState<string>(() => {
    try {
      return localStorage.getItem(THEME_KEY) ?? DEFAULT_THEME;
    } catch {
      return DEFAULT_THEME;
    }
  });
  const theme = themeById(themeId);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, themeId);
    } catch {
      /* ignore */
    }
    document.documentElement.setAttribute("data-theme", themeId);
    applyFavicon(theme);
  }, [themeId, theme]);

  return <Ctx.Provider value={{ theme, themeId, setThemeId }}>{children}</Ctx.Provider>;
}

export function useTheme(): ThemeCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

export { THEMES };
