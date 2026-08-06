import { createContext, useContext, useEffect, useState } from "react";
import { DEFAULT_THEME, THEME_KEY, THEMES, themeById, type ThemeDef } from "./themes";

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
    // shadcn `dark:` variant switch — colors still come from data-theme vars.
    document.documentElement.classList.toggle("dark", theme.kind === "dark");
  }, [themeId, theme.kind]);

  return <Ctx.Provider value={{ theme, themeId, setThemeId }}>{children}</Ctx.Provider>;
}

export function useTheme(): ThemeCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

export { THEMES };
