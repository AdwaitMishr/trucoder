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
| `difficulty` | yes | enum | `beginner` \| `easy` \| `medium` \| `hard` |
| `order` | yes | int | Position in the course. Files are also ordered by filename; `order` wins for display. |
| `tags` | no | list[string] | Concepts this lesson teaches. Shown on the roadmap. |
| `task` | yes | string | The one-line problem statement shown above the editor. |
| `languages` | yes | list | Which languages you provide starter + signature for. Supported: `java`, `javascript`, `python`. |
| `timeLimitMs` | no | int | Wall-clock budget per submission (default `2000`). |
| `signature` | yes | map | The function signature the learner must implement, per language. **The function must be named `solve`.** |
| `starter` | yes | map | Editable starter code, per language. Use the YAML `\|` block scalar so indentation is preserved. |
| `tests.public` | yes | list | Visible tests (shown to the learner, used by **Run**). |
| `tests.private` | yes | list | Hidden tests (used by **Submit** only). At least one. |
| `hints` | no | list[string] | Progressive hints. Revealed one at a time in the UI. Start vague, get more specific. |
| `solution` | no | string | A reference solution. **Never displayed to the learner** — it is for agents/tools and for verifying the tests. |

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
- [ ] Every lesson has `id`, `title`, `difficulty`, `order`, `task`,
      `languages`, `signature`, `starter`, `tests.public`, `tests.private`.
- [ ] `hints` are progressive (vague → specific) when present.
- [ ] Function is named `solve` in every language; Java is `static`.
- [ ] `expected` matches `solve(...args)` for every test (verified via §8).
- [ ] Big integers are quoted strings.
- [ ] Body uses Markdown + directives (not raw HTML/JSX).
- [ ] `node scripts/verify.js` reports `0 failed`.
