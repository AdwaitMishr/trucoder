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
    id: "frost",
    name: "frost",
    kind: "dark",
    colors: {
      bg: "#0d1520", ink: "#dbe7f5", muted: "#7d8fa6",
      surface: "#131e2c", surface2: "#1a2838", hairline: "#24344a",
      accent: "#7cc0ff", accentInk: "#0d1520", caret: "#7cc0ff",
      ok: "#5fbf8f", err: "#e0656f",
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
    id: "catppuccin",
    name: "catppuccin",
    kind: "dark",
    colors: {
      bg: "#1e1e2e", ink: "#cdd6f4", muted: "#7f849c",
      surface: "#252537", surface2: "#2c2c3e", hairline: "#323246",
      accent: "#cba6f7", accentInk: "#1e1e2e", caret: "#f2cdcd",
      ok: "#a6e3a1", err: "#f38ba8",
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
  {
    id: "dollar",
    name: "dollar",
    kind: "light",
    colors: {
      bg: "#e4e4d4", ink: "#555a56", muted: "#8a9b69",
      surface: "#ebebdc", surface2: "#dcdccb", hairline: "#d2d2c2",
      accent: "#6b886b", accentInk: "#f6f5ec", caret: "#424643",
      ok: "#4c7d4c", err: "#d60000",
    },
  },
  {
    id: "modern-dolch-light",
    name: "modern dolch light",
    kind: "light",
    colors: {
      bg: "#e4e5e7", ink: "#26282c", muted: "#8a8d93",
      surface: "#ececef", surface2: "#dadbde", hairline: "#c9cacd",
      accent: "#2ea697", accentInk: "#f4fbfa", caret: "#2ea697",
      ok: "#3f8f63", err: "#c14e63",
    },
  },  {
    id: "8008", name: "8008", kind: "dark",
    colors: {
      bg: "#333a45", ink: "#e9ecf0", muted: "#939eae",
      surface: "#2e343d", surface2: "#303741", hairline: "#68717f",
      accent: "#f44c7f", accentInk: "#333a45", caret: "#f44c7f",
      ok: "#4ead6e", err: "#da3333",
    },
  },
  {
    id: "80s_after_dark", name: "80s_after_dark", kind: "dark",
    colors: {
      bg: "#1b1d36", ink: "#e1e7ec", muted: "#99d6ea",
      surface: "#17182c", surface2: "#191a31", hairline: "#608399",
      accent: "#fca6d1", accentInk: "#1b1d36", caret: "#99d6ea",
      ok: "#4ead6e", err: "#fffb85",
    },
  },
  {
    id: "9009", name: "9009", kind: "light",
    colors: {
      bg: "#eeebe2", ink: "#080909", muted: "#99947f",
      surface: "#d3cfc1", surface2: "#e0ddd2", hairline: "#bfbbac",
      accent: "#080909", accentInk: "#eeebe2", caret: "#7fa480",
      ok: "#2c613d", err: "#c87e74",
    },
  },
  {
    id: "aether", name: "aether", kind: "dark",
    colors: {
      bg: "#101820", ink: "#eedaea", muted: "#cf6bdd",
      surface: "#292136", surface2: "#1c1c2b", hairline: "#794688",
      accent: "#eedaea", accentInk: "#101820", caret: "#eedaea",
      ok: "#4ead6e", err: "#ff5253",
    },
  },
  {
    id: "alduin", name: "alduin", kind: "dark",
    colors: {
      bg: "#1c1c1c", ink: "#f5f3ed", muted: "#444444",
      surface: "#242424", surface2: "#202020", hairline: "#323232",
      accent: "#dfd7af", accentInk: "#1c1c1c", caret: "#e3e3e3",
      ok: "#4ead6e", err: "#af5f5f",
    },
  },
  {
    id: "alpine", name: "alpine", kind: "dark",
    colors: {
      bg: "#6c687f", ink: "#ffffff", muted: "#9994b8",
      surface: "#77738c", surface2: "#726e86", hairline: "#85809e",
      accent: "#ffffff", accentInk: "#6c687f", caret: "#585568",
      ok: "#4ead6e", err: "#e32b2b",
    },
  },
  {
    id: "anti_hero", name: "anti_hero", kind: "dark",
    colors: {
      bg: "#00002e", ink: "#f1deef", muted: "#ff3d8b",
      surface: "#060548", surface2: "#03023b", hairline: "#8c2261",
      accent: "#ffadad", accentInk: "#00002e", caret: "#ffffff",
      ok: "#4ead6e", err: "#8fecff",
    },
  },
  {
    id: "arch", name: "arch", kind: "dark",
    colors: {
      bg: "#0c0d11", ink: "#f6f5f5", muted: "#454864",
      surface: "#171a25", surface2: "#12141b", hairline: "#2b2d3f",
      accent: "#7ebab5", accentInk: "#0c0d11", caret: "#7ebab5",
      ok: "#4ead6e", err: "#ff4754",
    },
  },
  {
    id: "aurora", name: "aurora", kind: "dark",
    colors: {
      bg: "#011926", ink: "#ffffff", muted: "#245c69",
      surface: "#000c13", surface2: "#00121c", hairline: "#143e4b",
      accent: "#00e980", accentInk: "#011926", caret: "#00e980",
      ok: "#4ead6e", err: "#b94da1",
    },
  },
  {
    id: "beach", name: "beach", kind: "light",
    colors: {
      bg: "#ffeead", ink: "#5b7869", muted: "#ffcc5c",
      surface: "#f7dc8f", surface2: "#fbe59e", hairline: "#ffdb80",
      accent: "#96ceb4", accentInk: "#ffeead", caret: "#ffcc5c",
      ok: "#2c613d", err: "#ff6f69",
    },
  },
  {
    id: "bento", name: "bento", kind: "dark",
    colors: {
      bg: "#2d394d", ink: "#fffaf8", muted: "#4a768d",
      surface: "#263041", surface2: "#2a3447", hairline: "#3d5b70",
      accent: "#ff7a90", accentInk: "#2d394d", caret: "#ff7a90",
      ok: "#4ead6e", err: "#ee2a3a",
    },
  },
  {
    id: "bingsu", name: "bingsu", kind: "light",
    colors: {
      bg: "#b8a7aa", ink: "#ebe6ea", muted: "#48373d",
      surface: "#ab989e", surface2: "#b2a0a4", hairline: "#7a696e",
      accent: "#83616e", accentInk: "#b8a7aa", caret: "#ebe6ea",
      ok: "#2c613d", err: "#921341",
    },
  },
  {
    id: "bliss", name: "bliss", kind: "dark",
    colors: {
      bg: "#262727", ink: "#ffffff", muted: "#665957",
      surface: "#343231", surface2: "#2d2c2c", hairline: "#494241",
      accent: "#f0d3c9", accentInk: "#262727", caret: "#f0d3c9",
      ok: "#4ead6e", err: "#bd4141",
    },
  },
  {
    id: "blue_dolphin", name: "blue_dolphin", kind: "dark",
    colors: {
      bg: "#003950", ink: "#82eaff", muted: "#00e4ff",
      surface: "#014961", surface2: "#004158", hairline: "#0097b0",
      accent: "#ffcefb", accentInk: "#003950", caret: "#00bcd4",
      ok: "#4ead6e", err: "#ffbde6",
    },
  },
  {
    id: "blueberry_dark", name: "blueberry_dark", kind: "dark",
    colors: {
      bg: "#212b42", ink: "#91b4d5", muted: "#5c7da5",
      surface: "#1b2334", surface2: "#1e273b", hairline: "#415878",
      accent: "#add7ff", accentInk: "#212b42", caret: "#962f7e",
      ok: "#4ead6e", err: "#df4576",
    },
  },
  {
    id: "blueberry_light", name: "blueberry_light", kind: "light",
    colors: {
      bg: "#dae0f5", ink: "#678198", muted: "#92a4be",
      surface: "#c1c7df", surface2: "#ced4ea", hairline: "#b2bfd7",
      accent: "#506477", accentInk: "#dae0f5", caret: "#df4576",
      ok: "#2c613d", err: "#df4576",
    },
  },
  {
    id: "botanical", name: "botanical", kind: "light",
    colors: {
      bg: "#7b9c98", ink: "#eaf1f3", muted: "#495755",
      surface: "#72908d", surface2: "#769692", hairline: "#607673",
      accent: "#eaf1f3", accentInk: "#7b9c98", caret: "#abc6c4",
      ok: "#2c613d", err: "#f6c9b4",
    },
  },
  {
    id: "bouquet", name: "bouquet", kind: "dark",
    colors: {
      bg: "#173f35", ink: "#e9e0d2", muted: "#408e7b",
      surface: "#1f4e43", surface2: "#1b463c", hairline: "#2e6a5c",
      accent: "#eaa09c", accentInk: "#173f35", caret: "#eaa09c",
      ok: "#4ead6e", err: "#d44729",
    },
  },
  {
    id: "breeze", name: "breeze", kind: "light",
    colors: {
      bg: "#e8d5c4", ink: "#1b4c5e", muted: "#3a98b9",
      surface: "#f6e6da", surface2: "#efdecf", hairline: "#88b3be",
      accent: "#7d67a9", accentInk: "#e8d5c4", caret: "#7d67a9",
      ok: "#2c613d", err: "#7d67a9",
    },
  },
  {
    id: "bushido", name: "bushido", kind: "dark",
    colors: {
      bg: "#242933", ink: "#f6f0e9", muted: "#596172",
      surface: "#1c222d", surface2: "#202630", hairline: "#414856",
      accent: "#ec4c56", accentInk: "#242933", caret: "#ec4c56",
      ok: "#4ead6e", err: "#ec4c56",
    },
  },
  {
    id: "cafe", name: "cafe", kind: "light",
    colors: {
      bg: "#ceb18d", ink: "#14120f", muted: "#d4d2d1",
      surface: "#bba180", surface2: "#c4a986", hairline: "#d1c3b2",
      accent: "#14120f", accentInk: "#ceb18d", caret: "#14120f",
      ok: "#2c613d", err: "#c82931",
    },
  },
  {
    id: "camping", name: "camping", kind: "light",
    colors: {
      bg: "#faf1e4", ink: "#3c403b", muted: "#c2b8aa",
      surface: "#e7dccb", surface2: "#f0e6d8", hairline: "#dbd2c4",
      accent: "#618c56", accentInk: "#faf1e4", caret: "#618c56",
      ok: "#2c613d", err: "#ad4f4e",
    },
  },
  {
    id: "carbon", name: "carbon", kind: "dark",
    colors: {
      bg: "#313131", ink: "#f5e6c8", muted: "#616161",
      surface: "#2b2b2b", surface2: "#2e2e2e", hairline: "#4b4b4b",
      accent: "#f66e0d", accentInk: "#313131", caret: "#f66e0d",
      ok: "#4ead6e", err: "#e72d2d",
    },
  },
  {
    id: "chaos_theory", name: "chaos_theory", kind: "dark",
    colors: {
      bg: "#141221", ink: "#dde5ed", muted: "#676e8a",
      surface: "#1e1d2f", surface2: "#191828", hairline: "#42455b",
      accent: "#fd77d7", accentInk: "#141221", caret: "#dde5ed",
      ok: "#4ead6e", err: "#fd77d7",
    },
  },
  {
    id: "cheesecake", name: "cheesecake", kind: "light",
    colors: {
      bg: "#fdf0d5", ink: "#3a3335", muted: "#d91c81",
      surface: "#f3e2bf", surface2: "#f8e9ca", hairline: "#e97ba7",
      accent: "#8e2949", accentInk: "#fdf0d5", caret: "#892948",
      ok: "#2c613d", err: "#5cf074",
    },
  },
  {
    id: "cherry_blossom", name: "cherry_blossom", kind: "dark",
    colors: {
      bg: "#323437", ink: "#d1d0c5", muted: "#787d82",
      surface: "#2d2f31", surface2: "#303234", hairline: "#585c60",
      accent: "#d65ccc", accentInk: "#323437", caret: "#ffffff",
      ok: "#4ead6e", err: "#ca4754",
    },
  },
  {
    id: "comfy", name: "comfy", kind: "dark",
    colors: {
      bg: "#4a5b6e", ink: "#f5efee", muted: "#9ec1cc",
      surface: "#425366", surface2: "#46576a", hairline: "#7893a2",
      accent: "#f8cdc6", accentInk: "#4a5b6e", caret: "#9ec1cc",
      ok: "#4ead6e", err: "#c9465e",
    },
  },
  {
    id: "copper", name: "copper", kind: "dark",
    colors: {
      bg: "#442f29", ink: "#e7e0de", muted: "#7ebab5",
      surface: "#50362e", surface2: "#4a322c", hairline: "#647b76",
      accent: "#b46a55", accentInk: "#442f29", caret: "#c25c42",
      ok: "#4ead6e", err: "#a32424",
    },
  },
  {
    id: "creamsicle", name: "creamsicle", kind: "light",
    colors: {
      bg: "#ff9869", ink: "#fcfcf8", muted: "#ff661f",
      surface: "#fe8954", surface2: "#fe905e", hairline: "#ff7c40",
      accent: "#fcfcf8", accentInk: "#ff9869", caret: "#fcfcf8",
      ok: "#2c613d", err: "#6a0dad",
    },
  },
  {
    id: "cy_red", name: "cy_red", kind: "dark",
    colors: {
      bg: "#6e2626", ink: "#ffaaaa", muted: "#ff6060",
      surface: "#3f1616", surface2: "#561e1e", hairline: "#be4646",
      accent: "#e55050", accentInk: "#6e2626", caret: "#541d1d",
      ok: "#4ead6e", err: "#919fd9",
    },
  },
  {
    id: "cyberspace", name: "cyberspace", kind: "dark",
    colors: {
      bg: "#181c18", ink: "#c2fbe1", muted: "#9578d3",
      surface: "#131613", surface2: "#161916", hairline: "#5d4f7f",
      accent: "#00ce7c", accentInk: "#181c18", caret: "#00ce7c",
      ok: "#4ead6e", err: "#ff5f5f",
    },
  },
  {
    id: "dark_magic_girl", name: "dark_magic_girl", kind: "dark",
    colors: {
      bg: "#091f2c", ink: "#a288d9", muted: "#93e8d3",
      surface: "#071823", surface2: "#081c28", hairline: "#558e88",
      accent: "#f5b1cc", accentInk: "#091f2c", caret: "#a288d9",
      ok: "#4ead6e", err: "#e45c96",
    },
  },
  {
    id: "dark_note", name: "dark_note", kind: "dark",
    colors: {
      bg: "#1f1f1f", ink: "#d2dff4", muted: "#768f95",
      surface: "#141414", surface2: "#1a1a1a", hairline: "#4f5d60",
      accent: "#f2c17b", accentInk: "#1f1f1f", caret: "#e3dce0",
      ok: "#4ead6e", err: "#ff0000",
    },
  },
  {
    id: "darling", name: "darling", kind: "light",
    colors: {
      bg: "#fec8cd", ink: "#ffffff", muted: "#a30000",
      surface: "#f2babd", surface2: "#f8c1c5", hairline: "#cc5a5c",
      accent: "#ffffff", accentInk: "#fec8cd", caret: "#ffffff",
      ok: "#2c613d", err: "#2e7dde",
    },
  },
  {
    id: "deku", name: "deku", kind: "dark",
    colors: {
      bg: "#058b8c", ink: "#f7f2ea", muted: "#255458",
      surface: "#0e7d7e", surface2: "#0a8485", hairline: "#176d6f",
      accent: "#b63530", accentInk: "#058b8c", caret: "#b63530",
      ok: "#4ead6e", err: "#b63530",
    },
  },
  {
    id: "desert_oasis", name: "desert_oasis", kind: "light",
    colors: {
      bg: "#fff2d5", ink: "#332800", muted: "#0061fe",
      surface: "#eddebc", surface2: "#f6e8c8", hairline: "#73a2ec",
      accent: "#d19d01", accentInk: "#fff2d5", caret: "#3a87fe",
      ok: "#2c613d", err: "#76bb40",
    },
  },
  {
    id: "dev", name: "dev", kind: "dark",
    colors: {
      bg: "#1b2028", ink: "#ccccb5", muted: "#4b5975",
      surface: "#151a21", surface2: "#181d24", hairline: "#353f52",
      accent: "#23a9d5", accentInk: "#1b2028", caret: "#4b5975",
      ok: "#4ead6e", err: "#b81b2c",
    },
  },
  {
    id: "diner", name: "diner", kind: "dark",
    colors: {
      bg: "#537997", ink: "#dfdbc8", muted: "#445c7f",
      surface: "#4d6f8b", surface2: "#507491", hairline: "#4b698a",
      accent: "#c3af5b", accentInk: "#537997", caret: "#ad5145",
      ok: "#4ead6e", err: "#ad5145",
    },
  },
  {
    id: "dino", name: "dino", kind: "light",
    colors: {
      bg: "#ffffff", ink: "#1d221f", muted: "#d5d5d5",
      surface: "#cafad8", surface2: "#e4fcec", hairline: "#e8e8e8",
      accent: "#40d672", accentInk: "#ffffff", caret: "#40d672",
      ok: "#2c613d", err: "#ff5f5f",
    },
  },
  {
    id: "discord", name: "discord", kind: "dark",
    colors: {
      bg: "#313338", ink: "#dcdee3", muted: "#565861",
      surface: "#2b2d31", surface2: "#2e3034", hairline: "#45474f",
      accent: "#5a65ea", accentInk: "#313338", caret: "#5a65ea",
      ok: "#4ead6e", err: "#df4f4b",
    },
  },
  {
    id: "dmg", name: "dmg", kind: "light",
    colors: {
      bg: "#dadbdc", ink: "#414141", muted: "#3846b1",
      surface: "#bec1d2", surface2: "#ccced7", hairline: "#8189c4",
      accent: "#ae185e", accentInk: "#dadbdc", caret: "#384693",
      ok: "#2c613d", err: "#ae185e",
    },
  },
  {
    id: "dots", name: "dots", kind: "dark",
    colors: {
      bg: "#121520", ink: "#ffffff", muted: "#676e8a",
      surface: "#1b1e2c", surface2: "#161a26", hairline: "#41465a",
      accent: "#ffffff", accentInk: "#121520", caret: "#ffffff",
      ok: "#4ead6e", err: "#da3333",
    },
  },
  {
    id: "drowning", name: "drowning", kind: "dark",
    colors: {
      bg: "#191826", ink: "#9393a7", muted: "#50688c",
      surface: "#1e1f2f", surface2: "#1c1c2a", hairline: "#37445e",
      accent: "#4a6fb5", accentInk: "#191826", caret: "#4f85e8",
      ok: "#4ead6e", err: "#be555f",
    },
  },
  {
    id: "dualshot", name: "dualshot", kind: "dark",
    colors: {
      bg: "#737373", ink: "#212222", muted: "#aaaaaa",
      surface: "#646464", surface2: "#6c6c6c", hairline: "#919191",
      accent: "#212222", accentInk: "#737373", caret: "#212222",
      ok: "#4ead6e", err: "#c82931",
    },
  },
  {
    id: "earthsong", name: "earthsong", kind: "dark",
    colors: {
      bg: "#292521", ink: "#e6c7a8", muted: "#f5ae2d",
      surface: "#1d1b18", surface2: "#23201c", hairline: "#997028",
      accent: "#509452", accentInk: "#292521", caret: "#1298ba",
      ok: "#4ead6e", err: "#7e2a33",
    },
  },
  {
    id: "everblush", name: "everblush", kind: "dark",
    colors: {
      bg: "#141b1e", ink: "#dadada", muted: "#838887",
      surface: "#232a2d", surface2: "#1c2226", hairline: "#515758",
      accent: "#8ccf7e", accentInk: "#141b1e", caret: "#6cbfbf",
      ok: "#4ead6e", err: "#e57474",
    },
  },
  {
    id: "evil_eye", name: "evil_eye", kind: "dark",
    colors: {
      bg: "#0084c2", ink: "#171718", muted: "#01589f",
      surface: "#0c79be", surface2: "#067ec0", hairline: "#016caf",
      accent: "#f7f2ea", accentInk: "#0084c2", caret: "#f7f2ea",
      ok: "#4ead6e", err: "#ca4754",
    },
  },
  {
    id: "ez_mode", name: "ez_mode", kind: "dark",
    colors: {
      bg: "#0068c6", ink: "#ffffff", muted: "#138bf7",
      surface: "#005bac", surface2: "#0062b9", hairline: "#0a7be1",
      accent: "#fa62d5", accentInk: "#0068c6", caret: "#4ddb47",
      ok: "#4ead6e", err: "#4ddb47",
    },
  },
  {
    id: "fire", name: "fire", kind: "dark",
    colors: {
      bg: "#0f0000", ink: "#ffffff", muted: "#683434",
      surface: "#200a0a", surface2: "#180505", hairline: "#401d1d",
      accent: "#b31313", accentInk: "#0f0000", caret: "#b31313",
      ok: "#4ead6e", err: "#2f3cb6",
    },
  },
  {
    id: "fledgling", name: "fledgling", kind: "dark",
    colors: {
      bg: "#3b363f", ink: "#e6d5d3", muted: "#8e5568",
      surface: "#332e38", surface2: "#37323c", hairline: "#694756",
      accent: "#fc6e83", accentInk: "#3b363f", caret: "#474747",
      ok: "#4ead6e", err: "#f52443",
    },
  },
  {
    id: "fleuriste", name: "fleuriste", kind: "light",
    colors: {
      bg: "#c6b294", ink: "#091914", muted: "#64374d",
      surface: "#b4a389", surface2: "#bdaa8e", hairline: "#906e6d",
      accent: "#405a52", accentInk: "#c6b294", caret: "#8a785b",
      ok: "#2c613d", err: "#990000",
    },
  },
  {
    id: "floret", name: "floret", kind: "dark",
    colors: {
      bg: "#00272c", ink: "#e5e5e5", muted: "#779097",
      surface: "#173033", surface2: "#0c2c30", hairline: "#416167",
      accent: "#ffdd6d", accentInk: "#00272c", caret: "#c3bd40",
      ok: "#4ead6e", err: "#8a4000",
    },
  },
  {
    id: "froyo", name: "froyo", kind: "light",
    colors: {
      bg: "#e1dacb", ink: "#7b7d7d", muted: "#b29c5e",
      surface: "#d3cdc1", surface2: "#dad4c6", hairline: "#c7b88f",
      accent: "#7b7d7d", accentInk: "#e1dacb", caret: "#7b7d7d",
      ok: "#2c613d", err: "#f28578",
    },
  },
  {
    id: "frozen_llama", name: "frozen_llama", kind: "light",
    colors: {
      bg: "#9bf2ea", ink: "#ffffff", muted: "#b690fd",
      surface: "#7fe7dd", surface2: "#8dece4", hairline: "#aabcf4",
      accent: "#6d44a6", accentInk: "#9bf2ea", caret: "#ffffff",
      ok: "#2c613d", err: "#e42629",
    },
  },
  {
    id: "fruit_chew", name: "fruit_chew", kind: "light",
    colors: {
      bg: "#d6d3d6", ink: "#282528", muted: "#b49cb5",
      surface: "#cabfca", surface2: "#d0c9d0", hairline: "#c3b5c4",
      accent: "#5c1e5f", accentInk: "#d6d3d6", caret: "#b92221",
      ok: "#2c613d", err: "#bd2621",
    },
  },
  {
    id: "fundamentals", name: "fundamentals", kind: "dark",
    colors: {
      bg: "#727474", ink: "#131313", muted: "#cac4be",
      surface: "#666868", surface2: "#6c6e6e", hairline: "#a2a09d",
      accent: "#7fa482", accentInk: "#727474", caret: "#196378",
      ok: "#4ead6e", err: "#5e477c",
    },
  },
  {
    id: "future_funk", name: "future_funk", kind: "dark",
    colors: {
      bg: "#2e1a47", ink: "#f7f2ea", muted: "#c18fff",
      surface: "#27173c", surface2: "#2a1842", hairline: "#7f5aac",
      accent: "#f7f2ea", accentInk: "#2e1a47", caret: "#f7f2ea",
      ok: "#4ead6e", err: "#f04e98",
    },
  },
  {
    id: "github", name: "github", kind: "dark",
    colors: {
      bg: "#212830", ink: "#ccdae6", muted: "#788386",
      surface: "#141b23", surface2: "#1a222a", hairline: "#515a5f",
      accent: "#41ce5c", accentInk: "#212830", caret: "#41ce5c",
      ok: "#4ead6e", err: "#c23e3a",
    },
  },
  {
    id: "godspeed", name: "godspeed", kind: "light",
    colors: {
      bg: "#eae4cf", ink: "#646669", muted: "#ada998",
      surface: "#ded9c9", surface2: "#e4decc", hairline: "#c8c4b1",
      accent: "#9abbcd", accentInk: "#eae4cf", caret: "#f4d476",
      ok: "#2c613d", err: "#ca4754",
    },
  },
  {
    id: "graen", name: "graen", kind: "dark",
    colors: {
      bg: "#303c36", ink: "#a59682", muted: "#181d1a",
      surface: "#36453c", surface2: "#334039", hairline: "#232b27",
      accent: "#a59682", accentInk: "#303c36", caret: "#601420",
      ok: "#4ead6e", err: "#601420",
    },
  },
  {
    id: "grand_prix", name: "grand_prix", kind: "dark",
    colors: {
      bg: "#36475c", ink: "#c1c7d7", muted: "#5c6c80",
      surface: "#42536b", surface2: "#3c4d64", hairline: "#4b5b70",
      accent: "#c0d036", accentInk: "#36475c", caret: "#c0d036",
      ok: "#4ead6e", err: "#fc5727",
    },
  },
  {
    id: "grape", name: "grape", kind: "dark",
    colors: {
      bg: "#2c003e", ink: "#ffffff", muted: "#6e225e",
      surface: "#1f002d", surface2: "#260036", hairline: "#501350",
      accent: "#ff8f00", accentInk: "#2c003e", caret: "#ff8f00",
      ok: "#4ead6e", err: "#ff4081",
    },
  },
  {
    id: "gruvbox_dark", name: "gruvbox_dark", kind: "dark",
    colors: {
      bg: "#282828", ink: "#ebdbb2", muted: "#665c54",
      surface: "#212121", surface2: "#242424", hairline: "#4a4540",
      accent: "#d79921", accentInk: "#282828", caret: "#fabd2f",
      ok: "#4ead6e", err: "#fb4934",
    },
  },
  {
    id: "gruvbox_light", name: "gruvbox_light", kind: "light",
    colors: {
      bg: "#fbf1c7", ink: "#3c3836", muted: "#a89984",
      surface: "#daceae", surface2: "#eae0ba", hairline: "#cdc1a2",
      accent: "#689d6a", accentInk: "#fbf1c7", caret: "#689d6a",
      ok: "#2c613d", err: "#cc241d",
    },
  },
  {
    id: "hammerhead", name: "hammerhead", kind: "dark",
    colors: {
      bg: "#030613", ink: "#e2f1f5", muted: "#213c53",
      surface: "#0a1928", surface2: "#06101e", hairline: "#142436",
      accent: "#4fcdb9", accentInk: "#030613", caret: "#4fcdb9",
      ok: "#4ead6e", err: "#e32b2b",
    },
  },
  {
    id: "hanok", name: "hanok", kind: "light",
    colors: {
      bg: "#d8d2c3", ink: "#393b3b", muted: "#8b6f5c",
      surface: "#cdc0af", surface2: "#d2c9b9", hairline: "#ae9c8a",
      accent: "#513a2a", accentInk: "#d8d2c3", caret: "#513a2a",
      ok: "#2c613d", err: "#ca4754",
    },
  },
  {
    id: "hedge", name: "hedge", kind: "dark",
    colors: {
      bg: "#415e31", ink: "#f7f1d6", muted: "#ede5b4",
      surface: "#38502a", surface2: "#3c572e", hairline: "#a0a879",
      accent: "#6a994e", accentInk: "#415e31", caret: "#f2efbb",
      ok: "#4ead6e", err: "#ca3d3f",
    },
  },
  {
    id: "honey", name: "honey", kind: "dark",
    colors: {
      bg: "#f2aa00", ink: "#f3eecb", muted: "#a66b00",
      surface: "#e19e00", surface2: "#eaa400", hairline: "#c88700",
      accent: "#fff546", accentInk: "#f2aa00", caret: "#795200",
      ok: "#4ead6e", err: "#df3333",
    },
  },
  {
    id: "horizon", name: "horizon", kind: "dark",
    colors: {
      bg: "#1c1e26", ink: "#bbbbbb", muted: "#db886f",
      surface: "#17181f", surface2: "#1a1b22", hairline: "#85584e",
      accent: "#c4a88a", accentInk: "#1c1e26", caret: "#bbbbbb",
      ok: "#4ead6e", err: "#d55170",
    },
  },
  {
    id: "husqy", name: "husqy", kind: "dark",
    colors: {
      bg: "#000000", ink: "#ebd7ff", muted: "#972fff",
      surface: "#1e001e", surface2: "#0f000f", hairline: "#531a8c",
      accent: "#c58aff", accentInk: "#000000", caret: "#c58aff",
      ok: "#4ead6e", err: "#da3333",
    },
  },
  {
    id: "iceberg_dark", name: "iceberg_dark", kind: "dark",
    colors: {
      bg: "#161821", ink: "#c6c8d1", muted: "#595e76",
      surface: "#232531", surface2: "#1c1e29", hairline: "#3b3e50",
      accent: "#84a0c6", accentInk: "#161821", caret: "#d2d4de",
      ok: "#4ead6e", err: "#e27878",
    },
  },
  {
    id: "iceberg_light", name: "iceberg_light", kind: "light",
    colors: {
      bg: "#e8e9ec", ink: "#33374c", muted: "#adb1c4",
      surface: "#ccceda", surface2: "#dadce3", hairline: "#c8cad6",
      accent: "#2d539e", accentInk: "#e8e9ec", caret: "#262a3f",
      ok: "#2c613d", err: "#cc517a",
    },
  },
  {
    id: "incognito", name: "incognito", kind: "dark",
    colors: {
      bg: "#0e0e0e", ink: "#c6c6c6", muted: "#555555",
      surface: "#151515", surface2: "#121212", hairline: "#353535",
      accent: "#ff9900", accentInk: "#0e0e0e", caret: "#ff9900",
      ok: "#4ead6e", err: "#e44545",
    },
  },
  {
    id: "ishtar", name: "ishtar", kind: "dark",
    colors: {
      bg: "#202020", ink: "#fae1c3", muted: "#847869",
      surface: "#272727", surface2: "#242424", hairline: "#575048",
      accent: "#91170c", accentInk: "#202020", caret: "#c58940",
      ok: "#4ead6e", err: "#bb1e10",
    },
  },
  {
    id: "iv_clover", name: "iv_clover", kind: "light",
    colors: {
      bg: "#a0a0a0", ink: "#3b2d3b", muted: "#353535",
      surface: "#bebebe", surface2: "#afafaf", hairline: "#656565",
      accent: "#573e40", accentInk: "#a0a0a0", caret: "#8d8d8d",
      ok: "#2c613d", err: "#937173",
    },
  },
  {
    id: "iv_spade", name: "iv_spade", kind: "dark",
    colors: {
      bg: "#0c0c0c", ink: "#d3c2c3", muted: "#404040",
      surface: "#121212", surface2: "#0f0f0f", hairline: "#292929",
      accent: "#b7976a", accentInk: "#0c0c0c", caret: "#bebebe",
      ok: "#4ead6e", err: "#9d7b7d",
    },
  },
  {
    id: "joker", name: "joker", kind: "dark",
    colors: {
      bg: "#1a0e25", ink: "#e9e2f5", muted: "#7554a3",
      surface: "#14081f", surface2: "#170b22", hairline: "#4c346a",
      accent: "#99de1e", accentInk: "#1a0e25", caret: "#99de1e",
      ok: "#4ead6e", err: "#e32b2b",
    },
  },
  {
    id: "laser", name: "laser", kind: "dark",
    colors: {
      bg: "#221b44", ink: "#dbe7e8", muted: "#b82356",
      surface: "#1e173b", surface2: "#201940", hairline: "#741f4e",
      accent: "#009eaf", accentInk: "#221b44", caret: "#009eaf",
      ok: "#4ead6e", err: "#a8d400",
    },
  },
  {
    id: "lavender", name: "lavender", kind: "light",
    colors: {
      bg: "#ada6c2", ink: "#2f2a41", muted: "#e4e3e9",
      surface: "#a19bb9", surface2: "#a7a0be", hairline: "#cbc8d7",
      accent: "#e4e3e9", accentInk: "#ada6c2", caret: "#e4e3e9",
      ok: "#2c613d", err: "#ca4754",
    },
  },
  {
    id: "leather", name: "leather", kind: "dark",
    colors: {
      bg: "#a86948", ink: "#ffe4bc", muted: "#81482b",
      surface: "#9a5f3f", surface2: "#a16444", hairline: "#935738",
      accent: "#ffe4bc", accentInk: "#a86948", caret: "#ef6d49",
      ok: "#4ead6e", err: "#ca4754",
    },
  },
  {
    id: "lil_dragon", name: "lil_dragon", kind: "light",
    colors: {
      bg: "#ebe1ef", ink: "#212b43", muted: "#a28db8",
      surface: "#dac7e2", surface2: "#e2d4e8", hairline: "#c3b3d1",
      accent: "#8a5bd6", accentInk: "#ebe1ef", caret: "#212b43",
      ok: "#2c613d", err: "#f794ca",
    },
  },
  {
    id: "lilac_mist", name: "lilac_mist", kind: "light",
    colors: {
      bg: "#fffbfe", ink: "#5c2954", muted: "#e094c2",
      surface: "#ecdcee", surface2: "#f6ecf6", hairline: "#eec2dd",
      accent: "#b94189", accentInk: "#fffbfe", caret: "#e099d6",
      ok: "#2c613d", err: "#ff6f69",
    },
  },
  {
    id: "lime", name: "lime", kind: "light",
    colors: {
      bg: "#7c878e", ink: "#bfcfdc", muted: "#4b5257",
      surface: "#737d82", surface2: "#788288", hairline: "#616a70",
      accent: "#93c247", accentInk: "#7c878e", caret: "#93c247",
      ok: "#2c613d", err: "#ea4221",
    },
  },
  {
    id: "luna", name: "luna", kind: "dark",
    colors: {
      bg: "#221c35", ink: "#ffe3eb", muted: "#5a3a7e",
      surface: "#2f2346", surface2: "#28203e", hairline: "#412c5d",
      accent: "#f67599", accentInk: "#221c35", caret: "#f67599",
      ok: "#4ead6e", err: "#efc050",
    },
  },
  {
    id: "macroblank", name: "macroblank", kind: "light",
    colors: {
      bg: "#b2d2c8", ink: "#490909", muted: "#717977",
      surface: "#c6ddd3", surface2: "#bcd8ce", hairline: "#8ea19b",
      accent: "#c13117", accentInk: "#b2d2c8", caret: "#766f71",
      ok: "#2c613d", err: "#c13117",
    },
  },
  {
    id: "magic_girl", name: "magic_girl", kind: "light",
    colors: {
      bg: "#ffffff", ink: "#00ac8c", muted: "#93e8d3",
      surface: "#f2f2f2", surface2: "#f8f8f8", hairline: "#c4f2e7",
      accent: "#f5b1cc", accentInk: "#ffffff", caret: "#e45c96",
      ok: "#2c613d", err: "#ffe495",
    },
  },
  {
    id: "mashu", name: "mashu", kind: "dark",
    colors: {
      bg: "#2b2b2c", ink: "#f1e2e4", muted: "#d8a0a6",
      surface: "#27242c", surface2: "#29282c", hairline: "#8a6b6f",
      accent: "#76689a", accentInk: "#2b2b2c", caret: "#76689a",
      ok: "#4ead6e", err: "#d44729",
    },
  },
  {
    id: "matcha_moccha", name: "matcha_moccha", kind: "dark",
    colors: {
      bg: "#523525", ink: "#ecddcc", muted: "#9e6749",
      surface: "#422b1e", surface2: "#4a3022", hairline: "#7c5039",
      accent: "#7ec160", accentInk: "#523525", caret: "#7ec160",
      ok: "#4ead6e", err: "#fb4934",
    },
  },
  {
    id: "material", name: "material", kind: "dark",
    colors: {
      bg: "#263238", ink: "#e6edf3", muted: "#4c6772",
      surface: "#2e3c43", surface2: "#2a373e", hairline: "#3b4f58",
      accent: "#80cbc4", accentInk: "#263238", caret: "#80cbc4",
      ok: "#4ead6e", err: "#fb4934",
    },
  },
  {
    id: "matrix", name: "matrix", kind: "dark",
    colors: {
      bg: "#000000", ink: "#d1ffcd", muted: "#006500",
      surface: "#032000", surface2: "#021000", hairline: "#003800",
      accent: "#15ff00", accentInk: "#000000", caret: "#15ff00",
      ok: "#4ead6e", err: "#da3333",
    },
  },
  {
    id: "menthol", name: "menthol", kind: "dark",
    colors: {
      bg: "#00c18c", ink: "#ffffff", muted: "#186544",
      surface: "#17ae7d", surface2: "#0cb884", hairline: "#0d8e64",
      accent: "#ffffff", accentInk: "#00c18c", caret: "#99fdd8",
      ok: "#4ead6e", err: "#e03c3c",
    },
  },
  {
    id: "metaverse", name: "metaverse", kind: "dark",
    colors: {
      bg: "#232323", ink: "#e8e8e8", muted: "#5e5e5e",
      surface: "#1d1d1d", surface2: "#202020", hairline: "#434343",
      accent: "#d82934", accentInk: "#232323", caret: "#d82934",
      ok: "#4ead6e", err: "#da3333",
    },
  },
  {
    id: "metropolis", name: "metropolis", kind: "dark",
    colors: {
      bg: "#0f1f2c", ink: "#e4edf1", muted: "#326984",
      surface: "#0b1822", surface2: "#0d1c27", hairline: "#22485c",
      accent: "#56c3b7", accentInk: "#0f1f2c", caret: "#56c3b7",
      ok: "#4ead6e", err: "#d44729",
    },
  },
  {
    id: "mexican", name: "mexican", kind: "light",
    colors: {
      bg: "#f8ad34", ink: "#eeeeee", muted: "#333333",
      surface: "#f9b951", surface2: "#f8b342", hairline: "#8c6a33",
      accent: "#b12189", accentInk: "#f8ad34", caret: "#eeeeee",
      ok: "#2c613d", err: "#da3333",
    },
  },
  {
    id: "miami", name: "miami", kind: "light",
    colors: {
      bg: "#f35588", ink: "#f0e9ec", muted: "#94294c",
      surface: "#db4979", surface2: "#e74f80", hairline: "#bf3d67",
      accent: "#05dfd7", accentInk: "#f35588", caret: "#a3f7bf",
      ok: "#2c613d", err: "#fff591",
    },
  },
  {
    id: "miami_nights", name: "miami_nights", kind: "dark",
    colors: {
      bg: "#18181a", ink: "#ffffff", muted: "#47bac0",
      surface: "#0f0f10", surface2: "#141415", hairline: "#327175",
      accent: "#e4609b", accentInk: "#18181a", caret: "#e4609b",
      ok: "#4ead6e", err: "#fff591",
    },
  },
  {
    id: "midnight", name: "midnight", kind: "dark",
    colors: {
      bg: "#0b0e13", ink: "#9fadc6", muted: "#394760",
      surface: "#141a24", surface2: "#10141c", hairline: "#242d3d",
      accent: "#60759f", accentInk: "#0b0e13", caret: "#60759f",
      ok: "#4ead6e", err: "#c27070",
    },
  },
  {
    id: "milkshake", name: "milkshake", kind: "light",
    colors: {
      bg: "#ffffff", ink: "#212b43", muted: "#62cfe6",
      surface: "#ddeff3", surface2: "#eef7f9", hairline: "#a9e5f1",
      accent: "#212b43", accentInk: "#ffffff", caret: "#212b43",
      ok: "#2c613d", err: "#f19dac",
    },
  },
  {
    id: "mint", name: "mint", kind: "dark",
    colors: {
      bg: "#05385b", ink: "#edf5e1", muted: "#20688a",
      surface: "#07324e", surface2: "#063554", hairline: "#145275",
      accent: "#5cdb95", accentInk: "#05385b", caret: "#5cdb95",
      ok: "#4ead6e", err: "#f35588",
    },
  },
  {
    id: "mizu", name: "mizu", kind: "light",
    colors: {
      bg: "#afcbdd", ink: "#1a2633", muted: "#85a5bb",
      surface: "#9fc1d4", surface2: "#a7c6d8", hairline: "#98b6ca",
      accent: "#fcfbf6", accentInk: "#afcbdd", caret: "#fcfbf6",
      ok: "#2c613d", err: "#bf616a",
    },
  },
  {
    id: "modern_dolch", name: "modern_dolch", kind: "dark",
    colors: {
      bg: "#2d2e30", ink: "#e3e6eb", muted: "#54585c",
      surface: "#242527", surface2: "#282a2c", hairline: "#424548",
      accent: "#7eddd3", accentInk: "#2d2e30", caret: "#7eddd3",
      ok: "#4ead6e", err: "#d36a7b",
    },
  },
  {
    id: "modern_dolch_light", name: "modern_dolch_light", kind: "light",
    colors: {
      bg: "#dbdbdb", ink: "#454545", muted: "#a3a2a2",
      surface: "#e8e8e8", surface2: "#e2e2e2", hairline: "#bcbcbc",
      accent: "#8fd1c3", accentInk: "#dbdbdb", caret: "#8fd1c3",
      ok: "#2c613d", err: "#ea8a9a",
    },
  },
  {
    id: "modern_ink", name: "modern_ink", kind: "light",
    colors: {
      bg: "#ffffff", ink: "#000000", muted: "#b7b7b7",
      surface: "#ececec", surface2: "#f6f6f6", hairline: "#d7d7d7",
      accent: "#ff360d", accentInk: "#ffffff", caret: "#ff0000",
      ok: "#2c613d", err: "#d70000",
    },
  },
  {
    id: "monokai", name: "monokai", kind: "dark",
    colors: {
      bg: "#272822", ink: "#e2e2dc", muted: "#e6db74",
      surface: "#1f201b", surface2: "#23241e", hairline: "#908a4f",
      accent: "#a6e22e", accentInk: "#272822", caret: "#66d9ef",
      ok: "#4ead6e", err: "#f92672",
    },
  },
  {
    id: "moonlight", name: "moonlight", kind: "dark",
    colors: {
      bg: "#191f28", ink: "#ccccb5", muted: "#4b5975",
      surface: "#141a22", surface2: "#161c25", hairline: "#343f52",
      accent: "#c69f68", accentInk: "#191f28", caret: "#8f744b",
      ok: "#4ead6e", err: "#b81b2c",
    },
  },
  {
    id: "mountain", name: "mountain", kind: "dark",
    colors: {
      bg: "#0f0f0f", ink: "#e7e7e7", muted: "#4c4c4c",
      surface: "#1a1a1a", surface2: "#141414", hairline: "#313131",
      accent: "#e7e7e7", accentInk: "#0f0f0f", caret: "#f5f5f5",
      ok: "#4ead6e", err: "#ac8c8c",
    },
  },
  {
    id: "mr_sleeves", name: "mr_sleeves", kind: "light",
    colors: {
      bg: "#d1d7da", ink: "#1d1d1d", muted: "#9a9fa1",
      surface: "#bfcbd1", surface2: "#c8d1d6", hairline: "#b3b8bb",
      accent: "#daa99b", accentInk: "#d1d7da", caret: "#8fadc9",
      ok: "#2c613d", err: "#bf6464",
    },
  },
  {
    id: "ms_cupcakes", name: "ms_cupcakes", kind: "light",
    colors: {
      bg: "#ffffff", ink: "#0a282f", muted: "#d64090",
      surface: "#edf8fa", surface2: "#f6fcfc", hairline: "#e896c2",
      accent: "#5ed5f3", accentInk: "#ffffff", caret: "#303030",
      ok: "#2c613d", err: "#a4dd32",
    },
  },
  {
    id: "muted", name: "muted", kind: "dark",
    colors: {
      bg: "#525252", ink: "#b1e4e3", muted: "#939eae",
      surface: "#494949", surface2: "#4e4e4e", hairline: "#767c85",
      accent: "#c5b4e3", accentInk: "#525252", caret: "#b1e4e3",
      ok: "#4ead6e", err: "#edc1cd",
    },
  },
  {
    id: "nautilus", name: "nautilus", kind: "dark",
    colors: {
      bg: "#132237", ink: "#1cbaac", muted: "#0b4c6c",
      surface: "#0e1a29", surface2: "#101e30", hairline: "#0f3954",
      accent: "#ebb723", accentInk: "#132237", caret: "#ebb723",
      ok: "#4ead6e", err: "#da3333",
    },
  },
  {
    id: "nebula", name: "nebula", kind: "dark",
    colors: {
      bg: "#212135", ink: "#838686", muted: "#19b3b8",
      surface: "#191928", surface2: "#1d1d2e", hairline: "#1d717d",
      accent: "#be3c88", accentInk: "#212135", caret: "#78c729",
      ok: "#4ead6e", err: "#ca4754",
    },
  },
  {
    id: "night_runner", name: "night_runner", kind: "dark",
    colors: {
      bg: "#212121", ink: "#e8e8e8", muted: "#5c4a9c",
      surface: "#1a1a1a", surface2: "#1e1e1e", hairline: "#413865",
      accent: "#feff04", accentInk: "#212121", caret: "#feff04",
      ok: "#4ead6e", err: "#da3333",
    },
  },
  {
    id: "nord", name: "nord", kind: "dark",
    colors: {
      bg: "#242933", ink: "#d8dee9", muted: "#929aaa",
      surface: "#2e3440", surface2: "#292e3a", hairline: "#606774",
      accent: "#88c0d0", accentInk: "#242933", caret: "#eceff4",
      ok: "#4ead6e", err: "#bf616a",
    },
  },
  {
    id: "nord_light", name: "nord_light", kind: "light",
    colors: {
      bg: "#eceff4", ink: "#8fbcbb", muted: "#6a7791",
      surface: "#d8dee9", surface2: "#e2e6ee", hairline: "#a4adbe",
      accent: "#8fbcbb", accentInk: "#eceff4", caret: "#8fbcbb",
      ok: "#2c613d", err: "#bf616a",
    },
  },
  {
    id: "norse", name: "norse", kind: "dark",
    colors: {
      bg: "#242425", ink: "#ccc2b1", muted: "#505b5e",
      surface: "#303333", surface2: "#2a2c2c", hairline: "#3c4244",
      accent: "#2b5f6d", accentInk: "#242425", caret: "#2b5f6d",
      ok: "#4ead6e", err: "#7e2a2a",
    },
  },
  {
    id: "oblivion", name: "oblivion", kind: "dark",
    colors: {
      bg: "#313231", ink: "#f7f5f1", muted: "#5d6263",
      surface: "#3a3b3b", surface2: "#363636", hairline: "#494c4c",
      accent: "#a5a096", accentInk: "#313231", caret: "#a5a096",
      ok: "#4ead6e", err: "#dd452e",
    },
  },
  {
    id: "olivia", name: "olivia", kind: "dark",
    colors: {
      bg: "#1c1b1d", ink: "#f2efed", muted: "#4e3e3e",
      surface: "#262223", surface2: "#211e20", hairline: "#382e2f",
      accent: "#deaf9d", accentInk: "#1c1b1d", caret: "#deaf9d",
      ok: "#4ead6e", err: "#bf616a",
    },
  },
  {
    id: "onedark", name: "onedark", kind: "dark",
    colors: {
      bg: "#2f343f", ink: "#98c379", muted: "#eceff4",
      surface: "#262b34", surface2: "#2a303a", hairline: "#979ba3",
      accent: "#61afef", accentInk: "#2f343f", caret: "#61afef",
      ok: "#4ead6e", err: "#e06c75",
    },
  },
  {
    id: "our_theme", name: "our_theme", kind: "dark",
    colors: {
      bg: "#ce1226", ink: "#ffffff", muted: "#6d0f19",
      surface: "#9f1020", surface2: "#b61123", hairline: "#99101f",
      accent: "#fcd116", accentInk: "#ce1226", caret: "#fcd116",
      ok: "#4ead6e", err: "#fcd116",
    },
  },
  {
    id: "pale_nimbus", name: "pale_nimbus", kind: "dark",
    colors: {
      bg: "#433e4c", ink: "#feffdb", muted: "#ffaca3",
      surface: "#694f5e", surface2: "#564655", hairline: "#aa7a7c",
      accent: "#94ffc2", accentInk: "#433e4c", caret: "#9efffd",
      ok: "#4ead6e", err: "#ff5c5c",
    },
  },
  {
    id: "paper", name: "paper", kind: "light",
    colors: {
      bg: "#eeeeee", ink: "#444444", muted: "#b2b2b2",
      surface: "#dddddd", surface2: "#e6e6e6", hairline: "#cdcdcd",
      accent: "#444444", accentInk: "#eeeeee", caret: "#444444",
      ok: "#2c613d", err: "#d70000",
    },
  },
  {
    id: "passion_fruit", name: "passion_fruit", kind: "dark",
    colors: {
      bg: "#7c2142", ink: "#ffffff", muted: "#9994b8",
      surface: "#833c5e", surface2: "#802e50", hairline: "#8c6083",
      accent: "#f4a3b4", accentInk: "#7c2142", caret: "#ffffff",
      ok: "#4ead6e", err: "#deb80b",
    },
  },
  {
    id: "pastel", name: "pastel", kind: "light",
    colors: {
      bg: "#e0b2bd", ink: "#6d5c6f", muted: "#b4e9ff",
      surface: "#d29fab", surface2: "#d9a8b4", hairline: "#c8d0e1",
      accent: "#fbf4b6", accentInk: "#e0b2bd", caret: "#fbf4b6",
      ok: "#2c613d", err: "#ff6961",
    },
  },
  {
    id: "peach_blossom", name: "peach_blossom", kind: "dark",
    colors: {
      bg: "#292929", ink: "#fecea8", muted: "#616161",
      surface: "#2a363b", surface2: "#2a3032", hairline: "#484848",
      accent: "#99b898", accentInk: "#292929", caret: "#616161",
      ok: "#4ead6e", err: "#ff6961",
    },
  },
  {
    id: "peaches", name: "peaches", kind: "light",
    colors: {
      bg: "#e0d7c1", ink: "#5f4c41", muted: "#e7b28e",
      surface: "#e2caaf", surface2: "#e1d0b8", hairline: "#e4c3a5",
      accent: "#dd7a5f", accentInk: "#e0d7c1", caret: "#dd7a5f",
      ok: "#2c613d", err: "#ff6961",
    },
  },
  {
    id: "phantom", name: "phantom", kind: "dark",
    colors: {
      bg: "#000011", ink: "#c0caf5", muted: "#414868",
      surface: "#24283b", surface2: "#121426", hairline: "#242841",
      accent: "#7aa2f7", accentInk: "#000011", caret: "#bb9af7",
      ok: "#4ead6e", err: "#f7768e",
    },
  },
  {
    id: "pink_lemonade", name: "pink_lemonade", kind: "light",
    colors: {
      bg: "#f6d992", ink: "#fcfcf8", muted: "#f6b092",
      surface: "#f6cc93", surface2: "#f6d292", hairline: "#f6c292",
      accent: "#f6a192", accentInk: "#f6d992", caret: "#fcfcf8",
      ok: "#2c613d", err: "#ff6f69",
    },
  },
  {
    id: "pulse", name: "pulse", kind: "dark",
    colors: {
      bg: "#181818", ink: "#e5f4f4", muted: "#53565a",
      surface: "#121212", surface2: "#151515", hairline: "#383a3c",
      accent: "#17b8bd", accentInk: "#181818", caret: "#17b8bd",
      ok: "#4ead6e", err: "#da3333",
    },
  },
  {
    id: "purpleish", name: "purpleish", kind: "dark",
    colors: {
      bg: "#1e1e32", ink: "#a3a3cc", muted: "#5c5c99",
      surface: "#181829", surface2: "#1b1b2e", hairline: "#40406b",
      accent: "#7a52cc", accentInk: "#1e1e32", caret: "#7a52cc",
      ok: "#4ead6e", err: "#ff6666",
    },
  },
  {
    id: "rainbow_trail", name: "rainbow_trail", kind: "light",
    colors: {
      bg: "#f5f5f5", ink: "#1f1f1f", muted: "#4f4f4f",
      surface: "#e0e0e0", surface2: "#eaeaea", hairline: "#9a9a9a",
      accent: "#363636", accentInk: "#f5f5f5", caret: "#0d0d0d",
      ok: "#2c613d", err: "#ff0008",
    },
  },
  {
    id: "red_dragon", name: "red_dragon", kind: "dark",
    colors: {
      bg: "#1a0b0c", ink: "#4a4d4e", muted: "#e2a528",
      surface: "#0e0506", surface2: "#140809", hairline: "#88601b",
      accent: "#ff3a32", accentInk: "#1a0b0c", caret: "#ff3a32",
      ok: "#4ead6e", err: "#771b1f",
    },
  },
  {
    id: "red_samurai", name: "red_samurai", kind: "dark",
    colors: {
      bg: "#84202c", ink: "#e2dad0", muted: "#55131b",
      surface: "#751d26", surface2: "#7c1e29", hairline: "#6a1923",
      accent: "#c79e6e", accentInk: "#84202c", caret: "#c79e6e",
      ok: "#4ead6e", err: "#33bbda",
    },
  },
  {
    id: "repose_dark", name: "repose_dark", kind: "dark",
    colors: {
      bg: "#2f3338", ink: "#d6d2bc", muted: "#8f8e84",
      surface: "#3a3c3d", surface2: "#34383a", hairline: "#646562",
      accent: "#d6d2bc", accentInk: "#2f3338", caret: "#d6d2bc",
      ok: "#4ead6e", err: "#ff4a59",
    },
  },
  {
    id: "repose_light", name: "repose_light", kind: "light",
    colors: {
      bg: "#efead0", ink: "#333538", muted: "#8f8e84",
      surface: "#dbd6c4", surface2: "#e5e0ca", hairline: "#bab7a6",
      accent: "#5f605e", accentInk: "#efead0", caret: "#5f605e",
      ok: "#2c613d", err: "#c43c53",
    },
  },
  {
    id: "retro", name: "retro", kind: "light",
    colors: {
      bg: "#dad3c1", ink: "#1d1b17", muted: "#918b7d",
      surface: "#c8c3b3", surface2: "#d1cbba", hairline: "#b2ab9c",
      accent: "#1d1b17", accentInk: "#dad3c1", caret: "#1d1b17",
      ok: "#2c613d", err: "#bf616a",
    },
  },
  {
    id: "retrocast", name: "retrocast", kind: "dark",
    colors: {
      bg: "#07737a", ink: "#ffffff", muted: "#f3e03b",
      surface: "#26858b", surface2: "#167c82", hairline: "#89af57",
      accent: "#88dbdf", accentInk: "#07737a", caret: "#88dbdf",
      ok: "#4ead6e", err: "#ff585d",
    },
  },
  {
    id: "rgb", name: "rgb", kind: "dark",
    colors: {
      bg: "#111111", ink: "#eeeeee", muted: "#444444",
      surface: "#1a1a1a", surface2: "#161616", hairline: "#2d2d2d",
      accent: "#eeeeee", accentInk: "#111111", caret: "#eeeeee",
      ok: "#4ead6e", err: "#eeeeee",
    },
  },
  {
    id: "rose_pine", name: "rose_pine", kind: "dark",
    colors: {
      bg: "#1f1d27", ink: "#e0def4", muted: "#c4a7e7",
      surface: "#282533", surface2: "#24212d", hairline: "#7a6991",
      accent: "#9ccfd8", accentInk: "#1f1d27", caret: "#f6c177",
      ok: "#4ead6e", err: "#eb6f92",
    },
  },
  {
    id: "rose_pine_dawn", name: "rose_pine_dawn", kind: "light",
    colors: {
      bg: "#fffaf3", ink: "#286983", muted: "#c4a7e7",
      surface: "#f0e9df", surface2: "#f8f2e9", hairline: "#dfccec",
      accent: "#56949f", accentInk: "#fffaf3", caret: "#ea9d34",
      ok: "#2c613d", err: "#b4637a",
    },
  },
  {
    id: "rose_pine_moon", name: "rose_pine_moon", kind: "dark",
    colors: {
      bg: "#2a273f", ink: "#e0def4", muted: "#c4a7e7",
      surface: "#211f32", surface2: "#262338", hairline: "#7f6d9b",
      accent: "#9ccfd8", accentInk: "#2a273f", caret: "#f6c177",
      ok: "#4ead6e", err: "#eb6f92",
    },
  },
  {
    id: "rudy", name: "rudy", kind: "dark",
    colors: {
      bg: "#1a2b3e", ink: "#c9c8bf", muted: "#3a506c",
      surface: "#152231", surface2: "#182638", hairline: "#2c3f57",
      accent: "#af8f5c", accentInk: "#1a2b3e", caret: "#af8f5c",
      ok: "#4ead6e", err: "#bf616a",
    },
  },
  {
    id: "ryujinscales", name: "ryujinscales", kind: "dark",
    colors: {
      bg: "#081426", ink: "#ffe4bc", muted: "#ffbc90",
      surface: "#040e1d", surface2: "#061122", hairline: "#907060",
      accent: "#f17754", accentInk: "#081426", caret: "#ef6d49",
      ok: "#4ead6e", err: "#ca4754",
    },
  },
  {
    id: "serika", name: "serika", kind: "light",
    colors: {
      bg: "#e1e1e3", ink: "#323437", muted: "#aaaeb3",
      surface: "#d1d3d8", surface2: "#d9dade", hairline: "#c3c5c9",
      accent: "#e2b714", accentInk: "#e1e1e3", caret: "#e2b714",
      ok: "#2c613d", err: "#da3333",
    },
  },
  {
    id: "serika_dark", name: "serika_dark", kind: "dark",
    colors: {
      bg: "#323437", ink: "#d1d0c5", muted: "#646669",
      surface: "#2c2e31", surface2: "#2f3134", hairline: "#4e5052",
      accent: "#e2b714", accentInk: "#323437", caret: "#e2b714",
      ok: "#4ead6e", err: "#ca4754",
    },
  },
  {
    id: "sewing_tin", name: "sewing_tin", kind: "dark",
    colors: {
      bg: "#241963", ink: "#ffffff", muted: "#446ad5",
      surface: "#2a277a", surface2: "#27206e", hairline: "#3646a2",
      accent: "#f2ce83", accentInk: "#241963", caret: "#fbdb8c",
      ok: "#4ead6e", err: "#c6915e",
    },
  },
  {
    id: "sewing_tin_light", name: "sewing_tin_light", kind: "light",
    colors: {
      bg: "#ffffff", ink: "#2d2076", muted: "#385eca",
      surface: "#c8cedf", surface2: "#e4e6ef", hairline: "#92a6e2",
      accent: "#2d2076", accentInk: "#ffffff", caret: "#fbdb8c",
      ok: "#2c613d", err: "#f2ce83",
    },
  },
  {
    id: "shadow", name: "shadow", kind: "dark",
    colors: {
      bg: "#000000", ink: "#eeeeee", muted: "#444444",
      surface: "#171717", surface2: "#0c0c0c", hairline: "#252525",
      accent: "#eeeeee", accentInk: "#000000", caret: "#eeeeee",
      ok: "#4ead6e", err: "#ffffff",
    },
  },
  {
    id: "shoko", name: "shoko", kind: "light",
    colors: {
      bg: "#ced7e0", ink: "#3b4c58", muted: "#7599b1",
      surface: "#b7cada", surface2: "#c2d0dd", hairline: "#9db5c6",
      accent: "#81c4dd", accentInk: "#ced7e0", caret: "#81c4dd",
      ok: "#2c613d", err: "#bf616a",
    },
  },
  {
    id: "slambook", name: "slambook", kind: "light",
    colors: {
      bg: "#fffdde", ink: "#13005a", muted: "#1c82adc4",
      surface: "#c6dce4", surface2: "#e2ece1", hairline: "#808080",
      accent: "#03001c", accentInk: "#fffdde", caret: "#367e18",
      ok: "#2c613d", err: "#f900bf",
    },
  },
  {
    id: "snes", name: "snes", kind: "light",
    colors: {
      bg: "#bfbec2", ink: "#2e2e2e", muted: "#9f8ad4",
      surface: "#b5b0c2", surface2: "#bab7c2", hairline: "#ada1cc",
      accent: "#553d94", accentInk: "#bfbec2", caret: "#523793",
      ok: "#2c613d", err: "#ca4754",
    },
  },
  {
    id: "soaring_skies", name: "soaring_skies", kind: "light",
    colors: {
      bg: "#fff9f2", ink: "#1d1e1e", muted: "#1e107a",
      surface: "#e5ddd4", surface2: "#f2ebe3", hairline: "#8379b0",
      accent: "#55c6f0", accentInk: "#fff9f2", caret: "#1e107a",
      ok: "#2c613d", err: "#fb5745",
    },
  },
  {
    id: "solarized_dark", name: "solarized_dark", kind: "dark",
    colors: {
      bg: "#002b36", ink: "#268bd2", muted: "#2aa198",
      surface: "#00222b", surface2: "#002630", hairline: "#176c6c",
      accent: "#859900", accentInk: "#002b36", caret: "#dc322f",
      ok: "#4ead6e", err: "#d33682",
    },
  },
  {
    id: "solarized_light", name: "solarized_light", kind: "light",
    colors: {
      bg: "#fdf6e3", ink: "#181819", muted: "#2aa198",
      surface: "#e2d8be", surface2: "#f0e7d0", hairline: "#89c7ba",
      accent: "#859900", accentInk: "#fdf6e3", caret: "#dc322f",
      ok: "#2c613d", err: "#d33682",
    },
  },
  {
    id: "solarized_osaka", name: "solarized_osaka", kind: "dark",
    colors: {
      bg: "#00141a", ink: "#eee8d5", muted: "#2aa198",
      surface: "#00222b", surface2: "#001b22", hairline: "#17625f",
      accent: "#859900", accentInk: "#00141a", caret: "#b58900",
      ok: "#4ead6e", err: "#dc322f",
    },
  },
  {
    id: "sonokai", name: "sonokai", kind: "dark",
    colors: {
      bg: "#2c2e34", ink: "#e2e2e3", muted: "#e7c664",
      surface: "#232429", surface2: "#28292e", hairline: "#93824e",
      accent: "#9ed072", accentInk: "#2c2e34", caret: "#f38c71",
      ok: "#4ead6e", err: "#fc5d7c",
    },
  },
  {
    id: "spiderman", name: "spiderman", kind: "dark",
    colors: {
      bg: "#0d1219", ink: "#f0f0f0", muted: "#0476f2",
      surface: "#0b1c2e", surface2: "#0c1724", hairline: "#084990",
      accent: "#e23636", accentInk: "#0d1219", caret: "#e23636",
      ok: "#4ead6e", err: "#0476f2",
    },
  },
  {
    id: "stealth", name: "stealth", kind: "dark",
    colors: {
      bg: "#010203", ink: "#383e42", muted: "#5e676e",
      surface: "#121212", surface2: "#0a0a0a", hairline: "#343a3e",
      accent: "#383e42", accentInk: "#010203", caret: "#e25303",
      ok: "#4ead6e", err: "#e25303",
    },
  },
  {
    id: "strawberry", name: "strawberry", kind: "light",
    colors: {
      bg: "#f37f83", ink: "#fcfcf8", muted: "#e53c58",
      surface: "#ef6e77", surface2: "#f1767d", hairline: "#eb5a6b",
      accent: "#fcfcf8", accentInk: "#f37f83", caret: "#fcfcf8",
      ok: "#2c613d", err: "#fcd23f",
    },
  },
  {
    id: "striker", name: "striker", kind: "dark",
    colors: {
      bg: "#124883", ink: "#d6dbd9", muted: "#0f2d4e",
      surface: "#104176", surface2: "#11447c", hairline: "#103966",
      accent: "#d7dcda", accentInk: "#124883", caret: "#d7dcda",
      ok: "#4ead6e", err: "#fb4934",
    },
  },
  {
    id: "suisei", name: "suisei", kind: "dark",
    colors: {
      bg: "#3b4a62", ink: "#dbdeeb", muted: "#fe9841",
      surface: "#313e55", surface2: "#36445c", hairline: "#a67550",
      accent: "#bef0ff", accentInk: "#3b4a62", caret: "#bef0ff",
      ok: "#4ead6e", err: "#ed2939",
    },
  },
  {
    id: "sunset", name: "sunset", kind: "dark",
    colors: {
      bg: "#211e24", ink: "#f4e0c9", muted: "#5b578e",
      surface: "#161319", surface2: "#1c181e", hairline: "#413d5e",
      accent: "#f79777", accentInk: "#211e24", caret: "#ffca99",
      ok: "#4ead6e", err: "#66a1ff",
    },
  },
  {
    id: "superuser", name: "superuser", kind: "dark",
    colors: {
      bg: "#262a33", ink: "#e5f7ef", muted: "#526777",
      surface: "#1f232c", surface2: "#222630", hairline: "#3e4c58",
      accent: "#43ffaf", accentInk: "#262a33", caret: "#43ffaf",
      ok: "#4ead6e", err: "#ff5f5f",
    },
  },
  {
    id: "sweden", name: "sweden", kind: "dark",
    colors: {
      bg: "#0058a3", ink: "#ffffff", muted: "#57abdb",
      surface: "#024f8e", surface2: "#015498", hairline: "#3086c2",
      accent: "#ffcc02", accentInk: "#0058a3", caret: "#b5b5b5",
      ok: "#4ead6e", err: "#e74040",
    },
  },
  {
    id: "tangerine", name: "tangerine", kind: "light",
    colors: {
      bg: "#ffede0", ink: "#3d1705", muted: "#ff9562",
      surface: "#fdd3bf", surface2: "#fee0d0", hairline: "#ffbd9b",
      accent: "#fe5503", accentInk: "#ffede0", caret: "#5d8500",
      ok: "#2c613d", err: "#7fb500",
    },
  },
  {
    id: "taro", name: "taro", kind: "light",
    colors: {
      bg: "#b3baff", ink: "#130f1a", muted: "#6f6c91",
      surface: "#a3a7df", surface2: "#abb0ef", hairline: "#8e8fc2",
      accent: "#130f1a", accentInk: "#b3baff", caret: "#00e9e5",
      ok: "#2c613d", err: "#ffe23e",
    },
  },
  {
    id: "terminal", name: "terminal", kind: "dark",
    colors: {
      bg: "#191a1b", ink: "#e7eae0", muted: "#48494b",
      surface: "#141516", surface2: "#161818", hairline: "#333435",
      accent: "#79a617", accentInk: "#191a1b", caret: "#79a617",
      ok: "#4ead6e", err: "#a61717",
    },
  },
  {
    id: "terra", name: "terra", kind: "dark",
    colors: {
      bg: "#0c100e", ink: "#f0edd1", muted: "#436029",
      surface: "#0f1d18", surface2: "#0e1613", hairline: "#2a3c1d",
      accent: "#89c559", accentInk: "#0c100e", caret: "#89c559",
      ok: "#4ead6e", err: "#d3ca78",
    },
  },
  {
    id: "terrazzo", name: "terrazzo", kind: "light",
    colors: {
      bg: "#f1e5da", ink: "#023e3b", muted: "#688e8f",
      surface: "#e3d3c6", surface2: "#eadcd0", hairline: "#a6b5b1",
      accent: "#e0794e", accentInk: "#f1e5da", caret: "#e0794e",
      ok: "#2c613d", err: "#a01034",
    },
  },
  {
    id: "terror_below", name: "terror_below", kind: "dark",
    colors: {
      bg: "#0b1e1a", ink: "#dceae5", muted: "#015c53",
      surface: "#041715", surface2: "#081a18", hairline: "#064039",
      accent: "#66ac92", accentInk: "#0b1e1a", caret: "#66ac92",
      ok: "#4ead6e", err: "#bf616a",
    },
  },
  {
    id: "tiramisu", name: "tiramisu", kind: "light",
    colors: {
      bg: "#cfc6b9", ink: "#7d5448", muted: "#c0976f",
      surface: "#d0bca7", surface2: "#d0c1b0", hairline: "#c7ac90",
      accent: "#c0976f", accentInk: "#cfc6b9", caret: "#7d5448",
      ok: "#2c613d", err: "#e9632d",
    },
  },
  {
    id: "trackday", name: "trackday", kind: "dark",
    colors: {
      bg: "#464d66", ink: "#cfcfcf", muted: "#5c7eb9",
      surface: "#3d4359", surface2: "#424860", hairline: "#526894",
      accent: "#e0513e", accentInk: "#464d66", caret: "#475782",
      ok: "#4ead6e", err: "#e44e4e",
    },
  },
  {
    id: "trance", name: "trance", kind: "dark",
    colors: {
      bg: "#00021b", ink: "#ffffff", muted: "#3c4c79",
      surface: "#18214c", surface2: "#0c1234", hairline: "#212b4f",
      accent: "#e51376", accentInk: "#00021b", caret: "#e51376",
      ok: "#4ead6e", err: "#02d3b0",
    },
  },
  {
    id: "tron_orange", name: "tron_orange", kind: "dark",
    colors: {
      bg: "#0d1c1c", ink: "#ffffff", muted: "#ff6600",
      surface: "#9c9191", surface2: "#545656", hairline: "#92450d",
      accent: "#f0e800", accentInk: "#0d1c1c", caret: "#f0e800",
      ok: "#4ead6e", err: "#ff0000",
    },
  },
  {
    id: "vaporwave", name: "vaporwave", kind: "light",
    colors: {
      bg: "#a4a7ea", ink: "#f1ebf1", muted: "#7c7faf",
      surface: "#989bd9", surface2: "#9ea1e2", hairline: "#8e91ca",
      accent: "#e368da", accentInk: "#a4a7ea", caret: "#28cafe",
      ok: "#2c613d", err: "#573ca9",
    },
  },
  {
    id: "vesper", name: "vesper", kind: "dark",
    colors: {
      bg: "#101010", ink: "#ffffff", muted: "#a0a0a0",
      surface: "#1c1c1c", surface2: "#161616", hairline: "#5f5f5f",
      accent: "#ffc799", accentInk: "#101010", caret: "#99ffe4",
      ok: "#4ead6e", err: "#ff8080",
    },
  },
  {
    id: "vesper_light", name: "vesper_light", kind: "light",
    colors: {
      bg: "#ffffff", ink: "#000000", muted: "#a0a0a0",
      surface: "#fff8f4", surface2: "#fffcfa", hairline: "#cbcbcb",
      accent: "#fb7100", accentInk: "#ffffff", caret: "#067a6e",
      ok: "#2c613d", err: "#ed2839",
    },
  },
  {
    id: "viridescent", name: "viridescent", kind: "dark",
    colors: {
      bg: "#2c3333", ink: "#e9f5db", muted: "#84a98c",
      surface: "#232828", surface2: "#282e2e", hairline: "#5c7464",
      accent: "#95d5b2", accentInk: "#2c3333", caret: "#f0d3c9",
      ok: "#4ead6e", err: "#ff4646",
    },
  },
  {
    id: "voc", name: "voc", kind: "dark",
    colors: {
      bg: "#190618", ink: "#eeeae4", muted: "#4c1e48",
      surface: "#2c0c28", surface2: "#220920", hairline: "#351332",
      accent: "#e0caac", accentInk: "#190618", caret: "#e0caac",
      ok: "#4ead6e", err: "#af3735",
    },
  },
  {
    id: "vscode", name: "vscode", kind: "dark",
    colors: {
      bg: "#1e1e1e", ink: "#d4d4d4", muted: "#4d4d4d",
      surface: "#191919", surface2: "#1c1c1c", hairline: "#383838",
      accent: "#007acc", accentInk: "#1e1e1e", caret: "#569cd6",
      ok: "#4ead6e", err: "#f44747",
    },
  },
  {
    id: "watermelon", name: "watermelon", kind: "dark",
    colors: {
      bg: "#1f4437", ink: "#cdc6bc", muted: "#3e7a65",
      surface: "#244d3f", surface2: "#22483b", hairline: "#306250",
      accent: "#d6686f", accentInk: "#1f4437", caret: "#d6686f",
      ok: "#4ead6e", err: "#c82931",
    },
  },
  {
    id: "wavez", name: "wavez", kind: "dark",
    colors: {
      bg: "#1c292f", ink: "#e9efe6", muted: "#1f5e6b",
      surface: "#1b3238", surface2: "#1c2e34", hairline: "#1e4650",
      accent: "#6bde3b", accentInk: "#1c292f", caret: "#6bde3b",
      ok: "#4ead6e", err: "#ca4754",
    },
  },
  {
    id: "witch_girl", name: "witch_girl", kind: "light",
    colors: {
      bg: "#f3dbda", ink: "#56786a", muted: "#ddb4a7",
      surface: "#e7c8be", surface2: "#edd2cc", hairline: "#e7c6be",
      accent: "#56786a", accentInk: "#f3dbda", caret: "#afc5bd",
      ok: "#2c613d", err: "#b29a91",
    },
  },
];

export const DEFAULT_THEME = "warm";
export const THEME_KEY = "tc:theme";

export const themeById = (id: string): ThemeDef =>
  THEMES.find((t) => t.id === id) ?? THEMES[0];
