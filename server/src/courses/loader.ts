import fs from "fs";
import path from "path";
import matter from "gray-matter";
import chokidar from "chokidar";
import { config } from "../config";
import type {
  Block,
  CodeBlock,
  Course,
  Difficulty,
  FlowEdge,
  FlowchartBlock,
  ImageBlock,
  Lang,
  Lesson,
  MarkdownBlock,
  McqBlock,
  MscqBlock,
  TestCase,
} from "./types";

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

const SUPPORTED_LANGS = new Set<Lang>(["java", "javascript", "python", "cpp"]);
const DIFFS = new Set<string>(["beginner", "easy", "medium", "hard"]);

/** Convert a frontmatter `expected` value to a compact JSON string. */
export function toExpectedJson(v: unknown): string {
  // A numeric string is treated as a raw JSON number literal, which preserves
  // big integers exactly (a bare YAML number would lose precision above 2^53).
  if (typeof v === "string" && /^-?\d+$/.test(v)) return v;
  return JSON.stringify(v);
}

function mapTests(arr: unknown): TestCase[] {
  return (Array.isArray(arr) ? arr : []).map((t) => ({
    name: String((t as any).name ?? "test"),
    args: (t as any).args ?? [],
    expected: toExpectedJson((t as any).expected),
  }));
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

    // Blocks: explicit `blocks:` list wins; otherwise derive from the legacy
    // fields (code lesson = body markdown + a code block, content lesson =
    // a single markdown block).
    let blocks: Block[] | null = null;
    if (Array.isArray(d.blocks) && d.blocks.length > 0) {
      blocks = d.blocks.map((b: any, i: number) => parseBlock(b, i, courseId));
    } else {
      const legacyCode = parseCodeBlock(d);
      if (legacyCode) {
        blocks = [legacyCode, markdownBlock(content)];
      } else if (content.trim().length > 0) {
        blocks = [markdownBlock(content)];
      }
    }
    if (!blocks || blocks.length === 0) {
      throw new Error("lesson has no content: add a body or a `blocks:` list");
    }

    const hasExercise = blocks.some((b) => b.type === "code");

    return {
      id: String(d.id),
      courseId,
      title: String(d.title),
      difficulty: (d.difficulty ?? "easy") as Difficulty,
      order: typeof d.order === "number" ? d.order : Infinity,
      tags: Array.isArray(d.tags) ? d.tags.map(String) : [],
      blocks,
      hasExercise,
    };
  } catch (e) {
    loadErrors[path.basename(file)] = (e as Error).message;
    console.error(`[trucoder] failed to load lesson ${file}:`, (e as Error).message);
    return null;
  }
}

function markdownBlock(content: string): MarkdownBlock {
  return { type: "markdown", content };
}

/** Build a code block from legacy lesson frontmatter (pre-blocks format). */
function parseCodeBlock(d: Record<string, any>): CodeBlock | null {
  const starterMap = normalizeLangMap(d.starter);
  if (Object.keys(starterMap).length === 0 && d.type !== "code") return null;

  const languages: Lang[] = (d.languages ?? []).filter((l: string) =>
    SUPPORTED_LANGS.has(l as Lang)
  );
  if (languages.length === 0) languages.push("java");

  return {
    type: "code",
    task: String(d.task ?? "Implement solve(...) per the signature."),
    languages,
    signature: normalizeLangMap(d.signature),
    starterCode: starterMap,
    publicTests: mapTests(d.tests?.public),
    privateTests: mapTests(d.tests?.private),
    timeLimitMs: typeof d.timeLimitMs === "number" ? d.timeLimitMs : 2000,
    hints: Array.isArray(d.hints) ? d.hints.map(String) : [],
    solution: typeof d.solution === "string" ? d.solution : undefined,
  };
}

/** Parse one entry of a `blocks:` list into a typed block. */
function parseBlock(raw: any, index: number, courseId: string): Block {
  if (!raw || typeof raw !== "object") {
    throw new Error(`block #${index}: expected an object with a type`);
  }
  switch (raw.type) {
    case "markdown": {
      if (typeof raw.content !== "string") {
        throw new Error(`block #${index} (markdown): missing content`);
      }
      return { type: "markdown", content: raw.content };
    }
    case "code": {
      const block = parseCodeBlock(raw);
      if (!block) throw new Error(`block #${index} (code): missing starter code`);
      return block;
    }
    case "mcq": {
      if (
        typeof raw.prompt !== "string" ||
        !Array.isArray(raw.options) ||
        raw.options.length < 2 ||
        typeof raw.answer !== "number" ||
        raw.answer < 0 ||
        raw.answer >= raw.options.length
      ) {
        throw new Error(
          `block #${index} (mcq): need prompt, >=2 options, and a valid answer index`
        );
      }
      const b: McqBlock = {
        type: "mcq",
        prompt: raw.prompt,
        options: raw.options.map(String),
        answer: raw.answer,
        explanation: typeof raw.explanation === "string" ? raw.explanation : "",
      };
      return b;
    }
    case "mscq": {
      if (
        typeof raw.prompt !== "string" ||
        !Array.isArray(raw.options) ||
        raw.options.length < 2 ||
        !Array.isArray(raw.answer) ||
        raw.answer.length === 0 ||
        raw.answer.some(
          (a: unknown) =>
            typeof a !== "number" || a < 0 || a >= raw.options.length
        )
      ) {
        throw new Error(
          `block #${index} (mscq): need prompt, >=2 options, and a non-empty answer index list`
        );
      }
      const b: MscqBlock = {
        type: "mscq",
        prompt: raw.prompt,
        options: raw.options.map(String),
        answer: [
          ...new Set((raw.answer as unknown[]).map((a) => Number(a))),
        ].sort((a, b) => a - b),
        explanation: typeof raw.explanation === "string" ? raw.explanation : "",
      };
      return b;
    }
    case "image": {
      if (typeof raw.src !== "string" || typeof raw.alt !== "string") {
        throw new Error(`block #${index} (image): need src and alt`);
      }
      const b: ImageBlock = {
        type: "image",
        src: raw.src,
        alt: raw.alt,
        caption: typeof raw.caption === "string" ? raw.caption : undefined,
      };
      if (!fs.existsSync(path.join(config.coursesDir, courseId, "assets", path.basename(b.src)))) {
        console.warn(
          `[trucoder] image block #${index} in ${courseId}: asset not found: ${b.src}`
        );
      }
      return b;
    }
    case "flowchart": {
      if (!Array.isArray(raw.nodes) || raw.nodes.length === 0) {
        throw new Error(`block #${index} (flowchart): need a non-empty nodes list`);
      }
      const edges: FlowEdge[] = (raw.edges ?? []).map((e: any, ei: number) => {
        if (
          typeof e !== "object" ||
          typeof e.from !== "number" ||
          typeof e.to !== "number" ||
          e.from < 0 ||
          e.to < 0 ||
          e.from >= raw.nodes.length ||
          e.to >= raw.nodes.length
        ) {
          throw new Error(
            `block #${index} (flowchart): edge #${ei} must have valid from/to node indices`
          );
        }
        return {
          from: e.from,
          to: e.to,
          label: typeof e.label === "string" ? e.label : undefined,
        };
      });
      const b: FlowchartBlock = {
        type: "flowchart",
        title: typeof raw.title === "string" ? raw.title : undefined,
        nodes: raw.nodes.map(String),
        edges,
      };
      return b;
    }
    default:
      throw new Error(
        `block #${index}: unknown block type '${String(raw.type)}' (expected markdown, code, mcq, mscq, image, flowchart)`
      );
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
