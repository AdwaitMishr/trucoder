import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useChat, type Message } from "@ai-sdk/react";
import { PiMicrophone, PiMicrophoneSlash, PiStopCircle } from "react-icons/pi";
import { sessionStore, type InterviewSession } from "./lib/db";
import { fetchModuleText, buildSystemPrompt, gradeInterview } from "./lib/engine";
import { parseQuizzes, letter, type ChatQuiz } from "./lib/quiz";
import InterviewReport from "./InterviewReport";
import Markdown from "../components/Markdown";

const RELAY = "http://127.0.0.1:3177";

function errMsg(e: unknown): string {
  return typeof e === "string" ? e : e instanceof Error ? e.message : JSON.stringify(e);
}

function toSdk(s: InterviewSession): Message[] {
  return s.messages
    .filter((m) => !m.content.startsWith("‹control›"))
    .map((m, i) => ({
      id: `m${i}`,
      role: m.role === "interviewer" ? "assistant" : "user",
      content: m.content,
    }));
}

function toSession(msgs: Message[]): InterviewSession["messages"] {
  return msgs
    .filter((m) => (m.role === "assistant" || m.role === "user") && !m.content.startsWith("‹control›"))
    .map((m) => ({
      role: m.role === "assistant" ? "interviewer" as const : "user" as const,
      content: m.content,
    }));
}

function isControl(m: Message): boolean {
  return m.role === "user" && m.content.startsWith("‹control›");
}

/** A quiz embedded in an interviewer message: click an option to answer. */
function ChatQuizBlock({ quiz, onAnswer }: { quiz: ChatQuiz; onAnswer: (i: number) => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  return (
    <div className="chat-quiz">
      <div className="chat-quiz-q">{quiz.question}</div>
      <div className="chat-quiz-opts">
        {quiz.options.map((o, i) => {
          const state = picked === null ? "idle" : i === quiz.answer ? "correct" : i === picked ? "wrong" : "idle";
          return (
            <button
              key={i}
              className={`chat-quiz-opt ${state}`}
              disabled={picked !== null}
              onClick={() => {
                setPicked(i);
                onAnswer(i);
              }}
            >
              <span className="chat-quiz-letter">{letter(i)}</span>
              <span>{o}</span>
              {state === "correct" && <span className="chat-quiz-mark">✓</span>}
              {state === "wrong" && <span className="chat-quiz-mark">✗</span>}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className={`chat-quiz-verdict ${picked === quiz.answer ? "right" : "wrong"}`}>
          {picked === quiz.answer ? "correct — nice." : "not quite — the interviewer will unpack it."}
        </div>
      )}
    </div>
  );
}

/** Interviewer message with rich rendering: markdown (code fences) + quizzes. */
function AssistantMessage({ content, onQuizAnswer }: { content: string; onQuizAnswer: (i: number) => void }) {
  const { quizzes, text } = parseQuizzes(content);
  return (
    <div className="chat-bubble">
      {text && <Markdown>{text}</Markdown>}
      {quizzes.map((q, i) => (
        <ChatQuizBlock key={i} quiz={q} onAnswer={onQuizAnswer} />
      ))}
    </div>
  );
}

/** Auto-growing textarea. */
function AutosizeInput({
  value,
  onChange,
  onKeyDown,
  disabled,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  disabled: boolean;
  placeholder: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }, [value]);
  return (
    <textarea
      ref={ref}
      className="text-input chat-input"
      placeholder={placeholder}
      value={value}
      rows={1}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      disabled={disabled}
    />
  );
}

export default function InterviewChat() {
  const { id } = useParams();
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [ctx, setCtx] = useState<{ resume: string; focus: string; moduleText: string; model: string } | null>(null);
  const [error, setError] = useState("");
  const [listening, setListening] = useState(false);
  const [seeded, setSeeded] = useState(false);
  const recRef = useRef<{ stop: () => void } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const systemRef = useRef("");
  const modelRef = useRef("deepseek-v4-flash");

  const chat = useChat({
    api: RELAY + "/v1/chat/text",
    streamProtocol: "text",
    body: { system: systemRef.current, model: modelRef.current },
    onFinish: () => {
      setSession((prev) => {
        if (!prev) return prev;
        const next = { ...prev, messages: toSession(chat.messages) };
        void sessionStore.put(next);
        return next;
      });
    },
    onError: (e) => setError(errMsg(e)),
  });

  useEffect(() => {
    if (!id) return;
    sessionStore.get(id).then((s) => {
      setSession(s ?? null);
      if (s) {
        fetchModuleText(s.modules).then((moduleText) => {
          const c = { resume: s.resume, focus: s.focus, moduleText, model: s.model };
          setCtx(c);
          systemRef.current = buildSystemPrompt(c);
          modelRef.current = s.model;
        });
      }
    });
  }, [id]);

  // seed the SDK chat once the session + context are ready
  useEffect(() => {
    if (!session || !ctx || seeded) return;
    setSeeded(true);
    chat.setMessages(toSdk(session));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.id, ctx]);

  // opening question
  useEffect(() => {
    if (
      seeded &&
      session &&
      session.messages.length === 0 &&
      chat.messages.length === 0 &&
      !chat.isLoading &&
      systemRef.current
    ) {
      void chat.append({ role: "user", content: "‹control›(The interview is starting — greet me and ask your opening question.)" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seeded, session?.id, chat.messages.length, chat.isLoading]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.messages.length, chat.isLoading]);

  function send() {
    const text = chat.input.trim();
    if (!text || chat.isLoading) return;
    chat.append({ role: "user", content: text });
    setError("");
  }

  function control(kind: "hint" | "go-deeper" | "skip") {
    if (chat.isLoading) return;
    const hint =
      kind === "hint"
        ? "‹control›(The candidate asked for a hint. Give ONE small hint — never the full answer.)"
        : kind === "go-deeper"
          ? "‹control›(The candidate wants to go DEEPER on the current topic. Ask a harder, more subtle follow-up — trade-offs, edge cases, design decisions. One question.)"
          : "‹control›(The candidate wants to move on. Wrap up the topic in one short sentence and open the next topic with one question.)";
    void chat.append({ role: "user", content: hint });
  }

  async function endInterview() {
    if (!session || !ctx || chat.isLoading) return;
    setError("");
    try {
      const report = await gradeInterview(ctx, toSession(chat.messages));
      setSession((prev) => {
        if (!prev) return prev;
        const next = { ...prev, status: "done" as const, report };
        void sessionStore.put(next);
        return next;
      });
    } catch (e) {
      setError(errMsg(e));
    }
  }

  function toggleMic() {
    if (listening) {
      recRef.current?.stop();
      setListening(false);
      return;
    }
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) {
      setError("speech recognition isn't available in this browser — try Chrome/Edge");
      return;
    }
    const rec = new SR();
    rec.lang = "en-IN";
    rec.interimResults = true;
    rec.continuous = true;
    let sawSpeech = false;
    rec.onresult = (e: SpeechRecognitionEvent) => {
      sawSpeech = true;
      let t = "";
      for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
      if (t) chat.setInput(t);
    };
    rec.onend = () => {
      setListening(false);
      if (!sawSpeech) setError("no speech heard — check the mic permission (lock icon) and try again");
    };
    rec.onerror = (e) => {
      const err = (e as { error?: string }).error ?? "unknown";
      setListening(false);
      if (err === "not-allowed" || err === "service-not-allowed")
        setError("mic permission denied — allow the microphone for localhost:3001 (lock icon in the address bar)");
      else if (err === "no-speech") setError("no speech detected — try again");
      else if (err === "network") setError("speech service unreachable (network error)");
      else setError(`speech error: ${err}`);
    };
    recRef.current = rec;
    setError("");
    setListening(true);
    try {
      rec.start();
    } catch {
      setListening(false);
      setError("couldn't start the microphone — check the browser permission");
    }
  }

  const streaming = chat.isLoading;
  const lastAssistant = [...chat.messages].reverse().find((m) => m.role === "assistant");

  if (!session) {
    return (
      <div className="page">
        <div className="empty">
          <div className="empty-title">session not found</div>
          <Link to="/interviews" className="btn run">
            back to interviews
          </Link>
        </div>
      </div>
    );
  }

  if (session.status === "done" && session.report) {
    return <InterviewReport session={session} />;
  }

  return (
    <div className="page interview-page">
      <header className="page-head interview-head">
        <div>
          <h1>{session.title}</h1>
          <p className="muted small">
            {session.model} · {session.modules.length} module{session.modules.length === 1 ? "" : "s"} referenced
            {session.focus ? " · custom focus" : ""}
          </p>
        </div>
        <div className="interview-head-actions">
          <button className="ghost" onClick={() => control("hint")} disabled={streaming}>
            hint
          </button>
          <button className="ghost" onClick={() => control("go-deeper")} disabled={streaming}>
            go deeper
          </button>
          <button className="ghost" onClick={() => control("skip")} disabled={streaming}>
            skip topic
          </button>
          <button className="btn submit" onClick={() => void endInterview()} disabled={streaming}>
            end interview
          </button>
        </div>
      </header>

      <div className="chat">
        {chat.messages.length === 0 && !streaming && (
          <div className="chat-empty muted">the interviewer will open with a question from your resume…</div>
        )}
        {chat.messages.map((m) =>
          isControl(m) ? null : m.role === "assistant" ? (
            <div key={m.id} className="chat-msg interviewer">
              <AssistantMessage
                content={m.content}
                onQuizAnswer={(i) => void chat.append({ role: "user", content: `My answer: ${letter(i)}` })}
              />
            </div>
          ) : m.role === "user" ? (
            <div key={m.id} className="chat-msg user">
              <div className="chat-bubble">{m.content}</div>
            </div>
          ) : null
        )}
        {streaming && lastAssistant && (
          <div className="chat-msg interviewer">
            <div className="chat-bubble typing">
              {lastAssistant.content.slice(0, 300)}
              <span className="typing-dots" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && <div className="form-error chat-error">{error}</div>}

      <div className="chat-input-row">
        <AutosizeInput
          value={chat.input}
          onChange={(v) => chat.setInput(v)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          disabled={streaming}
          placeholder="your answer… (or speak it with the mic)"
        />
        <button
          className={`ghost mic-btn ${listening ? "on" : ""}`}
          onClick={toggleMic}
          title={listening ? "stop listening" : "speak your answer"}
        >
          {listening ? <PiMicrophoneSlash size={17} /> : <PiMicrophone size={17} />}
          {listening && <span className="mic-live">listening…</span>}
        </button>
        {streaming ? (
          <button className="btn stop" onClick={() => chat.stop()} title="stop generating">
            <PiStopCircle size={17} /> stop
          </button>
        ) : (
          <button className="btn submit" onClick={send} disabled={!chat.input.trim()}>
            send
          </button>
        )}
      </div>
    </div>
  );
}
