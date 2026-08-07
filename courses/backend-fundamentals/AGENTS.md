# Backend Engineering — course notes for agents

Read the global `../AGENTS.md` first (file format + grading contract). This
file adds this course's specifics.

## Purpose

A backend-from-first-principles course **distilled from the user's own
Obsidian notes** at `/home/monke/monke/notes/v1/Backend/` (01.md … 09
Caching.md). Read the notes for your lessons and build the lesson content
from them — the notes ARE the source material. The user said the notes alone
are enough for the notes sections, so preserve their core content, structure
it, and add: **Use case** lines, **e-commerce examples**, ≥2
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
PostgreSQL + Redis, run in Docker), lesson by lesson, in **LeetCode style**:
each lesson = problem statement + deliverables (what to build, how it wires
into the real project) + ONE graded exercise. The theme is constant:
**e-commerce** (catalog, cart, checkout, orders, users).

### Rules for project lessons

- Every graded exercise uses **languages: [javascript, python]** (Node.js is
  the point; Python is the verifier's language). `solution` in Python.
- **NO hidden tests**: put the full contract in `tests.public`, and for the
  platform-required `tests.private`, ALSO document every private case in the
  lesson markdown ("Private cases you should handle: …") so nothing is hidden.
- The sandbox harness supports only arrays/primitives/strings as args and
  returns (Java-style typing: int, double, String, boolean, int[]/long[]/
  String[], int[][]). NO objects/maps — design exercises accordingly.
- The deliverables section in each lesson shows the real Express wiring
  (route → controller → service → repository) as fenced code blocks in the
  markdown content, so the learner sees where the graded logic fits.
- Lesson 13's content contains the COMPLETE project blueprint: app.js, server
  bootstrap, routes, controllers, services, db handler, middleware, utils,
  package.json, Dockerfile, docker-compose.yml (node + postgres + redis),
  and a curl walkthrough (register → login → add to cart → checkout → 429).

### Exercise specs (exactly one code block per project lesson)

- **L10** cart domain: `solve(items: list[list[int]], item_id: int, qty: int,
  price: int) -> list[list[int]]` — items rows are `[id, qty, price]`; add
  the item (merge qty if id exists) and return the updated rows with a
  **line total appended as a 4th element** `[id, qty, price, qty*price]`.
  Public: `([[1,2,100]], 1, 3, 100)` → `[[1,5,100,500]]`; `([[1,1,50],[2,2,25]], 3, 1, 10)` → `[[1,1,50,50],[2,2,25,50],[3,1,10,10]]`. Private (document in markdown): empty items; qty 0 removed? (no — keep simple: qty ≥ 1); large numbers. Verify solution with python3.
- **L11** checkout pipeline: `solve(items: list[list[int]], stock: list[list[int]], balance: int) -> list[int]` — items rows `[id, qty, price]`, stock rows `[id, available]`; compute total = Σ qty×price; if any item missing from stock or qty > available → return `[1, 0]` (status 1 = insufficient stock); else if balance < total → `[2, total]` (insufficient funds); else → `[0, total]` (confirmed). Public: valid checkout; out-of-stock. Private (documented): insufficient balance; empty items → `[0, 0]`; missing product id. Verify with python3.
- **L12** rate limiter (sliding window): `solve(timestamps: list[int], limit: int, window_ms: int) -> list[bool]` — timestamps in ms, non-decreasing; request allowed if fewer than `limit` requests in the last `window_ms` (inclusive of current). Public: `([100, 200, 300], 2, 200)` → `[true, true, false]` (at 300: window [100,300] has 100,200,300 = 3 > 2 → deny); `([100, 200, 300, 400], 3, 300)` → `[true, true, true, false]` (at 400: [100,400] has 4 > 3 → deny). Private (documented): empty; single request; exact-boundary (window edge — pick a convention and state it); large limit. Verify with python3.
- **L13** config validation (utils): `solve(vars: list[str], required: list[str]) -> list[str]` — return the required vars missing from vars, in the order they appear in `required`; empty list if all present. Public: `(["PORT=3000", "JWT_SECRET=abc"], ["PORT", "DB_URL"])` → `["DB_URL"]`; `(["A=1","B=2"], ["A","B"])` → `[]`. Private (documented): empty vars; empty required; var present with empty value counts as missing? (state convention: `KEY=` with empty value counts as present? pick: only exact `KEY=value` with non-empty value counts; document). Verify with python3.

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
