export type Lang = "java" | "javascript" | "python" | "cpp";
export type Difficulty = "beginner" | "easy" | "medium" | "hard";

export interface CourseSummary {
  id: string;
  title: string;
  description: string;
  difficultyLevels: string[];
  lessonCount: number;
  solved: number;
  body: string;
}

export interface LessonMeta {
  id: string;
  title: string;
  difficulty: Difficulty;
  order: number;
  tags: string[];
  hasExercise: boolean;
  solved: boolean;
  attemptCount: number;
}

export interface CourseDetail {
  id: string;
  title: string;
  description: string;
  difficultyLevels: string[];
  body: string;
  lessons: LessonMeta[];
}

export interface PublicTestCase {
  name: string;
  args: unknown[];
  expected: string;
}

export interface CodeBlock {
  type: "code";
  task: string;
  languages: Lang[];
  signature: Partial<Record<Lang, string>>;
  starterCode: Partial<Record<Lang, string>>;
  publicTests: PublicTestCase[];
  timeLimitMs: number;
  hints: string[];
  /** "function" (default) | "module" — module exercises run a real backend
   *  file against a visible node:test suite. */
  mode?: "function" | "module";
  /** Present when mode === "module". */
  module?: {
    entry: string;
    language: "javascript" | "typescript";
    testsFile: string;
    /** Canned preview text shown when all tests pass (fallback to output). */
    preview?: string;
  };
}

export interface MarkdownBlock {
  type: "markdown";
  content: string;
}

export interface McqBlock {
  type: "mcq";
  prompt: string;
  options: string[];
  explanation: string;
}

export interface MscqBlock {
  type: "mscq";
  prompt: string;
  options: string[];
  explanation: string;
}

export interface ImageBlock {
  type: "image";
  src: string;
  alt: string;
  caption?: string;
}

export interface FlowEdge {
  from: number;
  to: number;
  label?: string;
}
export interface FlowchartBlock {
  type: "flowchart";
  title?: string;
  nodes: string[];
  edges: FlowEdge[];
}

export type QuizBlock = McqBlock | MscqBlock;
export type Block =
  | CodeBlock
  | MarkdownBlock
  | McqBlock
  | MscqBlock
  | ImageBlock
  | FlowchartBlock;

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  difficulty: Difficulty;
  order: number;
  tags: string[];
  hasExercise: boolean;
  blocks: Block[];
  /** Indices of quiz blocks the user has already answered correctly. */
  solvedBlocks: number[];
  progress: { solved: boolean; attemptCount: number };
  lastCode: string | null;
  lastLanguage: Lang | null;
  prevLesson: { id: string; title: string } | null;
  nextLesson: { id: string; title: string } | null;
  lessonIndex: number;
  lessonCount: number;
}

export interface TestResult {
  name: string;
  passed: boolean;
  expected?: string;
  actual?: string;
  error?: string;
}

export interface RunResult {
  publicTests: TestResult[];
  compileError?: string;
  /** Module exercises: the test suite's stdout (output preview). */
  output?: string;
}

export interface SubmitResult {
  verdict: "accepted" | "wrong" | "error" | "timeout";
  publicTests: TestResult[];
  privatePassed: number;
  privateTotal: number;
  compileError?: string;
  /** Module exercises: the test suite's stdout (output preview). */
  output?: string;
  error?: string;
}

export interface AnswerResult {
  correct: boolean;
  explanation: string;
  lessonSolved: boolean;
}

export interface User {
  id: number;
  username: string;
}
