# CSES Problem Set — course notes for agents

Read the global `../AGENTS.md` first (file format + grading contract). This
file adds this course's specifics. You are authoring lessons for the **CSES
Problem Set** (cses.fi) rebuilt as a DSA course.

## Purpose

A studyable version of the CSES competitive-programming set. The value is
**explaining the algorithm and how it maps onto each specific problem** — a
learner should understand the technique, not just copy a solution.

## Lesson format — content-only lessons (type: content)

Each problem is ONE lesson with frontmatter `type: content` (see global
AGENTS.md §3.1) and a `blocks:` list. **Do NOT use `type: code` blocks.**

Rationale: verify.js always runs a code block's reference `solution` as
**Python** and needs the Docker sandboxes to execute — at 400 problems that's
brittle and needs infra. Content lessons have no code runner: they always pass
the gate, and the C++ solution is *displayed* (fenced block) so learners read
it and can paste it into any external judge.

### The FULL PACK (every lesson, in this order)

1. **Theory markdown** — the algorithm/technique: what it is, when you reach
   for it, why it works, time/space complexity, a worked mini-example. Include
   a `:::tip` with **Interview tip:** noting when it shows up in interviews.
2. **Question markdown** — the exact problem statement, real CSES constraints,
   input/output format, and the **sample input/sample output** verbatim
   (fenced).
3. **Solution — progressive tiers (the core of every lesson).** Present the
   solution as a *layered build-up*, each tier with its own ```cpp fenced
   code + time/space complexity, so the learner sees how to think:
   - **① Brute force** — the simplest *correct* approach (often too slow for
     the real constraints). Explain why it's too slow (exact big-O vs.
     the limit).
   - **② Optimization** — the first real optimization (e.g. sort + two
     pointers, prefix sums, hashing, greedy). Code + improved complexity.
   - **③ Further optimization** — a second optimization if one exists
     (e.g. binary search, Fenwick/segment tree, monotonic stack).
   - **④ Alternative algorithm** — a *different* approach that also solves
     it, if one exists (e.g. brute via bitmask vs. DP; sweep-line vs.
     sorting; simulated vs. closed-form). If none is meaningful, say so and
     skip.
   Format each tier as a mini-block: a `**Brute force — O(n²)**` bold line,
   the fenced code, then a one-line complexity note. All tiers must be
   CORRECT; they differ only in speed. Use ```cpp fences.
4. **Code-logic markdown** — how the chosen algorithm maps onto THIS problem
   (walk through the key lines).
5. **Walkthrough markdown** — a traced run on the sample: input → expected →
   actual, showing intermediate state (DP table, pointers, iteration).
6. *(optional)* 1 flowchart (≤10 nodes) + 1 mcq quiz (with `explanation`) on
   the algorithm's trade-off.

YAML: `blocks:` list; every block has `type`. mcq: `answer` = correct index.
Markdown block content under `content: |` indented exactly 6 spaces, NO tabs.
No closing `---` after frontmatter. Filename `lessons/NN-<id>.mdx`.

## Validating

Self-check a file before reporting:

```bash
node -e 'const gm=require(require("path").join(process.cwd(),"server/node_modules/gray-matter"));const fs=require("fs");for(const f of process.argv.slice(1)){const d=gm(fs.readFileSync(f,"utf8"));console.log(f.split("/").pop(),"frontmatter OK,",(d.data.blocks||[]).length,"blocks")}' <files>   # run from repo root
```

Do NOT run the full verify.js while other agents are writing. Report per file:
block count, signature, sample test copied, and the complexity claim.

## Assigned problems (this batch)

Fill this in per batch dispatch — the writer receives its exact problem
list (id + title + section) and must produce one lesson per problem, following
everything above.