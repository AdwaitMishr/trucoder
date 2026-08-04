import { runInSandbox, type SandboxResult } from "./sandbox";
import type { Lang, Lesson, TestCase } from "./courses/types";
import type { RunResult, SubmitResult, TestResult } from "./types";

/**
 * Grading pipeline:
 *
 *   user code + lesson  ->  harness (calls solve, one JSON result per line)
 *   all test cases      ->  one container execution, stdin = { tests: [...] }
 *   results             ->  line i == result for test i, compared to expected
 *
 * Batching all tests into a single container run means one javac compile and
 * one container per action, instead of one per test case. The runner is
 * swappable per-lesson in the future; today every lesson uses the default
 * "call solve and compare JSON" runner.
 */

const ERROR_MARKER = "__tru_error__";

function resultFromLine(line: string, test: TestCase): TestResult {
  const trimmed = line.trim();
  if (trimmed.startsWith(`{"${ERROR_MARKER}"`)) {
    let message = trimmed;
    try {
      const obj = JSON.parse(trimmed);
      message = String(obj[ERROR_MARKER] ?? trimmed);
    } catch {
      /* keep raw */
    }
    return {
      name: test.name,
      passed: false,
      error: `runtime error: ${message.slice(0, 2000)}`,
    };
  }
  return {
    name: test.name,
    passed: trimmed === test.expected,
    expected: test.expected,
    actual: trimmed || "(no output)",
  };
}

function parseResults(stdout: string, tests: TestCase[]): TestResult[] {
  const lines = stdout.split("\n");
  return tests.map((t, i) => resultFromLine(lines[i] ?? "", t));
}

function compileErrorFrom(lang: Lang, res: SandboxResult): string | undefined {
  return lang === "java" && res.code === 2 ? res.stderr : undefined;
}

async function runBatch(
  lesson: Lesson,
  lang: Lang,
  code: string,
  tests: TestCase[]
): Promise<TestResult[]> {
  try {
    const res = await runInSandbox({
      language: lang,
      code,
      tests: tests.map((t) => ({ args: t.args })),
      timeLimitMs: lesson.timeLimitMs,
    });
    if (compileErrorFrom(lang, res)) {
      return tests.map((t) => ({
        name: t.name,
        passed: false,
        error: `compile error:\n${compileErrorFrom(lang, res)!.slice(0, 2000)}`,
      }));
    }
    if (res.timedOut) {
      return tests.map((t) => ({
        name: t.name,
        passed: false,
        error: "time limit exceeded. Check for an infinite loop.",
      }));
    }
    if (res.code !== 0) {
      return tests.map((t) => ({
        name: t.name,
        passed: false,
        error: `runtime error (exit ${res.code}):\n${(res.stderr || "").slice(
          0,
          2000
        )}`,
      }));
    }
    return parseResults(res.stdout, tests);
  } catch (err) {
    return tests.map((t) => ({
      name: t.name,
      passed: false,
      error: `runner error: ${(err as Error).message}`,
    }));
  }
}

export async function runPublic(
  lesson: Lesson,
  lang: Lang,
  code: string
): Promise<import("./types").RunResult> {
  const results = await runBatch(lesson, lang, code, lesson.publicTests);
  const compileError = results.find((r) => r.error?.startsWith("compile error"))
    ?.error;
  return { publicTests: results, compileError };
}

export async function submit(
  lesson: Lesson,
  lang: Lang,
  code: string
): Promise<import("./types").SubmitResult> {
  const all = [...lesson.publicTests, ...lesson.privateTests];
  const results = await runBatch(lesson, lang, code, all);

  const publicTests = results.slice(0, lesson.publicTests.length);
  const privateTests = results.slice(lesson.publicTests.length);
  const privatePassed = privateTests.filter((r) => r.passed).length;

  const compileError = publicTests.find((r) =>
    r.error?.startsWith("compile error")
  )?.error;
  const runtimeError = publicTests.find((r) =>
    r.error?.startsWith("runtime error")
  )?.error;

  const publicPassed = publicTests.filter((r) => r.passed).length;
  const allPassed =
    compileError === undefined &&
    runtimeError === undefined &&
    publicPassed === publicTests.length &&
    privatePassed === privateTests.length;

  return {
    verdict: compileError
      ? "error"
      : runtimeError
        ? "error"
        : allPassed
          ? "accepted"
          : "wrong",
    publicTests,
    privatePassed,
    privateTotal: privateTests.length,
    compileError,
    error: compileError || runtimeError,
  };
}
