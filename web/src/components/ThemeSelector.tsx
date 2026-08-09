import { useMemo, useState, type CSSProperties } from "react";
import { PiCheck, PiMagnifyingGlass } from "react-icons/pi";
import { THEMES, useTheme } from "../theme";
import type { ThemeDef } from "../themes";
import { matchQuery } from "../commands";

/** Relative luminance of a hex color (0..1) — used to sort light themes
 *  first, exactly like monkeytype's hexToHSL lightness ordering. */
function luma(hex: string): number {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Light themes first — monkeytype sorts its picker by bg lightness. */
const byLightness = (a: ThemeDef, b: ThemeDef) => luma(b.colors.bg) - luma(a.colors.bg);

function ThemeCard({
  theme,
  active,
  onPick,
}: {
  theme: ThemeDef;
  active: boolean;
  onPick: () => void;
}) {
  const c = theme.colors;
  return (
    <button
      type="button"
      className={`theme-card ${active ? "active" : ""}`}
      style={
        {
          "--pbg": c.bg,
          "--pmain": c.accent,
          "--psub": c.muted,
          "--ptext": c.ink,
        } as CSSProperties
      }
      onClick={onPick}
      title={theme.name}
    >
      <span className="tc-name">{theme.name}</span>
      <span className="tc-dots">
        <i style={{ background: c.accent }} />
        <i style={{ background: c.muted }} />
        <i style={{ background: c.ink }} />
      </span>
    </button>
  );
}

/** Monkeytype-style theme selector: a searchable grid of cards, each card
 *  rendering its own palette (bg + name in its accent + 3 color dots).
 *  Reused by the topbar popover AND the settings modal (inline mode). */
export default function ThemeSelector({
  inline = false,
  onPick,
}: {
  inline?: boolean;
  onPick?: () => void;
}) {
  const { themeId, setThemeId } = useTheme();
  const [query, setQuery] = useState("");

  const themes = useMemo(() => {
    const sorted = [...THEMES].sort(byLightness);
    if (!query.trim()) return sorted;
    return sorted.filter((t) => matchQuery(query, t.name, t.id));
  }, [query]);

  return (
    <div className={`theme-selector ${inline ? "theme-selector-inline" : ""}`}>
      <div className="theme-search">
        <PiMagnifyingGlass size={14} />
        <input
          autoFocus={!inline}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="search themes…"
          spellCheck={false}
        />
      </div>
      <div className="theme-grid-scroll">
        <div className="theme-grid-cards">
          {themes.map((t) => (
            <ThemeCard
              key={t.id}
              theme={t}
              active={t.id === themeId}
              onPick={() => {
                setThemeId(t.id);
                onPick?.();
              }}
            />
          ))}
          {themes.length === 0 && <div className="theme-none">no themes match</div>}
        </div>
      </div>
      {!inline && (
        <div className="theme-pop-foot">
          <PiCheck size={12} /> {themes.length} themes · stays open while you switch · esc to close
        </div>
      )}
    </div>
  );
}
