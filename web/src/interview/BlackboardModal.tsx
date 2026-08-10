import { lazy, Suspense, useRef } from "react";
import { PiX, PiTrash, PiPaperPlaneRight, PiPencilLine } from "react-icons/pi";
import { elementsToMermaid, mermaidMessage } from "./lib/mermaid";

// Excalidraw is heavy (~1MB) — load it only when the blackboard opens.
const Excalidraw = lazy(() =>
  import("@excalidraw/excalidraw").then((m) => ({ default: m.Excalidraw }))
);

export default function BlackboardModal({
  open,
  onClose,
  onSend,
}: {
  open: boolean;
  onClose: () => void;
  onSend: (content: string) => void;
}) {
  const apiRef = useRef<{ getSceneElements: () => unknown[]; resetScene: () => void } | null>(null);

  if (!open) return null;

  const send = () => {
    const els = apiRef.current?.getSceneElements() ?? [];
    const src = elementsToMermaid(els);
    if (!src) {
      onSend("[blackboard] (empty)");
    } else {
      onSend(mermaidMessage(src));
    }
    onClose();
  };

  return (
    <div className="cmd-overlay" onMouseDown={onClose}>
      <div
        className="cmd-panel blackboard-panel"
        role="dialog"
        aria-label="blackboard"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="blackboard-head">
          <span className="blackboard-title">
            <PiPencilLine size={15} /> blackboard
          </span>
          <span className="muted small">draw it — it's sent to the interviewer as mermaid text</span>
          <div className="blackboard-actions">
            <button className="ghost small-ghost" title="clear" onClick={() => apiRef.current?.resetScene()}>
              <PiTrash size={14} />
            </button>
            <button className="btn submit" onClick={send}>
              <PiPaperPlaneRight size={14} /> send to interviewer
            </button>
            <button className="ghost" title="close" onClick={onClose}>
              <PiX size={15} />
            </button>
          </div>
        </div>
        <div className="blackboard-canvas">
          <Suspense fallback={<div className="muted small blackboard-loading">loading canvas…</div>}>
            <Excalidraw
              excalidrawAPI={(api: unknown) => {
                apiRef.current = api as { getSceneElements: () => unknown[]; resetScene: () => void };
              }}
              initialData={{ elements: [], appState: { viewBackgroundColor: "transparent" } }}
              UIOptions={{
                canvasActions: {
                  loadScene: false,
                  saveToActiveFile: false,
                  export: false,
                  saveAsImage: false,
                  toggleTheme: false,
                },
              }}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
