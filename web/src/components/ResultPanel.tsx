import { PiCheck, PiX, PiTimer } from "react-icons/pi";
import type { RunResult, SubmitResult, TestResult } from "../types";
import Mascot from "./Mascot";

function TestRow({ t }: { t: TestResult }) {
  if (t.passed) {
    return (
      <div className="test-row pass">
        <span className="dot"><PiCheck size={13} /></span>
        <span>{t.name}</span>
      </div>
    );
  }
  return (
    <div className="test-row fail">
      <span className="dot"><PiX size={13} /></span>
      <div className="test-body">
        <div>{t.name}</div>
        {t.error && <pre className="test-error">{t.error}</pre>}
        {!t.error && t.expected !== undefined && (
          <div className="test-io">
            <div>
              <span className="muted">expected</span> {t.expected}
            </div>
            <div>
              <span className="muted">got</span> {t.actual ?? "(none)"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** The verdict mood: correct = happy :D, everything else = red grimace. */
function VerdictFace({ ok }: { ok: boolean }) {
  return ok ? (
    <Mascot state="correct" size={15} className="mascot-ok" />
  ) : (
    <Mascot state="wrong" size={15} />
  );
}

export default function ResultPanel({
  run,
  submit,
}: {
  run: RunResult | null;
  submit: SubmitResult | null;
}) {
  if (submit) {
    if (submit.verdict === "timeout") {
      return (
        <div className="results">
          <div className="verdict err">
            <VerdictFace ok={false} />
            <PiTimer size={15} /> time limit exceeded
          </div>
          <pre className="block-error">
            too slow for the hidden tests. look for a faster approach — e.g.
            memoize, or build the answer bottom-up.
          </pre>
          {submit.publicTests.map((t) => (
            <TestRow key={t.name} t={t} />
          ))}
        </div>
      );
    }
    const accepted = submit.verdict === "accepted";
    const error = submit.verdict === "error";
    const label = accepted ? "all tests passed" : error ? "error" : "wrong answer";
    return (
      <div className="results">
        <div className={`verdict ${accepted ? "ok" : "err"}`}>
          <VerdictFace ok={accepted} />
          {label}
          <span className="verdict-detail">
            {submit.privatePassed}/{submit.privateTotal} hidden
          </span>
        </div>
        {(submit.compileError || submit.error) && (
          <pre className="block-error">{submit.compileError ?? submit.error}</pre>
        )}
        {submit.publicTests.map((t) => (
          <TestRow key={t.name} t={t} />
        ))}
      </div>
    );
  }
  if (!run) return null;

  const allPass = run.publicTests.length > 0 && run.publicTests.every((t) => t.passed);
  return (
    <div className="results">
      <div className={`verdict ${allPass ? "ok" : "err"}`}>
        <VerdictFace ok={allPass && !run.compileError} />
        {run.compileError ? "compile error" : allPass ? "public tests pass" : "public test results"}
      </div>
      {run.compileError && <pre className="block-error">{run.compileError}</pre>}
      {run.publicTests.map((t) => (
        <TestRow key={t.name} t={t} />
      ))}
    </div>
  );
}
