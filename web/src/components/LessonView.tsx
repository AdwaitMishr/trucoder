import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import {
  PiArrowLeft,
  PiArrowRight,
  PiCheck,
  PiRows,
} from "react-icons/pi";
import { api, ApiError, assetUrl } from "../api";
import type {
  Block,
  CodeBlock,
  Lang,
  Lesson,
  QuizBlock as QuizBlockType,
} from "../types";
import CodeWorkbench from "./CodeWorkbench";
import FlowchartBlock from "./FlowchartBlock";
import Markdown from "./Markdown";
import QuizBlock from "./QuizBlock";

const LANGS: { id: Lang; label: string }[] = [
  { id: "java", label: "Java" },
  { id: "javascript", label: "JavaScript" },
  { id: "python", label: "Python" },
];

export default function LessonView() {
  const { courseId = "", lessonId = "" } = useParams();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [error, setError] = useState("");
  const [zen, setZen] = useState<boolean>(() => {
    try {
      return localStorage.getItem("tc:zen") === "1";
    } catch {
      return false;
    }
  });
  const [solvedBlocks, setSolvedBlocks] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    api
      .lesson(courseId, lessonId)
      .then((l) => {
        if (!active) return;
        setLesson(l);
        setSolvedBlocks(l.solvedBlocks);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "load failed"));
    return () => {
      active = false;
    };
  }, [courseId, lessonId]);

  if (error) return <div className="center error">{error}</div>;
  if (!lesson) return <div className="boot">trucoder</div>;
  const p = lesson;

  const codeBlock = p.blocks.find((b) => b.type === "code") as
    | CodeBlock
    | undefined;
  const hasGradedBlocks =
    codeBlock !== undefined ||
    p.blocks.some((b) => b.type === "mcq" || b.type === "mscq");

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

  async function markRead() {
    setBusy(true);
    setError("");
    try {
      await api.markRead(courseId, lessonId);
      setLesson((prev) =>
        prev ? { ...prev, progress: { ...prev.progress, solved: true } } : prev
      );
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "failed to mark as read");
    } finally {
      setBusy(false);
    }
  }

  function onQuizSolved(blockIndex: number, lessonSolved: boolean) {
    setSolvedBlocks((prev) =>
      prev.includes(blockIndex) ? prev : [...prev, blockIndex]
    );
    if (lessonSolved) {
      setLesson((prev) =>
        prev ? { ...prev, progress: { ...prev.progress, solved: true } } : prev
      );
    }
  }

  const renderBlock = (b: Block, i: number) => {
    switch (b.type) {
      case "markdown":
        return (
          <div key={i} className="lesson-body">
            <Markdown>{b.content}</Markdown>
          </div>
        );
      case "code": {
        const sigs = LANGS.filter((l) => b.signature[l.id]);
        return (
          <div key={i} className="task">
            <span className="task-label">task</span>
            <p>{b.task}</p>
            {sigs.length > 0 && (
              <div className="sigs">
                {sigs.map((l) => (
                  <code key={l.id} className="sig">
                    {b.signature[l.id]}
                  </code>
                ))}
              </div>
            )}
            {b.hints.length > 0 && (
              <div className="hints">
                <div className="hints-head">
                  <span className="hints-title">hints</span>
                </div>
                <ul className="hint-list">
                  {b.hints.map((h, hi) => (
                    <li key={hi}>{h}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      }
      case "mcq":
      case "mscq":
        return (
          <QuizBlock
            key={i}
            courseId={courseId}
            lessonId={lessonId}
            blockId={i}
            block={b as QuizBlockType}
            solved={solvedBlocks.includes(i)}
            onSolved={(lessonSolved) => onQuizSolved(i, lessonSolved)}
          />
        );
      case "image":
        return (
          <figure key={i} className="block-image">
            <img src={assetUrl(courseId, b.src)} alt={b.alt} />
            {b.caption && <figcaption>{b.caption}</figcaption>}
          </figure>
        );
      case "flowchart":
        return <FlowchartBlock key={i} block={b} />;
      default:
        return null;
    }
  };

  const flow = p.blocks.filter((b) => b.type !== "code");

  const navRow = (
    <div className="lesson-nav">
      {p.prevLesson ? (
        <Link
          to={`/course/${courseId}/lessons/${p.prevLesson.id}`}
          className="ghost"
          title={p.prevLesson.title}
        >
          <PiArrowLeft size={14} /> previous
        </Link>
      ) : (
        <span className="ghost disabled" aria-disabled="true">
          <PiArrowLeft size={14} /> previous
        </span>
      )}
      <span className="nav-count">
        {p.lessonIndex + 1} / {p.lessonCount}
      </span>
      {p.nextLesson ? (
        <Link
          to={`/course/${courseId}/lessons/${p.nextLesson.id}`}
          className="ghost"
          title={p.nextLesson.title}
        >
          next <PiArrowRight size={14} />
        </Link>
      ) : (
        <span className="ghost disabled" aria-disabled="true">
          next <PiArrowRight size={14} />
        </span>
      )}
    </div>
  );

  const readActions = !codeBlock && (
    <div className="read-actions">
      {p.progress.solved ? (
        <span className="read-done">
          <PiCheck size={14} /> {hasGradedBlocks ? "completed" : "read"}
        </span>
      ) : (
        <button className="btn submit" onClick={markRead} disabled={busy}>
          <PiCheck size={14} /> {busy ? "marking…" : "mark as read"}
        </button>
      )}
    </div>
  );

  return (
    <div className={`lesson-page ${zen && codeBlock ? "lesson-page-zen" : ""}`}>
      <div className="lesson-head">
        <div className="lesson-head-top">
          <Link to={`/course/${courseId}`} className="back">
            <PiArrowLeft size={14} /> course
          </Link>
          {codeBlock && (
            <button
              className="ghost"
              onClick={toggleZen}
              title={zen ? "exit zen mode" : "zen mode"}
            >
              <PiRows size={15} /> {zen ? "exit" : "zen"}
            </button>
          )}
        </div>
        <div className="lesson-head-title-row">
          <h1 className="lesson-head-title">{p.title}</h1>
          {p.progress.solved && (
            <span className="solved-badge">
              <PiCheck size={11} />
              {codeBlock ? "solved" : hasGradedBlocks ? "completed" : "read"}
            </span>
          )}
        </div>
      </div>

      {codeBlock ? (
        zen ? (
          <div className="zen-body">
            <div className="zen-content">
              {flow.map(renderBlock)}
              {navRow}
            </div>
            <div className="zen-editor">
              <CodeWorkbench
                courseId={courseId}
                lessonId={lessonId}
                block={codeBlock}
                lastLanguage={p.lastLanguage}
                onAccepted={() =>
                  setLesson((prev) =>
                    prev
                      ? { ...prev, progress: { ...prev.progress, solved: true } }
                      : prev
                  )
                }
              />
            </div>
          </div>
        ) : (
          <PanelGroup
            direction="horizontal"
            autoSaveId="trucoder-split-h"
            className="split-group"
          >
            <Panel defaultSize={42} minSize={28} className="lesson-content">
              <div className="lesson-scroll">
                {flow.map(renderBlock)}
                {navRow}
              </div>
            </Panel>

            <PanelResizeHandle className="resize-handle" />

            <Panel defaultSize={58} minSize={42} className="workbench">
              <CodeWorkbench
                courseId={courseId}
                lessonId={lessonId}
                block={codeBlock}
                lastLanguage={p.lastLanguage}
                onAccepted={() =>
                  setLesson((prev) =>
                    prev
                      ? { ...prev, progress: { ...prev.progress, solved: true } }
                      : prev
                  )
                }
              />
            </Panel>
          </PanelGroup>
        )
      ) : (
        <div className="zen-body">
          <div className="zen-content">
            {p.blocks.map(renderBlock)}
            {readActions}
            {error && <div className="form-error">{error}</div>}
            {navRow}
          </div>
        </div>
      )}
    </div>
  );
}
