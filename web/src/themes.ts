/** Theme definitions, monkeytype-style: each theme is a set of CSS custom
 *  properties. The active theme is applied as `data-theme` on <html> and the
 *  chosen id is persisted in localStorage. These palettes MUST stay in sync
 *  with the `[data-theme="..."]` blocks in styles.css — they also feed the
 *  Monaco editor themes. */

export interface ThemeColors {
  bg: string;
  ink: string;
  muted: string;
  surface: string;
  surface2: string;
  hairline: string;
  accent: string;
  accentInk: string;
  caret: string;
  ok: string;
  err: string;
}

export interface ThemeDef {
  id: string;
  name: string;
  kind: "light" | "dark";
  colors: ThemeColors;
}

export const THEMES: ThemeDef[] = [
  {
    id: "warm",
    name: "warm",
    kind: "light",
    colors: {
      bg: "#f4f3f0", ink: "#1c1b18", muted: "#8a867e",
      surface: "#fbfaf8", surface2: "#efede8", hairline: "#e3e0da",
      accent: "#a8821b", accentInk: "#fdfcf9", caret: "#a8821b",
      ok: "#3e7d3e", err: "#b3452f",
    },
  },
  {
    id: "dark",
    name: "dark",
    kind: "dark",
    colors: {
      bg: "#17181a", ink: "#d7d6d0", muted: "#6f7073",
      surface: "#1e1f21", surface2: "#252628", hairline: "#2e3034",
      accent: "#e2b714", accentInk: "#1e1f21", caret: "#e2b714",
      ok: "#4fae6a", err: "#ca4754",
    },
  },
  {
    id: "dracula",
    name: "dracula",
    kind: "dark",
    colors: {
      bg: "#1e1f2b", ink: "#f5f5f2", muted: "#646a82",
      surface: "#262734", surface2: "#2c2e3d", hairline: "#343647",
      accent: "#bd93f9", accentInk: "#1e1f2b", caret: "#f5f5f2",
      ok: "#50fa7b", err: "#ff5555",
    },
  },
  {
    id: "forest",
    name: "forest",
    kind: "dark",
    colors: {
      bg: "#10160f", ink: "#d8e0d6", muted: "#5f705f",
      surface: "#161d15", surface2: "#1c241b", hairline: "#263226",
      accent: "#8fb573", accentInk: "#10160f", caret: "#a7cf8c",
      ok: "#79b46a", err: "#c36a54",
    },
  },
  {
    id: "ocean",
    name: "ocean",
    kind: "light",
    colors: {
      bg: "#eef1f4", ink: "#1f2a33", muted: "#77899a",
      surface: "#f7f9fb", surface2: "#e8edf1", hairline: "#d8e0e7",
      accent: "#2f6f9f", accentInk: "#f7f9fb", caret: "#2f6f9f",
      ok: "#3f8f63", err: "#bf5244",
    },
  },
  {
    id: "olive",
    name: "olive",
    kind: "light",
    colors: {
      bg: "#f2f0e8", ink: "#3a3a30", muted: "#939483",
      surface: "#f8f7f1", surface2: "#efede3", hairline: "#e0ded1",
      accent: "#6b7a3c", accentInk: "#f8f7f1", caret: "#6b7a3c",
      ok: "#5e8c4c", err: "#b0483a",
    },
  },
];

export const DEFAULT_THEME = "warm";
export const THEME_KEY = "tc:theme";

export const themeById = (id: string): ThemeDef =>
  THEMES.find((t) => t.id === id) ?? THEMES[0];
