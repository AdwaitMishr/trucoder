import { useEffect } from "react";

/** Central site-wide keyboard shortcut registry.
 *
 *   registerShortcut({
 *     id: "palette",
 *     keys: "⌘K",
 *     description: "Open the command palette",
 *     run: () => togglePalette(),
 *     when: () => !isTyping(),   // optional gate
 *   });
 *
 * Combos use meta/ctrl (⌘/Ctrl). Plain keys are ignored while the user is
 * typing in an input/textarea/contenteditable, so shortcuts never fight the
 * editor or search boxes. */

export interface Shortcut {
  id: string;
  keys: string;
  description: string;
  run: () => void;
  /** Extra gate evaluated at keydown time. */
  when?: () => boolean;
}

const registry: Shortcut[] = [];

export function registerShortcut(s: Shortcut): void {
  // replace-by-id: re-registration keeps closures fresh (the app registers
  // every render; a kept-first registration would capture stale state)
  const i = registry.findIndex((r) => r.id === s.id);
  if (i >= 0) registry[i] = s;
  else registry.push(s);
}

export function getShortcuts(): Shortcut[] {
  return [...registry];
}

const isTyping = (e: KeyboardEvent): boolean => {
  const t = e.target as HTMLElement | null;
  if (!t) return false;
  const tag = t.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    t.isContentEditable ||
    t.closest(".monaco-editor") !== null
  );
};

export function useShortcuts(): void {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      for (const s of registry) {
        const parts = s.keys.split("+");
        const combo = parts.every((p) =>
          p === "⌘" || p === "Ctrl"
            ? meta
            : p === "⇧" || p === "Shift"
              ? e.shiftKey
              : p === "Alt"
                ? e.altKey
                : e.key.toLowerCase() === p.toLowerCase(),
        );
        if (!combo) continue;
        // plain-key shortcuts never fire while the user is typing
        if (!parts.some((p) => p === "⌘" || p === "Ctrl") && isTyping(e)) continue;
        if (s.when && !s.when()) continue;
        e.preventDefault();
        s.run();
        return;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
