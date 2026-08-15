import { lazy, Suspense, useRef } from "react";
import { PiX, PiTrash, PiPaperPlaneRight, PiPencilLine } from "react-icons/pi";
import { elementsToMermaid, mermaidMessage, type ArrowBinding } from "./lib/mermaid";

// tldraw is heavy (~1MB+) — loaded only when the blackboard opens.
const TldrawCanvas = lazy(() => import("./TldrawCanvas"));

interface BoardEditor {
  getCurrentPageShapes: () => unknown[];
  getCurrentPageShapeIds: () => Set<string>;
  deleteShapes: (ids: string[]) => void;
  getBindingsInvolvingShape: (id: string) => ArrowBinding[];
}

export default function BlackboardModal({
  open,
  onClose,
  onSend,
}: {
  open: boolean;
  onClose: () => void;
  onSend: (content: string) => void;
}) {
  const editorRef = useRef<BoardEditor | null>(null);

  if (!open) return null;

  const send = () => {
    const editor = editorRef.current;
    const shapes = (editor?.getCurrentPageShapes() ?? []) as unknown[];
    const src = elementsToMermaid(shapes, (arrowId) => {
      const binds = editor?.getBindingsInvolvingShape(arrowId) ?? [];
      return binds
        .filter((b) => b.fromId === arrowId && b.toId)
        .map((b) => ({ fromId: b.fromId, toId: b.toId, terminal: b.terminal }));
    });
    onSend(src ? mermaidMessage(src) : "[blackboard] (empty)");
    onClose();
  };

  const clear = () => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.deleteShapes([...editor.getCurrentPageShapeIds()]);
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
            <button className="ghost small-ghost" title="clear" onClick={clear}>
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
            <TldrawCanvas
              onMount={(editor) => {
                editorRef.current = editor as BoardEditor;
                // test/debug hook: reach the tldraw editor from the console
                if (import.meta.env.DEV) {
                  (window as unknown as Record<string, unknown>).__bb = editor;
                }
              }}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
