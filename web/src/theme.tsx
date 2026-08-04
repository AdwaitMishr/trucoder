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

  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, themeId);
    } catch {
      /* ignore */
    }
    document.documentElement.setAttribute("data-theme", themeId);
  }, [themeId]);

  const theme = themeById(themeId);
  return <Ctx.Provider value={{ theme, themeId, setThemeId }}>{children}</Ctx.Provider>;
}

export function useTheme(): ThemeCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

export { THEMES };
