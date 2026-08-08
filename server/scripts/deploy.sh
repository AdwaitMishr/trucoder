#!/usr/bin/env bash
# Auto-deploy for GitHub push webhooks (trucoder). Idempotent and safe to
# re-run: fetches, fast-forwards, rebuilds ONLY what changed, verifies.
# Runs detached from the webhook request — survives the server restart.
set -u
REPO_DIR="${DEPLOY_DIR:-/home/adith/trucoder}"
LOG="$REPO_DIR/deploy.log"
SHA_FILE="$REPO_DIR/.deployed-sha"
cd "$REPO_DIR" || exit 1

log() { echo "[$(date -Is)] $*" >> "$LOG"; }

# Serialize deploys: if one is running, skip quietly (next push re-triggers).
exec 9>"$REPO_DIR/.deploy.lock"
flock -n 9 || { log "deploy skipped: another deploy is running"; exit 0; }

log "deploy start"
git fetch origin >/dev/null 2>&1
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)
if [ "$LOCAL" = "$REMOTE" ]; then
  log "deploy no-op: already at ${REMOTE:0:7}"
  exit 0
fi

git pull --ff-only origin main >/dev/null 2>&1 || { log "deploy FAILED: git pull"; exit 1; }
NEW=$(git rev-parse HEAD)
PREV=$(cat "$SHA_FILE" 2>/dev/null || echo "$LOCAL")
CHANGED=$(git diff --name-only "$PREV".."$NEW")

SERVER=0; WEB=0; SANDBOX=0; SANDBOX_NODE=0
echo "$CHANGED" | grep -q '^server/' && SERVER=1
echo "$CHANGED" | grep -q '^web/' && WEB=1
echo "$CHANGED" | grep -q '^sandbox-image/' && SANDBOX=1
echo "$CHANGED" | grep -q '^sandbox-image-node/' && SANDBOX_NODE=1

log "changes: server=$SERVER web=$WEB sandbox=$SANDBOX sandbox-node=$SANDBOX_NODE (${NEW:0:7})"

if [ "$SANDBOX" = 1 ]; then
  docker build -t trucoder-sandbox:latest "$REPO_DIR/sandbox-image/" >> "$LOG" 2>&1 \
    || { log "deploy FAILED: sandbox image build"; exit 1; }
fi
if [ "$SANDBOX_NODE" = 1 ]; then
  docker build -t trucoder-sandbox-node:latest "$REPO_DIR/sandbox-image-node/" >> "$LOG" 2>&1 \
    || { log "deploy FAILED: node sandbox image build"; exit 1; }
fi
if [ "$SERVER" = 1 ]; then
  (cd "$REPO_DIR/server" && npx tsc) >> "$LOG" 2>&1 \
    || { log "deploy FAILED: server tsc"; exit 1; }
fi
if [ "$WEB" = 1 ]; then
  (cd "$REPO_DIR/web" && npm run build) >> "$LOG" 2>&1 \
    || { log "deploy FAILED: web build"; exit 1; }
fi
if [ "$SERVER" = 1 ] || [ "$WEB" = 1 ] || [ "$SANDBOX" = 1 ] || [ "$SANDBOX_NODE" = 1 ]; then
  sudo systemctl restart trucoder >> "$LOG" 2>&1 \
    || { log "deploy FAILED: systemctl restart"; exit 1; }
fi

# Verify against the running stack (needs dist — built above if server changed).
(cd "$REPO_DIR/server" && node scripts/verify.js) >> "$LOG" 2>&1
VR=$?
echo "$NEW" > "$SHA_FILE"

if [ "$VR" = 0 ]; then
  log "deploy OK ${NEW:0:7} (server=$SERVER web=$WEB sandbox=$SANDBOX sandbox-node=$SANDBOX_NODE) verify=pass"
  "$HOME/.hermes/scripts/hark-notify.sh" -t "trucoder" "deployed ${NEW:0:7} — verify pass" >/dev/null 2>&1 || true
else
  log "deploy DONE ${NEW:0:7} BUT verify FAILED — inspect immediately"
  "$HOME/.hermes/scripts/hark-notify.sh" -t "trucoder" "deploy VERIFY FAILED at ${NEW:0:7}" >/dev/null 2>&1 || true
fi
exit 0
