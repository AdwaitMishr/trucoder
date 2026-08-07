# System Design — course notes for agents

Read the global `../AGENTS.md` first (file format + grading contract). This
file adds this course's specifics.

## Purpose

Interview-revision course for the System Design section of a placement
checklist (TODO §6). Short, to-the-point notes covering HLD + LLD. Skeleton
per lesson: concept → key points (bullets) → **Use case** → flowchart →
worked numerical → **interview questions** → quiz. Design lessons follow the
interview answer shape: clarify requirements → back-of-envelope estimates →
APIs → data model → scale → tradeoffs.

## Lesson map

| # | Lesson | Difficulty | Covers (TODO §6 + 2024-26 research) |
|---|--------|-----------|--------------------------------------|
| 1 | scaling-fundamentals | beginner | horizontal vs vertical scaling, CAP theorem, ACID vs BASE, latency vs throughput, estimation toolkit (QPS = DAU×actions/86400; storage/day; cache 80/20; #servers = QPS/capacity; bandwidth = QPS×payload; 99.99% ≈ 52 min/yr; Jeff Dean numbers: L1 1ns, RAM 100ns, SSD 100µs, RTT 100ms) |
| 2 | core-components | easy | load balancers (L4 vs L7, round robin/least connections/IP hash, health checks), caching (Redis, cache-aside vs write-through vs write-back, LRU/LFU/TTL), CDN (pull vs push, edge caching), SQL vs NoSQL choice |
| 3 | async-and-scaling-tools | medium | message queues (why async, Kafka vs SQS vs RabbitMQ tradeoffs: ordering/replay/throughput, at-least-once vs exactly-once), consistent hashing (virtual nodes), sharding & replication (partition key, leader/follower, read replicas), rate limiting (token bucket vs sliding window, Redis, 429) |
| 4 | url-shortener | medium | worked design: requirements, estimates, API (POST /api/url, GET /:code), base62 encoding, DB schema (id, code, long_url, created_at), redirect 301 vs 302, ID generation (DB auto-increment vs snowflake), cache hot URLs, analytics |
| 5 | chat-system | medium | WhatsApp-style: WebSockets vs polling, connection handler stateless + Redis presence, message flow via Kafka, message ordering (sequence numbers), last-seen, group chat fanout, push notifications |
| 6 | newsfeed | medium | Twitter/Instagram-style: fanout-on-write (push) vs fanout-on-read (pull) vs hybrid, timeline cache (Redis), ranking, sharding by user_id, media via CDN |
| 7 | notification-system | medium | Meta/Uber/Swiggy-style: notification service + queue + workers, provider integration (APNs/FCM/email/SMS), retries + dead-letter, dedup, rate limiting sends, fanout to devices |
| 8 | streaming-ridesharing | medium | Netflix: CDN, DASH/HLS adaptive bitrate, transcoding pipeline, DRM; Uber: geohash/quadtree index, matching, ETA, driver location updates; bonus: GenAI/RAG design block (RAG pipeline, vector DB, streaming, cost) |
| 9 | lld-practice | medium | SOLID deep dive (with code smells), pattern selection (Strategy/Factory/Observer/State — which for what), classic LLD walkthrough (parking lot class design in text + flowchart), snake & ladder BFS code exercise |
| 10 | final-assessment | medium | comprehensive exam across lessons 1–9 incl estimation numerics |

## Conventions

- All lessons use `blocks:`. Flowcharts for every architecture diagram;
  mcq/mscq quizzes; estimation numericals with FULL working in explanations.
- **Interview questions:** every lesson's markdown blocks include at least 2
  `:::tip` callouts phrased as `**Interview question:** <question> — <model
  answer>` (e.g. "design a URL shortener — walk me through it", "why is
  consistent hashing needed?", "cache-aside vs write-through?").
- **Code blocks — exactly 3 in the whole course, in lessons 3, 4, 9:**
  - L3 token-bucket rate limiter: `solve(timestamps: list[int], capacity: int, refill_per_sec: int) -> list[bool]` — tokens accumulate at refill_per_sec capped at capacity; refill happens between timestamps (per elapsed second); each allowed request consumes 1 token; timestamps are non-decreasing ints (seconds). Public example: solve([0,0,0,0], 2, 1) -> [true,true,false,false] (t=0: 2 tokens → allow → 1; t=0 same second: no refill → allow → 0; t=0: deny; t=0: deny). Second public test: solve([0,1,2,3], 2, 1) -> [true,true,true,true] (steady state: refill 1 per sec, use 1 per sec). Private: empty list -> []; burst with gap solve([0,10,20], 1, 1) -> [true,true,true]? (t0:1→0; t10: +10 refill → capped at 1 → allow → 0; t20: same → true) — verify by running python3; large capacity; long sequence. Languages [python, javascript, java]. Solution in Python, VERIFY locally.
  - L4 base62: `solve(code: str) -> int` — DECODE a base62 short code to its numeric id (the redirect path), alphabet "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ" (0-9, then a-z, then A-Z). Examples: solve("0") -> 0, solve("Z") -> 61, solve("10") -> 62, solve("4c92") -> 1000000. NOTE: decode (not encode) — expected values are integers, which avoids the loader's numeric-string unquoting trap (`expected: "0"` becomes the number 0 while Python returns the string "0" — a mismatch). Languages [python, javascript, java]. Solution in Python, VERIFY locally.
  - L9 snake & ladder: `solve(board: list[int]) -> int` — minimum dice throws (die 1..6) to reach the LAST index starting from index 0; board[i] = -1 means normal square, otherwise landing on i teleports you to board[i] (must take it). BFS. Public: small verified board (e.g. board = [-1,-1,4,-1,-1,-1,-1,-1] — 8 squares: 0 → roll 2 → 2 → teleport 4 → roll 1 → 5? NO: 5 is not last (last is 7). Correct path: 0 → roll 2 → 2 → teleport 4 → roll 3 → 7 (last) → answer 2. VERIFY with python3 before finalizing). Private: snakes only, no teleports, longer boards. Languages [python, javascript, java]. Solution in Python, VERIFY locally.
  - At most one code block per lesson. Java starters static solve; int[]/int params.
- Estimation numbers: use round, defensible numbers (1M DAU → ~116 QPS avg at 10 actions/day; peak 3-5×; cache hit 80/20; server ~10k QPS, DB node ~1-5k QPS). Every estimate shows its arithmetic.
- YAML block scalars: content under `content: |` indented 6 spaces, no tabs.

## Validating

Do NOT run verify.js while other agents are writing. Self-check a file with:

```bash
node -e 'const gm=require(require("path").join(process.cwd(),"server/node_modules/gray-matter"));const fs=require("fs");for(const f of process.argv.slice(1)){const d=gm(fs.readFileSync(f,"utf8"));const b=d.data.blocks||[];console.log(f.split("/").pop(),"frontmatter OK,",b.length,"blocks")}' <files...>   # run from the repo root
```

## Pedagogy

Interview answers are short: requirements → estimates → APIs → data model →
scale → tradeoffs. Every design lesson walks ONE canonical design through all
six steps. Every estimate shows its working. The three code lessons make the
learner WRITE the core algorithm (token bucket, base62, BFS) that the design
hinges on.
