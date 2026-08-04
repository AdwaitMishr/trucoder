# Dynamic Programming: Zero to Hero — course notes for agents

You are looking at a TruCoder course. To author or edit lessons, first read the
global `../AGENTS.md` — it defines the file format and grading contract. This
file documents *this course specifically*.

## What this course teaches

Dynamic Programming, from first principles to the patterns that cover most
interview problems. The goal is not memorizing solutions — it is building the
recognition skill: "this problem has overlapping subproblems and optimal
substructure, so DP applies."

## The learning arc (why this order)

Each lesson introduces exactly one new idea and then leans on it in the next:

1. **fibonacci** — overlapping subproblems + memoization + tabulation. The seed.
2. **climbing-stairs** — the same recurrence in a costume (ways-to-arrive).
3. **house-robber** — the **choose / skip** decision; `dp[i] = max(skip, take)`.
4. **coin-change** — a *minimization* with an "impossible" sentinel; state is the
   remaining amount, every coin is the "last coin used".
5. **longest-increasing-subsequence** — state is the *ending index*, not the
   prefix; answer is `max(dp)`, not `dp[n-1]`.
6. **0/1-knapsack** — the **two-dimensional state** (item index × capacity) and
   the reverse-loop space optimization.
7. **longest-common-subsequence** — two-string DP: match → advance both, mismatch
   → drop one side and take the max.
8. **edit-distance** — the capstone: two-string DP with a *cost* per operation;
   take the minimum of replace/delete/insert.

A learner who finishes all eight can recognize the recurrence behind most
classic DP problems.

## Conventions to keep when editing

- `solve` returns the direct answer (int, long, boolean, or int[]/String[]).
  No printing; no extra I/O.
- Public tests demonstrate the contract (typical + one edge). Private tests add
  the subtleties: large `n`, empty input, ties, off-by-ones.
- Keep `n` (or array sizes) in private tests small enough that even an O(n²) or
  O(n·m) reference runs in the sandbox in well under the time limit.
- Big Fibonacci numbers (above ~46) overflow Java `int`. If you add a larger
  case, change the Java signature to `long`/`long[]` and quote the expected
  value as a string. See `../AGENTS.md` §3.
- Difficulty mapping: `beginner` (1–2), `easy` (3), `medium` (4–7), `hard` (8).

## Verifying changes

Always run the verifier before committing a course edit:

```bash
cd server && npm run build && node scripts/verify.js
```

It runs every lesson's reference solution in every language against every test.
It must report `0 failed`. If you change a test, change the reference solution
too, or the verifier will catch the mismatch.
