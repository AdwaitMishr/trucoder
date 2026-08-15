# GRADER-REVIEW — Personal Interview Feature

Grader: qwen3.7-max brief · Date: 2026-08-09 · Scope: `web/src/interview/*`, `relay/server.js`, `web/src/App.tsx`, `web/src/main.tsx`, `vite.config.ts`, prompts

## Method executed

1. Read all feature code (InterviewsIndex, InterviewWizard, InterviewChat, InterviewReport, lib/{relay,db,resume,engine}, prompts/*.md, interview.css, App.tsx).
2. Live-tested the relay: `/health`, `/key` (GET/PUT/DELETE), 404 path, short-key rejection (400), `/v1/models` no-key (401). All behave correctly; key file round-trips with mode 0600.
3. `cd web && npm run build` → clean (30.3s, exit 0). `npx tsc --noEmit` → clean (strict, noUnusedLocals/Parameters on).
4. Static greps: `console.*` in interview code (1 hit), `localStorage` (0), external CDN/script URLs (0), `interview` in `server/` source (0 — server has ZERO interview endpoints).
5. Browser flow (wizard→chat→report) NOT driven — no CDP session available; chat/report behavior assessed statically.

## Scores

| Section | Score | Verdict |
|---|---|---|
| A. Privacy & security | 4/4 | Meets the contract. No key/resume/server exposure found. |
| B. Functional completeness | 3/4 | One real wizard bug (select-all race) + minor gaps. |
| C. Theme & UX | 4/4 | Tokens/hairlines/pills consistent; states honest. |
| D. Engineering | 4/4 | Build + strict TS clean; relay resilient; prompts tunable files. |

**Overall: 3.75/4 — ship-ready after W1 and W2.**

---

## CRITICAL

None found. The three headline risks were actively checked and are clean:

- **Key never leaves the machine** — browser ↔ relay is `http://127.0.0.1:3177` only (`lib/relay.ts:4`); relay binds `127.0.0.1` (`relay/server.js:165`); key written to `~/.trucoder-interview/key` mode 0600 (`server.js:46`); never logged (startup log prints only `stored`/`not set`, `server.js:166`); relay forwards only to the configured Zen base (`server.js:18,73`).
- **TruCoder server never sees the key or resume** — grep for `interview` in `server/src` returns nothing; no new endpoints; resume is parsed client-side (`lib/resume.ts`) and persisted only in IndexedDB (`lib/db.ts`); no `localStorage`, no URL params carry key/resume.
- **XSS surface** — no external scripts/CDNs in any interview file; key input is `type="password"` (`InterviewWizard.tsx:253`) and cleared after save (`setKey("")`, line 79).

---

## WARNING

### W1 — Course "select all" toggles nothing on first click (functional bug)
- **File:** `web/src/interview/InterviewWizard.tsx:195-200`
- **Issue:** The course-head checkbox calls `void pickCourse(c.id).then(() => { const ls = lessons[c.id] ?? []; ... toggle(...) })`. `pickCourse` is async and `lessons` in the `.then` closure is the **stale render snapshot** — on the first click for a course whose lessons were never loaded, `lessons[c.id]` is still `undefined`, so `ls` is `[]` and no lessons get selected. The checkbox flips visually then re-renders back to unchecked. Only works if the user clicked "load lessons" first (separate button), because then the closure already contains the list.
- **Fix:** have `pickCourse` return the fetched list and toggle from it:
  ```ts
  async function pickCourse(id: string): Promise<LessonMeta[]> {
    if (!lessons[id]) { const r = await api.course(id); const ls = r.lessons ?? [];
      setLessons(m => ({ ...m, [id]: ls })); return ls; }
    return lessons[id];
  }
  // onChange: void pickCourse(c.id).then(ls => { for (const l of ls) toggle(`${c.id}/${l.id}`, e.target.checked); });
  ```

### W2 — Dev-mode CORS mismatch: feature dead under `vite` dev server
- **File:** `relay/server.js:19` + `web/vite.config.ts:17-21`
- **Issue:** Relay's `Access-Control-Allow-Origin` defaults to `APP_ORIGIN=http://localhost:3001` (the production origin). `vite.config.ts` sets no `server.port`, so the dev server runs on **5173** by default. Browser origin `http://localhost:5173` ≠ allowed origin → preflight OPTIONS fails → every relay call (key save, models, chat) is CORS-blocked in dev unless the env var is set. Production (server at 3001 serving the built app) works.
- **Fix:** reflect localhost origins in dev, e.g. `const origin = req.headers.origin; if (origin && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) res.setHeader("Access-Control-Allow-Origin", origin);` — still safe because the relay binds 127.0.0.1 only — or document `APP_ORIGIN=http://localhost:5173 npm run relay` in the README/relay header comment.

### W3 — Dropzone advertises drag-and-drop but implements none
- **File:** `web/src/interview/InterviewWizard.tsx:144-153`
- **Issue:** Copy says "drop your resume here" and `.dropzone` has `cursor: pointer`, but there are no `onDrop`/`onDragOver` handlers — only `onClick` opening the file picker. Dragging a file over it does nothing (and the browser would navigate away to the file).
- **Fix:** add `onDragOver={e => e.preventDefault()}` and `onDrop={e => { e.preventDefault(); onFile(e.dataTransfer.files?.[0]); }}`, or change the copy to "click to choose your resume".

---

## INFO

1. **Trust boundary worth documenting** — `lib/engine.ts:46-65,107-121` sends the resume + module text to the configured LLM provider (OpenCode Zen) via the relay. That is inherent to the feature (resume-based interviewing) and the contract ("never touches the TruCoder server") holds — but the README should state plainly: *resume and module content leave the machine to the LLM provider; never to TruCoder*. This is the one place the brief's "no network calls carry them" (A4) is technically qualified.

2. **Export MIME mismatch** — `InterviewReport.tsx:123`: blob is `type: "text/markdown"` but downloads a `.json` file. Use `"application/json"` (or `application/json;charset=utf-8`). Cosmetic but wrong signal.

3. **Console noise** — `InterviewChat.tsx:71` `console.error("IV_TURN_ERR", e)` is the only console call in feature code and logs only the error (no key/prompt). Fine as a debugging aid, but per brief D13 ("no console noise") consider dropping it or gating on `import.meta.env.DEV`.

4. **Dead/unused code** — `lib/db.ts:63` `sessionStore.del` is never called (no delete-session UI in InterviewsIndex — users cannot remove old sessions); `db.ts:9-11` `InterviewMessage.topic` is declared but never set (engine never emits topic markers). Either wire up deletion + topic tracking or remove.

5. **Key file perms apply only at creation** — `relay/server.js:44-47`: `mode: 0o600` is honored on `writeFileSync` only when the file does not exist. If perms ever drift (manual edit, umask edge case), they aren't corrected. Defensive fix: `fs.chmodSync(KEY_FILE, 0o600)` after write.

6. **Relay has no request-body size cap** — `server.js:53-54`: `body += c` accumulates unbounded. Local-only (127.0.0.1), so low risk; a cap (e.g. 5 MB) is cheap insurance against a runaway local page.

7. **Stale-closure persistence in chat** — `InterviewChat.tsx:83,100`: `persist(() => ({ ...session, ... }))` snapshots `session` from the render closure. Safe today because the `busy` guard serializes turns; could read the latest state via the updater's `prev` arg for robustness.

8. **Step-1 gate contradicts start()** — `InterviewWizard.tsx:167`: "next" is `disabled={!resume.trim()}`, but `start()` (line 90) explicitly allows resume-less sessions (focus-only or modules-only). A user who wants a modules-only interview can't reach step 2. Either allow proceeding with an empty resume (the step-2/3 guards already handle it) or align the copy.

9. **Build warnings** — `npm run build` exits 0 with the pre-existing chunk-size warning; `mammoth.browser` (499 KB / 125 KB gzip) is already code-split via dynamic import (`lib/resume.ts:32`) — good. Monaco is manually chunked. No action needed.

---

## Rubric detail (evidence per standard)

**A1-A5 (Privacy & security) — 4/4.** All five standards verified clean; see CRITICAL section + greps above.

**B6 (Wizard) — 4/4.** Resume: PDF (pdfjs, main-thread), DOCX (mammoth browser build), TXT/MD, editable preview, paste fallback, scan-detection message (`InterviewWizard.tsx:66`). Module tree with per-course load + select-all (bug W1 aside), focus textarea. AI setup: key save/remove via relay, model picker from relay `/v1/models`, `deepseek-v4-flash` default (`InterviewWizard.tsx:32,274-287`).

**B7 (Chat) — 4/4.** Opens from resume (`prompts/interviewer.md` "Opening" rule; auto first turn at `InterviewChat.tsx:48-53`); one adaptive follow-up per turn (prompt rule + single assistant message per turn); hint/go-deeper/skip/end all wired; SSE streaming renders incrementally (`InterviewChat.tsx:66,161-167`); errors surfaced via `errMsg`/relay error extraction — never `[object Object]` (`InterviewChat.tsx:7-9`, `relay.ts:12-20,52-60`); 3-min client timeout + abort (`relay.ts:39-40`).

**B8 (Report) — 4/4.** Separate grading pass with its own prompt (`engine.ts:107-136`); 5 dims 1-4 clamped (`InterviewReport.tsx:54`), topic verdicts, strengths, gaps, recommended modules → course links (`InterviewReport.tsx:97-115`); JSON-fence tolerant parse with raw fallback; export works; session list shows `in progress`/`reported` pills (`InterviewsIndex.tsx:67-68`).

**B9 (Interviewer prompt) — 4/4.** `prompts/interviewer.md` enforces: one question per turn (lines 11, 48), follow-up on last answer (12-13, 33-39), max 3 deep-dives per topic (40-41), may go beyond module reference (42-44), session focus highest priority (21-23, reinforced in `engine.ts:50-52`).

**C10-C11 (Theme & UX) — 4/4.** Sidebar switch (App.tsx:16-29), page-heads, pills, hairline borders, theme tokens throughout `interview.css`; no layout changes to courses side (sidebar/route-body only). Relay-down notice (InterviewsIndex.tsx:32-35), no-key notice (37-41), typing indicator + disabled sends while busy (InterviewChat.tsx:161-167,186-189).

**D12 (Build/relay/strict) — 4/4.** Build clean; `tsc --noEmit` clean under strict. Relay handles aborted browser streams: `res.on("close") → up.destroy()` (`server.js:97`), `headersSent` guard before JSON error (88), upstream error mid-stream → `res.destroy()` (81), retry only before headers sent (91-93), `uncaughtException` guard (170-172) — no crash, no `ERR_HTTP_HEADERS_SENT`.

**D13 (Dead code/console/prompts) — 3.5/4.** Prompts are `?raw`-imported tunable files (`engine.ts:5-6`); no console noise beyond the single gated error (INFO 3); minor dead code (INFO 4).
