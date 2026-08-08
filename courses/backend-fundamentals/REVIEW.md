# REVIEW — backend-fundamentals (14 lessons) — full PR-readiness audit

**Reviewer:** independent quality grader (structure, quizzes, module exercises,
concept coverage, consistency, numericals)
**Date:** 2026-08-08
**Scope:** all 14 lesson files at `courses/backend-fundamentals/lessons/`,
`course.mdx`, course `AGENTS.md`, the shipped practice project
(`courses/backend-fundamentals/project/`) — stubs, tests, references, wiring.
**Method (everything below was actually executed, not eyeballed):**
- gray-matter parse of **all 14 files** via the repo's
  `server/node_modules/gray-matter` (structural dump: block types, quizzes,
  flowcharts, callouts, fenced-code counts, tabs, orders).
- `npm install` + **`npm test` run** against the five reference solutions
  copied over the stubs (then stubs restored and verified byte-identical).
- **Sandbox simulation** for lessons 10–13: each module block's
  `module.testsContent` written as `tests/lesson.test.js` + reference solution
  as the entry + `extraFiles` in a scratch dir, run with `node --test`.
- Byte-comparison: `starter.javascript` ↔ project stub, `module.testsContent` ↔
  `tests/*.test.js`, `solution` ↔ `reference/*`, `extraFiles` ↔ project files,
  L13 blueprint snippets ↔ shipped project files.
- Manual audit of every quiz (answer correctness), every hint, every preview,
  every worked numerical (recomputed by hand), and every callout.

> **Note on the previous REVIEW.md:** it described the old solve-style model
> (in-platform grade = quizzes only, no `type: code` blocks in 10–13, tests
> executed via python3). The lessons have since moved to **`mode: module`
> code blocks** with a real graded `testsContent` suite. This review supersedes
> it. Several of the old review's findings (W1 CMD path, W2 products limiter,
> W3 `unit_price` column, S1 unitPrice in curl, S3 undefined `reqBalance`) are
> **already fixed** in the current files — confirmed below.

---

## Verdict

| Severity | Count | Blocks PR? |
|----------|-------|-----------|
| **CRITICAL** | **0** | — |
| **WARNING** | **11** | Should fix before merge (docs/claims stale, 3 hints over-promise, 2 previews show wrong shapes) |
| **INFO** | **14** | Nice to have |

**Bottom line: the course is loadable, internally consistent, and the graded
artifacts are correct.** All 14 lessons parse; all 78 quizzes are answerable
and correct; all four module exercises' tests **pass 27/27 against the
reference solutions** — both in the shipped project layout and in a simulated
platform sandbox (`tests/lesson.test.js`); starters/solutions/testsContent are
byte-identical to the project stubs/references/tests. No quiz, test, or parse
issue blocks publishing. The WARNINGs are **stale wording** (grading-model
claims that predate the module-exercise format) plus a few task/hint/preview
over-promises that the tests don't enforce — worth fixing so the course's own
prose matches what the platform and tests actually do.

---

## 1. PARSE / LOADABILITY — ✅ all 14 files load

| File | order | difficulty | blocks | types (unique) | parse |
|------|-------|-----------|--------|----------------|-------|
| 01-backend-basics | 1 | beginner | 11 | markdown, flowchart, mcq, mscq | ✅ |
| 02-http | 2 | beginner | 12 | markdown, flowchart, mcq, mscq | ✅ |
| 03-routing | 3 | easy | 12 | markdown, flowchart, mcq, mscq | ✅ |
| 04-request-context-and-controllers | 4 | easy | 10 | markdown, flowchart, mcq, mscq | ✅ |
| 05-validation-and-transformations | 5 | easy | 11 | markdown, flowchart, mcq, mscq | ✅ |
| 06-auth | 6 | medium | 12 | markdown, flowchart, mcq, mscq | ✅ |
| 07-api-design | 7 | medium | 13 | markdown, flowchart, mcq, mscq | ✅ |
| 08-database-postgresql | 8 | medium | 12 | markdown, flowchart, mcq, mscq | ✅ |
| 09-caching | 9 | medium | 12 | markdown, flowchart, mcq, mscq | ✅ |
| 10-project-cart-domain | 10 | medium | 11 | markdown, flowchart, **code(mode:module)**, mcq, mscq | ✅ |
| 11-project-checkout-pipeline | 11 | medium | 11 | markdown, flowchart, **code(mode:module)**, mcq, mscq | ✅ |
| 12-project-rate-limiter-middleware | 12 | medium | 11 | markdown, flowchart, **code(mode:module)**, mcq, mscq | ✅ |
| 13-project-assembly-docker | 13 | easy | 14 | markdown, flowchart, **code(mode:module)**, mcq, mscq | ✅ |
| 14-final-assessment | 14 | medium | 28 | markdown, mcq, mscq | ✅ |

- All block types ∈ {markdown, flowchart, mcq, mscq, code} — **0 unknown types**.
- Lesson 14 has no `type: code` block — correct, it is the exam.
- Frontmatter ids unique; `order` fields 1–14 match filenames `01-…`–`14-…`.
- `course.mdx difficultyLevels: [beginner, easy, medium]` — no lesson uses `hard` ✅.
- Difficulty ladder sane: 1–2 beginner → 3–5 easy → 6–12 medium → 13 easy → 14 medium.
- **0 tabs** anywhere in the 14 files.
- Note: files DO end with a closing `---` line (contrary to the authoring brief's
  claim that there are no closing delimiters) — gray-matter handles both fine.

## 2. QUIZZES — ✅ 78 quizzes, all correct

**Counts:** lessons 1–13 each have exactly **4 quizzes (3 mcq + 1 mscq)**;
lesson 14 has **26 (24 mcq + 2 mscq)**. Total 78.

- **All answer indices in range** (mcq ∈ [0, options-1]; mscq indices unique,
  non-empty, in range). Every question has 4 options.
- **Every marked answer verified CORRECT** (audited against lesson content):
  - L1: 0, 0, 0, [0,1,2] · L2: 3, 1, 1, [0,2,4] · L3: 0, 0, 0, [0,1,3]
  - L4: 0, 1, 1, [0,1,2] · L5: 0, 0, 0, [0,1,2] · L6: 2, 1, 0, [0,1,2]
  - L7: 1, 1, 1, [0,2,3] · L8: 1, 1, 1, [0,1,3] · L9: 1, 1, 1, [0,1,2]
  - L10: 1, 1, 0, [1,2] · L11: 1, 2, 2, [0,2] · L12: 2, 1, 1, [0,1]
  - L13: 1, 1, 2, [0,1,2] · L14: 0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0, [0,2,4], [0,1,3]
- **No duplicate questions** (normalized-prompt scan of all 78: 0 exact/near
  duplicates). Same-concept questions in different lessons are distinct
  (e.g. L2 "Which HTTP method is NOT idempotent?" vs L14's POST-retry scenario).
- Every quiz maps to content taught in its own lesson (checked question by
  question; the 3 exam numericals trace to L10/L11/L12 material).

## 3. MODULE EXERCISES (lessons 10–13)

### Execution evidence (c)

| Lesson | Suite | `npm test` (project, references in place) | Sandbox sim (`tests/lesson.test.js` + reference entry + extraFiles) |
|--------|-------|------------------------------------------|---------------------------------------------------------------------|
| 10 cart | `tests/cart.test.js` | 7/7 ✅ | 7/7 ✅ |
| 11 checkout | `tests/orders.test.js` | 8/8 ✅ | 8/8 ✅ |
| 12 rate limiter | `tests/rateLimiter.test.js` | 6/6 ✅ | 6/6 ✅ |
| 13 env | `tests/env.test.js` | 6/6 ✅ | 6/6 ✅ |
| **All** | `npm test` | **27/27, 0 fail** ✅ | **27/27** ✅ |

`package.json` `test` script (`node --test "tests/*.test.js"`) runs the exact
four files embedded in the lessons. Stubs were restored afterwards and
verified byte-identical to the staged versions (git-clean; `node_modules`
ignored).

### Byte-identity (d)

| Lesson | starter ↔ project stub | testsContent ↔ project test | solution ↔ reference | extraFiles ↔ project |
|--------|------------------------|-----------------------------|----------------------|----------------------|
| 10 | ✅ `services/cartService.js` | ✅ `tests/cart.test.js` | ✅ `reference/services/cartService.js` | — |
| 11 | ✅ `controllers/ordersController.js` | ✅ `tests/orders.test.js` | ✅ `reference/controllers/ordersController.js` | ✅ `routes/orders.js`; ⚠ `services/orderService.js` (see W4) |
| 12 | ✅ `middleware/rateLimiter.js` | ✅ `tests/rateLimiter.test.js` | ✅ `reference/middleware/rateLimiter.js` | — |
| 13 | ✅ `utils/env.js` | ✅ `tests/env.test.js` | ✅ `reference/utils/env.js` | — |

Also: the **fenced test file printed inside each lesson's markdown** is
byte-identical to `module.testsContent` for all four lessons (2,569 / 5,114 /
6,430 / 1,768 chars) — the "visible suite" promise holds.

### Task text vs tests (a), hints (e), previews (f) — per lesson

- **L10** ✅ task, hints, and preview all describe the real contract. `preview`
  uses the old array-tuple cart notation — see W7.
- **L11** ⚠ task text ("Validate the body first (items must be a non-empty
  array)") and hint 3 ("400 with code 'VALIDATION'") promise validation that
  **neither the tests nor the reference solution implement** — see W5. Hint 2
  ("Use STATUS_TO_HTTP to map the service's status") is a trap for the replay
  path: the service returns `status: 'confirmed'` on replays, so mapping
  status only yields 201, and the stub's `STATUS_TO_HTTP` even contains a
  dead `replayed: 200` entry — the reference handles `replayed` *before*
  mapping. See W6.
- **L12** ✅ task/hints/preview consistent with the code (inclusive edges,
  flat-array `results[1]`, Retry-After formula all taught and tested). See I9
  for the preview's `Retry-After: 60` nit.
- **L13** ⚠ task ("returns the trimmed value") and hints 1/3 ("trim both
  sides") promise **trimming** that the contract table, the tests, and the
  reference solution do not implement — see W8.

## 4. CONCEPT COVERAGE — theory (1–9) vs the exercise arc (10–13)

Requirement: every concept the exercises depend on must be taught in 1–9, and
every *implementation* concept must appear as real JavaScript (fenced
```` ```js ```` in a lesson, or the module exercise itself).

| Concept (needed by) | Taught where | JS implementation code? | Verdict |
|---|---|---|---|
| HTTP/Express basics (all) | L2 (HTTP), L3 (routing, params, query, 404) | ✅ L3 has 4 fenced ```` ```js ```` blocks (`app.get`, `req.params`, `req.query`, catch-all) | ✅ covered |
| req.user / request context (L10, L11, L12 use `req.user.id`) | L4 (context, "auth middleware stores `req.user = { id, role }`" — **inline code only**), L6 (JWT, prose) | ⚠ **No fenced JS in any theory lesson.** Real JS appears only in L11's `testsContent` (`testAuth` sets `req.user`) and L13's blueprint (`middleware/auth.js`). | **W1** |
| AuthN/AuthZ, JWT verify, sessions (L11 `req.user.id`, L13 blueprint) | L6 (thorough prose + 2 flowcharts) | ⚠ Same as above — L6 contains **zero** fenced JS. | **W2** |
| Validation (L11 task text + hints; L10 "validated upstream") | L5 (prose, types table, ```` ```json ```` envelope; **no JS**) | ⚠ No JS anywhere in theory; and the one place the arc demands it (L11 task/hint) is unimplemented in tests + reference. | **W3** |
| Idempotency / Idempotency-Key (L11) | L7 (prose, worked example) | ✅ L11 fenced JS: `redis.set(key,'pending','NX','EX',3600)` production shape + `store.orders.has()` replay in the extraFile | ✅ covered |
| Price snapshot / merge semantics (L10) | L8 (`order_items.unit_price` snapshot prose) | ✅ L10 module exercise (tests + solution) is the JS | ✅ covered |
| Transactions, ACID, `FOR UPDATE` (L11 checkout) | L8 (SQL snippets, checkout transaction) | ✅ L11 fenced JS: `BEGIN`/`COMMIT`/`ROLLBACK` + conditional `UPDATE … WHERE available >= $1` | ✅ covered |
| Sliding window, Redis sorted sets, node-redis v4 flat-array `multi().exec()` (L12) | L12 itself (contract + "production note" fenced JS) | ✅ L12 fenced JS (`results[1]` vs `results[1][1]` gotcha) + hint 2 + the tests' in-memory double | ✅ covered |
| Env config validation, fail-fast boot (L13) | L13 (contract + `server.js` fenced JS) | ✅ exercise + blueprint | ✅ covered |
| Docker / docker-compose / healthchecks (L13) | L13 blueprint (Dockerfile + compose YAML) | ✅ config files shown in full (not a JS concept) | ✅ covered |
| HTTP status mapping incl. **402** (L11) | L2/L7 status tables list 400/401/403/404/409/422/429 — **402 appears nowhere in theory** | ✅ taught where used (L11 contract + mscq) | **I1** |

**No CRITICAL coverage gaps** — nothing the exercises depend on is absent from
theory, and every implementation concept has real JS somewhere in the course.
Three WARNINGs (W1–W3) concern theory lessons that teach concepts only in
prose/inline code: **L6 (auth) and L5 (validation) contain no fenced JS at
all**, and L4's `req.user` is inline-only. A learner doing L11 cold has not
seen a JWT-verify or body-validation function in JS before writing code that
touches `req.user.id`.

## 5. CONSISTENCY

- **course.mdx order** ✅ — the 14-item lesson list and roadmap table match the
  actual files (1–14, correct titles). ⚠ The description still says "Quizzes
  are graded in-platform; the real grade is npm test going green" — stale now
  that the module exercises are the in-platform grade (**W9**).
- **course AGENTS.md** — several statements no longer match reality:
  - "**NO `type: code` blocks in lessons 10–13 (no `solve()` anywhere)** …
    the in-platform grade is the quiz blocks" — **false now**: all four
    project lessons have a `type: code` block with `mode: module`, and the
    platform grades `testsContent`. An agent following AGENTS.md would strip
    the graded exercises (**W10**).
  - Does not document the `mode: module` block schema
    (`module.entry/language/testsFile/testsContent/preview/extraFiles`,
    `starter.javascript`) (**W10**).
  - "The shipped project (`shop-api/`)" — the directory is `project/` (npm
    name `shop-api`) (I2).
  - "package.json `test` script is `node --test`" — actual:
    `node --test "tests/*.test.js"` (I3).
  - "Exam: 24–26 questions covering ALL 13 lessons (**2 per lesson**)" —
    actual distribution: L1 2, L2 3, L3 1, L4 2, L5 2, L6 3, L7 3, L8 2, L9 3,
    L10 1, L11 1, L12 1, L13 2 (26 total). All lessons covered; "2 per lesson"
    convention not met for 8 lessons (I4).
  - Chain-comment quote: AGENTS.md says the comment reads "logger → auth →
    rate limit → controller"; the actual comment in `app.js` (lesson + project)
    is "chain: logger → rate limiter → routes (auth runs per-route where
    needed)" (I5).
- **L10–13 "How this lesson is graded" paragraphs** (e.g. L10 lines 49–51:
  "The platform grades the four quiz blocks at the bottom. The real deliverable
  is the passing test suite in the shipped project") — **stale**: the platform
  now grades the module exercise itself. Learners are told their in-platform
  grade is quizzes while a graded code block sits right above them (**W11**).
- **L14 revision-tips block** says "re-run the three `solve()` exercises by
  hand" — `solve()` no longer exists anywhere in the course (they are module
  exercises) (**W11**).
- **L13 blueprint vs shipped project** — byte-compared 16 files:
  `app.js`, `docker-compose.yml`, `001_init.sql`, `middleware/auth.js`,
  `logger.js`, `errors.js`, `server.js`, `routes/cart.js`, `routes/orders.js`,
  `repositories/cartRepository.js`, `utils/response.js`, `utils/orderId.js` all
  **BYTE-IDENTICAL**. Diffs are comment-only or by design:
  - `Dockerfile`: lesson blueprint has an extra comment line
    "(commit package-lock.json so `npm ci` works…)" that the shipped Dockerfile
    omits (I6).
  - `db/pool.js`: lesson snippet has a `// db/pool.js` header the project lacks
    (I7).
  - `db/redis.js`: lesson snippet has a **duplicated header comment**, and both
    copies say the file is "missing from the lesson-13 project tree" — but the
    tree (L13 lines 166–169) **does** list `db/redis.js` (I8).
  - `controllers/ordersController.js` / `services/cartService.js`: the L13
    blueprint shows the *complete* modules while the project ships stubs — by
    design (blueprint = finished project; project = learner stubs) (I10).
  - `package.json`: blueprint `"test": "node --test"` vs project
    `"test": "node --test \"tests/*.test.js\""` — same 4 files discovered,
    cosmetic (I3).
- **RUNLOG.md / CHANGELOG.md** reflect an earlier code era: RUNLOG responses
  show cart rows as arrays `[1,2,2500,5000]` and order field `totalCents`, but
  the current controller/serializer returns objects `{productId, qty,
  unitPrice}` and the service field is `total`. CHANGELOG F10 claims validation
  ("400 with code 'VALIDATION'") was added to the controllers — the shipped
  reference controller has none. These artifacts are stale history, not
  shipped behavior, but they disagree with the code they sit next to (I11).
- Lesson titles/difficulties: sane (see §1 table).

## 6. NUMERICALS + CALLOUTS

- **`:::tip **Interview question:**` callouts** — every teaching lesson has
  ≥2: L1: 2, L2: 3, L3: 2, L4: 3, L5: 3, L6: 3, L7: 3, L8: 3, L9: 3, L10: 2,
  L11: 2, L12: 2, L13: 2. L14 (exam): 0 — correct, exempt.
- **Use-case lines** — present in all 13 teaching lessons. ⚠ Punctuation
  inconsistency: theory lessons use `**Use case:**`, project lessons (L10–13)
  use `**Use case.**` (I12).
- **Worked numericals — all recomputed, all correct:**
  - L10: `[{1,2,100}]` + add(1,3,100) → qty 5, price 100, total 5×100=500 ✅;
    `50 + 50 + 10 = 110` ✅.
  - L10 big numbers: `2_000_000 × 9999 = 19,998,000,000` (< 2^53, exact) ✅.
  - L11: total `2×100 = 200`, stock 5 ≥ 2 → confirmed → 201 ✅; qty 10 vs
    stock 5 → 409 ✅; balance 100 < 200 → 402 ✅; replay → 200 ✅.
  - L12: `[100,200,300]`, limit 2, window 200 → allow, allow, deny ✅;
    inclusive-edge example `[100,300]` → allow ✅; Retry-After
    `max(1, ceil((oldest+5000−now)/1000))` ∈ [4,5] for windowMs 5000 ✅ (test
    passes).
  - L14 Q20 cart merge → `[1,5,100,500]` ✅; Q21 checkout → total 250,
    balance 200 → `[2,250]` ✅; Q22 sliding window → `[true,true,false,false]`
    ✅.
- **Flowcharts**: 22 total; all ≤10 nodes (max: L2 "status code families",
  10 nodes); all edges within bounds; L14 has none (exam) — correct.

---

## WARNING items (fix before merge)

| # | Location | Issue | Fix |
|---|----------|-------|-----|
| **W1** | `04-request-context-and-controllers.mdx` (whole lesson) | `req.user = { id, role }` is taught as **inline code in prose**; no fenced JS block shows the auth middleware actually setting `req.user`. The exercise arc (L11 controller, L12 `keyFn: (req) => \`user:${req.user.id}\``) depends on this. | Add one small fenced ```js block in L4 (auth middleware: verify → `req.user = {id}` → `next()`; or 401). |
| **W2** | `06-auth.mdx` (whole lesson) | Auth lesson contains **zero fenced JS** — JWT sign/verify, bcrypt hash/compare, cookie flags are all prose + flowcharts. First real JS appears in L13's blueprint (`middleware/auth.js`) and L11's tests. | Add a fenced ```js snippet (e.g. `jwt.sign`/`jwt.verify` + `bcrypt.compare`) to L6's password-hashing or JWT section. |
| **W3** | `05-validation-and-transformations.mdx` (whole lesson) | Validation is taught with prose + a ```json envelope only; no JS (e.g. a zod/manual validation snippet). L11's task text and hint 3 demand validation behavior that no test or reference implements (see W5). | Add one fenced ```js snippet (hand-rolled or zod) to L5; then make L11's task/hint/solution agree (see W5). |
| **W4** | `11-project-checkout-pipeline.mdx`, code block `module.extraFiles['services/orderService.js']` | The lesson's extraFile ships the **complete** orderService while `project/services/orderService.js` is a **stub** (learner writes it). By design (offline project = 5 learner modules; sandbox = 4 + given service) but breaks the "byte-identical" ideal and the lesson text says "the two modules ship with the suite" without explaining that the platform provides the service. | Add one line to L11 ("In the platform, `orderService.js` is provided for you; in the offline project you write it too — same contract."). |
| **W5** | `11-project-checkout-pipeline.mdx` — task (line 411) + hint 3 (line 681) | Task says "Validate the body first (items must be a non-empty array)"; hint 3 promises "400 with code 'VALIDATION'". **Neither the tests nor the reference solution validate anything** (no test sends an invalid body; reference `checkout` just delegates). A learner implementing the hint adds dead code; CHANGELOG F10 claims this validation exists in the controllers — it does not. | Either add the validation to the reference solution + a test case, or delete the validation sentence from task/hint (preferred: drop it — the contract is about status mapping). |
| **W6** | `11-project-checkout-pipeline.mdx` — starter `STATUS_TO_HTTP` (line 425) + hint 2 (line 680) | Stub's `STATUS_TO_HTTP` includes `replayed: 200`, but the service returns `status: 'confirmed'` on replays, so mapping `result.status` yields **201** on replays (fails tests 19–20). Hint 2 ("map the service's status") doesn't mention checking `replayed` first; only the hidden-in-solution branch saves the naive learner. | Add `replayed: 200` handling to hint 2 (or to the stub's comment: "handle `result.replayed` before mapping status"). |
| **W7** | `10-project-cart-domain.mdx` — code block `module.preview`; also `11` preview | L10 preview: `addItem([[1,2,100]], 1, 3, 100) → [[1,5,100,500]]` — the 4-tuple `[id, qty, price, total]` is the **old solve-era row shape**; the actual item shape is the 3-field object `{productId, qty, unitPrice}` and `addItem` returns a cart, not a tuple+total. L11 preview: `201 {status: confirmed, totalCents: 12500}` — the response is `{data: order}` and the field is `total`, **not `totalCents`** (RUNLOG's stale shape leaked into the preview). | Rewrite previews to match the contract: L10 → "addItem([{productId:1,qty:2,unitPrice:100}], 1, 3, 100) → [{productId:1,qty:5,unitPrice:100}], total 500"; L11 → "201 {data: {id, total: 12500, status: 'confirmed'}}; same key again → 200". |
| **W8** | `13-project-assembly-docker.mdx` — task (line 1012) + hints 1/3 (lines 1091, 1093) | Task/hints promise `getEnv`/`validateEnv` **trim** the value; the contract table (line 55), the tests, and the reference solution do **not** trim (they only treat `undefined`/`''` as missing). Hint 1 ("split on the FIRST '='; trim both sides") also describes parsing `process.env` entries, which the implementation never does (it indexes `process.env[name]` directly). | Remove the trim wording from task/hints (or implement trimming everywhere — but then tests must cover it). |
| **W9** | `course.mdx` — description (line 4) and roadmap (lines 46–59) | "Quizzes are graded in-platform; the real grade is npm test going green" — stale: the platform now grades each project lesson's module exercise (`testsContent`). | Reword: "Each project lesson ships a graded module exercise (visible node:test suite); the offline project's `npm test` must go green too." |
| **W10** | `courses/backend-fundamentals/AGENTS.md` — "Rules for project lessons" (lines 55–58) | "**NO `type: code` blocks in lessons 10–13 (no `solve()` anywhere)** … the in-platform grade is the quiz blocks" — **directly contradicts the current lessons**, which all have `mode: module` code blocks that are the in-platform grade. The module block schema is undocumented here and in the global `courses/AGENTS.md`. | Rewrite the section to document the `mode: module` format (`module.entry/language/testsFile/testsContent/preview/extraFiles`, `starter.javascript`, hints, solution) and drop the "no code blocks" rule. |
| **W11** | L10–13 "How this lesson is graded" markdown paragraphs (L10 49–51, L11 49–51, L12 49–51, L13 41–43); `14-final-assessment.mdx` revision-tips (line 287) | Lessons tell learners "the platform grades the four quiz blocks" — stale (module exercise is graded). Exam revision tips say "re-run the three `solve()` exercises by hand" — `solve()` doesn't exist in this course. | Update the grading sentences; change "solve() exercises" → "module exercises". |

## INFO items (nice to have)

| # | Location | Issue |
|---|----------|-------|
| I1 | L2/L7 status tables | `402 Payment Required` (used by L11's insufficient-funds mapping) appears nowhere in the theory status-code lessons; only introduced in L11's contract. Consider one line in L2's 4xx list. |
| I2 | course AGENTS.md line 46 | "The shipped project (`shop-api/`)" — actual dir is `project/`. |
| I3 | AGENTS.md line 86 + L13 blueprint package.json + project package.json | Test script written three ways: `node --test` (AGENTS.md, L13 blueprint) vs `node --test "tests/*.test.js"` (project). All run the same 4 files. |
| I4 | AGENTS.md exam convention (line 133) | "2 per lesson" not met: L2/L6/L7/L9 have 3, L3/L10/L11/L12 have 1 (26 total, all lessons covered). Rebalance or reword the convention. |
| I5 | L13 app.js comment (line 244) + AGENTS.md line 84 | Comment says "chain: logger → rate limiter → routes (auth runs per-route where needed)"; AGENTS.md quotes "logger → auth → rate limit → controller". Code is correct; align the comment. |
| I6 | L13 Dockerfile snippet vs project Dockerfile | Blueprint carries the "commit package-lock.json so npm ci works" comment; shipped Dockerfile doesn't. |
| I7 | L13 `db/pool.js` snippet vs project | Comment-only diff (`// db/pool.js` header). |
| I8 | L13 `db/redis.js` (both snippet and shipped file) | Duplicated header comment; and the "missing from the lesson-13 project tree" note is stale — the tree lists `db/redis.js`. |
| I9 | L12 `module.preview` | "Retry-After: 60" is only the *maximum* (when the oldest request just entered the window); the actual header is `max(1, ceil((oldest+windowMs−now)/1000))` ∈ [1,60] — usually far less for a fast burst. Fine as a loose description; a precise example would say 1. |
| I10 | L13 blueprint vs project | Blueprint shows complete `cartService.js`/`ordersController.js` where the project ships stubs — intended (finished-project view). |
| I11 | project/RUNLOG.md, CHANGELOG.md (F7, F10) | Stale artifacts from an earlier code era: array-rows `[1,2,2500,5000]`, `totalCents`, `cart_items.price_cents`, "validation added to controllers" — none match the shipped code. Rewrite or mark as historical. |
| I12 | L10–13 markdown | Use-case callouts use `**Use case.**` while theory lessons use `**Use case:**` — unify punctuation. |
| I13 | L11 stub `services/orderService.js` store (line 14) | Stub store has a dead `idempotency: new Map()` and no `seq`; the reference uses `orders` (keyed by idempotencyKey) + `seq`. Harmless (stub is TODO) but inconsistent scaffolding. |
| I14 | L13 walkthrough step 7 (lines 957–965) | Expected output `60 200 / 10 429` vs parenthetical "the verified run measured 59×200/11×429" — the RUNLOG confirms 59/11. Make the comment match the expected block or vice versa. |

---

## Previously-reported issues — re-checked

| Old finding | Status now |
|---|---|
| W1: mscq explanation cites `node src/server.js` | ✅ **Fixed** — explanation (L13 line 1150) says "The CMD is node server.js"; Dockerfile is `CMD ["node","server.js"]`. |
| W2: `/api/products` not rate-limited | ✅ **Fixed** — `app.js` mounts an IP-keyed limiter (limit 60) on `/api/products`; matches L12 acceptance criteria. |
| W3: `cart_items` lacks a price column | ✅ **Fixed** — `001_init.sql` has `unit_price BIGINT NOT NULL`; repository upsert writes it. |
| S1: add-to-cart curl missing price | ✅ **Fixed** — walkthrough sends `unitPrice: 2500` with an explanation. |
| S3: undefined `reqBalance` in L11 snippet | ✅ **Fixed** — the production-shape snippet now shows `decide(items, await stockSnapshot(), balanceFor(userId))`. |
| S4: `npm ci` without lockfile | ✅ **Fixed** — `package-lock.json` committed; tree + Dockerfile note it. |
| S5: exam distribution | Still deviates from "2 per lesson" (I4). |
| S6: L2 PATCH table "no" vs L7 nuance | Still present — internally consistent; optional cross-reference. |

**Files touched by this review:** only `courses/backend-fundamentals/REVIEW.md`
(overwritten). The project directory was left byte-identical to its staged
state (stubs restored, `node_modules` git-ignored); scratch scripts live in
`/tmp/`.
