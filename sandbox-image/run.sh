#!/bin/bash
# Sandbox entrypoint. Receives the harness source via $SOURCE_B64 (base64) and
# the args JSON on stdin. Works entirely inside a throwaway tmpfs under /tmp;
# the container is --rm so nothing survives.
set -euo pipefail

work=$(mktemp -d /tmp/run.XXXXXX)
trap 'rm -rf "$work" 2>/dev/null || true' EXIT
cd "$work"

case "${LANG:-}" in
  java)        file=Main.java ;;
  javascript)  file=main.js ;;
  python)      file=main.py ;;
  *) echo "unsupported language: ${LANG:-}"; exit 2 ;;
esac

printf '%s' "${SOURCE_B64:-}" | base64 -d > "$file"

SECS="${TIMEOUT_SECS:-5}"
HEAP="${HEAP_MB:-512}"

case "${LANG:-}" in
  java)
    if ! timeout -s KILL -k 2 "${COMPILE_SECS:-20}" javac -encoding UTF-8 -cp /opt/gson.jar Main.java; then
      exit 2  # compile failure -> distinct from runtime exit codes
    fi
    exec timeout -s KILL -k 2 "$SECS" java "-Xmx${HEAP}m" -cp /opt/gson.jar:. Main
    ;;
  javascript)
    exec timeout -s KILL -k 2 "$SECS" node "--max-old-space-size=${HEAP}" main.js
    ;;
  python)
    exec timeout -s KILL -k 2 "$SECS" python3 main.py
    ;;
esac
