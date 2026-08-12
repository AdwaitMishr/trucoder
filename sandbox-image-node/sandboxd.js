#!/usr/bin/env node
/**
 * TruCoder sandbox daemon.
 *
 * Runs INSIDE the sandbox image as a long-lived compose service. The app
 * container talks to it over the internal compose network (no docker socket
 * in the app). Each request spawns a FRESH hardened per-run container with
 * the exact same isolation flags the old in-app code used:
 *
 *   --network none, read-only rootfs, memory/CPU/pids caps, drop ALL caps,
 *   no-new-privileges, non-root user, throwaway exec tmpfs.
 *
 * The image's own ENTRYPOINT (run.sh) stays the default — per-run spawns use
 * it. The compose service overrides entrypoint to this daemon.
 *
 * API:
 *   GET  /health              -> { ok, image } (docker image inspect)
 *   POST /run                 -> SandboxResult JSON (same shape as before)
 *
 * The daemon needs the docker CLI + the host docker socket (mounted by
 * compose) — it only ever spawns hardened, --network none containers.
 */
"use strict";

const http = require("http");
const { execFile } = require("child_process");

const IMAGE = process.env.SANDBOXD_IMAGE || "trucoder-sandbox:latest";
const PORT = parseInt(process.env.SANDBOXD_PORT || "9000", 10);
const MEMORY_MB = 768;
const HEAP_MB = 512;
const COMPILE_SECS = 20;
const STARTUP_BUFFER_MS = 5000;
const DEFAULT_MAX_OUTPUT = 8 * 1024 * 1024;
// Per-run containers are heavyweight (JVM cold start, ~768MB cgroup each).
// On the Pi, letting the app fire N containers at once can OOM the host —
// cap concurrent runs and queue the rest. The app's HTTP timeout
// (effectiveMs + 40s) is wider than the per-run budget, so queued runs
// still complete inside the client's window in practice.
const MAX_CONCURRENT =
  parseInt(process.env.SANDBOXD_MAX_CONCURRENT || "2", 10) || 2;

// ---- tiny FIFO concurrency gate ----
let active = 0;
const queue = [];
function gate(fn) {
  return new Promise((resolve, reject) => {
    queue.push({ fn, resolve, reject });
    pump();
  });
}
function pump() {
  while (active < MAX_CONCURRENT && queue.length > 0) {
    const { fn, resolve, reject } = queue.shift();
    active += 1;
    Promise.resolve()
      .then(fn)
      .then(resolve, reject)
      .finally(() => {
        active -= 1;
        pump();
      });
  }
}

const DOCKER_STDERR_PATTERNS = [
  {
    re: /Cannot connect to the Docker daemon/i,
    message:
      "sandbox unavailable — the Docker daemon is not running. Start it and try again.",
  },
  {
    re: /No such image|pull access denied|repository does not exist/i,
    message:
      `sandbox image missing (${IMAGE}) — run: docker compose build sandbox`,
  },
  {
    re: /permission denied|Is your user in the "docker" group/i,
    message:
      "sandbox unavailable — docker permission denied. The sandbox service must be in the host docker group.",
  },
];

function classifySandboxError(e, stderr) {
  if (e && e.code === "ENOENT") {
    return "sandbox unavailable — the docker binary was not found inside the sandbox service.";
  }
  if (e && e.code === "ERR_CHILD_PROCESS_STDIO_MAXBUFFER") {
    return "program output exceeded the 8 MB capture limit — the harness cannot receive it.";
  }
  const stderrText = stderr || "";
  for (const p of DOCKER_STDERR_PATTERNS) {
    if (p.re.test(stderrText)) return p.message;
  }
  if (typeof e?.code === "number" && e.code === 125) {
    return `sandbox container failed to start (exit 125): ${
      stderrText.slice(0, 300) || "no detail from docker"
    }`;
  }
  return undefined;
}

function buildDockerArgs(req) {
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
  ];
  if (req.kind === "module") {
    args.push(
      "--tmpfs",
      "/tmp:rw,size=256m,mode=1777,exec",
      "-e",
      `FILES_B64=${req.filesB64}`,
      "-e",
      `MODULE_ENTRY=${req.entry}`,
      "-e",
      `MODULE_TESTFILE=${req.testsFile}`,
      "-e",
      `TIMEOUT_SECS=${req.timeoutSecs}`,
      IMAGE
    );
    return { args, stdin: null };
  }
  args.push(
    "--tmpfs",
    "/tmp:rw,size=128m,mode=1777,exec",
    "-e",
    `SOURCE_B64=${req.sourceB64}`,
    "-e",
    `LANG=${req.lang}`,
    "-e",
    `TIMEOUT_SECS=${req.timeoutSecs}`,
    "-e",
    `HEAP_MB=${HEAP_MB}`,
    "-e",
    `COMPILE_SECS=${COMPILE_SECS}`,
    IMAGE
  );
  return { args, stdin: JSON.stringify({ tests: req.tests }) };
}

function handleRun(req, res, body) {
  let payload;
  try {
    payload = JSON.parse(body);
  } catch {
    res.writeHead(400, { "content-type": "application/json" });
    res.end(JSON.stringify({ sandboxError: "sandbox daemon: bad request JSON" }));
    return;
  }
  const { args, stdin } = buildDockerArgs(payload);
  const timeoutSecs = Number(payload.timeoutSecs) || 10;
  const effectiveMs = timeoutSecs * 1000 + STARTUP_BUFFER_MS;
  const maxOutput = Number(payload.maxOutputBytes) || DEFAULT_MAX_OUTPUT;

  // Serialized through the concurrency gate: at most MAX_CONCURRENT docker
  // runs at once; the rest wait their turn (each with its own timeout).
  gate(() => {
    return new Promise((resolve) => {
      const child = execFile(
        "docker",
        args,
        { timeout: effectiveMs + 30_000, maxBuffer: maxOutput },
        (err, stdout, stderr) => {
          const e = err || null;
          const sandboxError = classifySandboxError(e, stderr || "");
          if (sandboxError) {
            res.writeHead(200, { "content-type": "application/json" });
            res.end(
              JSON.stringify({
                stdout: stdout || "",
                stderr: stderr || "",
                code: typeof e?.code === "number" ? e.code : 1,
                timedOut: false,
                sandboxError,
              })
            );
            resolve();
            return;
          }
          const code =
            e && typeof e.code === "number" ? e.code : e ? (e.killed ? 137 : 1) : 0;
          const timedOut = code === 124 || code === 137;
          res.writeHead(200, { "content-type": "application/json" });
          res.end(
            JSON.stringify({
              stdout: stdout || "",
              stderr: stderr || "",
              code,
              timedOut,
              compileError:
                (payload.lang === "java" || payload.lang === "cpp") && code === 2
                  ? stderr || undefined
                  : undefined,
            })
          );
          resolve();
        }
      );
      child.stdin.end(stdin ?? undefined);
    });
  }).catch((err) => {
    // A failure inside the gated promise (should not happen — execFile
    // reports through the callback) still answers the client.
    res.writeHead(500, { "content-type": "application/json" });
    res.end(JSON.stringify({ sandboxError: `sandbox daemon error: ${err.message}` }));
  });
}

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    execFile("docker", ["image", "inspect", IMAGE], (err) => {
      const ok = !err;
      res.writeHead(ok ? 200 : 500, { "content-type": "application/json" });
      res.end(JSON.stringify({ ok, image: IMAGE, error: err ? String(err) : null }));
    });
    return;
  }
  if (req.method === "POST" && req.url === "/run") {
    let body = "";
    req.on("data", (c) => {
      body += c;
      if (body.length > 4 * 1024 * 1024) req.destroy();
    });
    req.on("end", () => handleRun(req, res, body));
    return;
  }
  res.writeHead(404);
  res.end();
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[sandboxd] ${IMAGE} listening on :${PORT}`);
});
