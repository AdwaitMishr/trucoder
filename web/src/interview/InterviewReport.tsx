import { Link } from "react-router-dom";
import type { InterviewSession } from "./lib/db";

const DIMS: { key: string; label: string }[] = [
  { key: "correctness", label: "correctness" },
  { key: "completeness", label: "completeness" },
  { key: "structure", label: "structure" },
  { key: "depth", label: "depth" },
  { key: "communication", label: "communication" },
];

function Bars({ value }: { value: number }) {
  return (
    <span className="rubric-bars" aria-label={`${value} of 4`}>
      {[1, 2, 3, 4].map((i) => (
        <span key={i} className={`bar ${i <= value ? "on" : ""}`} />
      ))}
    </span>
  );
}

export default function InterviewReport({ session }: { session: InterviewSession }) {
  const report = (session.report ?? {}) as Record<string, unknown>;
  const scores = (report.scores ?? {}) as Record<string, number>;
  const topics = (report.topic_verdicts ?? []) as { topic?: string; level?: number; note?: string }[];
  const strengths = (report.strengths ?? []) as string[];
  const gaps = (report.gaps ?? []) as string[];
  const recs = (report.recommended_modules ?? []) as string[];
  const summary = (report.summary ?? "") as string;
  const raw = report._raw as string | undefined;

  return (
    <div className="page">
      <header className="page-head">
        <h1>interview report</h1>
        <p>{session.title}</p>
      </header>

      <div className="report">
        {raw ? (
          <div className="report-raw">
            <div className="muted small">could not parse the report as JSON — raw output:</div>
            <pre>{raw}</pre>
          </div>
        ) : (
          <>
            {summary && <div className="report-summary">{summary}</div>}

            <div className="report-section">
              <h3>rubric</h3>
              {DIMS.map((d) => (
                <div key={d.key} className="report-dim">
                  <span>{d.label}</span>
                  <Bars value={Math.max(1, Math.min(4, Math.round(scores[d.key] ?? 1)))} />
                </div>
              ))}
            </div>

            {topics.length > 0 && (
              <div className="report-section">
                <h3>topics</h3>
                {topics.map((t, i) => (
                  <div key={i} className="report-topic">
                    <div className="report-topic-head">
                      <span>{t.topic ?? "topic"}</span>
                      <Bars value={Math.max(1, Math.min(4, Math.round(t.level ?? 1)))} />
                    </div>
                    {t.note && <div className="muted small">{t.note}</div>}
                  </div>
                ))}
              </div>
            )}

            <div className="report-cols">
              {strengths.length > 0 && (
                <div className="report-section">
                  <h3>strengths</h3>
                  <ul className="report-list">
                    {strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
              {gaps.length > 0 && (
                <div className="report-section">
                  <h3>gaps to work on</h3>
                  <ul className="report-list">
                    {gaps.map((g, i) => (
                      <li key={i}>{g}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {recs.length > 0 && (
              <div className="report-section">
                <h3>review these modules</h3>
                <ul className="report-list report-recs">
                  {recs.map((r, i) => {
                    // models may emit "course-id:lesson-id" or "courseId/lessonId"
                    const [course, lesson] = r.split(/[:/]/);
                    return (
                      <li key={i}>
                        {course && lesson ? (
                          <Link to={`/course/${course}/lessons/${lesson}`}>{r}</Link>
                        ) : (
                          r
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </>
        )}

        <div className="report-actions">
          <button
            className="ghost"
            onClick={() => {
              const blob = new Blob([JSON.stringify(session, null, 2)], { type: "application/json" });
              const a = document.createElement("a");
              a.href = URL.createObjectURL(blob);
              a.download = `${session.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-report.json`;
              a.click();
            }}
          >
            export report
          </button>
          <Link to="/interviews" className="btn run">
            back to interviews
          </Link>
        </div>
      </div>
    </div>
  );
}
