# CHANGELOG — how this project came to be

This project started as the blueprint in lesson 13 and was **built and run for
real** (Docker Compose, PostgreSQL + Redis) before shipping. That live run
found and fixed everything below — so the code you see is what actually runs,
not an idealized sketch. The fixes are worth reading: each one is a real
"the blueprint was wrong" lesson.

## F1. `requestLogger` was used but never defined
`app.js` mounted `app.use('/api', requestLogger)` without importing it — the
app crashed at boot. Added `middleware/logger.js` (method/url/status/duration)
and the require. The logger also stamps `req.id = randomUUID()`.

## F2. `/api/products` was not rate-limited, but the walkthrough expects 429s there
Added a public, IP-keyed limiter: `rateLimiter({ limit: 60, windowMs: 60_000,
keyFn: (req) => ip:${req.ip} })`. Lesson 12's rule: every API route is behind
the limiter.

## F3. `db/redis.js` was missing from the blueprint tree
`rateLimiter` and `orderService` both require it. Added the shared node-redis
v4 client.

## F4. The middleware was written against the old redis API
node-redis v4 broke the sketch: `multi()` chaining, positional options,
`zadd`/`zrange` signatures. Rewritten for v4.

## F5. Placeholder DB password in the compose file
Replaced with the real one (`postgres://shop:shop@postgres:5432/shop`).

## F6. The schema was never applied
Nothing ran `001_init.sql` — every query would 500. Fixed by mounting
`./db/migrations:/docker-entrypoint-initdb.d:ro` on the postgres service.

## F7. Schema gaps found while exercising checkout
- `users.balance_cents` — checkout needs a shopper balance (402 case).
- `cart_items.price_cents` — lesson 10's price-snapshot rule needs it stored.
- Seed data — the walkthrough needs product ids 1 and 2 to exist.

## F8/F9. `cartService`/`orderService` were pseudocode
Lesson 13 showed sketches calling undefined helpers. Implemented fully:
transactional stock reserve (`UPDATE ... WHERE available >= $1`), order insert,
balance deduction, NX idempotency claim, replay returns the stored order.

## F10. Validation was promised but absent
Added hand-rolled checks in the controllers: integer `itemId`, `qty >= 1`,
non-empty `items`; 400 with `code: 'VALIDATION'`.

## F11. `npm ci` needs a lockfile
Generated `package-lock.json` (the Dockerfile uses `npm ci --omit=dev`).

## Live-verification fixes (found AFTER the first "complete" run)
- **F12. `multi().exec()` returns a FLAT array in node-redis v4** — the code
  read `results[1][1]` which is `undefined`, so the limiter NEVER denied
  requests. The 429 evidence was impossible until this was fixed
  (`results[1]` = the zCard count). Moral: run the thing.
- **F13. Duplicate registration leaked a raw 500** (PG `23505`). The error
  handler now maps `23505 → 409 CONFLICT` and `23503 → 400 INVALID_REFERENCE`.
- **F14. The rate limiter accepts an optional `store`** — tests inject an
  in-memory redis double, so the suite runs with zero infrastructure while
  the real app still uses the shared Redis client.

The full verified walkthrough (health → register → login → products → cart →
merge → checkout → idempotent replay → 429) lives in `RUNLOG.md`.
