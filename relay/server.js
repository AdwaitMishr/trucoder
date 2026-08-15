// TruCoder Interview — local BYOK relay.
// A tiny zero-dependency proxy so your OpenCode Zen key NEVER leaves this
// machine: the browser talks to THIS process (localhost), which injects the
// key and forwards to opencode.ai. The TruCoder server is never involved.
//
// Run:  node relay/server.js   (or: npm run relay)
// Key storage: ~/.trucoder-interview/key  (0600, written only when you save
// it from the app's settings UI).
"use strict";

const http = require("http");
const https = require("https");
const fs = require("fs");
const os = require("os");
const path = require("path");

const PORT = Number(process.env.RELAY_PORT || 3177);
const ZEN_BASE = process.env.ZEN_BASE_URL || "https://opencode.ai/zen/go/v1";
const APP_ORIGIN = process.env.APP_ORIGIN || "http://localhost:3001";
const KEY_DIR = path.join(os.homedir(), ".trucoder-interview");
const KEY_FILE = path.join(KEY_DIR, "key");

// Only the app (prod: 3001) and the vite dev server (5173) may talk to the
// relay. Reflecting ANY localhost origin (or merely falling back to
// APP_ORIGIN) lets a page served from another local port — or a remote page
// via DNS rebinding + a simple text/plain POST — spend the stored key and
// read the responses.
const ALLOWED_ORIGINS = new Set([
  APP_ORIGIN,
  APP_ORIGIN.replace("://localhost:", "://127.0.0.1:"),
  APP_ORIGIN.replace("://127.0.0.1:", "://localhost:"),
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

/** Browsers always send Origin on cross-origin fetches; requests without
 *  one (curl, tests) are local by construction. */
function originAllowed(req) {
  const origin = req.headers.origin;
  return !origin || ALLOWED_ORIGINS.has(origin);
}

function cors(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Max-Age", "86400");
}

function json(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) });
  res.end(body);
}

function readKey() {
  try {
    return fs.readFileSync(KEY_FILE, "utf8").trim();
  } catch {
    return null;
  }
}

function writeKey(key) {
  fs.mkdirSync(KEY_DIR, { recursive: true });
  fs.writeFileSync(KEY_FILE, key.trim(), { mode: 0o600 });
  fs.chmodSync(KEY_FILE, 0o600); // self-heal if perms ever drift
}

// Forward a request to the Zen API (chat completions, streaming-aware).
function proxy(req, res, pathname) {
  const key = readKey();
  if (!key) return json(res, 401, { error: "no key stored — save your key in the app first" });
  let body = "";
  req.on("data", (c) => {
    if (body.length + c.length > 5 * 1024 * 1024) {
      req.destroy();
      return json(res, 413, { error: "payload too large" });
    }
    body += c;
  });
  req.on("end", () => {
    let payload;
    try {
      payload = body ? JSON.parse(body) : {};
    } catch {
      return json(res, 400, { error: "invalid JSON" });
    }
    const headers = {
      Authorization: "Bearer " + key,
      "Content-Type": "application/json",
    };
    if (req.headers["accept"]) headers["Accept"] = req.headers["accept"];
    const bodyStr = JSON.stringify(payload);
    let attempts = 0;
    const MAX_ATTEMPTS = 3;

    const attempt = () => {
      attempts++;
      const up = https.request(
        ZEN_BASE + pathname,
        { method: "POST", headers, timeout: 240000 },
        (upres) => {
          res.writeHead(upres.statusCode || 500, {
            "Content-Type": upres.headers["content-type"] || "application/json",
          });
          upres.pipe(res);
          upres.on("error", () => res.destroy());
        }
      );
      up.on("timeout", () => up.destroy(new Error("upstream timeout")));
      up.on("error", (e) => {
        // If we already started streaming, the response is committed — just drop
        // the connection instead of trying to write a JSON error.
        if (res.headersSent) return res.destroy();
        // Transient connection errors: retry before giving up (the browser has
        // seen nothing yet, so a retry is invisible to it).
        if (attempts < MAX_ATTEMPTS && /ECONNRESET|ETIMEDOUT|ECONNREFUSED|socket hang up/i.test(e.message)) {
          return attempt();
        }
        json(res, 502, { error: "relay -> zen failed: " + e.message });
      });
      // If the browser goes away mid-stream, tear down the upstream too.
      res.on("close", () => up.destroy());
      up.end(bodyStr);
    };
    attempt();
  });
}

const server = http.createServer((req, res) => {
  cors(req, res);
  // Reject foreign pages BEFORE any work happens — CORS headers alone only
  // stop the response from being READ, not the request from EXECUTING.
  if (!originAllowed(req)) return json(res, 403, { error: "rejected: origin not allowed" });
  if (req.method === "OPTIONS") return res.writeHead(204).end();

  const url = new URL(req.url, "http://localhost");
  const p = url.pathname;

  if (req.method === "GET" && p === "/health") return json(res, 200, { ok: true, hasKey: !!readKey() });

  if (req.method === "GET" && p === "/key") return json(res, 200, { hasKey: !!readKey() });

  if (req.method === "PUT" && p === "/key") {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      try {
        const { key } = JSON.parse(body);
        if (!key || typeof key !== "string" || key.trim().length < 8) {
          return json(res, 400, { error: "key looks too short" });
        }
        writeKey(key);
        json(res, 200, { ok: true });
      } catch {
        json(res, 400, { error: "invalid body" });
      }
    });
    return;
  }

  if (req.method === "DELETE" && p === "/key") {
    try { fs.unlinkSync(KEY_FILE); } catch {}
    return json(res, 200, { ok: true });
  }

  if (req.method === "GET" && p === "/v1/models") {
    const key = readKey();
    if (!key) return json(res, 401, { error: "no key stored" });
    const up = https.request(ZEN_BASE + "/models", { method: "GET", headers: { Authorization: "Bearer " + key }, timeout: 30000 }, (upres) => {
      let data = "";
      upres.on("data", (c) => (data += c));
      upres.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          json(res, 200, parsed);
        } catch {
          json(res, 502, { error: "bad upstream models response" });
        }
      });
    });
    up.on("error", (e) => json(res, 502, { error: "models fetch failed: " + e.message }));
    up.end();
    return;
  }

  if (req.method === "POST" && p === "/v1/chat/completions") {
    return proxy(req, res, "/chat/completions");
  }

  // AI SDK `useChat` text protocol: the client POSTs { model, system, messages }
  // (messages = [{role, content}] in SDK format) and expects PLAIN TEXT streamed
  // back. We translate to OpenAI format, call Zen, and forward only the content
  // deltas (skipping the model's reasoning pass entirely).
  if (req.method === "POST" && p === "/v1/chat/text") {
    const key = readKey();
    if (!key) return json(res, 401, { error: "no key stored — save your key in the app first" });
    let body = "";
    req.on("data", (c) => {
      if (body.length + c.length > 5 * 1024 * 1024) {
        req.destroy();
        return json(res, 413, { error: "payload too large" });
      }
      body += c;
    });
    req.on("end", () => {
      let parsed;
      try {
        parsed = body ? JSON.parse(body) : {};
      } catch {
        return json(res, 400, { error: "invalid JSON" });
      }
      const { model: modelRaw, system, messages = [] } = parsed;
      const model = typeof modelRaw === "string" && modelRaw ? modelRaw : "deepseek-v4-flash";
      const msgs = [];
      if (system && typeof system === "string" && system.trim()) msgs.push({ role: "system", content: system });
      for (const m of messages) {
        if (!m || typeof m.content !== "string") continue;
        const role = m.role === "assistant" || m.role === "user" || m.role === "system" ? m.role : "user";
        msgs.push({ role, content: m.content });
      }
      if (!msgs.length) return json(res, 400, { error: "no messages" });

      const up = https.request(
        ZEN_BASE + "/chat/completions",
        { method: "POST", headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" }, timeout: 240000 },
        (upres) => {
          res.writeHead(upres.statusCode || 500, {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
          });
          if ((upres.statusCode || 500) >= 400) {
            let err = "";
            upres.on("data", (c) => (err += c));
            upres.on("end", () => res.end("relay -> zen failed: " + err.slice(0, 300)));
            return;
          }
          let buf = "";
          upres.on("data", (chunk) => {
            buf += chunk.toString("utf8");
            const lines = buf.split("\n");
            buf = lines.pop() ?? "";
            for (const line of lines) {
              const t = line.trim();
              if (!t.startsWith("data:")) continue;
              const payload = t.slice(5).trim();
              if (payload === "[DONE]") continue;
              try {
                const chunkData = JSON.parse(payload);
                const delta = chunkData.choices?.[0]?.delta?.content;
                if (typeof delta === "string" && delta.length) res.write(delta);
              } catch {
                /* skip malformed */
              }
            }
          });
          upres.on("end", () => res.end());
          upres.on("error", () => res.destroy());
        }
      );
      up.on("timeout", () => up.destroy(new Error("upstream timeout")));
      up.on("error", (e) => {
        if (res.headersSent) return res.destroy();
        json(res, 502, { error: "relay -> zen failed: " + e.message });
      });
      res.on("close", () => up.destroy());
      up.end(JSON.stringify({ model, messages: msgs, stream: true }));
    });
    return;
  }

  json(res, 404, { error: "not found" });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`[interview-relay] listening on http://127.0.0.1:${PORT} (key: ${readKey() ? "stored" : "not set"})`);
});

// A local tool should never die on an edge-case socket error.
process.on("uncaughtException", (e) => {
  console.error("[interview-relay] uncaught:", e.message);
});
