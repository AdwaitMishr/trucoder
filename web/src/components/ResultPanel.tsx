import type { RunResult, SubmitResult, TestResult } from "../types";

function TestRow({ t }: { t: TestResult }) {
  if (t.passed) {
    return (
      <div className="test-row pass">
        <span className="dot">✓</span>
        <span>{t.name}</span>
      </div>
    );
  }
  return (
    <div className="test-row fail">
      <span className="dot">✗</span>
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

export default function ResultPanel({
  run,
  submit,
}: {
  run: RunResult | null;
  submit: SubmitResult | null;
}) {
  if (submit) {
    const accepted = submit.verdict === "accepted";
    const error = submit.verdict === "error";
    const label = accepted ? "all tests passed" : error ? "error" : "wrong answer";
    return (
      <div className="results">
        <div className={`verdict ${accepted ? "ok" : "err"}`}>
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
      <div className={`verdict ${allPass ? "ok" : ""}`}>
        {run.compileError ? "compile error" : allPass ? "public tests pass" : "public test results"}
      </div>
      {run.compileError && <pre className="block-error">{run.compileError}</pre>}
      {run.publicTests.map((t) => (
        <TestRow key={t.name} t={t} />
      ))}
    </div>
  );
}
