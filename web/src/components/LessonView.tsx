import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import {
  PiArrowLeft,
  PiCheck,
  PiPlay,
  PiPaperPlaneRight,
  PiRows,
} from "react-icons/pi";
import { api, ApiError } from "../api";
import type { Lang, Lesson, RunResult, SubmitResult } from "../types";
import CodeEditor from "./CodeEditor";
import Markdown from "./Markdown";
import ResultPanel from "./ResultPanel";

const LANGS: { id: Lang; label: string }[] = [
  { id: "java", label: "Java" },
  { id: "javascript", label: "JavaScript" },
  { id: "python", label: "Python" },
];

function storageKey(courseId: string, lessonId: string, lang: Lang) {
  return `tc:${courseId}:${lessonId}:${lang}`;
}

export default function LessonView() {
  const { courseId = "", lessonId = "" } = useParams();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [lang, setLang] = useState<Lang>("java");
  const [code, setCode] = useState("");
  const [hintsShown, setHintsShown] = useState(0);
  const [run, setRun] = useState<RunResult | null>(null);
  const [submit, setSubmit] = useState<SubmitResult | null>(null);
  const [busy, setBusy] = useState<"run" | "submit" | null>(null);
  const [error, setError] = useState("");
  const [zen, setZen] = useState<boolean>(() => {
    try {
      return localStorage.getItem("tc:zen") === "1";
    } catch {
      return false;
    }
  });
  const byLang = useRef<Partial<Record<Lang, string>>>({});

  function toggleZen() {
    setZen((z) => {
      const n = !z;
      try {
        localStorage.setItem("tc:zen", n ? "1" : "0");
      } catch {
        /* ignore */
      }
      return n;
    });
  }

  useEffect(() => {
    let active = true;
    api
      .lesson(courseId, lessonId)
      .then((l) => {
        if (!active) return;
        const langs: Lang[] = l.languages.length ? l.languages : ["java"];
        const savedLang: Lang = langs.includes(l.lastLanguage as Lang)
          ? (l.lastLanguage as Lang)
          : langs[0];
        byLang.current = {};
        for (const lg of langs) {
          const k = storageKey(courseId, lessonId, lg);
          byLang.current[lg] = localStorage.getItem(k) ?? l.starterCode[lg] ?? "";
        }
        setLesson(l);
        setLang(savedLang);
        setCode(byLang.current[savedLang] ?? "");
        setRun(null);
        setSubmit(null);
        setHintsShown(0);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "load failed"));
    return () => {
      active = false;
    };
  }, [courseId, lessonId]);

  if (error) return <div className="center error">{error}</div>;
  if (!lesson) return <div className="boot">trucoder</div>;
  const p = lesson;

  function switchLang(l: Lang) {
    if (l === lang) return;
    byLang.current[lang] = code;
    setCode(byLang.current[l] ?? p.starterCode[l] ?? "");
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
    const starter = p.starterCode[lang] ?? "";
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
      setLesson((prev) =>
        prev
          ? {
              ...prev,
              progress: {
                ...prev.progress,
                solved: prev.progress.solved || res.verdict === "accepted",
              },
            }
          : prev
      );
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "submit failed");
    } finally {
      setBusy(null);
    }
  }

  const tabs = (
    <div className="editor-tabs">
      {LANGS.filter((l) => p.starterCode[l.id]).map((l) => (
        <button
          key={l.id}
          className={`lang ${lang === l.id ? "active" : ""}`}
          onClick={() => switchLang(l.id)}
        >
          {l.label}
        </button>
      ))}
    </div>
  );

  const editorWindow = (
    <div className="editor-window">
      <div className="editor-header">
        {tabs}
        <button className="ghost small-ghost" onClick={resetCode}>
          reset
        </button>
      </div>
      <CodeEditor language={lang} value={code} onChange={onCodeChange} />
    </div>
  );

  const actionsRow = (
    <div className="actions">
      <button className="btn run" onClick={doRun} disabled={busy !== null}>
        <PiPlay size={14} /> {busy === "run" ? "running…" : "run"}
      </button>
      <button className="btn submit" onClick={doSubmit} disabled={busy !== null}>
        <PiPaperPlaneRight size={14} /> {busy === "submit" ? "submitting…" : "submit"}
      </button>
      <span className="muted small">run = visible tests · submit = hidden too</span>
    </div>
  );

  const content = (
    <>
      <div className="task">
        <span className="task-label">task</span>
        <p>{p.task}</p>
        <div className="sigs">
          {LANGS.filter((l) => p.signature[l.id]).map((l) => (
            <code key={l.id} className="sig">
              {p.signature[l.id]}
            </code>
          ))}
        </div>
      </div>

      <div className="lesson-body">
        <Markdown>{p.body}</Markdown>
      </div>

      <div className="hints">
        <div className="hints-head">
          <span className="hints-title">hints</span>
          {hintsShown === 0 && (
            <button className="ghost" onClick={() => setHintsShown((n) => n + 1)}>
              show a hint
            </button>
          )}
        </div>
        {hintsShown === 0 ? (
          <p className="muted small">stuck? reveal a nudge toward the solution.</p>
        ) : (
          <ul className="hint-list">
            {p.hints.slice(0, hintsShown).map((h, i) => (
              <li key={i}>{h}</li>
            ))}
            {hintsShown < p.hints.length && (
              <li>
                <button className="ghost" onClick={() => setHintsShown((n) => n + 1)}>
                  another hint →
                </button>
              </li>
            )}
          </ul>
        )}
      </div>
    </>
  );

  return (
    <div className={`lesson-page ${zen ? "lesson-page-zen" : ""}`}>
      <div className="lesson-head">
        <div className="lesson-head-top">
          <Link to={`/course/${courseId}`} className="back">
            <PiArrowLeft size={14} /> course
          </Link>
          <button className="ghost" onClick={toggleZen} title={zen ? "exit zen mode" : "zen mode"}>
            <PiRows size={15} /> {zen ? "exit" : "zen"}
          </button>
        </div>
        <div className="lesson-head-title-row">
          <h1 className="lesson-head-title">{p.title}</h1>
          {p.progress.solved && (
            <span className="solved-badge">
              <PiCheck size={11} /> solved
            </span>
          )}
        </div>
      </div>

      {zen ? (
        <div className="zen-body">
          <div className="zen-content">{content}</div>
          {editorWindow}
          {actionsRow}
          {error && <div className="form-error">{error}</div>}
          <ResultPanel run={run} submit={submit} />
        </div>
      ) : (
        <PanelGroup
          direction="horizontal"
          autoSaveId="trucoder-split-h"
          className="split-group"
        >
          <Panel defaultSize={42} minSize={28} className="lesson-content">
            <div className="lesson-scroll">{content}</div>
          </Panel>

          <PanelResizeHandle className="resize-handle" />

          <Panel defaultSize={58} minSize={42} className="workbench">
            {editorWindow}
            {actionsRow}
            {error && <div className="form-error">{error}</div>}
            <ResultPanel run={run} submit={submit} />
          </Panel>
        </PanelGroup>
      )}
    </div>
  );
}
