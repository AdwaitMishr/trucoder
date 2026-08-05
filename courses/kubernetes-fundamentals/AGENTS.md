# Kubernetes Fundamentals — course notes for agents

Read the global `../AGENTS.md` first — it defines the file format and grading
contract. This file adds the specifics of *this* course.

## What this course teaches

A hands-on introduction to Kubernetes ideas, taught by solving small problems
in code. Concepts introduced in order:

1. **Resource units** — parsing `Ki`/`Mi`/`Gi`/`Ti` (binary) vs `K`/`M`/`G` (SI).
2. **Labels & selectors** — `matchLabels` semantics = subset match on key/value
   pairs.
3. **Desired state** — the controller loop reconciles current toward desired;
   the exercise is the signed delta.
4. **Rolling update** — `maxUnavailable` as a percentage rounds *down*.
5. **Service DNS** — `name.namespace.svc.cluster.local`.
6. **Readiness probes** — NotReady after `initialDelay + period × (threshold − 1)`
   seconds of consecutive failures.
7. **HPA math** — `max(1, ceil(replicas × utilization / target))`.
8. **Taints & tolerations** — match on key + effect, value optional; empty
   value or effect on the toleration acts as a wildcard.

## Conventions specific to this course

- Map-like data (labels, selectors, taints) is **encoded as strings**, not
  structured types, because the Java harness only supports scalar and array
  parameters:
  - Labels/selectors: comma-separated `key=value` pairs, e.g.
    `"app=web,env=prod"`.
  - Taints/tolerations: `key=value:effect` with an **empty** value or effect
    allowed, e.g. `"gpu=:NoSchedule"` or `"gpu=true:"`. Empty side = wildcard.
- Lesson 1 returns **`long` in Java** (byte counts exceed `int` range).
  Lessons 2 and 8 return `boolean`; lesson 5 returns `String`.
- The reference `solution` is Python; Java/JS starters must be equivalent logic.
- Keep all test values below `2^53` so bare YAML numbers compare exactly.

## Pedagogy

Each lesson body is short: the mental model → a worked example → a callout
pointing at the common mistake. Two lessons need extra care:
- Lesson 6 (probes): the contract is `initialDelay + period × (threshold − 1)`
  — the *first* probe runs at `initialDelay`, so the failure is confirmed one
  period short of the naive formula. The task string states this exactly.
- Lesson 8 (taints): Java's `split` drops trailing empty strings, so the
  reference logic must split with a negative limit. Warn learners about the
  `key=value:effect` format with possibly-empty parts.
