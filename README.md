# TruCoder

A self-hosted, interactive learning platform. Courses are **fully data-driven**
— they live as `.mdx` files in `courses/`, so any agent (or human) can author a
course with zero code changes. TruCoder loads, renders, and grades it at
runtime.

## What a lesson can be

Every lesson is an **ordered list of typed blocks** — mix and match:

| Block | Purpose |
|-------|---------|
| `markdown` | reading material, callouts, command/YAML examples |
| `code` | a coding exercise, graded in an isolated sandbox |
| `mcq` / `mscq` | single-/multi-select questions, server-graded |
| `image` | figures served from the course's `assets/` |
| `flowchart` | DAG diagrams rendered as inline SVG (no dependencies) |

Legacy lesson formats (body + `starter`/`tests`, or `type: content`) are
normalized to blocks automatically — nothing needs converting.

- **The loader** scans `courses/` at startup and watches it — drop in a file and
  it reloads without a restart. `courses/AGENTS.md` is the authoring contract
  any contributor should read first.
- **Grading** is language-agnostic: learner code is wrapped in a harness that
  calls `solve(...args)` per test; results compare as JSON text in an isolated
  Docker sandbox (`--network none`, read-only rootfs, mem/CPU/pids caps,
  `--cap-drop ALL`). Quiz answers are graded server-side; solutions and answers
  are never sent to the client.
- **Auth** is real: scrypt-hashed passwords, opaque session tokens in httpOnly
  cookies, per-user progress in SQLite.
- **UI** is a calm, minimal, fully themeable light/dark interface built with
  React + Monaco. The home page lists every course with live progress; lessons
  have zen mode, resizable split, prev/next navigation, and per-block progress.

## Layout

```
courses/                     Course content (.mdx) + authoring contract
  AGENTS.md                  THE contract — read before authoring anything
  kubernetes-fundamentals/   the sample course (tracked in git)
  <your-course>/             local-only by default (see below)
server/                      Express API, course loader, grading, sandbox
  src/courses/               loader + types (reads courses/)
  src/sandbox.ts             runs submissions in an isolated Docker container
  scripts/verify.js          runs every lesson's reference solution vs its tests
web/                         React frontend (builds to web/dist)
data/                        SQLite DB (users, sessions, progress) — gitignored
deploy/                      systemd unit example
.env                         SESSION_SECRET, OWNER_USERNAME, OWNER_PASSWORD
```

### Course content and git

Courses are personal learning content, so **everything under `courses/` is
gitignored by default** — except `courses/AGENTS.md` and the sample course
(`kubernetes-fundamentals/`). Local courses stay on your machine and still load
and grade at runtime; they just don't get committed.

To share a course through git (a PR, for example):

```bash
git add -f courses/<course-id>/
```

## Authoring a course

Read `courses/AGENTS.md` first — it is the full contract (lesson frontmatter,
block types, test format, hints, conventions). In short: create a directory with
`course.mdx` + a `lessons/` folder of `.mdx` files, then validate:

```bash
cd server && npm run build && node scripts/verify.js
```

It runs every lesson's reference solution against every test and must report
`0 failed`. This gate runs in CI on every push and PR.

## Install from a fresh clone

```bash
git clone <your-repo> trucoder && cd trucoder
./setup.sh
```

`setup.sh` does four things, in order:
1. **Server** — `cd server && npm install && npm run build`.
2. **Web** — `cd web && npm install && npm run build` (Vite → `web/dist`).
3. **Sandbox image** — `docker build -t trucoder-sandbox:latest sandbox-image/`
   (required for grading; skipped with a warning if Docker isn't running).
4. **`.env`** — created from `.env.example` if missing. **Edit it** and set
   `OWNER_PASSWORD` and `SESSION_SECRET`.

Then start the server, and verify the shipped course:

```bash
node server/dist/index.js                 # serves on :3001
cd server && npm run verify               # every lesson's solution vs its tests
```

Requirements: **Node.js v18+**, **npm**, **Docker** (for grading). The sandbox
base image is `debian:bookworm-slim`, so it builds on arm64 and x86_64 alike.

> First boot seeds the owner account from `OWNER_USERNAME` / `OWNER_PASSWORD`.
> Progress and user hashes live in `data/` (gitignored).

## Running as a service

A sample systemd unit is in `deploy/trucoder.service` — edit paths, install it,
and start:

```bash
sudo cp deploy/trucoder.service /etc/systemd/system/trucoder.service
sudo systemctl daemon-reload
sudo systemctl enable --now trucoder
journalctl -u trucoder -f
```

Env comes from `.env` via `EnvironmentFile` (see the unit). Pin the Node binary
in `ExecStart` — nvm's node may mismatch the `better-sqlite3` ABI.

## Internet access

The app listens on `localhost:3001` by default. Expose it with a Cloudflare
tunnel (or any reverse proxy) → HTTP → `localhost:3001`.

## Auto-deploy (webhook)

Merges to `main` deploy themselves: GitHub sends a `push` webhook to
`POST /_deploy` (HMAC-gated by `DEPLOY_SECRET`, verified against the raw
payload bytes, main-ref only). The server spawns `server/scripts/deploy.sh`
detached, which:

1. fast-forwards `git pull --ff-only origin main`,
2. rebuilds only what changed — `server/` → `tsc`, `web/` → `npm run build`,
   `sandbox-image/` → `docker build`,
3. restarts the `trucoder` systemd unit when any of those changed,
4. runs `verify.js` and pings the operator (Hark) with the result.

Deploys are serialized with `flock` (`.deploy.lock`); a busy skip is fine
because the next push re-triggers. Progress lives in `deploy.log` and the last
deployed SHA in `.deployed-sha`. The script is detached so it survives the
server restart it performs. To register the webhook:

```bash
gh api repos/<owner>/trucoder/hooks -f name=web -F active=true \
  -f events[]=push -f config[url]=https://<host>/_deploy \
  -f config[content_type]=json -f "config[secret]=<DEPLOY_SECRET>"
```

Note: pushes made FROM the deploy box are a no-op by design (the code is
already there); the webhook earns its keep for GitHub-side merges (PRs,
UI edits).

## Contributing

Contributors are welcome — the platform is designed for people to author
courses without touching code.

1. **Fork + branch.** `git checkout -b feat/<your-course>` or
   `fix/<something>`.
2. **Author.** Read `courses/AGENTS.md`, write your course under `courses/`,
   and validate locally with `npm run verify` (see Authoring above).
3. **Commit conventionally.** Use [Conventional Commits]:
   `feat:`, `fix:`, `docs:`, `chore:`, `refactor:` + a short imperative
   description (e.g. `feat: add docker-basics course`).
4. **Share the course.** Course files are gitignored by default —
   `git add -f courses/<course-id>/` to include them in your PR.
5. **Open a PR.** CI runs the server build, the web build, and `verify.js`
   against every tracked lesson — a red check means your tests or solutions
   are wrong; fix before asking for review.

Platform changes (server/web) follow the same flow. `courses/AGENTS.md` is the
single source of truth for content conventions — if your course needs a new
block type, propose it there first.

## Stack

- Backend: Node 20 + Express + TypeScript + SQLite (better-sqlite3).
- Frontend: Vite + React + TypeScript, `@monaco-editor/react`, `react-markdown`
  (+ remark-gfm, remark-directive for callouts), react-router.
- Sandbox: Docker image `trucoder-sandbox` (JDK 17 + g++/C++17 + Node + Python +
  Gson + nlohmann/json) run with `--network none`, read-only rootfs, mem/CPU/pids
  caps, `--cap-drop ALL`. (Piston/Judge0 are amd64-only, so they don't run on
  arm64 — see the `arm64-code-sandbox` skill.)

[Conventional Commits]: https://www.conventionalcommits.org/
