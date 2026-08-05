import { useState } from "react";
import { PiCheck, PiX } from "react-icons/pi";
import { api } from "../api";
import type { QuizBlock } from "../types";

export default function QuizBlock({
  courseId,
  lessonId,
  blockId,
  block,
  solved,
  onSolved,
}: {
  courseId: string;
  lessonId: string;
  blockId: number;
  block: QuizBlock;
  solved: boolean;
  onSolved: (lessonSolved: boolean) => void;
}) {
  const [selected, setSelected] = useState<number[]>([]);
  const [state, setState] = useState<"idle" | "busy" | "correct" | "wrong">(
    solved ? "correct" : "idle"
  );
  const [explanation, setExplanation] = useState(
    solved ? block.explanation : ""
  );

  function toggle(i: number) {
    if (state === "correct" || state === "busy") return;
    setSelected((prev) =>
      block.type === "mcq"
        ? [i]
        : prev.includes(i)
          ? prev.filter((x) => x !== i)
          : [...prev, i]
    );
  }

  async function check() {
    if (selected.length === 0 || state === "busy") return;
    setState("busy");
    try {
      const r = await api.answer(courseId, lessonId, blockId, selected);
      setState(r.correct ? "correct" : "wrong");
      if (r.correct) {
        setExplanation(r.explanation);
        onSolved(r.lessonSolved);
      }
    } catch {
      setState("idle");
    }
  }

  return (
    <div className={`quiz ${state === "correct" ? "quiz-done" : ""}`}>
      <div className="quiz-head">
        <span className="quiz-label">
          {block.type === "mcq" ? "choose one" : "choose all that apply"}
        </span>
        <p className="quiz-prompt">{block.prompt}</p>
      </div>

      <div className="quiz-options">
        {block.options.map((opt, i) => {
          const isSel = selected.includes(i);
          const showCorrect = state === "correct" && isSel;
          return (
            <button
              key={i}
              className={`quiz-opt ${isSel ? "sel" : ""}`}
              onClick={() => toggle(i)}
              disabled={state === "correct" || state === "busy"}
            >
              <span className="quiz-key">{String.fromCharCode(65 + i)}</span>
              <span className="quiz-opt-text">{opt}</span>
              {showCorrect && <PiCheck size={15} className="quiz-opt-mark" />}
            </button>
          );
        })}
      </div>

      {state === "correct" ? (
        explanation && (
          <div className="quiz-feedback ok">
            <PiCheck size={14} /> {explanation}
          </div>
        )
      ) : (
        <div className="quiz-actions">
          <button
            className="btn run"
            onClick={check}
            disabled={selected.length === 0 || state === "busy"}
          >
            {state === "busy" ? "checking…" : "check answer"}
          </button>
          {state === "wrong" && (
            <span className="quiz-feedback bad">
              <PiX size={13} /> not quite — try again
            </span>
          )}
        </div>
      )}
    </div>
  );
}
