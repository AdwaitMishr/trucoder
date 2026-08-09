import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PiPlus, PiChatCircle, PiTrash } from "react-icons/pi";
import { sessionStore, type InterviewSession } from "./lib/db";
import { relay } from "./lib/relay";

export default function InterviewsIndex() {
  const [sessions, setSessions] = useState<InterviewSession[] | null>(null);
  const [relayUp, setRelayUp] = useState<boolean | null>(null);
  const [hasKey, setHasKey] = useState(false);

  function refresh() {
    sessionStore.list().then(setSessions);
    relay
      .health()
      .then((h) => {
        setRelayUp(true);
        setHasKey(h.hasKey);
      })
      .catch(() => setRelayUp(false));
  }

  useEffect(refresh, []);

  async function remove(id: string) {
    await sessionStore.del(id);
    refresh();
  }

  return (
    <div className="page">
      <header className="page-head">
        <h1>interviews</h1>
        <p>practice with a senior-dev interviewer — resume-based, module-grounded, fully private.</p>
      </header>

      {relayUp === false && (
        <div className="form-error" style={{ marginBottom: 14 }}>
          local relay is not running — start it with <code>npm run relay</code> (or <code>node relay/server.js</code>)
        </div>
      )}
      {relayUp === true && !hasKey && (
        <div className="notice" style={{ marginBottom: 14 }}>
          no API key stored yet — set one in the <em>ai setup</em> step of a new interview
        </div>
      )}

      <div className="interview-actions">
        <Link to="/interviews/new" className="btn submit">
          <PiPlus size={15} /> new interview
        </Link>
      </div>

      {sessions === null ? (
        <div className="muted small" style={{ marginTop: 24 }}>
          loading…
        </div>
      ) : sessions.length === 0 ? (
        <div className="empty">
          <PiChatCircle size={34} />
          <div className="empty-title">no interviews yet</div>
          <p className="muted">
            upload a resume, pick the modules you want to be tested on, and let the interviewer drill in.
          </p>
        </div>
      ) : (
        <div className="session-list">
          {sessions.map((s) => (
            <div key={s.id} className="session-card-wrap">
              <Link to={`/interviews/${s.id}`} className="session-card">
                <div className="session-card-title">
                  {s.title || "untitled"}
                  <span className={`pill ${s.status === "done" ? "ok" : ""}`}>
                    {s.status === "done" ? "reported" : s.status === "active" ? "in progress" : "draft"}
                  </span>
                </div>
                <div className="muted small">
                  {new Date(s.createdAt).toLocaleString()} · {s.messages.length} turns · {s.modules.length} modules ·{" "}
                  {s.model}
                </div>
              </Link>
              <button
                className="ghost session-del"
                title="delete session (local only)"
                onClick={() => void remove(s.id)}
              >
                <PiTrash size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
