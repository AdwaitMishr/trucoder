# Kubernetes Fundamentals — course notes for agents

Read the global `../AGENTS.md` first — it defines the file format and grading
contract. This file adds the specifics of *this* course.

## Structure: reading + code

This course deliberately mixes lesson types — Kubernetes is mostly *commands
and YAML*, not algorithms, so most lessons are `type: content` (reading) and
only two are coding exercises:

| # | Lesson | Type | Idea |
|---|--------|------|------|
| 1 | Cluster architecture | content | control plane vs nodes, kubectl |
| 2 | Pods | content | smallest unit, lifecycle, manifests |
| 3 | Resource units | code | Ki/Mi/Gi binary vs K/M/G SI parsing |
| 4 | Deployments | content | desired state, replicas, rolling update |
| 5 | Services | content | selectors, DNS, port-forward |
| 6 | Probes | content | readiness vs liveness, timing |
| 7 | HPA math | code | ceil(replicas × util / target), min 1 |
| 8 | Taints & tolerations | content | scheduling constraints |

Rule for adding lessons: if the idea is expressed in commands, manifests, or
concepts → `type: content` with real `kubectl` commands and YAML in fenced
blocks. If the idea has genuine arithmetic worth practicing → a coding lesson.
Do not force a topic into `solve()`.

## Conventions for the coding lessons

- Map-like data is encoded as strings (Java harness limitation):
  - Labels/selectors: comma-separated `key=value` pairs.
  - Taints/tolerations (if ever a code lesson again): `key=value:effect` with
    empty value/effect allowed; empty side = wildcard.
- Resource-units returns **`long` in Java** (byte counts exceed `int`).
- The reference `solution` is Python; Java/JS starters must be equivalent.
- Keep test values below `2^53`.

## Pedagogy

Content lessons teach: the concept → the `kubectl` command → the YAML → a
worked example/callout. The two code lessons keep the short mental-model style
of the DP course: model → example → `:::warning` on the common mistake
(probe timing `− 1`, HPA integer ceil, multiply-before-divide).
