# Kubernetes Fundamentals — course notes for agents

Read the global `../AGENTS.md` first — it defines the file format and grading
contract. This file adds the specifics of *this* course.

## Structure: reading + code + a capstone project

This course deliberately mixes lesson types — Kubernetes is mostly *commands
and YAML*, not algorithms:

- Reading lessons (`blocks:` with markdown + quizzes): concepts, real
  `kubectl` commands, and YAML in fenced blocks.
- Two arithmetic code lessons (resource units, HPA math) — code only where
  the math genuinely matters.
- The ShopAPI capstone (lessons 16–21): five graded *manifest literacy*
  lessons (Python-only) + a kind walkthrough reading lesson.

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
| 9 | Namespaces | content | folders, quotas, DNS scope |
| 10 | ConfigMaps & Secrets | content | config without rebuilds |
| 11 | Storage | content | PVs, PVCs, access modes |
| 12 | Other workloads | content | Jobs, CronJobs, DaemonSets, StatefulSets |
| 13 | Ingress | content | L7 routing, hosts, paths, TLS |
| 14 | RBAC & security | content | service accounts, roles, policies |
| 15 | Observability & Helm | content | logs, metrics, packaging |
| 16 | Project: Deployment | code (python) | read + validate the manifest |
| 17 | Project: Service | code (python) | ports, selectors, endpoints |
| 18 | Project: Config & Secret | code (python) | keys, types, separation |
| 19 | Project: Ingress & HPA | code (python) | routing + autoscaling |
| 20 | Project: Storage | code (python) | PVC wiring, consistency |
| 21 | Project: run it | content | kind walkthrough + interview prep |

Rule for adding lessons: if the idea is expressed in commands, manifests, or
concepts → reading with real `kubectl` commands and YAML in fenced blocks. If
the idea has genuine arithmetic worth practicing → a coding lesson. Do not
force a topic into `solve()`.

## Conventions for the coding lessons

- The two arithmetic lessons use all four languages; the manifest lessons
  (16–20) are **Python-only** — they parse YAML with `yaml.safe_load`
  (`python3-yaml` is installed in the sandbox image; do NOT remove it).
- Manifest lessons return **fixed-order lists** (`[image, replicas,
  selector_ok, ...]`), never dicts — the harness compares JSON strings, and
  dict key order would break equality. State the exact order in `task`.
- Booleans `true`/`false` and `null` compare cleanly through the JSON
  harness; use `.get()` for optional fields (`nodePort`,
  `storageClassName`, probes).
- The canonical ShopAPI manifest set (deployment, service, configmap,
  secret, ingress, hpa, pvc) is defined once across lessons 16–21 — keep
  every lesson's YAML consistent with it (same names, ports, labels).
  Tests include BROKEN variants (selector mismatches, missing probes,
  wrong kinds) — that is the point of the lesson.
- Existing conventions still apply: keep expected values below `2^53`,
  `resource-units` returns `long` in Java.

## Pedagogy

Reading lessons teach: the concept → the `kubectl` command → the YAML → a
worked example/callout, with 2–3 quiz blocks (mcq/mscq) per lesson. The
project arc teaches manifest literacy first (graded extraction/validation),
then real execution on kind (lesson 21). The course is explicitly positioned
as resume material — lesson 21 closes with the exact claims the learner can
make and the three interview questions they must be able to answer.

Keep the ShopAPI example app consistent: `shop-api` deployment (3 replicas,
port 8080, `/readyz` + `/healthz`), `shop-config` ConfigMap, `shop-secrets`
Secret, `shop-api` Service (80 → 8080), `shop-ingress` (shop.example.com),
`shop-api-hpa` (min 2, max 6, 70%), `shop-reports` PVC (1Gi, RWO, mounted at
`/data`).
