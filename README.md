# TruCoder

A self-hosted, interactive coding-course platform. Content is **fully
data-driven** — courses live as `.mdx` files in `courses/`, so any agent (or
human) can author a course with no code changes. TruCoder loads and grades it at
runtime. Ships with a validated 8-lesson Dynamic Programming course; the model is
generic enough for any topic.

## How it works

- **Courses** live in `courses/<course-id>/` as `.mdx` files: YAML frontmatter
  (signature, starter code, tests, hints, reference solution) + a Markdown body
  with rich `:::tip` / `:::warning` callouts.
- **The loader** scans `courses/` at startup and watches it — drop in a file and
  it reloads without a restart. `courses/AGENTS.md` is the authoring contract any
  agent should read first.
- **Grading** is language-agnostic: the learner's code is wrapped in a harness
  that calls `solve(...args)` per test, and results are compared as JSON text in
  an isolated sandbox container.
- **Auth** is real: scrypt-hashed passwords, opaque session tokens in httpOnly
  cookies, per-user progress in SQLite.
- **UI** is a calm, minimal, fully themeable light/dark interface (monkeytype
  style) built with React + Monaco. Themes are CSS-variable palettes switched
  via `data-theme` and remembered in localStorage; six are bundled (warm, dark,
  dracula, forest, ocean, olive). The home page lists every course under
  `courses/`, each with live progress.

## Layout

```
courses/                 Agent-authored course content (.mdx) + AGENTS.md
  dynamic-programming-zero-to-hero/   the shipped DP course
server/                  Express API, course loader, grading, sandbox
  src/courses/           loader + types (reads courses/)
  src/sandbox.ts         runs submissions in an isolated Docker container
web/                     React frontend (builds to web/dist)
data/                    SQLite DB (users, sessions, progress)
.env                     SESSION_SECRET, OWNER_USERNAME, OWNER_PASSWORD
```

## Authoring a course

Read `courses/AGENTS.md` first — it is the full contract. In short: create a
directory with `course.mdx` + a `lessons/` folder of `.mdx` files. Validate with:

```bash
cd server && npm run build && node scripts/verify.js
```

It runs every lesson's reference solution against every test and must report
`0 failed`.

## Install from a fresh clone

```
git clone <your-repo> trucoder && cd trucoder
./setup.sh
```

`setup.sh` does four things, in order:
1. **Server** — `cd server && npm install && npm run build` (compiles TS; builds the native `better-sqlite3` binding for your Node).
2. **Web** — `cd web && npm install && npm run build` (Vite → `web/dist`).
3. **Sandbox image** — `docker build -t trucoder-sandbox:latest sandbox-image/` (required for grading; skipped with a warning if Docker isn't running).
4. **`.env`** — created from `.env.example` if missing. **Edit it** and set `OWNER_PASSWORD` and `SESSION_SECRET`.

Then start the server, and optionally verify the shipped course:

```
node server/dist/index.js                 # serves on :3001
node server/scripts/verify.js             # runs every lesson's solution vs. its tests
```

Requirements: **Node.js v18+**, **npm**, **Docker** (for grading). The sandbox
base image is `debian:bookworm-slim`, so it builds on arm64 and x86_64 alike.

> First boot seeds the owner account from `OWNER_USERNAME` / `OWNER_PASSWORD`.
> Progress and user hashes live in `data/` (gitignored).

## Running / deploying (this Pi)

A systemd unit runs the server as `adith` on port 3001. The sandbox image must
exist:

```bash
docker build -t trucoder-sandbox:latest sandbox-image/
```

```bash
sudo systemctl enable --now trucoder
systemctl status trucoder
journalctl -u trucoder -f
```

Env comes from `/home/adith/trucoder/.env`. The owner account (seeded from
`OWNER_USERNAME` / `OWNER_PASSWORD`) is created on first boot. Pin
`/usr/bin/node` (v20) because nvm's node (v24) mismatches the `better-sqlite3`
ABI.

## Internet access

The app listens on `localhost:3001`. cloudflared runs in token/dashboard mode, so
add a route in Cloudflare Zero Trust: Public Hostname → service `HTTP` →
`localhost:3001`.

## Stack

- Backend: Node 20 + Express + TypeScript + SQLite (better-sqlite3).
- Frontend: Vite + React + TypeScript, `@monaco-editor/react`, `react-markdown`
  (+ remark-gfm, remark-directive for callouts), react-router.
- Sandbox: arm64 Docker image `trucoder-sandbox` (JDK 17 + Node + Python + Gson)
  run with `--network none`, read-only rootfs, mem/CPU/pids caps, `--cap-drop ALL`.
  (Piston/Judge0 are amd64-only, so they don't run on this Pi — see the
  `arm64-code-sandbox` skill.)
