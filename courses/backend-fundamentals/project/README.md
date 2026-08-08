# shop-api — the Backend Fundamentals practice project

A real e-commerce backend (Node.js + Express + PostgreSQL + Redis) that you
**write yourself**, lesson by lesson, test-first. This is the companion
project for lessons 10–13 of the **Backend Engineering** course:

| Lesson | You build | Test suite |
|--------|-----------|------------|
| 10 — Cart Domain | `services/cartService.js` — pure cart math (`addItem`, `lineTotal`, `cartTotal`) | `tests/cart.test.js` |
| 11 — Checkout Pipeline | `services/orderService.js` (checkout + idempotency) and `controllers/ordersController.js` (status → HTTP mapping) | `tests/orders.test.js` |
| 12 — Rate Limiter & Middleware | `middleware/rateLimiter.js` — sliding-window limiter factory | `tests/rateLimiter.test.js` |
| 13 — Assembly & Docker | `utils/env.js` — `validateEnv` + `getEnv`, then run the whole stack in Docker | `tests/env.test.js` |

**Everything else ships complete** — routes, `app.js`, `server.js`, auth,
products, the cart repository, Docker, and the schema are all given. Your job
is exactly the five modules above.

## The workflow: red → green

The project is in a deliberately **unfinished** state. Each of the five
learner modules is a **stub** — the exports and signatures match the
contract, but the bodies are unimplemented (`TODO: implement ...`). The test
suite is the spec, and it is **red on purpose**:

```bash
npm install          # once (or npm ci — package-lock.json is committed)
npm test             # node --test — expect FAILURES: the stubs are not done
```

Then implement a module and run its test file until it goes green:

```bash
node --test tests/cart.test.js        # lesson 10
node --test tests/orders.test.js      # lesson 11
node --test tests/rateLimiter.test.js # lesson 12
node --test tests/env.test.js         # lesson 13
npm test                              # the whole suite, all green
```

Each lesson embeds its test file **in full** — nothing is hidden. The files
in `tests/` are byte-for-byte the ones printed in the lessons, so you can
read the exact expected behavior before you write a line of code.

## What the tests cover

- **Pure unit tests** (`cart`, `env`): the module is exercised directly —
  no HTTP, no database.
- **Integration tests** (`orders`, `rateLimiter`): the test boots a real
  Express app on an ephemeral port (`app.listen(0)`) and drives it with the
  built-in `fetch` against `http://127.0.0.1:<port>`. **No Docker, no
  Postgres, no Redis required** — the checkout service ships an in-memory
  store with test seams (`__setStock`, `__setBalance`, `__reset`) and the
  limiter keeps its buckets in memory.

## The module contracts (must match EXACTLY)

1. `services/cartService.js` — `addItem(cart, productId, qty, unitPrice)`
   (merge qty on existing `productId`, **keep the original `unitPrice`**,
   else append), `lineTotal(item)` = `qty × unitPrice`, `cartTotal(cart)` =
   sum of line totals (`0` for empty). Prices in integer cents.
2. `services/orderService.js` — `checkout({ userId, items, idempotencyKey })`
   → `{ status, order, replayed }` with `status ∈ 'confirmed' |
   'insufficient_stock' | 'insufficient_funds'`; `replayed: true` when the
   key was already used (returns the stored order). Test seams:
   `__setStock(productId, available)`, `__setBalance(userId, cents)`,
   `__reset()`.
3. `controllers/ordersController.js` — reads `req.body.items`,
   `req.headers['idempotency-key']`, `req.user.id`, delegates to
   `orderService.checkout`, maps: `confirmed → 201`, `insufficient_stock →
   409`, `insufficient_funds → 402`, `replayed → 200`.
4. `middleware/rateLimiter.js` — `rateLimiter({ limit, windowMs, keyFn })`
   returns Express middleware; sliding window `[t − windowMs, t]`
   **inclusive both edges**; deny with **429** + `Retry-After`
   (`max(1, ceil((oldest + windowMs − now) / 1000))`) when the window holds
   `limit` requests or more; `keyFn(req)` picks the bucket.
5. `utils/env.js` — `validateEnv(required)` returns missing names **in
   required order** (only `KEY=value` with a non-empty value counts as
   present), `getEnv(key, fallback)` returns the value or the fallback when
   missing/empty.

## Running the full stack (lesson 13)

Once `tests/env.test.js` is green, boot the whole system — API + Postgres +
Redis — with Docker:

```bash
docker compose up -d --build
curl http://localhost:3000/health          # {"status":"ok"}
```

Then follow the curl walkthrough in lesson 13: register → login → browse the
catalog → add to cart → checkout with an `Idempotency-Key` → replay it →
hammer `/api/products` and watch the IP-keyed limiter return 429s. The
schema (`db/migrations/001_init.sql`) is applied automatically by the
Postgres container on first boot.

> Note: `DATABASE_URL` in `docker-compose.yml` uses the real Postgres
> password (`shop`) — the lesson shows a redacted `***` placeholder.

## Peeking at the answers

`reference/` holds **complete, working implementations** of all five
learner modules — the exact code the test suite passes against. Try the
stubs first, then compare:

```bash
cp reference/services/cartService.js services/cartService.js   # lesson 10
cp reference/services/orderService.js services/orderService.js # lesson 11
cp reference/controllers/ordersController.js controllers/ordersController.js
cp reference/middleware/rateLimiter.js middleware/rateLimiter.js # lesson 12
cp reference/utils/env.js utils/env.js                          # lesson 13
npm test
```

## Project layout

```
shop-api/
├── app.js  server.js  package.json  package-lock.json
├── Dockerfile  docker-compose.yml
├── db/pool.js  db/migrations/001_init.sql
├── middleware/   auth.js  errors.js  logger.js  rateLimiter.js ← YOU (L12)
├── routes/       auth.js  products.js  cart.js  orders.js
├── controllers/  authController.js  productsController.js
│                 cartController.js  ordersController.js ← YOU (L11)
├── services/     authService.js
│                 cartService.js  orderService.js ← YOU (L10, L11)
├── repositories/ cartRepository.js
├── utils/        response.js  orderId.js  env.js ← YOU (L13)
├── tests/        cart.test.js  orders.test.js  rateLimiter.test.js  env.test.js
└── reference/    complete solutions for the five learner modules
```

Files marked **YOU** are the ones you write; everything else ships complete.
