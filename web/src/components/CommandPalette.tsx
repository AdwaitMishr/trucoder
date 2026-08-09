import { useEffect, useMemo, useRef, useState } from "react";
import { PiCheck, PiMagnifyingGlass } from "react-icons/pi";
import { getCommandSections, matchQuery, type Command } from "../commands";

/** Command palette (⌘K) — monkeytype-commandline-style searchable action menu.
 *  Renders whatever sections are registered in the command registry. */

export default function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [sections, setSections] = useState<{ title: string; commands: Command[] }[]>([]);
  const [resolving, setResolving] = useState(false);
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement | null>(null);

  // resolve sections (async thunks allowed) each time the palette opens
  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActive(0);
    setSections([]);
    setResolving(true);
    let cancelled = false;
    (async () => {
      const resolved = await Promise.all(
        getCommandSections().map(async (s) => ({
          title: s.title,
          commands:
            typeof s.commands === "function"
              ? await s.commands()
              : s.commands,
        })),
      );
      if (!cancelled) {
        setSections(resolved);
        setResolving(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  // flatten for navigation: [sectionIndex, commandIndex] pairs
  const flat = useMemo(() => {
    const out: { si: number; ci: number; cmd: Command }[] = [];
    sections.forEach((s, si) => {
      s.commands.forEach((cmd, ci) => {
        if (!cmd.available || cmd.available()) {
          if (matchQuery(query, cmd.display, cmd.alias)) {
            out.push({ si, ci, cmd });
          }
        }
      });
    });
    return out;
  }, [sections, query]);

  // keep the active row visible
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((a) => Math.min(a + 1, flat.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((a) => Math.max(a - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const hit = flat[active];
        if (hit) {
          onClose();
          hit.cmd.run();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, flat, active, onClose]);

  if (!open) return null;

  // rows grouped by section, preserving flat order for navigation
  let flatIdx = -1;

  return (
    <div className="cmd-overlay" onMouseDown={onClose}>
      <div
        className="cmd-panel"
        role="dialog"
        aria-label="command palette"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="cmd-input-row">
          <PiMagnifyingGlass size={15} />
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            placeholder="type a command or search…"
            spellCheck={false}
          />
          <kbd className="cmd-esc">esc</kbd>
        </div>
        <div className="cmd-list" ref={listRef}>
          {sections.map((s) => {
            const rows = s.commands
              .map((cmd, ci) => ({ cmd, ci }))
              .filter(
                ({ cmd }) =>
                  (!cmd.available || cmd.available()) &&
                  matchQuery(query, cmd.display, cmd.alias),
              );
            if (rows.length === 0) return null;
            return (
              <div className="cmd-section" key={s.title}>
                <div className="cmd-section-title">{s.title}</div>
                {rows.map(({ cmd }) => {
                  flatIdx += 1;
                  const idx = flatIdx;
                  const isActive = idx === active;
                  return (
                    <button
                      key={cmd.id}
                      data-idx={idx}
                      className={`cmd-row ${isActive ? "active" : ""}`}
                      onMouseEnter={() => setActive(idx)}
                      onClick={() => {
                        onClose();
                        cmd.run();
                      }}
                    >
                      <span className="cmd-icon">{cmd.icon}</span>
                      <span className="cmd-display">{cmd.display}</span>
                      <span className="cmd-hint">{cmd.hint}</span>
                      {cmd.active?.() && <PiCheck size={12} className="cmd-check" />}
                      {isActive && <span className="cmd-caret" />}
                    </button>
                  );
                })}
              </div>
            );
          })}
          {resolving && sections.length === 0 && (
            <div className="cmd-empty">loading…</div>
          )}
          {flat.length === 0 && !resolving && (
            <div className="cmd-empty">no commands match “{query}”</div>
          )}
        </div>
        <div className="cmd-foot">
          <PiMagnifyingGlass size={11} /> search · <kbd>↑</kbd>
          <kbd>↓</kbd> navigate · <kbd>↵</kbd> run · <kbd>esc</kbd> close
        </div>
      </div>
    </div>
  );
}
