import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import type { CourseDetail, CourseSummary, Difficulty } from "../types";
import Markdown from "./Markdown";

const DIFF_LABEL: Record<Difficulty, string> = {
  beginner: "beginner",
  easy: "easy",
  medium: "medium",
  hard: "hard",
};

export default function CourseDashboard() {
  const [courses, setCourses] = useState<CourseSummary[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    api.courses().then((r) => {
      setCourses(r.courses);
      if (r.courses.length === 1) setSelectedId(r.courses[0].id);
    });
  }, []);

  if (!courses) return <div className="boot">trucoder</div>;
  if (courses.length === 0) {
    return (
      <div className="page">
        <div className="empty">
          <div className="empty-title">no courses yet</div>
          <p className="muted">
            Add a course under <code>courses/&lt;id&gt;/</code> — see{" "}
            <code>courses/AGENTS.md</code>. TruCoder picks it up automatically.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      {courses.length > 1 && !selectedId && (
        <div className="course-index">
          {courses.map((c) => (
            <button key={c.id} className="course-card" onClick={() => setSelectedId(c.id)}>
              <div className="course-card-title">{c.title}</div>
              <div className="muted">{c.description}</div>
              <div className="course-card-meta">
                {c.solved}/{c.lessonCount} done
              </div>
            </button>
          ))}
        </div>
      )}
      {selectedId && <CourseDetailView id={selectedId} />}
    </div>
  );
}

function CourseDetailView({ id }: { id: string }) {
  const [course, setCourse] = useState<CourseDetail | null>(null);
  useEffect(() => {
    api.course(id).then(setCourse);
  }, [id]);

  if (!course) return <div className="boot">trucoder</div>;

  const pct = course.lessons.length ? (course.lessons.filter((l) => l.solved).length / course.lessons.length) * 100 : 0;

  return (
    <main className="course">
      <header className="course-head">
        <h1>{course.title}</h1>
        <p className="muted">{course.description}</p>
      </header>

      <div className="progress">
        <div className="progress-label">
          <span>{course.lessons.filter((l) => l.solved).length} of {course.lessons.length} lessons</span>
          <span className="muted">{Math.round(pct)}%</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {course.body && (
        <div className="syllabus">
          <Markdown>{course.body}</Markdown>
        </div>
      )}

      <ol className="roadmap">
        {course.lessons.map((l) => (
          <li key={l.id}>
            <Link
              to={`/course/${course.id}/lessons/${l.id}`}
              className="lesson-row"
            >
              <span className={`lesson-state ${l.solved ? "done" : ""}`}>
                {l.solved ? "✓" : String(l.order).padStart(2, "0")}
              </span>
              <span className="lesson-info">
                <span className="lesson-title">{l.title}</span>
                <span className="lesson-tags">
                  {l.tags.map((t) => (
                    <span key={t} className="tag">
                      {t}
                    </span>
                  ))}
                </span>
              </span>
              <span className={`diff diff-${l.difficulty}`}>
                {DIFF_LABEL[l.difficulty]}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </main>
  );
}
