export type Lang = "java" | "javascript" | "python";
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

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  difficulty: Difficulty;
  order: number;
  tags: string[];
  hasExercise: boolean;
  task: string;
  languages: Lang[];
  signature: Partial<Record<Lang, string>>;
  starterCode: Partial<Record<Lang, string>>;
  publicTests: PublicTestCase[];
  timeLimitMs: number;
  body: string;
  hints: string[];
  progress: { solved: boolean; attemptCount: number };
  lastCode: string | null;
  lastLanguage: Lang | null;
  /** Previous/next lesson within the course (for course navigation). */
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
}

export interface SubmitResult {
  verdict: "accepted" | "wrong" | "error" | "timeout";
  publicTests: TestResult[];
  privatePassed: number;
  privateTotal: number;
  compileError?: string;
  error?: string;
}

export interface User {
  id: number;
  username: string;
}
