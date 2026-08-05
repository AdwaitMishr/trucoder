# AGENTS.md — Authoring Courses for TruCoder

TruCoder is a self-hosted interactive learning platform. Courses live as plain
text files in this directory. **No code changes are needed to add a course** —
write the files, and TruCoder loads them at runtime.

This document is the contract between an agent (or a human) and TruCoder. Read
it fully before authoring. It defines exactly how a course is structured so that
any agent — this one, Claude, Codex, Copilot, your local model — can produce a
valid, well-designed course that TruCoder can run and grade.

---

## 1. The big picture

```
courses/
  AGENTS.md                     <- you are here
  <course-id>/
    AGENTS.md                   <- course-specific notes for agents
    course.mdx                  <- course metadata + syllabus/overview
    lessons/
      <nn>-<lesson-id>.mdx      <- one file per lesson, ordered by filename
```

Each course is a directory. Each lesson is a `.mdx` file. `course.mdx` describes
the course; the `lessons/` files are the actual teaching units.

TruCoder scans this tree on startup and whenever a file changes. It reads every
course and every lesson, parses the frontmatter, and makes them available through
the API. A malformed file is logged and skipped — it never takes the app down.

---

## 2. The `.mdx` format (two parts)

Every `.mdx` file has exactly two parts:

1. **YAML frontmatter** — a block between two `---` lines at the very top.
   Holds all *machine-readable* data (ids, difficulty, starter code, tests,
   reference solution).
2. **A Markdown body** — everything after the frontmatter. Holds the *human*
   lesson content. Rich formatting is supported (see §6).

```mdx
---
id: example-lesson
title: "Example Lesson"
difficulty: easy
order: 1
tags: [pattern]
task: "Implement solve to do the thing."
languages: [java, javascript, python]
timeLimitMs: 2000
signature:
  java: "static int solve(int n)"
  javascript: "function solve(n)"
  python: "def solve(n: int) -> int"
starter:
  java: |
    static int solve(int n) {
        return 0;
    }
  javascript: |
    function solve(n) {
      return 0;
    }
  python: |
    def solve(n: int) -> int:
        return 0
tests:
  public:
    - name: "simple"
      args: [3]
      expected: 6
  private:
    - name: "edge"
      args: [0]
      expected: 0
solution: |
  def solve(n: int) -> int:
      return n * 2
hints:
  - "Try doubling the input by hand first."
  - "solve(n) should return n * 2."
---

Write the teaching content here in Markdown.

:::tip
Use container directives for callouts. See section 6.
:::
```

---

## 3. Frontmatter fields (lesson)

| Field | Required | Type | Notes |
|---|---|---|---|
| `id` | yes | string | Unique within the course. lowercase-hyphens. |
| `title` | yes | string | Human title shown in the roadmap and header. |
| `type` | no | enum | `content` = reading-only lesson (no coding exercise). See §3.1. Omit for a normal coding lesson. |
| `difficulty` | yes | enum | `beginner` \| `easy` \| `medium` \| `hard` |
| `order` | yes | int | Position in the course. Files are also ordered by filename; `order` wins for display. |
| `tags` | no | list[string] | Concepts this lesson teaches. Shown on the roadmap. |
| `task` | yes* | string | The one-line problem statement shown above the editor. *Not required for `type: content`.* |
| `languages` | yes* | list | Which languages you provide starter + signature for. Supported: `java`, `javascript`, `python`. *Not required for `type: content`.* |
| `timeLimitMs` | no | int | Wall-clock budget per submission (default `2000`). |
| `signature` | yes* | map | The function signature the learner must implement, per language. **The function must be named `solve`.** *Not required for `type: content`.* |
| `starter` | yes* | map | Editable starter code, per language. Use the YAML `\|` block scalar so indentation is preserved. *Not required for `type: content`.* |
| `tests.public` | yes* | list | Visible tests (shown to the learner, used by **Run**). *Not required for `type: content`.* |
| `tests.private` | yes* | list | Hidden tests (used by **Submit** only). At least one. *Not required for `type: content`.* |
| `hints` | no | list[string] | Progressive hints. Revealed one at a time in the UI. Start vague, get more specific. |
| `solution` | no | string | A reference solution. **Never displayed to the learner** — it is for agents/tools and for verifying the tests. |

### 3.1 Content-only lessons (`type: content`)

Not every lesson needs to be a coding problem — command-heavy topics (Kubernetes,
Docker, git) are better taught as reading material. A content lesson has:

```mdx
---
id: cluster-architecture
title: "Cluster Architecture"
type: content
difficulty: beginner
order: 1
tags: [cluster, kubectl]
---

Write the teaching content here. Use `kubectl` commands and YAML in fenced
code blocks — that IS the content.
```

- Only `id`, `title`, and the body are required. No `signature`/`starter`/
  `tests`/`task`.
- The UI renders the body full-width (no editor, no run/submit, no zen toggle)
  and shows a **mark as read** button at the end. Marking read counts as solved
  for course progress, exactly like passing an exercise.
- Content lessons still take `difficulty`, `order`, and `tags` — they appear in
  the roadmap (with a book icon and a `reading` tag) like any other lesson.
- Mix freely: `type: content` for concepts/commands, normal lessons for the
  parts that are genuinely algorithmic. Do not force a topic into a coding
  problem just to fill a template.

### 3.2 Block-based lessons (`blocks:`)

For maximum flexibility, define a lesson as an **ordered list of typed blocks**.
This is the most extensible format — a lesson can combine reading, a coding
exercise, quizzes, images, and flowcharts in any order:

```mdx
---
id: deployments
title: "Deployments"
difficulty: easy
order: 4
tags: [deployments, rolling-update]
blocks:
  - type: markdown
    content: |
      Any markdown prose, including callouts and fenced code blocks.
  - type: image
    src: my-diagram.svg       # served from courses/<course-id>/assets/
    alt: "What the image shows"
    caption: "Optional caption under the image."
  - type: flowchart
    title: "optional diagram title"
    nodes: ["Start", "Do the thing", "Done"]
    edges:
      - {from: 0, to: 1, label: "go"}
      - {from: 1, to: 2, label: "finish"}
  - type: mcq
    prompt: "Which option is correct?"
    options: ["A", "B", "C"]
    answer: 1                     # index of the correct option
    explanation: "Why — shown after a correct answer."
  - type: mscq
    prompt: "Which options are true?"
    options: ["A", "B", "C", "D"]
    answer: [0, 2]                # set of correct indices
    explanation: "Why these are correct."
  - type: code
    task: "Implement solve(...)"
    languages: [java, javascript, python]
    signature: {java: "...", javascript: "...", python: "..."}
    starter: {java: "|...", javascript: "|...", python: "|..."}
    tests:
      public: [{name: "basic", args: [1], expected: 1}]
      private: [{name: "edge", args: [0], expected: 0}]
    hints: ["First hint.", "Second hint."]
    solution: |
      def solve(n): return n
---
```

Block types and rules:

| Type | Purpose | Fields |
|------|---------|--------|
| `markdown` | prose/reading | `content` |
| `code` | coding exercise (same fields as a legacy code lesson) | `task`, `languages`, `signature`, `starter`, `tests`, `hints`, `solution` |
| `mcq` | single-choice question, server-graded | `prompt`, `options` (≥2), `answer` (index), `explanation` |
| `mscq` | multi-select question, server-graded | `prompt`, `options` (≥2), `answer` (indices), `explanation` |
| `image` | figure | `src` (relative to `courses/<id>/assets/`), `alt`, `caption?` |
| `flowchart` | simple DAG diagram (rendered as inline SVG, no deps) | `title?`, `nodes` (≥1), `edges` (`{from, to, label?}`) |

Rules:

- `answer` fields and `solution` are **never sent to the learner** — grading is
  server-side. A lesson is `solved` when all its graded blocks are solved:
  code block = accepted submission; quiz blocks = all answered correctly.
- Quiz-only lessons complete when every quiz block is answered correctly (a
  **mark as read** escape hatch is still available in the UI).
- A lesson may contain **at most one `code` block** (run/submit grade the
  lesson). Multiple quizzes, images, and flowcharts are fine.
- Flowchart `edges` reference node indices; `from`/`to` must be valid indices.
  Avoid cycles (or keep them short — the renderer caps layout passes).
- Legacy lessons (body + `starter`/`tests`, or `type: content`) are normalized
  to blocks automatically — you do not need to convert existing courses.

### Test case shape

Each test is:

```yaml
- name: "readable label"
  args: [1, "abc"]     # positional args passed to solve(...)
  expected: 42         # expected JSON result
```

Rules:

- `args` are positional and passed to `solve(*args)`.
- `expected` must be the JSON value `solve` should return.
  - Numbers and booleans: write them naturally (`42`, `true`).
  - Strings: quote them (`"ace"`).
  - Arrays: `[1, 2, 3]` or `["a", "b"]`.
  - **Big integers**: write them as a **quoted string** (`"1134903170"`), never
    as a bare number. TruCoder compares results as JSON text, so a string keeps
    full precision. A bare YAML number is parsed as a JS float and can lose
    digits above `2^53`.
  - `-1` and `null` are fine as-is.

---

## 4. The function contract (how grading works)

Grading is language-agnostic and simple:

1. TruCoder wraps the learner's code with a harness that reads the test `args`
   and calls `solve(...args)` once per test.
2. It serializes the return value to compact JSON and compares it, character for
   character, to the `expected` value you wrote.
3. All tests in one submission run inside one isolated sandbox container.

Implications you must respect:

- The learner's entry point is **always a function named `solve`**.
- It must be `static` in Java. In JavaScript/Python it is a top-level function.
- For Java, `int[]`, `long[]`, `String[]`, `int`, `long`, `String`, `double`,
  and `boolean` parameters and returns are supported. Keep signatures to these
  types. (`java.util.*` is auto-imported in the harness, so learners can use
  `HashMap`, `Arrays`, etc.)
- Every language must have the **same logical behavior** in `starter` and
  `signature` — the tests are language-agnostic.

---

## 5. Frontmatter fields (course.mdx)

| Field | Required | Type | Notes |
|---|---|---|---|
| `id` | yes | string | Must match the directory name. |
| `title` | yes | string | Course title. |
| `description` | yes | string | 1–2 sentence summary shown on the dashboard. |
| `difficultyLevels` | no | list | The levels you use (e.g. `[beginner, easy, medium, hard]`). |

The `course.mdx` **body** is a syllabus / welcome. It can describe the path,
prerequisites, and how to use the course. It renders at the top of the dashboard.

The **course `AGENTS.md`** (one level down) is for *your collaborator agents*:
overview, pedagogy, how lessons build on each other, conventions to keep when you
extend or fix the course.

---

## 6. Rich content (Markdown + directives)

The body is Markdown. It supports **CommonMark + GitHub-flavored Markdown** and
**container directives** for callouts:

```md
:::note
A neutral clarification.
:::

:::tip
A nudge toward the solution. Good for hints woven into prose.
:::

:::warning
A common mistake to avoid.
:::

:::example
Walk through a concrete input.
:::
```

Supported Markdown: headings (`##`), paragraphs, `**bold**`, `*italic*`,
`\`inline code\``, fenced code blocks, lists, tables, links, and blockquotes.

Write in plain, direct prose. **Show, don't tell** — walk through concrete
inputs. Explain *why* before *how*. Teach the intuition first.

---

## 7. Best practices for a great course

1. **Order matters.** Arrange lessons so each builds on the last (see the DP
   course for a worked example of a learning arc).
2. **Progressive difficulty.** Start with a guided, low-difficulty lesson that
   shows the pattern; ramp up. The `difficulty` field exists to signal this.
3. **One idea per lesson.** A lesson should teach one concept and reinforce it
   with a problem. Don't cram five ideas into one file.
4. **Write a strong `task`.** One or two sentences. State the input and the
   required output precisely enough that the learner can start coding.
5. **Public tests should demonstrate the contract** (typical + one edge case).
   **Private tests should catch the subtleties** (large inputs, empty input,
   ties, off-by-ones). Both should be correct against your `solution`.
6. **Validate your course before shipping** (see §8). A lesson with a test whose
   `expected` doesn't match the `solution` will fail for everyone.
7. **Keep `starter` minimal** — signature + a comment hint, `return 0` /
   `pass` / `{}`. The learner should fill in the logic, not fight boilerplate.

---

## 8. Validating a course

TruCoder ships a verification script that runs every lesson's `solution` against
every test and reports pass/fail. Run it after authoring or editing any course:

```bash
cd server
npm run build
node scripts/verify.js        # exercises every course × every language
```

Expected output: `N passed, 0 failed`. If a test fails, fix the `expected` value
or the `solution` — the lesson is not ready until it is green.

---

## 9. End-to-end example

See `dynamic-programming-zero-to-hero/` in this directory — a complete,
validated 8-lesson course. Use it as the reference for structure, frontmatter,
pedagogy, and test quality. When in doubt, mirror it.

---

## 10. Checklist before finishing

- [ ] Course directory is `courses/<id>/` with `course.mdx` and `lessons/`.
- [ ] Course `AGENTS.md` documents the pedagogy and conventions.
- [ ] Every lesson has `id` and `title`; coding lessons also have `task`,
      `languages`, `signature`, `starter`, `tests.public`, `tests.private`;
      content lessons set `type: content`; rich lessons use `blocks:` (see §3.2).
- [ ] `hints` are progressive (vague → specific) when present.
- [ ] Function is named `solve` in every language; Java is `static`.
- [ ] `expected` matches `solve(...args)` for every test (verified via §8).
- [ ] Quiz `answer` indices are valid (within `options` range); mscq answers
      are non-empty index lists.
- [ ] Image `src` files exist under `courses/<id>/assets/`.
- [ ] Big integers are quoted strings.
- [ ] Body uses Markdown + directives (not raw HTML/JSX).
- [ ] `node scripts/verify.js` reports `0 failed`.
