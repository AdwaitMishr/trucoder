import { runInSandbox, type SandboxResult } from "./sandbox";
import type { CodeBlock, Lang, TestCase } from "./courses/types";
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
  // Compilers (java, cpp) exit 2 on compile failure; interpreters don't compile.
  return (lang === "java" || lang === "cpp") && res.code === 2 ? res.stderr : undefined;
}

async function runBatch(
  block: CodeBlock,
  lang: Lang,
  code: string,
  tests: TestCase[]
): Promise<{ results: TestResult[]; sandboxError?: string }> {
  try {
    const res = await runInSandbox({
      language: lang,
      code,
      tests: tests.map((t) => ({ args: t.args })),
      timeLimitMs: block.timeLimitMs,
    });
    // Infrastructure failure (docker/image/daemon) — not the learner's fault.
    if (res.sandboxError) {
      return { results: [], sandboxError: res.sandboxError };
    }
    if (compileErrorFrom(lang, res)) {
      return {
        results: tests.map((t) => ({
          name: t.name,
          passed: false,
          error: `compile error:\n${compileErrorFrom(lang, res)!.slice(0, 2000)}`,
        })),
      };
    }
    if (res.timedOut) {
      return {
        results: tests.map((t) => ({
          name: t.name,
          passed: false,
          error:
            "time limit exceeded — your code was too slow for the hidden tests. Look for a faster approach (e.g. memoization).",
        })),
      };
    }
    if (res.code !== 0) {
      return {
        results: tests.map((t) => ({
          name: t.name,
          passed: false,
          error: `runtime error (exit ${res.code}):\n${(res.stderr || "").slice(
            0,
            2000
          )}`,
        })),
      };
    }
    return { results: parseResults(res.stdout, tests) };
  } catch (err) {
    return {
      results: tests.map((t) => ({
        name: t.name,
        passed: false,
        error: `runner error: ${(err as Error).message}`,
      })),
    };
  }
}

export async function runPublic(
  block: CodeBlock,
  lang: Lang,
  code: string
): Promise<import("./types").RunResult> {
  const { results, sandboxError } = await runBatch(
    block,
    lang,
    code,
    block.publicTests
  );
  if (sandboxError) return { publicTests: [], sandboxError };
  const compileError = results.find((r) => r.error?.startsWith("compile error"))
    ?.error;
  return { publicTests: results, compileError };
}

export async function submit(
  block: CodeBlock,
  lang: Lang,
  code: string
): Promise<import("./types").SubmitResult> {
  const all = [...block.publicTests, ...block.privateTests];
  const { results, sandboxError } = await runBatch(block, lang, code, all);
  if (sandboxError) {
    return {
      verdict: "error",
      publicTests: [],
      privatePassed: 0,
      privateTotal: block.privateTests.length,
      sandboxError,
    };
  }

  const publicTests = results.slice(0, block.publicTests.length);
  const privateTests = results.slice(block.publicTests.length);
  const privatePassed = privateTests.filter((r) => r.passed).length;

  const compileError = publicTests.find((r) =>
    r.error?.startsWith("compile error")
  )?.error;
  const runtimeError = publicTests.find((r) =>
    r.error?.startsWith("runtime error")
  )?.error;
  const timedOut = results.some((r) =>
    r.error?.startsWith("time limit exceeded")
  );

  const publicPassed = publicTests.filter((r) => r.passed).length;
  const allPassed =
    compileError === undefined &&
    runtimeError === undefined &&
    !timedOut &&
    publicPassed === publicTests.length &&
    privatePassed === privateTests.length;

  return {
    verdict: compileError
      ? "error"
      : timedOut
        ? "timeout"
        : runtimeError
          ? "error"
          : allPassed
            ? "accepted"
            : "wrong",
    publicTests,
    privatePassed,
    privateTotal: privateTests.length,
    compileError,
    error: compileError || runtimeError || (timedOut ? "time limit exceeded" : undefined),
  };
}
