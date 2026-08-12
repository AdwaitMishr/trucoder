import { useEffect, useState } from "react";
import { api } from "../api";
import { useDocumentTitle } from "../title";
import type { AdminStats } from "../types";
import Loader from "./Loader";

/** Owner-only telemetry page (/admin): users, per-lesson solve/submission
 *  counts, content load errors. Simple tables — no charts, no deps. */
export default function AdminDashboard() {
  useDocumentTitle("admin");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .adminStats()
      .then(setStats)
      .catch((e) => setError(e instanceof Error ? e.message : "load failed"));
  }, []);

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
