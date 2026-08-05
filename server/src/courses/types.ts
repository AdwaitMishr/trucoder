export type Lang = "java" | "javascript" | "python";
export type Difficulty = "beginner" | "easy" | "medium" | "hard";

export interface TestCase {
  name: string;
  args: unknown[];
  /** Expected result as a compact JSON string (string-safe for big ints). */
  expected: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  difficulty: Difficulty;
  order: number;
  tags: string[];
  /** True when the lesson has a coding exercise (signature/starter/tests). */
  hasExercise: boolean;
  task: string;
  languages: Lang[];
  signature: Partial<Record<Lang, string>>;
  starterCode: Partial<Record<Lang, string>>;
  publicTests: TestCase[];
  privateTests: TestCase[];
  timeLimitMs: number;
  solution?: string;
  /** Progressive hints (revealed one at a time in the UI). */
  hints: string[];
  /** Markdown lesson body (served to the client, rendered there). */
  body: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  difficultyLevels: string[];
  /** Markdown syllabus/welcome body. */
  body: string;
  lessons: Lesson[];
}
