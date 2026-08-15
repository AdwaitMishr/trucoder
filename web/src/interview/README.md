# Personal Interview (BYOK)

Resume-based mock interviews with a senior-dev AI interviewer, grounded in the
platform's course lessons. Lives in its own sidebar section, fully separate
from courses.

## Privacy / trust boundary (read this)

- Your API key is entered in the app, saved by the local relay
  (`relay/server.js`, port 3177) to `~/.trucoder-interview/key` (mode 0600),
  and injected into upstream calls to the configured provider (OpenCode Zen).
  **It never touches the TruCoder server and never leaves this machine.**
- Your **resume, session focus, module picks, and transcripts live in browser
  IndexedDB only** — the TruCoder server has zero interview endpoints.
- One honest caveat: to do the interview, the resume + selected module text
  ARE sent (with the key) to the LLM provider (OpenCode Zen). They never go
  to TruCoder — but they do leave your machine to the provider. Delete the
  key anytime (`ai setup` step → remove) or wipe `~/.trucoder-interview/`.

## Run

```sh
# terminal 1 — the app (as usual)
node --env-file=../.env dist/index.js   # in server/

# terminal 2 — the local relay (required for interviews)
npm run relay                            # in web/  (node ../relay/server.js)

# terminal 3 — local speech-to-text (required for the mic; first run
# downloads the ~140 MB faster-whisper 'base' model)
npm run stt                              # in web/  (relay/stt-server.py)
```

First-time STT setup (once): `npm run stt` prefers a local venv and falls
back to the system `python3` — create the venv so the model + deps are
self-contained:

```sh
python3 -m venv relay/stt-venv && relay/stt-venv/bin/pip install faster-whisper
```

Vite dev mode works too — the relay allowlists `http://localhost:5173` alongside the prod origin.

## Files

- `prompts/interviewer.md` — the interviewer persona/behavior (tune here)
- `prompts/report-grader.md` — the end-of-interview rubric grader (JSON out)
- `lib/relay.ts` — relay client (key never stored in the browser)
- `lib/stt.ts` — mic recording → local whisper transcription (relay/stt-server.py)
- `lib/mermaid.ts` — blackboard → mermaid conversion (interviewer reads the source)
- `lib/db.ts` — IndexedDB session store
- `lib/resume.ts` — client-side PDF/DOCX parsing (pdf.js + mammoth)
- `lib/engine.ts` — context assembly + turn logic
- `BlackboardModal.tsx` — tldraw canvas (send as mermaid)
- `GRADER-REVIEW.md` — qwen3.7-max grading report (goal + standards)
