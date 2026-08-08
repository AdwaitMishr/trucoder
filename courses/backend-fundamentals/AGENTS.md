# Backend Engineering — course notes for agents

Read the global `../AGENTS.md` first (file format + grading contract). This
file adds this course's specifics.

## Purpose

A backend-from-first-principles course **distilled from the author's notes**
(01.md … 09 Caching.md). Read the notes for your lessons and build the
lesson content from them — the notes ARE the source material. The notes
alone are enough for the notes sections, so preserve their core content,
structure it, and add: **Use case** lines, **e-commerce examples**, ≥2
`**Interview question:**` :::tip callouts per lesson, flowcharts, worked
examples, and quizzes.

## Lesson map

| # | Lesson | Difficulty | Source note(s) |
|---|--------|-----------|----------------|
| 1 | backend-basics | beginner | 01.md — what a backend is, request lifecycle (DNS → firewall → server), why centralized state |
| 2 | http | beginner | 02 HTTP.md — methods, status codes, headers, request/response, statelessness |
| 3 | routing | easy | 03 Routing.md — routes, params, query strings, 404s |
| 4 | request-context-and-controllers | easy | 06 Request context and controlers.md — middleware chain, controller pattern, req/res context |
| 5 | validation-and-transformations | easy | 05 Validation and Transformations.md — input validation, sanitization, DTOs, error responses |
| 6 | auth | medium | 04 Auth.md — sessions vs JWT vs cookies, hashing, stateful vs stateless, OAuth 2.0, API keys, security practices |
| 7 | api-design | medium | 07 API Design.md — REST, resource naming, versioning, error format, pagination, idempotency |
| 8 | database-postgresql | medium | 08 Database PostgreSql.md — schema design, SQL, connection pooling, transactions (ACID in checkout) |
| 9 | caching | medium | 09 Caching.md — cache-aside, Redis, TTL, invalidation, hot catalog |
| 10 | project-cart-domain | medium | project arc (e-commerce theme) |
| 11 | project-checkout-pipeline | medium | project arc |
| 12 | project-rate-limiter-middleware | medium | project arc |
| 13 | project-assembly-docker | easy | project arc |
| 14 | final-assessment | medium | exam across lessons 1–13 |

## The project arc (the special feature)

Lessons 10–13 build ONE complete **e-commerce backend** (Node.js + Express +
PostgreSQL + Redis, run in Docker), lesson by lesson, in **test-driven
real-code style**: each lesson = problem statement + exact **module contract**
(exports, signatures, behavior) + the **FULL visible node:test test file**
that ships in the project's `tests/` dir + wiring (where the module plugs
into routes/controllers/app) + 4 quizzes. The theme is constant:
**e-commerce** (catalog, cart, checkout, orders, users).

The shipped project (`shop-api/`) is a complete runnable Express app with the
real test suite. The **learner-written modules** are exactly five:
`services/cartService.js` (L10), `services/orderService.js` +
`controllers/ordersController.js` (L11), `middleware/rateLimiter.js` (L12),
`utils/env.js` (L13). Everything else (routes, other controllers, app.js,
server.js, db, repositories, Docker, tests/) ships complete.

### Rules for project lessons

- **Each project lesson (10–13) carries ONE `type: code` block with
  `mode: module`** — the platform's module-exercise format. The learner
  writes ONE real backend file in the app; a visible `node:test` suite
  (`module.testsContent`) runs it on a Node 24 sandbox and the app shows
  per-test pass/fail + a pass-gated preview. The block's fields:
  `task` (problem statement), `languages: [javascript]`,
  `starter.javascript` (the stub, byte-identical to the project stub),
  `module.entry` (the file the learner edits), `module.language`,
  `module.testsFile` (e.g. `lesson.test.js`), `module.testsContent` (the
  visible test file, byte-identical to `project/tests/*.test.js`),
  `module.extraFiles` (read-only files the suite imports — e.g. L11 mounts
  `routes/orders.js` + a reference `services/orderService.js`),
  `module.preview` (canned display shown when all tests pass), `hints`,
  `solution` (the reference implementation of the entry file).
- **In-platform grade = the module exercise's visible test suite** (all
  tests visible — there are no hidden tests; `verify.js` runs each block's
  solution against its `testsContent`). The **real-world grade is the same
  suite in the shipped project**: `npm test` (`node --test`) in
  `courses/backend-fundamentals/project/` must go green.
- **NO hidden tests**: every test in `project/tests/*.test.js` is printed IN
  FULL inside the lesson, and the block's `testsContent` is byte-identical
  to those files. The suite is the contract's executable spec.
- The **module contracts below are binding** — lessons, tests, and the
  shipped project must agree EXACTLY (exports, signatures, status strings,
  HTTP mapping, conventions).
- Pure modules are unit-tested directly; controller/middleware modules are
  integration-tested: the test file boots the app with `app.listen(0)` and
  drives it with the built-in `fetch` against `http://127.0.0.1:${port}` —
  zero infrastructure required (orderService ships an in-memory store).
- Test seams (`__setStock`, `__setBalance`, `__reset`) are documented,
  test-only exports; production storage (Postgres/Redis) swaps in behind the
  same contract.
- **Before embedding a lesson's test file, validate it**: run the exact file
  against a reference implementation in a scratch dir OUTSIDE the repo with
  `node --test` — it must pass 100%. Never embed unrun tests.
- Lesson 13's content contains the COMPLETE project blueprint: tree,
  package.json, app.js, server.js, routes, controllers, services,
  repositories, db handler, middleware, utils, tests/, Dockerfile,
  docker-compose.yml (node + postgres + redis), and a curl walkthrough
  (register → login → add to cart → checkout → replay → 429). The blueprint
  matches the contracts exactly: an **IP-keyed limiter on /api/products**
  (`rateLimiter({limit: 60, windowMs: 60_000, keyFn: (req) => \`ip:${req.ip}\`})`)
  so the 429 walkthrough works; `unit_price BIGINT NOT NULL` in `cart_items`
  for L10's price snapshot; add-to-cart curl sends `unitPrice`; chain comment
  "logger → auth → rate limit → controller"; Dockerfile
  `CMD ["node", "server.js"]` (root-level); "commit package-lock.json" noted
  next to `npm ci`; package.json `test` script is `node --test`.

### Module contracts (the project and lessons must agree EXACTLY)

- **L10 `services/cartService.js`** — cart = array of items
  `{productId, qty, unitPrice}` (prices in integer cents). Exports:
  `addItem(cart, productId, qty, unitPrice)` (merge qty when productId
  exists, **keep the ORIGINAL unitPrice on merge**, else append; returns the
  updated cart), `lineTotal(item)` = `qty × unitPrice`,
  `cartTotal(cart)` = sum of line totals (`0` for empty). Test file:
  `tests/cart.test.js` (pure unit tests).
- **L11 `services/orderService.js` + `controllers/ordersController.js`** —
  controller reads `req.body.items` + `req.headers['idempotency-key']` +
  `req.user.id` and calls `orderService.checkout({userId, items,
  idempotencyKey})` → `{status, order, replayed}` with status ∈
  `'confirmed' | 'insufficient_stock' | 'insufficient_funds'` and
  `replayed: true` when the key was already used (returns the stored order).
  Items are `{productId, qty, unitPrice}`; order is the created order for
  confirmed, `null` for rejections. Controller maps: confirmed → **201**,
  insufficient_stock → **409**, insufficient_funds → **402**, replayed →
  **200**. Test seams: `__setStock(productId, available)`,
  `__setBalance(userId, cents)`, `__reset()`. Test file:
  `tests/orders.test.js` (integration: listen(0) + fetch).
- **L12 `middleware/rateLimiter.js`** — exports factory
  `rateLimiter({limit, windowMs, keyFn})` → Express middleware. Sliding
  window `[t − windowMs, t]` **INCLUSIVE both edges**; allowed when the
  window holds **at most `limit`** requests including the current one;
  denied → **429** + `Retry-After` = `max(1, ceil((oldest + windowMs −
  now)/1000))` (seconds until the oldest request leaves the window). Works
  keyed on `req.user.id` for protected routes and `req.ip` for public ones
  (`keyFn(req)` picks the bucket; in-memory Map store, Redis zset for
  multi-instance). Test file: `tests/rateLimiter.test.js` (integration:
  listen(0) + fetch, incl. `trust proxy` + X-Forwarded-For for per-IP
  buckets).
- **L13 `utils/env.js`** — exports `validateEnv(required)` (returns missing
  keys **in required order**; only `KEY=value` with a NON-EMPTY value counts
  as present — `KEY=` and absent both missing) and `getEnv(key, fallback)`
  (value, or fallback when missing/empty). Test file: `tests/env.test.js`
  (pure unit tests, save/restore `process.env`).

## Conventions

- All lessons use `blocks:`. Flowcharts for request-lifecycle/middleware/pipeline
  diagrams. mcq/mscq quizzes. NO TABS. YAML content indented exactly 6 spaces.
- Theory lessons: concept → key points → **Use case** → flowchart → worked
  example → **interview questions** → quiz. E-commerce examples throughout
  (catalog, cart, orders, payments).
- Exams (lesson 14): 24–26 questions covering ALL 13 lessons (2 per lesson),
  numericals with full working, 2–3 mscq, intro + closing markdown blocks.

## Validating

Do NOT run verify.js while other agents are writing. Self-check with:

```bash
node -e 'const gm=require(require("path").join(process.cwd(),"server/node_modules/gray-matter"));const fs=require("fs");for(const f of process.argv.slice(1)){const d=gm(fs.readFileSync(f,"utf8"));const b=d.data.blocks||[];console.log(f.split("/").pop(),"frontmatter OK,",b.length,"blocks")}' <files...>   # run from the repo root
```

## Pedagogy

Backend interviews reward the same shape: define the concept in one line →
how it works end-to-end → where it fits in a request lifecycle → the e-commerce
example → the tradeoff. Every project lesson ties its graded exercise back to
the real Express wiring so theory and practice reinforce each other.
