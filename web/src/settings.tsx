import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type FontPreset =
  | "Geist Mono"
  | "Cascadia Code"
  | "JetBrains Mono"
  | "Fira Code"
  | "Consolas";

export interface EditorSettings {
  font: FontPreset;
  fontSize: number;
  ligatures: boolean;
  keyBinding: "standard" | "vim";
  tabSize: 2 | 4 | 8;
  wordWrap: boolean;
  relativeLineNumbers: boolean;
}

/** CSS font stacks per preset — the first face is the one Monaco uses. */
export const FONT_STACKS: Record<FontPreset, string> = {
  "Geist Mono": "'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  "Cascadia Code": "'Cascadia Code', 'Cascadia Mono', Consolas, 'Courier New', monospace",
  "JetBrains Mono": "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
  "Fira Code": "'Fira Code', ui-monospace, SFMono-Regular, Menlo, monospace",
  Consolas: "Consolas, 'Courier New', monospace",
};

export const FONT_PRESETS: FontPreset[] = Object.keys(FONT_STACKS) as FontPreset[];

export const DEFAULT_SETTINGS: EditorSettings = {
  font: "Geist Mono",
  fontSize: 14,
  ligatures: false,
  keyBinding: "standard",
  tabSize: 4,
  wordWrap: false,
  relativeLineNumbers: false,
};

const STORAGE_KEY = "tc:settings";

function loadSettings(): EditorSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<EditorSettings>;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

interface SettingsCtx {
  settings: EditorSettings;
  update: (patch: Partial<EditorSettings>) => void;
  reset: () => void;
}

const Ctx = createContext<SettingsCtx | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<EditorSettings>(loadSettings);

  const update = useCallback((patch: Partial<EditorSettings>) => {
    setSettings((s) => {
      const next = { ...s, ...patch };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* storage full/unavailable — settings still apply for the session */
      }
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(() => ({ settings, update, reset }), [settings, update, reset]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSettings(): SettingsCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSettings must be used inside SettingsProvider");
  return v;
}
