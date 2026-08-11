import { buildHarness } from "./util/harness";
import type { Lang } from "./courses/types";
/**
 * Code sandbox — now a network service.
 *
 * The app container has NO docker socket. Grading goes over the internal
 * compose network to a long-lived sandbox daemon (sandbox:9000 /
 * sandbox-node:9001, see sandboxd.js in the sandbox image dirs). The daemon
 * spawns the actual per-run container with the same Docker-level isolation
 * as before:
 *
 *   - --network none            (no external connectivity)
 *   - --read-only rootfs        (nothing writable except a tmpfs)
 *   - --memory / --cpus / --pids-limit  (cgroup hard limits)
 *   - --cap-drop ALL            (no capabilities)
 *   - --security-opt no-new-privileges
 *   - non-root user (uid 1000)  (no privilege inside the container either)
 *   - throwaway tmpfs workdir   (no host mounts, no cleanup on the host)
 *
 * The source arrives base64 via env; the args arrive as JSON on stdin. The
 * daemon classifies infra failures (docker missing, daemon down, image
 * missing, output overflow) and returns the same SandboxResult shape the
 * old direct-docker code produced — judge.ts is untouched.
 */

const SANDBOX_URL = process.env.SANDBOX_URL || "http://sandbox:9000";
const SANDBOX_NODE_URL = process.env.SANDBOX_NODE_URL || "http://sandbox-node:9001";
// Startup overhead (JVM/node/python cold start + container creation) is not
// part of the algorithm's time budget. Add slack so a correct solution isn't
// killed just for starting up on the Pi.
const STARTUP_BUFFER_MS = 5000;

export interface SandboxRunOptions {
  language: Lang;
  /** The user's code. For Java this is the body of class Main (a method). */
  code: string;
  /** Batch of test cases. Each has positional args, serialized to JSON. */
  tests: { args: unknown[] }[];
  /** Wall-clock limit in ms (per whole batch). */
  timeLimitMs: number;
}

/** Module-exercise run: a set of real files (entry = learner's module, plus
 *  extra read-only files and the node:test file) executed by Node 24. */
export interface ModuleSandboxOptions {
  /** path -> content map (entry module, extra files, test file). */
  files: Record<string, string>;
  /** The file the learner wrote (used for diagnostics). */
  entry: string;
  /** The test file to run (node:test). */
  testsFile: string;
  /** Wall-clock limit in ms (per whole batch). */
  timeLimitMs: number;
}

export interface SandboxResult {
  stdout: string;
  stderr: string;
  code: number;
  timedOut: boolean;
  /** Set when compilation failed (Java). Entrypoint exits 2 on compile fail. */
  compileError?: string;
  /**
   * Infrastructure failure — NOT the learner's fault (daemon down, image
   * missing, output overflow). When set, the run never reached the learner's
   * code, so the result carries no per-test verdicts.
   */
  sandboxError?: string;
}

/** POST a run to a sandbox daemon and translate transport failures into a
 *  SandboxResult with sandboxError set (never throws). */
async function postRun(
  url: string,
  payload: Record<string, unknown>,
  effectiveMs: number
): Promise<SandboxResult> {
  try {
    const res = await fetch(`${url}/run`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      // The daemon's own docker timeout is effectiveMs + 30s; give the HTTP
      // call a wider window so the daemon's verdict wins, not the abort.
      signal: AbortSignal.timeout(effectiveMs + 40_000),
    });
    if (!res.ok) {
      const txt = (await res.text()).slice(0, 300);
      return {
        stdout: "",
        stderr: txt,
        code: 1,
        timedOut: false,
        sandboxError: `sandbox service error (HTTP ${res.status}): ${txt.slice(0, 200)}`,
      };
    }
    return (await res.json()) as SandboxResult;
  } catch (err) {
    return {
      stdout: "",
      stderr: "",
      code: 1,
      timedOut: false,
      sandboxError: `sandbox service unreachable (${url}): ${(err as Error).message}`,
    };
  }
}

/**
 * Verify at boot that both sandbox daemons are up and their images exist.
 * Non-fatal: the server still boots (grading just fails with a clear error).
 */
export function preflightSandbox(): void {
  for (const url of [SANDBOX_URL, SANDBOX_NODE_URL]) {
    void (async () => {
      try {
        const res = await fetch(`${url}/health`, { signal: AbortSignal.timeout(5000) });
        const body = (await res.json().catch(() => null)) as
          | { ok?: boolean; image?: string; error?: string }
          | null;
        if (res.ok && body?.ok) {
          console.log(`[trucoder] sandbox daemon healthy (${url} -> ${body.image})`);
        } else {
          console.warn(
            `[trucoder] WARNING: sandbox daemon unhealthy (${url}): ` +
              `HTTP ${res.status} ${body?.error ?? "no detail"}`
          );
        }
      } catch (err) {
        console.warn(
          `[trucoder] WARNING: sandbox daemon unreachable (${url}) — ` +
            `grading will fail: ${(err as Error).message}`
        );
      }
    })();
  }
}

export function runInSandbox(options: SandboxRunOptions): Promise<SandboxResult> {
  const source = buildHarness(options.language, options.code);
  const effectiveMs = options.timeLimitMs + STARTUP_BUFFER_MS;
  const timeoutSecs = Math.max(2, Math.ceil(effectiveMs / 1000));
  return postRun(
    SANDBOX_URL,
    {
      kind: "code",
      sourceB64: Buffer.from(source, "utf8").toString("base64"),
      lang: options.language,
      tests: options.tests,
      timeoutSecs,
      maxOutputBytes: 8 * 1024 * 1024,
    },
    effectiveMs
  );
}

/** Run a module exercise: real files (learner entry + extras + test file)
 *  executed by the Node 24 sandbox. Stdout = the test file's own output
 *  (the JSON reporter is redirected to a file inside the container). */
export function runModuleInSandbox(
  options: ModuleSandboxOptions
): Promise<SandboxResult> {
  const effectiveMs = options.timeLimitMs + STARTUP_BUFFER_MS;
  const timeoutSecs = Math.max(5, Math.ceil(effectiveMs / 1000));
  return postRun(
    SANDBOX_NODE_URL,
    {
      kind: "module",
      filesB64: Buffer.from(JSON.stringify(options.files), "utf8").toString("base64"),
      entry: options.entry,
      testsFile: options.testsFile,
      timeoutSecs,
      maxOutputBytes: 16 * 1024 * 1024,
    },
    effectiveMs
  );
}
