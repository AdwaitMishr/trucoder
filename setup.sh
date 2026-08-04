#!/usr/bin/env bash
#
# TruCoder — one-shot install for a fresh clone.
#
#   git clone <your-repo> trucoder && cd trucoder && ./setup.sh
#
# Builds the server, builds the web frontend, builds the Docker sandbox image,
# and creates a .env from .env.example if one is missing. Requires Node.js
# (v18+), npm, and Docker (for grading).

set -euo pipefail
cd "$(dirname "$0")"

log() { printf '\n\033[1;33m==>\033[0m %s\n' "$*"; }
die() { printf '\n\033[1;31mERROR:\033[0m %s\n' "$*" >&2; exit 1; }

# --- Prerequisites -----------------------------------------------------------
command -v node >/dev/null 2>&1 || die "Node.js (v18+) is required. Install it first."
command -v npm  >/dev/null 2>&1 || die "npm is required. Install it first."

# --- 1. Server ---------------------------------------------------------------
log "building server (deps + TypeScript) ..."
( cd server && npm install && npm run build )

# --- 2. Web frontend ---------------------------------------------------------
log "building web frontend (deps + Vite) ..."
( cd web && npm install && npm run build )

# --- 3. Sandbox image --------------------------------------------------------
if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
  log "building sandbox image (trucoder-sandbox) ..."
  docker build -t trucoder-sandbox:latest sandbox-image/
else
  log "WARN: Docker is not available/running."
  printf '       Grading will fail until you build the image: docker build -t trucoder-sandbox:latest sandbox-image/\n'
fi

# --- 4. Environment ----------------------------------------------------------
if [ ! -f .env ]; then
  log "creating .env from .env.example"
  cp .env.example .env
  printf '       >>> EDIT .env now: set OWNER_PASSWORD and SESSION_SECRET.\n'
else
  log ".env already present — leaving it unchanged"
fi

# --- Done --------------------------------------------------------------------
cat <<'EOF'

Install complete.
 1) Edit .env  (OWNER_PASSWORD, SESSION_SECRET).
 2) Start:    node server/dist/index.js
 3) Verify:   node server/scripts/verify.js   (needs the sandbox image)

The app serves on http://localhost:3001 by default. To expose it, route a
Cloudflare tunnel (or any reverse proxy) to localhost:3001.
EOF
