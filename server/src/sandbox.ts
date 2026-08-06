import { execFile } from "child_process";
import { buildHarness } from "./util/harness";
import type { Lang } from "./courses/types";
/**
 * Code sandbox backed by an isolated container.
 *
 * Piston/Judge0 publish amd64 images only, so they cannot run on this arm64
 * Pi. Instead we run a small arm64 image (trucoder-sandbox) that carries the
 * JDK + Node + Python and Gson. Each submission runs as a fresh container with
 * Docker-level isolation:
 *
 *   - --network none            (no external connectivity)
 *   - --read-only rootfs        (nothing writable except a tmpfs)
 *   - --memory / --cpus / --pids-limit  (cgroup hard limits)
 *   - --cap-drop ALL            (no capabilities)
 *   - --security-opt no-new-privileges
 *   - non-root user (uid 1000)  (no privilege inside the container either)
 *   - throwaway tmpfs workdir   (no host mounts, no cleanup on the host)
 *
 * The source arrives base64 via env; the args arrive as JSON on stdin. The app
 * talks to the Docker daemon via the docker CLI over the local socket (the app
 * user is in the docker group — no sudo needed).
 */

const SANDBOX_IMAGE = process.env.SANDBOX_IMAGE || "trucoder-sandbox:latest";
const HEAP_MB = 512;
const MEMORY_MB = 768;
// Startup overhead (JVM/node/python cold start + container creation) is not
// part of the algorithm's time budget. Add slack so a correct solution isn't
// killed just for starting up on the Pi.
const STARTUP_BUFFER_MS = 5000;
const COMPILE_SECS = 20;

export interface SandboxRunOptions {
  language: Lang;
  /** The user's code. For Java this is the body of class Main (a method). */
  code: string;
  /** Batch of test cases. Each has positional args, serialized to JSON. */
  tests: { args: unknown[] }[];
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
   * Infrastructure failure — NOT the learner's fault (docker missing, daemon
   * down, image missing, output overflow). When set, the run never reached
   * the learner's code, so the result carries no per-test verdicts.
   */
  sandboxError?: string;
}

/**
 * Verify at boot that the sandbox image exists, so a missing image surfaces
 * in the logs instead of as a confusing runtime error on the first run.
 * Non-fatal: the server still boots (grading just fails with a clear error).
 */
export function preflightSandbox(): void {
  execFile("docker", ["image", "inspect", SANDBOX_IMAGE], (err) => {
    if (err) {
      console.warn(
        `[trucoder] WARNING: sandbox image '${SANDBOX_IMAGE}' not found — ` +
          `grading will fail until it is built. Run: ` +
          `docker build -t ${SANDBOX_IMAGE} sandbox-image/`
      );
    } else {
      console.log(`[trucoder] sandbox image '${SANDBOX_IMAGE}' present`);
    }
  });
}

const DOCKER_STDERR_PATTERNS: { re: RegExp; message: string }[] = [
  {
    re: /Cannot connect to the Docker daemon/i,
    message:
      "sandbox unavailable — the Docker daemon is not running. Start it and try again.",
  },
  {
    re: /No such image|pull access denied|repository does not exist/i,
    message:
      `sandbox image missing (${SANDBOX_IMAGE}) — build it with: ` +
      `docker build -t ${SANDBOX_IMAGE} sandbox-image/`,
  },
  {
    re: /permission denied|Is your user in the "docker" group/i,
    message:
      "sandbox unavailable — docker permission denied. The app user must be in the docker group.",
  },
];

/** Classify a failed docker invocation into a human-readable sandbox error. */
function classifySandboxError(e: {
  code?: string | number;
  killed?: boolean;
  signal?: string;
} | null, stderr: string): string | undefined {
  // The docker binary itself is missing.
  if (e && e.code === "ENOENT") {
    return "sandbox unavailable — the docker binary was not found. Is Docker installed and in PATH?";
  }
  // execFile kills the child on stdout overflow — that is NOT a timeout and
  // NOT the learner's fault; 8MB of captured output is a harness limit.
  if (e && e.code === "ERR_CHILD_PROCESS_STDIO_MAXBUFFER") {
    return "program output exceeded the 8 MB capture limit — the harness cannot receive it.";
  }
  const stderrText = stderr || "";
  for (const p of DOCKER_STDERR_PATTERNS) {
    if (p.re.test(stderrText)) return p.message;
  }
  // exit 125 is docker's "container failed to start" bucket (daemon-side).
  if (typeof e?.code === "number" && e.code === 125) {
    return `sandbox container failed to start (exit 125): ${stderrText.slice(0, 300) || "no detail from docker"}`;
  }
  return undefined;
}

export function runInSandbox(options: SandboxRunOptions): Promise<SandboxResult> {
  const source = buildHarness(options.language, options.code);
  const effectiveMs = options.timeLimitMs + STARTUP_BUFFER_MS;
  const timeoutSecs = Math.max(2, Math.ceil(effectiveMs / 1000));

  const args = [
    "run",
    "--rm",
    "-i",
    "--network",
    "none",
    "--read-only",
    "--memory",
    `${MEMORY_MB}m`,
    "--cpus",
    "1",
    "--pids-limit",
    "128",
    "--cap-drop",
    "ALL",
    "--security-opt",
    "no-new-privileges",
    "--tmpfs",
    "/tmp:rw,size=128m,mode=1777,exec",
    "-e",
    `SOURCE_B64=${Buffer.from(source, "utf8").toString("base64")}`,
    "-e",
    `LANG=${options.language}`,
    "-e",
    `TIMEOUT_SECS=${timeoutSecs}`,
    "-e",
    `HEAP_MB=${HEAP_MB}`,
    "-e",
    `COMPILE_SECS=${COMPILE_SECS}`,
    SANDBOX_IMAGE,
  ];

  return new Promise((resolve) => {
    const child = execFile(
      "docker",
      args,
      {
        timeout: effectiveMs + 30_000,
        maxBuffer: 8 * 1024 * 1024,
      },
      (err, stdout, stderr) => {
        const e = err as {
          code?: string | number;
          killed?: boolean;
          signal?: string;
        } | null;
        const sandboxError = classifySandboxError(e, stderr || "");
        if (sandboxError) {
          resolve({
            stdout: stdout || "",
            stderr: stderr || "",
            code: typeof e?.code === "number" ? e.code : 1,
            timedOut: false,
            sandboxError,
          });
          return;
        }
        const code =
          e && typeof e.code === "number" ? e.code : e ? (e.killed ? 137 : 1) : 0;
        const timedOut = code === 124 || code === 137;
        resolve({
          stdout: stdout || "",
          stderr: stderr || "",
          code,
          timedOut,
          compileError:
            (options.language === "java" || options.language === "cpp") && code === 2
              ? stderr || undefined
              : undefined,
        });
      }
    );
    child.stdin?.end(JSON.stringify({ tests: options.tests }));
  });
}
