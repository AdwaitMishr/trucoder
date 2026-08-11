# TruCoder

A self-hosted, interactive learning platform. Courses are **fully data-driven**
— they live as `.mdx` files in `courses/`, so any agent (or human) can author a
course with zero code changes. TruCoder loads, renders, and grades it at
runtime.

Self-host it with Docker in under five minutes — see
[Quick start](#quick-start-docker).

## Quick start (Docker)

```bash
git clone <your-fork-or-this-repo> trucoder && cd trucoder
cp .env.example .env            # set SESSION_SECRET, OWNER_USERNAME, OWNER_PASSWORD
docker compose build            # builds app + sandbox + sandbox-node images
docker compose up -d            # serves on :3001
```

First boot seeds the owner account from `.env`. Open `http://localhost:3001`,
and verify the shipped course against the real grading path:

```bash
docker compose run --rm app node server/scripts/verify.js   # expect 0 failed
```

Requirements: **Docker + Docker Compose** (that's it — no Node needed for a
production run; the images build on arm64 and x86_64 alike).

Prefer pulling prebuilt images over building? Every push to `main` publishes
multi-arch images to GHCR:

```bash
docker pull ghcr.io/adith2005-20/trucoder-app:latest
docker pull ghcr.io/adith2005-20/trucoder-sandbox:latest
docker pull ghcr.io/adith2005-20/trucoder-sandbox-node:latest
docker tag ghcr.io/adith2005-20/trucoder-app:latest trucoder-app:latest
docker tag ghcr.io/adith2005-20/trucoder-sandbox:latest trucoder-sandbox:latest
docker tag ghcr.io/adith2005-20/trucoder-sandbox-node:latest trucoder-sandbox-node:latest
docker compose up -d
```

The compose file builds from source by default; the tag step just maps the
pulled images onto the local names the stack expects. Images are also tagged
per-commit (`:<sha>`), so you can pin an exact build.

> If your host's docker group gid is not `116`, add it to `.env`
> (`DOCKER_GID=<gid>` — find it with `getent group docker | cut -d: -f3`).
> The sandbox daemons use it to access the docker socket.

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
server/                      Express API, course loader, grading
  src/courses/               loader + types (reads courses/)
  src/sandbox.ts             grading transport — talks to the sandbox daemons
  scripts/verify.js          runs every lesson's reference solution vs its tests
web/                         React frontend (builds to web/dist)
data/                        SQLite DB (users, sessions, progress) — gitignored
deploy/                      compose test override + systemd units (webhook trigger)
.env                         SESSION_SECRET, OWNER_USERNAME, OWNER_PASSWORD, ...
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

## Development setup

For working on the platform itself (server/web code), a bare Node setup is
fine:

```bash
./setup.sh
```

`setup.sh` does four things, in order:
1. **Server** — `cd server && npm install && npm run build`.
2. **Web** — `cd web && npm install && npm run build` (Vite → `web/dist`).
3. **Sandbox image** — `docker build -t trucoder-sandbox:latest sandbox-image/`
   (required for grading; skipped with a warning if Docker isn't running).
4. **`.env`** — created from `.env.example` if missing. **Edit it** and set
   `OWNER_PASSWORD` and `SESSION_SECRET`.

Then start the server and verify the shipped course:

```bash
node server/dist/index.js                 # serves on :3001
cd server && npm run verify               # every lesson's solution vs its tests
```

Requirements: **Node.js 20+**, **npm**, **Docker** (for grading).

> First boot seeds the owner account from `OWNER_USERNAME` / `OWNER_PASSWORD`.
> Progress and user hashes live in `data/` (gitignored).

## Deploy it yourself (Docker)

Production is a compose stack with three services (see the Quick start for the
three commands). The app binds `:3001` — put a reverse proxy or Cloudflare
tunnel in front of it for public access.

### How the pieces talk (grading)

- `app` — the Express server + built React bundle. It has **no docker socket**
  and never runs learner code itself.
- `sandbox` / `sandbox-node` — long-lived daemons built from
  `sandbox-image/` / `sandbox-image-node/`. Each exposes `POST /run` and
  `GET /health` and spawns the **per-run grading containers** via the host
  docker socket.
- One grading run = one throwaway container with the same hardening as
  before: `--network none`, read-only rootfs, `--cap-drop ALL`,
  `no-new-privileges`, memory/CPU/pids caps, non-root user, exec tmpfs.

The app calls `http://sandbox:9000` / `http://sandbox-node:9001` over the
compose network (override with `SANDBOX_URL` / `SANDBOX_NODE_URL`). The daemons
mount `/var/run/docker.sock` and publish their ports to loopback only, for
host health checks.

Volumes: `courses/` (hot-reloaded by the loader), `data/` (SQLite — the DB
file stays on the host), `.deploy-trigger` + `deploy.log` (webhook plumbing).

## Auto-deploy (webhook)

Optional. Pushes to `main` can deploy themselves: GitHub sends a `push` webhook
to `POST /_deploy` (HMAC-gated by `DEPLOY_SECRET`, verified against the raw
payload bytes, main-ref only). The endpoint runs inside the app container, so
it cannot run host-side deploys — it writes `.deploy-trigger` (bind-mounted
into the repo), and a host systemd path unit (`deploy/trucoder-deploy.path`)
starts `deploy/trucoder-deploy.service`, which runs `server/scripts/deploy.sh`
ON THE HOST:

1. fast-forwards `git pull --ff-only origin main`,
2. rebuilds only what changed — `server/` or `web/` → the app image
   (with the new SHA baked as the `build <sha>` bundle line),
   `sandbox-image/` → the sandbox image, `sandbox-image-node/` → the node image,
3. `docker compose up -d` (swaps only the changed containers),
4. waits for the sandbox daemons' `/health`,
5. runs `verify.js` in a throwaway app container, then optionally runs a
   post-deploy notification hook (`~/.hermes/scripts/hark-notify.sh`, if
   present — replace with your own or drop a script there).

The deploy process lives OUTSIDE the container being replaced, so a swap can
never kill the deploy mid-run. Deploys are serialized with `flock`
(`.deploy.lock`); a busy skip is fine because the next push re-triggers.
Progress lives in `deploy.log` and the last deployed SHA in `.deployed-sha`.

To install the trigger on the deploy host:

```bash
# edit the paths + User= in the two units to match your checkout, then:
sudo cp deploy/trucoder-deploy.path deploy/trucoder-deploy.service /etc/systemd/system/
sudo systemctl daemon-reload && sudo systemctl enable --now trucoder-deploy.path
```

To register the webhook (the URL must be reachable from GitHub):

```bash
gh api repos/<owner>/<repo>/hooks -f name=web -F active=true \
  -f events[]=push -f config[url]=https://<host>/_deploy \
  -f config[content_type]=json -f "config[secret]=<DEPLOY_SECRET>"
```

Note: if you develop on the same host that runs the deployment, a same-host
push is a deploy no-op (`LOCAL == REMOTE` at webhook time) — the image is
built from your local checkout, so the code is already live. The webhook earns
its keep for GitHub-side changes: PR merges, web edits, other contributors.

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

- Backend: Node 24 + Express + TypeScript + SQLite (better-sqlite3).
- Frontend: Vite + React + TypeScript, `@monaco-editor/react`, `react-markdown`
  (+ remark-gfm, remark-directive for callouts), react-router.
- Sandbox: Docker image `trucoder-sandbox` (JDK 17 + g++/C++17 + Node + Python +
  Gson + nlohmann/json) run with `--network none`, read-only rootfs, mem/CPU/pids
  caps, `--cap-drop ALL`.

[Conventional Commits]: https://www.conventionalcommits.org/
