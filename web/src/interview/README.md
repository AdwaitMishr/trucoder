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
```

Vite dev mode works too — the relay reflects any localhost origin.

## Files

- `prompts/interviewer.md` — the interviewer persona/behavior (tune here)
- `prompts/report-grader.md` — the end-of-interview rubric grader (JSON out)
- `lib/relay.ts` — relay client (key never stored in the browser)
- `lib/db.ts` — IndexedDB session store
- `lib/resume.ts` — client-side PDF/DOCX parsing (pdf.js + mammoth)
- `lib/engine.ts` — context assembly + turn logic
- `GRADER-REVIEW.md` — qwen3.7-max grading report (goal + standards)
