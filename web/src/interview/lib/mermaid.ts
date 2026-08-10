// Blackboard → mermaid: converts Excalidraw scene elements into a mermaid
// flowchart the interviewer can READ AS TEXT (no vision needed).
//
// Element model (Excalidraw): shapes (rectangle/ellipse/diamond) at x,y with
// width/height; text elements with text.rawText (often bound to a shape via
// containerId); linear elements (arrow) with startBinding/endBinding.

interface ExcalidrawElementLike {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text?: { rawText?: string };
  containerId?: string | null;
  boundElements?: { id: string; type: string }[] | null;
  startBinding?: { elementId: string } | null;
  endBinding?: { elementId: string } | null;
  points?: [number, number][];
}

const SHAPE_TYPES = new Set(["rectangle", "ellipse", "diamond"]);
const NODE_RE = /^[A-Za-z0-9_]+$/;

function esc(s: string): string {
  return s.replace(/"/g, '\\"').replace(/[\n\r]+/g, " ").trim().slice(0, 120);
}

export function elementsToMermaid(raw: unknown[]): string {
  const els = raw as ExcalidrawElementLike[];

  // 1) labels: bound text elements attach to their container shape
  const labelByContainer = new Map<string, string>();
  for (const e of els) {
    if (e.type === "text" && e.containerId && e.text?.rawText) {
      labelByContainer.set(e.containerId, esc(e.text.rawText));
    }
  }

  // 2) nodes: shapes (with their label) + standalone texts
  const nodeIdByEl = new Map<string, string>();
  const lines: string[] = [];
  let n = 0;
  for (const e of els) {
    if (SHAPE_TYPES.has(e.type)) {
      const label = labelByContainer.get(e.id) ?? esc(e.text?.rawText ?? "");
      n++;
      const id = `n${n}`;
      nodeIdByEl.set(e.id, id);
      const shape = e.type === "diamond" ? `{${label}}` : `["${label}"]`;
      lines.push(`    ${id}${shape}`);
    } else if (e.type === "text" && !e.containerId && e.text?.rawText?.trim()) {
      n++;
      const id = `n${n}`;
      nodeIdByEl.set(e.id, id);
      lines.push(`    ${id}["${esc(e.text.rawText)}"]`);
    }
  }

  // 3) edges: arrows by binding, else nearest node by geometry
  const edges = new Set<string>();
  const findNode = (elId: string | null | undefined): string | undefined =>
    elId ? nodeIdByEl.get(elId) : undefined;
  for (const e of els) {
    if (e.type !== "arrow") continue;
    let a = findNode(e.startBinding?.elementId);
    let b = findNode(e.endBinding?.elementId);
    if (!a || !b) {
      const nearest = (x: number, y: number) => {
        let best: { d: number; id: string } | null = null;
        for (const [elId, nid] of nodeIdByEl) {
          const el = els.find((x2) => x2.id === elId);
          if (!el) continue;
          const cx = el.x + el.width / 2;
          const cy = el.y + el.height / 2;
          const d = (cx - x) ** 2 + (cy - y) ** 2;
          if (!best || d < best.d) best = { d, id: nid };
        }
        return best?.id;
      };
      const pts = e.points ?? [];
      if (!a && pts.length > 1) a = nearest(e.x + pts[0][0], e.y + pts[0][1]);
      if (!b && pts.length > 1) b = nearest(e.x + pts[pts.length - 1][0], e.y + pts[pts.length - 1][1]);
    }
    if (a && b && a !== b) edges.add(`    ${a} --> ${b}`);
  }

  const body = [...lines, ...edges];
  if (!body.length) return "";
  return `flowchart LR\n${body.join("\n")}`;
}

/** Wrap mermaid source for the interviewer message. */
export function mermaidMessage(src: string): string {
  if (!src) return "";
  return `[blackboard diagram]\n\`\`\`mermaid\n${src}\n\`\`\`\n\n(that's my drawing, explained in mermaid — ask me about it)`;
}
