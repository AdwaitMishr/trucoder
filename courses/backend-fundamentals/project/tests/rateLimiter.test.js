// tests/rateLimiter.test.js — lesson 12
// Run: node --test tests/rateLimiter.test.js   (or: npm test)
// Integration: the limiter IS Express middleware, so the tests boot a real
// app on an ephemeral port and drive it with the built-in fetch.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { rateLimiter } = require('../middleware/rateLimiter');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// In-memory redis double: sliding-window zset semantics (member -> score),
// so the middleware's real logic (multi/zRemRangeByScore/zCard/zAdd/zRange)
// runs against a store that behaves like redis — no server required.
function memRedis() {
  const sets = new Map();
  const zset = (key) => {
    if (!sets.has(key)) sets.set(key, new Map());
    return sets.get(key);
  };
  return {
    multi() {
      const cmds = [];
      return {
        zRemRangeByScore: (k, min, max) => cmds.push(['zrem', k, min, max]),
        zCard: (k) => cmds.push(['zcard', k]),
        async exec() {
          const out = [];
          for (const [op, k, a, b] of cmds) {
            if (op === 'zrem') {
              const s = zset(k);
              let n = 0;
              for (const [m, sc] of [...s]) {
                if (sc >= a && sc <= b) {
                  s.delete(m);
                  n++;
                }
              }
              out.push(n);
            } else if (op === 'zcard') {
              out.push(zset(k).size);
            }
          }
          return out; // flat array, like node-redis v4 multi().exec()
        },
      };
    },
    async zAdd(k, { score, value }) {
      zset(k).set(value, score);
      return 1;
    },
    async zRange(k, start, stop) {
      const entries = [...zset(k).entries()].sort((x, y) => x[1] - y[1]);
      const out = [];
      for (const [m, sc] of entries.slice(start, stop + 1)) out.push(m, String(sc));
      return out; // flat [member, score, ...], like node-redis v4
    },
    async expire() {
      return 1;
    },
  };
}

// A tiny app with two routes: /public (keyed on the IP) and /protected
// (keyed on req.user.id — a stub auth middleware sets req.user first).
function buildApp({ limit, windowMs, keyFn }) {
  const app = express();
  app.set('trust proxy', true); // so X-Forwarded-For drives req.ip in tests
  const limiter = rateLimiter({ limit, windowMs, keyFn, store: memRedis() });
  app.get('/public', limiter, (req, res) => res.json({ ok: true }));
  app.get(
    '/protected',
    (req, res, next) => {
      req.user = { id: req.headers['x-user-id'] || 'anon' };
      next();
    },
    limiter,
    (req, res) => res.json({ ok: true })
  );
  return app;
}

// Boot a fresh app per test; the server is closed even if the test throws.
async function withServer(options, fn) {
  const server = buildApp(options).listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  try {
    await fn(`http://127.0.0.1:${server.address().port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test('the third request inside the window is denied with 429', async () => {
  await withServer(
    { limit: 2, windowMs: 300, keyFn: (req) => `ip:${req.ip}` },
    async (base) => {
      assert.equal((await fetch(`${base}/public`)).status, 200);
      assert.equal((await fetch(`${base}/public`)).status, 200);
      const denied = await fetch(`${base}/public`);
      assert.equal(denied.status, 429);
      const body = await denied.json();
      assert.equal(body.error.code, 'RATE_LIMITED');
    }
  );
});

test('the window slides: after windowMs the budget resets', async () => {
  await withServer(
    { limit: 1, windowMs: 200, keyFn: (req) => `ip:${req.ip}` },
    async (base) => {
      assert.equal((await fetch(`${base}/public`)).status, 200);
      assert.equal((await fetch(`${base}/public`)).status, 429);
      await sleep(250); // oldest request has now left the window
      assert.equal((await fetch(`${base}/public`)).status, 200);
    }
  );
});

test('denied responses carry Retry-After (seconds until the window frees)', async () => {
  await withServer(
    { limit: 1, windowMs: 5000, keyFn: (req) => `ip:${req.ip}` },
    async (base) => {
      assert.equal((await fetch(`${base}/public`)).status, 200);
      const denied = await fetch(`${base}/public`);
      assert.equal(denied.status, 429);
      const retryAfter = Number(denied.headers.get('retry-after'));
      // Oldest request leaves at oldest + 5000ms; we are a few ms in, so
      // ceil() lands on 5. Allow a little drift.
      assert.ok(retryAfter >= 4 && retryAfter <= 5, `retry-after was ${retryAfter}`);
    }
  );
});

test('protected routes are keyed on the authenticated user id', async () => {
  await withServer(
    { limit: 1, windowMs: 60_000, keyFn: (req) => `user:${req.user.id}` },
    async (base) => {
      const asUser1 = { 'x-user-id': 'u1' };
      assert.equal((await fetch(`${base}/protected`, { headers: asUser1 })).status, 200);
      assert.equal((await fetch(`${base}/protected`, { headers: asUser1 })).status, 429);
      // A different user has its own budget — the limiter is keyed on the
      // identity, not on a shared counter.
      const asUser2 = { 'x-user-id': 'u2' };
      assert.equal((await fetch(`${base}/protected`, { headers: asUser2 })).status, 200);
    }
  );
});

test('public routes are keyed on the client IP', async () => {
  await withServer(
    { limit: 2, windowMs: 60_000, keyFn: (req) => `ip:${req.ip}` },
    async (base) => {
      const fromIpA = { 'x-forwarded-for': '10.0.0.1' };
      const fromIpB = { 'x-forwarded-for': '10.0.0.2' };
      assert.equal((await fetch(`${base}/public`, { headers: fromIpA })).status, 200);
      assert.equal((await fetch(`${base}/public`, { headers: fromIpA })).status, 200);
      assert.equal((await fetch(`${base}/public`, { headers: fromIpA })).status, 429);
      // A second IP is untouched.
      assert.equal((await fetch(`${base}/public`, { headers: fromIpB })).status, 200);
    }
  );
});

test('a generous limit never denies normal traffic', async () => {
  await withServer(
    { limit: 100, windowMs: 1000, keyFn: (req) => `ip:${req.ip}` },
    async (base) => {
      for (let i = 0; i < 5; i++) {
        assert.equal((await fetch(`${base}/public`)).status, 200);
      }
    }
  );
});
