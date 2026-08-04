/** Shared API result types. Lesson/Course model lives in courses/types.ts. */

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
  verdict: "accepted" | "wrong" | "error";
  publicTests: TestResult[];
  privatePassed: number;
  privateTotal: number;
  compileError?: string;
  error?: string;
}
