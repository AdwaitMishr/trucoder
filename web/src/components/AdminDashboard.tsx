import { useEffect, useState } from "react";
import { PiCheck } from "react-icons/pi";
import { api } from "../api";
import { useDocumentTitle } from "../title";
import type { AdminStats, AdminUserVisibility } from "../types";
import Loader from "./Loader";

/** Owner-only telemetry page (/admin): users, per-lesson solve/submission
 *  counts, content load errors. Simple tables — no charts, no deps. */
export default function AdminDashboard() {
  useDocumentTitle("admin");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState("");
  const [perm, setPerm] = useState<AdminUserVisibility[] | null>(null);
  const [permError, setPermError] = useState("");
  const [inflight, setInflight] = useState<Set<string>>(new Set());

  useEffect(() => {
    api
      .adminStats()
      .then((s) => {
        setStats(s);
        return api.adminVisibility();
      })
      .then((r) => setPerm(r.users))
      .catch((e) => setError(e instanceof Error ? e.message : "load failed"));
  }, []);

  /** Flip one user×course cell; optimistic update, revert surface = error
   *  line above the matrix. */
  const toggle = async (userId: number, courseId: string, visible: boolean) => {
    const key = `${userId}:${courseId}`;
    if (inflight.has(key)) return;
    setInflight((s) => new Set(s).add(key));
    try {
      await api.setAdminVisibility(userId, courseId, visible);
      setPerm(
        (rows) =>
          rows?.map((u) =>
            u.id === userId
              ? {
                  ...u,
                  courses: u.courses.map((c) =>
                    c.courseId === courseId ? { ...c, visible } : c
                  ),
                }
              : u
          ) ?? null
      );
      setPermError("");
    } catch (e) {
      setPermError(
        "could not save — " + (e instanceof Error ? e.message : "try again")
      );
    } finally {
      setInflight((s) => {
        const n = new Set(s);
        n.delete(key);
        return n;
      });
    }
  };

  if (error) return <div className="center error">{error}</div>;
  if (!stats) return <Loader />;

  const loadErrEntries = Object.entries(stats.loadErrors);

  return (
    <div className="page">
      <header className="page-head">
        <h1>admin</h1>
        <p className="muted">
          {stats.totals.users} user{stats.totals.users === 1 ? "" : "s"} ·{" "}
          {stats.totals.submissions} submissions · {stats.totals.attempts} total attempts
        </p>
      </header>

      {stats.users.length > 0 && (
        <section className="admin-section">
          <h2 className="admin-heading">users</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>username</th>
                <th>created</th>
              </tr>
            </thead>
            <tbody>
              {stats.users.map((u) => (
                <tr key={u.id}>
                  <td>{u.username}</td>
                  <td className="muted">{u.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {perm && perm.length > 0 && (
        <section className="admin-section">
          <h2 className="admin-heading">course access</h2>
          <p className="admin-sub muted">
            default: visible to everyone. the owner always has access.
          </p>
          {permError && <p className="admin-errors">{permError}</p>}
          <div className="admin-scroll">
            <table className="admin-table access-table">
              <thead>
                <tr>
                  <th className="access-user-col">user</th>
                  {perm[0].courses.map((c) => {
                    const title =
                      stats.courses.find((s) => s.id === c.courseId)?.title ??
                      c.courseId;
                    return (
                      <th key={c.courseId} className="access-course-col" title={title}>
                        {c.courseId}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {perm.map((u) => (
                  <tr key={u.id}>
                    <td className="access-user-col">
                      {u.username}
                      {u.isOwner && <span className="muted"> · owner</span>}
                    </td>
                    {u.courses.map((c) => {
                      if (u.isOwner) {
                        return (
                          <td key={c.courseId} className="access-cell">
                            <span
                              className="access-lock"
                              title="owner always has access"
                              aria-label={`${u.username}: ${c.courseId} always visible`}
                            >
                              <PiCheck size={13} />
                            </span>
                          </td>
                        );
                      }
                      const key = `${u.id}:${c.courseId}`;
                      const pending = inflight.has(key);
                      return (
                        <td key={c.courseId} className="access-cell">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={c.visible}
                            aria-label={`${u.username}: ${c.courseId} ${c.visible ? "visible" : "hidden"}`}
                            className={`access-toggle ${c.visible ? "on" : "off"} ${pending ? "pending" : ""}`}
                            disabled={pending}
                            title={
                              c.visible
                                ? "visible — click to hide"
                                : "hidden — click to show"
                            }
                            onClick={() => toggle(u.id, c.courseId, !c.visible)}
                          >
                            <span className="access-knob" />
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {stats.courses.map((c) => (
        <section key={c.id} className="admin-section">
          <h2 className="admin-heading">{c.title}</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>lesson</th>
                <th>kind</th>
                <th>solved by</th>
                <th>submissions</th>
              </tr>
            </thead>
            <tbody>
              {c.lessons.map((l) => (
                <tr key={l.id}>
                  <td>{l.title}</td>
                  <td className="muted">{l.hasExercise ? "exercise" : "reading"}</td>
                  <td>{l.solvedUsers}</td>
                  <td>{l.submissions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}

      {loadErrEntries.length > 0 && (
        <section className="admin-section">
          <h2 className="admin-heading">course load errors</h2>
          <ul className="admin-errors">
            {loadErrEntries.map(([file, msg]) => (
              <li key={file}>
                <code>{file}</code>: {msg}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
