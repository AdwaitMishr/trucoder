# DBMS & SQL — course notes for agents

Read the global `../AGENTS.md` first (file format + grading contract). This
file adds this course's specifics.

## Purpose

Interview-revision course for the DBMS section of a placement checklist
(TODO §5, including SQL). Short, to-the-point notes. Skeleton per lesson:
concept → key points (bullets) → **Use case** → flowchart → **interview
questions** → quiz. SQL appears in fenced code blocks as teaching content.

## Lesson map

| # | Lesson | Difficulty | Covers (TODO §5) |
|---|--------|-----------|------------------|
| 1 | core-concepts | beginner | DBMS vs file system, ACID with examples, 1/2/3-tier architecture, schema levels (physical/logical/view) |
| 2 | er-relational | easy | entities/attributes/relationships, cardinality (1:1, 1:N, M:N), ER→relational conversion, keys (primary/candidate/super/foreign/composite) |
| 3 | normalization | medium | functional dependencies, 1NF/2NF/3NF/BCNF with worked examples, when to denormalize, lossy vs lossless decomposition |
| 4 | sql-queries | easy | DDL (CREATE/ALTER/DROP/TRUNCATE), DML (SELECT/INSERT/UPDATE/DELETE), all joins, subqueries & correlated, GROUP BY/HAVING/ORDER BY, window functions (ROW_NUMBER/RANK/DENSE_RANK/LEAD/LAG), indexes, views/triggers/procedures |
| 5 | transactions-concurrency | medium | transaction states, dirty read/phantom/non-repeatable read, isolation levels READ UNCOMMITTED→SERIALIZABLE, locking (2PL), DB deadlock |
| 6 | indexing-storage | medium | B-tree & B+ tree (most important), clustered vs non-clustered index, hashing in DBMS, query optimization basics |
| 7 | sql-interview-patterns | medium | recurring interview archetypes (LeetCode SQL 50): second-highest (LIMIT 1 OFFSET 1 / MAX < MAX, NULL when absent), top-N per group (DENSE_RANK + filter), consecutive rows (LAG / self-join), anti-join (LEFT JOIN ... IS NULL), NULL traps (COUNT(col) vs COUNT(*), referee != 2, COALESCE), running totals (SUM() OVER), division (HAVING COUNT(DISTINCT) = n); pattern-selection flowchart |
| 8 | sql-vs-nosql | medium | SQL vs NoSQL comparison, CAP (CP vs AP, partition unavoidable), ACID vs BASE, when to choose NoSQL, NoSQL types (Redis/MongoDB/Cassandra/Neo4j), Redis one-liners (in-memory, single-threaded), e-commerce schema design; CAP triangle + decision flowcharts |
| 9 | postgres-and-query-tuning | medium | PostgreSQL vs MySQL vs SQLite, EXPLAIN, CTEs, query tuning |
| 10 | final-assessment | medium | interview-favourite questions + comprehensive exam across lessons 1–9 |

## Conventions

- All lessons use `blocks:`. SQL in fenced blocks (` ```sql `) inside markdown
  content — that IS the content. Flowcharts where helpful; mcq/mscq quizzes.
- **Interview questions:** every lesson's markdown blocks include at least 2
  `:::tip` callouts phrased as `**Interview question:** <question> — <model
  answer>` (e.g. "what is the difference between HAVING and WHERE?", "why B+
  trees and not B-trees for indexes?", "explain dirty read vs phantom read").
- **Code blocks:** exactly one in lesson 4 (INNER JOIN simulation:
  `solve(left, right, lkey, rkey) -> int`, see below) and exactly one in
  lesson 7 (second-highest simulation:
  `solve(rows: list[list[int]], value_col: int) -> int` — the second-highest
  DISTINCT value in a column, or -1 when fewer than 2 distinct values exist;
  languages [python, javascript, java]; solution in Python).
- SQL examples used in lessons MUST be correct — mentally execute every query
  you write and every expected result you state.
- At most one code block per lesson. Expected numbers natural; arrays as JSON.
- YAML block scalars: content under `content: |` indented 6 spaces, no tabs.
  Fenced ```sql blocks keep the same 6-space indent.

## Validating

Do NOT run verify.js while other agents are writing. Self-check a file with:

```bash
node -e 'const gm=require("/home/monke/monke/my-projects/trucoder/server/node_modules/gray-matter");const fs=require("fs");for(const f of process.argv.slice(1)){const d=gm(fs.readFileSync(f,"utf8"));const b=d.data.blocks||[];console.log(f.split("/").pop(),"frontmatter OK,",b.length,"blocks")}' <files...>
```

## Pedagogy

Interview answers are short: define in one line, key points, use case, and for
SQL — the query and its result. Every normalization example must show the FD
derivation; every isolation-level question must name the anomalies it allows.
The code exercise makes learners think in set/join semantics.
