# Operating Systems — course notes for agents

Read the global `../AGENTS.md` first — it defines the file format and grading
contract. This file adds the specifics of *this* course.

## Purpose

Interview-revision course for the OS section of a 4th-year placement checklist.
**Short, to-the-point notes** — a student must be able to skim the whole course
the night before an interview. Every lesson follows the same skeleton:

> concept definition → key points (bullets) → **Use case** (real world) →
> flowchart diagram → numerical practice (worked) → quiz (mcq/mscq)

## Lesson map

| # | Lesson | Difficulty | Covers (from the TODO checklist) |
|---|--------|-----------|----------------------------------|
| 1 | processes-and-threads | beginner | program vs process vs thread; lifecycle & states; context switching; PCB; user vs kernel threads; multithreading models |
| 2 | cpu-scheduling | easy | FCFS, SJF, SRTF, RR, Priority (pre/non), MLQ & MLFQ, convoy effect, starvation, aging + code exercise (SJF) |
| 3 | synchronization | medium | race condition, critical section, mutex/semaphore, Peterson's, producer-consumer, readers-writers, dining philosophers, monitors |
| 4 | deadlocks | medium | Coffman conditions, prevention/avoidance/detection, Banker's algorithm, resource allocation graph |
| 5 | memory-management | medium | contiguous allocation, fragmentation, paging, segmentation, virtual memory & demand paging, FIFO/LRU/Optimal, thrashing + code exercise (FIFO) |
| 6 | file-systems-and-io | easy | allocation methods, directory structures, disk scheduling (FCFS/SSTF/SCAN/C-SCAN), inodes, fork/exec/wait |
| 7 | final-assessment | medium | comprehensive MCQ/MSQ exam across sections 1–6 |

## Conventions

- All lessons use `blocks:` (block-based format, §3.2 of the global contract).
- **markdown blocks** carry the notes. Keep prose tight; prefer bullets.
  End each concept chunk with a `**Use case:**` line or a `:::example` callout.
- **flowchart blocks** for every diagram: process states, scheduling, wait/signal,
  RAG, address translation, disk scheduling, fork trees. `nodes` ≤ 10; edges
  reference valid indices; keep them acyclic.
- **mcq/mscq** for practice. Numerical questions are mcq with computed options
  and a worked `explanation` showing every step (formula + substitution + answer).
- **code blocks** only in lessons 2 (SJF total waiting time) and 5 (FIFO page
  faults). `solution` is Python; provide equivalent starters/signatures for
  python, javascript, java. At most one code block per lesson.
- Numbers that exceed 2^53 are quoted strings in `expected`.
- YAML block scalars: content under `content: |` is indented **6 spaces**
  (2 for the list item + 4 for the scalar). No tabs. Fenced code blocks inside
  `content: |` keep that same 6-space indent.
- Difficulty signals: `beginner` = definitions, `easy` = algorithms + simple
  numerics, `medium` = multi-concept + trickier numerics.

## Validating

Do **not** run `verify.js` while other agents are writing lessons — it reads
the whole tree. The coordinator runs it once after review. To self-check a
single file's frontmatter parses, use:

```bash
node -e 'const gm=require("/home/monke/monke/my-projects/trucoder/server/node_modules/gray-matter");const fs=require("fs");for(const f of process.argv.slice(1)){const d=gm(fs.readFileSync(f,"utf8"));const b=d.data.blocks||[];console.log(f.split("/").pop(),"frontmatter OK,",b.length,"blocks")}' <files...>
```

## Pedagogy

Interview answers are short: define it in one line, say the key points, give
the use case, then the numbers. Mirror that in every lesson. Every numerical
must show its working in the `explanation` — that is the revision value.
