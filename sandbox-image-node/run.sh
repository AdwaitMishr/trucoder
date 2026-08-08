#!/bin/sh
# Module-runner entrypoint for TruCoder module exercises.
# Receives FILES_B64 = base64 of a JSON map { "path": "content", ... } via env.
# Writes all files under a tmpfs workdir, then runs the lesson test file with
# node:test, JSON reporter -> results file (keeps stdout clean = output preview).
# TS entries run via Node 24 native type stripping.
set -eu

work=$(mktemp -d /tmp/run.XXXXXX)
trap 'rm -rf "$work" 2>/dev/null || true' EXIT
cd "$work"

if [ -n "${FILES_B64:-}" ]; then
  printf '%s' "$FILES_B64" | base64 -d > files.json
  node -e '
    const fs = require("fs");
    const m = JSON.parse(fs.readFileSync("files.json", "utf8"));
    for (const [p, c] of Object.entries(m)) {
      const f = p;
      fs.mkdirSync(require("path").dirname(f), { recursive: true });
      fs.writeFileSync(f, c);
    }
  '
  rm -f files.json
fi

ENTRY="${MODULE_ENTRY:-lesson.test.js}"
TESTFILE="${MODULE_TESTFILE:-lesson.test.js}"
SECS="${TIMEOUT_SECS:-30}"

# Run only the declared test file (the entry module is imported by it).
# Custom reporter (this node build has no built-in 'json' reporter) writes
# NDJSON to a file so the test file's own stdout stays clean = output preview.
timeout -s KILL -k 2 "$SECS" node --test \
  --test-reporter=/opt/tru-reporter.js \
  --test-reporter-destination=/tmp/run-results.json \
  "$TESTFILE" || true

if [ -f /tmp/run-results.json ]; then
  cat /tmp/run-results.json
fi
