import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PiBookOpen, PiArrowRight } from "react-icons/pi";
import { api } from "../api";
import type { CourseSummary } from "../types";

export default function CourseIndex() {
  const [courses, setCourses] = useState<CourseSummary[] | null>(null);

  useEffect(() => {
    api.courses().then((r) => setCourses(r.courses));
  }, []);

  if (!courses) return <div className="boot">trucoder</div>;

  return (
    <div className="page">
      <header className="page-head">
        <h1>courses</h1>
        <p>pick one and work through it at your own pace.</p>
      </header>

      {courses.length === 0 ? (
        <div className="empty">
          <div className="empty-title">no courses yet</div>
          <p className="muted">
            Add a course under <code>courses/&lt;id&gt;/</code> — see{" "}
            <code>courses/AGENTS.md</code>. TruCoder picks it up automatically.
          </p>
        </div>
      ) : (
        <div className="course-grid">
          {courses.map((c) => {
            const pct = c.lessonCount ? Math.round((c.solved / c.lessonCount) * 100) : 0;
            return (
              <Link key={c.id} to={`/course/${c.id}`} className="course-card">
                <div className="course-card-title">
                  <PiBookOpen size={18} />
                  {c.title}
                </div>
                <div className="course-card-desc">{c.description}</div>
                <div className="progress-track-sm">
                  <div className="progress-fill-sm" style={{ width: `${pct}%` }} />
                </div>
                <div className="course-card-meta">
                  <span>
                    {c.solved}/{c.lessonCount} done · {pct}%
                  </span>
                  <PiArrowRight size={14} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
