import { useEffect, useRef, useState } from "react";
import { PiPlay, PiPaperPlaneRight } from "react-icons/pi";
import { api, ApiError } from "../api";
import type { CodeBlock, Lang, RunResult, SubmitResult } from "../types";
import CodeEditor from "./CodeEditor";
import ResultPanel from "./ResultPanel";

const LANGS: { id: Lang; label: string }[] = [
  { id: "java", label: "Java" },
  { id: "javascript", label: "JavaScript" },
  { id: "python", label: "Python" },
];

function storageKey(courseId: string, lessonId: string, lang: Lang) {
  return `tc:${courseId}:${lessonId}:${lang}`;
}

export default function CodeWorkbench({
  courseId,
  lessonId,
  block,
  lastLanguage,
  onAccepted,
}: {
  courseId: string;
  lessonId: string;
  block: CodeBlock;
  lastLanguage: Lang | null;
  onAccepted: () => void;
}) {
  const [lang, setLang] = useState<Lang>("java");
  const [code, setCode] = useState("");
  const [run, setRun] = useState<RunResult | null>(null);
  const [submit, setSubmit] = useState<SubmitResult | null>(null);
  const [busy, setBusy] = useState<"run" | "submit" | null>(null);
  const [error, setError] = useState("");
  const byLang = useRef<Partial<Record<Lang, string>>>({});

  useEffect(() => {
    const langs: Lang[] = block.languages.length ? block.languages : ["java"];
    const savedLang: Lang =
      lastLanguage && langs.includes(lastLanguage) ? lastLanguage : langs[0];
    byLang.current = {};
    for (const lg of langs) {
      const k = storageKey(courseId, lessonId, lg);
      byLang.current[lg] = localStorage.getItem(k) ?? block.starterCode[lg] ?? "";
    }
    setLang(savedLang);
    setCode(byLang.current[savedLang] ?? "");
    setRun(null);
    setSubmit(null);
    setError("");
  }, [courseId, lessonId, block, lastLanguage]);

  function switchLang(l: Lang) {
    if (l === lang) return;
    byLang.current[lang] = code;
    setCode(byLang.current[l] ?? block.starterCode[l] ?? "");
    setLang(l);
    setRun(null);
    setSubmit(null);
  }

  function onCodeChange(v: string) {
    setCode(v);
    byLang.current[lang] = v;
    localStorage.setItem(storageKey(courseId, lessonId, lang), v);
    // The displayed result no longer matches the code — drop it so the user
    // doesn't read a stale "all tests passed" for code they just changed.
    setRun(null);
    setSubmit(null);
  }

  function resetCode() {
    const starter = block.starterCode[lang] ?? "";
    byLang.current[lang] = starter;
    setCode(starter);
    localStorage.setItem(storageKey(courseId, lessonId, lang), starter);
    setRun(null);
    setSubmit(null);
  }

  async function doRun() {
    setBusy("run");
    setRun(null);
    setSubmit(null);
    setError("");
    try {
      setRun(await api.run(courseId, lessonId, lang, code));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "run failed");
    } finally {
      setBusy(null);
    }
  }

  async function doSubmit() {
    setBusy("submit");
    setRun(null);
    setSubmit(null);
    setError("");
    try {
      const res = await api.submit(courseId, lessonId, lang, code);
      setSubmit(res);
      if (res.verdict === "accepted") onAccepted();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "submit failed");
    } finally {
      setBusy(null);
    }
  }

  // Ctrl/Cmd+Enter = run, Ctrl/Cmd+Shift+Enter = submit.
  // Re-registered every render so the handlers always see the latest code.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.key !== "Enter") return;
      e.preventDefault();
      if (e.shiftKey) doSubmit();
      else doRun();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <>
      <div className="editor-window">
        <div className="editor-header">
          <div className="editor-tabs">
            {LANGS.filter((l) => block.starterCode[l.id]).map((l) => (
              <button
                key={l.id}
                className={`lang ${lang === l.id ? "active" : ""}`}
                onClick={() => switchLang(l.id)}
              >
                {l.label}
              </button>
            ))}
          </div>
          <button className="ghost small-ghost" onClick={resetCode}>
            reset
          </button>
        </div>
        <CodeEditor language={lang} value={code} onChange={onCodeChange} />
      </div>

      <div className="actions">
        <button className="btn run" onClick={doRun} disabled={busy !== null}>
          <PiPlay size={14} /> {busy === "run" ? "running…" : "run"}
        </button>
        <button className="btn submit" onClick={doSubmit} disabled={busy !== null}>
          <PiPaperPlaneRight size={14} /> {busy === "submit" ? "submitting…" : "submit"}
        </button>
        <span className="muted small">run = visible tests · submit = hidden too</span>
      </div>

      {error && <div className="form-error">{error}</div>}
      <ResultPanel run={run} submit={submit} />
    </>
  );
}
