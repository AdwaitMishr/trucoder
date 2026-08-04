/** Theme definitions, monkeytype-style: each theme is a set of CSS custom
 *  properties. The active theme is applied as `data-theme` on <html> and the
 *  chosen id is persisted in localStorage. */

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
      bg: "#eae8e4", ink: "#3b3833", muted: "#96918a",
      surface: "#f6f4f0", surface2: "#efece6", hairline: "#dbd7d0",
      accent: "#a8821b", accentInk: "#fdfcf9", caret: "#a8821b",
      ok: "#3e7d3e", err: "#b3452f",
    },
  },
  {
    id: "dark",
    name: "dark",
    kind: "dark",
    colors: {
      bg: "#323437", ink: "#d1d0c5", muted: "#7b7f85",
      surface: "#2c2e31", surface2: "#26282b", hairline: "#3a3c40",
      accent: "#e2b714", accentInk: "#2c2e31", caret: "#e2b714",
      ok: "#4fae6a", err: "#ca4754",
    },
  },
  {
    id: "dracula",
    name: "dracula",
    kind: "dark",
    colors: {
      bg: "#282a36", ink: "#f8f8f2", muted: "#6b728c",
      surface: "#21222c", surface2: "#1b1c26", hairline: "#3a3c52",
      accent: "#bd93f9", accentInk: "#1b1c26", caret: "#f8f8f2",
      ok: "#50fa7b", err: "#ff5555",
    },
  },
  {
    id: "forest",
    name: "forest",
    kind: "dark",
    colors: {
      bg: "#17201a", ink: "#d4e0d5", muted: "#6f8774",
      surface: "#141b16", surface2: "#101711", hairline: "#27362b",
      accent: "#8fb573", accentInk: "#11160f", caret: "#a7cf8c",
      ok: "#79b46a", err: "#c36a54",
    },
  },
  {
    id: "ocean",
    name: "ocean",
    kind: "light",
    colors: {
      bg: "#eef2f6", ink: "#23313d", muted: "#7d93a3",
      surface: "#f6f9fb", surface2: "#e7edf2", hairline: "#d3dde6",
      accent: "#2f6f9f", accentInk: "#f4f8fb", caret: "#2f6f9f",
      ok: "#3f8f63", err: "#bf5244",
    },
  },
  {
    id: "olive",
    name: "olive",
    kind: "light",
    colors: {
      bg: "#f1efe6", ink: "#3d3e34", muted: "#979b86",
      surface: "#f7f6ef", surface2: "#eeecdf", hairline: "#dfddd0",
      accent: "#6b7a3c", accentInk: "#f5f4ea", caret: "#6b7a3c",
      ok: "#5e8c4c", err: "#b0483a",
    },
  },
];

export const DEFAULT_THEME = "warm";
export const THEME_KEY = "tc:theme";

export const themeById = (id: string): ThemeDef =>
  THEMES.find((t) => t.id === id) ?? THEMES[0];
