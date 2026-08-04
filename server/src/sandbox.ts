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
    "/tmp:rw,size=128m,mode=1777",
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
        const e = err as { code?: number; killed?: boolean; signal?: string } | null;
        const code =
          e && typeof e.code === "number" ? e.code : e ? (e.killed ? 137 : 1) : 0;
        const timedOut = code === 124 || code === 137;
        resolve({
          stdout: stdout || "",
          stderr: stderr || "",
          code,
          timedOut,
          compileError:
            options.language === "java" && code === 2 ? stderr || undefined : undefined,
        });
      }
    );
    child.stdin?.end(JSON.stringify({ tests: options.tests }));
  });
}
