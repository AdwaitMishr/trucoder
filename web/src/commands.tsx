/** Command registry — the extensible core behind the command palette.
 *
 * ANY feature can register a command section at module load:
 *
 *   registerCommandSection({
 *     title: "My feature",
 *     commands: [
 *       { id: "my-action", display: "Do the thing", alias: "thing action",
 *         icon: <PiStar />, run: () => doTheThing() },
 *     ],
 *   });
 *
 * The palette renders whatever is registered — nothing else needs to change.
 * This is the extension point for future features (settings toggles, course
 * search, admin actions, ...). */

import type { ReactNode } from "react";

export interface Command {
  id: string;
  /** Human label shown in the list. */
  display: string;
  /** Extra search words (abbreviations, synonyms). */
  alias?: string;
  /** Left-side icon. */
  icon?: ReactNode;
  /** Right-side adornment (theme swatch, keybind chip, ...). */
  hint?: ReactNode;
  /** Hide the command when this returns false. */
  available?: () => boolean;
  /** Marks the row as the current state (checkmark). */
  active?: () => boolean;
  run: () => void;
}

export interface CommandSection {
  title: string;
  /** Static list, or a thunk (sync or async) resolved when the palette opens. */
  commands: Command[] | (() => Command[] | Promise<Command[]>);
}

const sections: CommandSection[] = [];

export function registerCommandSection(section: CommandSection): void {
  // replace-by-title: the app registers sections every render; a plain push
  // would duplicate every section (and freeze stale closures) on re-render
  const i = sections.findIndex((s) => s.title === section.title);
  if (i >= 0) sections[i] = section;
  else sections.push(section);
}

export function getCommandSections(): CommandSection[] {
  return sections;
}

const stripPunct = (w: string) => w.replace(/[^a-z0-9]/g, "");

/** Monkeytype-style word-prefix matching. Returns the number of query words
 *  matched against display+alias words (all words must match for a hit). */
export function matchQuery(query: string, display: string, alias = ""): boolean {
  const input = query
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .map(stripPunct)
    .filter(Boolean);
  if (input.length === 0) return true;
  const hay = (display + " " + alias).toLowerCase().split(/\s+/).map(stripPunct);
  return input.every((word) => hay.some((w) => w.startsWith(word)));
}
