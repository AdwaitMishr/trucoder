import fs from "fs";
import path from "path";
import matter from "gray-matter";
import chokidar from "chokidar";
import { config } from "../config";
import type { Course, Difficulty, Lang, Lesson, TestCase } from "./types";

/**
 * Loads courses from the on-disk `courses/` directory. Content is fully
 * data-driven — no code changes are needed to add or edit a course; just drop
 * .mdx files (see courses/AGENTS.md for the schema) and TruCoder picks them up.
 *
 * - Scans the tree at startup.
 * - Watches it with chokidar and re-scans on any change (agent-authored edits
 *   take effect without a restart).
 * - A malformed file is logged and skipped; it never breaks the app.
 */

type CourseMap = Map<string, Course>;
let cache: CourseMap = new Map();
let loadErrors: Record<string, string> = {};

const SUPPORTED_LANGS = new Set<Lang>(["java", "javascript", "python"]);
const DIFFS = new Set<string>(["beginner", "easy", "medium", "hard"]);

/** Convert a frontmatter `expected` value to a compact JSON string. */
export function toExpectedJson(v: unknown): string {
  // A numeric string is treated as a raw JSON number literal, which preserves
  // big integers exactly (a bare YAML number would lose precision above 2^53).
  if (typeof v === "string" && /^-?\d+$/.test(v)) return v;
  return JSON.stringify(v);
}

function parseFrontmatter(file: string): { data: Record<string, unknown>; content: string } {
  const raw = fs.readFileSync(file, "utf8");
  return matter(raw);
}

function loadLesson(courseId: string, file: string): Lesson | null {
  try {
    const { data, content } = parseFrontmatter(file);
    const d = data as Record<string, any>;

    if (!d.id || !d.title) {
      throw new Error("missing required fields: id, title");
    }
    if (d.difficulty && !DIFFS.has(d.difficulty)) {
      throw new Error(`unknown difficulty '${d.difficulty}'`);
    }

    const starterMap = normalizeLangMap(d.starter);
    const hasExercise = d.type !== "content" && Object.keys(starterMap).length > 0;

    const languages: Lang[] = (d.languages ?? []).filter((l: string) =>
      SUPPORTED_LANGS.has(l as Lang)
    );
    if (hasExercise && languages.length === 0) languages.push("java");

    const mapTests = (arr: unknown[]): TestCase[] =>
      (arr ?? []).map((t) => ({
        name: String((t as any).name ?? "test"),
        args: (t as any).args ?? [],
        expected: toExpectedJson((t as any).expected),
      }));

    const publicTests = mapTests(d.tests?.public ?? []);
    const privateTests = mapTests(d.tests?.private ?? []);

    return {
      id: String(d.id),
      courseId,
      title: String(d.title),
      difficulty: (d.difficulty ?? "easy") as Difficulty,
      order: typeof d.order === "number" ? d.order : Infinity,
      tags: Array.isArray(d.tags) ? d.tags.map(String) : [],
      hasExercise,
      task: String(d.task ?? ""),
      languages,
      signature: normalizeLangMap(d.signature),
      starterCode: starterMap,
      publicTests,
      privateTests,
      timeLimitMs: typeof d.timeLimitMs === "number" ? d.timeLimitMs : 2000,
      solution: typeof d.solution === "string" ? d.solution : undefined,
      hints: Array.isArray(d.hints) ? d.hints.map(String) : [],
      body: content,
    };
  } catch (e) {
    loadErrors[path.basename(file)] = (e as Error).message;
    console.error(`[trucoder] failed to load lesson ${file}:`, (e as Error).message);
    return null;
  }
}

function normalizeLangMap(
  raw: unknown
): Partial<Record<Lang, string>> {
  const out: Partial<Record<Lang, string>> = {};
  if (!raw || typeof raw !== "object") return out;
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (SUPPORTED_LANGS.has(k as Lang) && typeof v === "string") {
      out[k as Lang] = v;
    }
  }
  return out;
}

function loadCourse(dir: string): void {
  const courseFile = path.join(dir, "course.mdx");
  if (!fs.existsSync(courseFile)) {
    console.warn(`[trucoder] skipping ${dir}: no course.mdx`);
    return;
  }
  let data: Record<string, unknown>;
  let body: string;
  try {
    const fm = parseFrontmatter(courseFile);
    data = fm.data;
    body = fm.content;
  } catch (e) {
    loadErrors[path.basename(dir)] = (e as Error).message;
    console.error(`[trucoder] failed to load course ${courseFile}:`, (e as Error).message);
    return;
  }
  const id = String(data.id ?? path.basename(dir));

  const lessonsDir = path.join(dir, "lessons");
  const lessonFiles = fs.existsSync(lessonsDir)
    ? fs
        .readdirSync(lessonsDir)
        .filter((f) => f.endsWith(".mdx"))
        .sort()
    : [];

  const lessons = lessonFiles
    .map((f) => loadLesson(id, path.join(lessonsDir, f)))
    .filter((l): l is Lesson => l !== null)
    .sort((a, b) => a.order - b.order);

  cache.set(id, {
    id,
    title: String(data.title ?? id),
    description: String(data.description ?? ""),
    difficultyLevels: Array.isArray(data.difficultyLevels)
      ? data.difficultyLevels.map(String)
      : [],
    body,
    lessons,
  });
}

export function scanCourses(): void {
  cache = new Map();
  loadErrors = {};
  if (!fs.existsSync(config.coursesDir)) return;
  const entries = fs
    .readdirSync(config.coursesDir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith("."));
  for (const e of entries) {
    loadCourse(path.join(config.coursesDir, e.name));
  }
  console.log(
    `[trucoder] loaded ${cache.size} course(s), ${[...cache.values()].reduce(
      (n, c) => n + c.lessons.length,
      0
    )} lesson(s)`
  );
}

export function getCourses(): Course[] {
  return [...cache.values()];
}

export function getCourse(id: string): Course | undefined {
  return cache.get(id);
}

export function getLesson(courseId: string, lessonId: string): Lesson | undefined {
  return cache.get(courseId)?.lessons.find((l) => l.id === lessonId);
}

export function getLoadErrors(): Record<string, string> {
  return loadErrors;
}

let watcher: chokidar.FSWatcher | null = null;

/** Watch the courses tree and re-scan on any change. Call once at startup. */
export function watchCourses(): void {
  if (watcher) return;
  if (!fs.existsSync(config.coursesDir)) return;
  let timer: NodeJS.Timeout | null = null;
  watcher = chokidar.watch(config.coursesDir, { ignoreInitial: true });
  watcher.on("all", () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      scanCourses();
    }, 300);
  });
}
