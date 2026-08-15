// Blackboard → mermaid: converts tldraw page shapes into a mermaid flowchart
// the interviewer can READ AS TEXT (no vision needed).
//
// tldraw v3 shape model:
//   geo  { id, type:"geo", parentId?, props:{ geo:"rectangle"|"diamond"|…, richText } }
//   text { id, type:"text", parentId? /* = a geo shape → it's that shape's label */,
//          props:{ richText } }
//   arrow{ id, type:"arrow", props:{ start:{boundShapeId?}, end:{boundShapeId?} } }
// Labels live in separate child text shapes; text content is TipTap richText.

interface TldrawShapeLike {
  id: string;
  type: string;
  parentId?: string | null;
  x: number;
  y: number;
  props?: {
    geo?: string;
    w?: number;
    h?: number;
    richText?: unknown;
    text?: string;
    start?: { x?: number; y?: number; boundShapeId?: string | null };
    end?: { x?: number; y?: number; boundShapeId?: string | null };
  };
}

/** Extract plain text from tldraw's TipTap richText JSON (or legacy string). */
function textOf(shape: TldrawShapeLike): string {
  const p = shape.props;
  if (!p) return "";
  if (typeof p.text === "string") return p.text;
  const rt = p.richText as
    | { content?: { content?: { text?: string }[] }[] }
    | undefined;
  if (!rt || !Array.isArray(rt.content)) return "";
  const parts: string[] = [];
  for (const block of rt.content) {
    for (const leaf of block.content ?? []) {
      if (typeof leaf.text === "string" && leaf.text) parts.push(leaf.text);
    }
  }
  return parts.join(" ").trim();
}

function esc(s: string): string {
  return s.replace(/"/g, '\\"').replace(/[\n\r]+/g, " ").trim().slice(0, 120);
}

function nodeId(shapeId: string): string {
  const clean = shapeId.replace(/[^A-Za-z0-9_]/g, "");
  return (clean || "n").slice(0, 24);
}

export interface ArrowBinding {
  fromId: string;
  toId: string;
  terminal?: string;
}

export function elementsToMermaid(
  raw: unknown[],
  bindingsFor?: (arrowId: string) => ArrowBinding[]
): string {
  const shapes = raw as TldrawShapeLike[];

  // 1) labels: child text shapes label their parent geo shape
  const labelByParent = new Map<string, string>();
  for (const s of shapes) {
    if (s.type === "text" && s.parentId) {
      const t = textOf(s);
      if (t) labelByParent.set(s.parentId, esc(t));
    }
  }

  const lines: string[] = [];
  const nodeIdByShape = new Map<string, string>();
  const used = new Set<string>();
  const unique = (base: string) => {
    let id = base;
    let i = 2;
    while (used.has(id)) id = `${base}_${i++}`;
    used.add(id);
    return id;
  };

  // 2) nodes
  for (const s of shapes) {
    if (s.type === "geo") {
      const id = unique(nodeId(s.id));
      nodeIdByShape.set(s.id, id);
      const label = labelByParent.get(s.id) ?? esc(textOf(s));
      const shape = s.props?.geo === "diamond" ? `{${label}}` : `["${label}"]`;
      lines.push(`    ${id}${shape}`);
    } else if (s.type === "text" && !s.parentId) {
      const label = esc(textOf(s));
      if (!label) continue;
      const id = unique(nodeId(s.id));
      nodeIdByShape.set(s.id, id);
      lines.push(`    ${id}["${label}"]`);
    }
  }

  // 3) edges
  const edges = new Set<string>();
  const find = (id: string | null | undefined): string | undefined =>
    id ? nodeIdByShape.get(id) : undefined;
  const center = (s: TldrawShapeLike) => ({
    cx: s.x + (s.props?.w ?? 0) / 2,
    cy: s.y + (s.props?.h ?? 0) / 2,
  });
  const nearest = (x: number, y: number): string | undefined => {
    let best: { d: number; id: string } | null = null;
    for (const [shapeId, nid] of nodeIdByShape) {
      const s = shapes.find((z) => z.id === shapeId);
      if (!s) continue;
      const { cx, cy } = center(s);
      const d = (cx - x) ** 2 + (cy - y) ** 2;
      if (!best || d < best.d) best = { d, id: nid };
    }
    return best?.id;
  };

  for (const s of shapes) {
    if (s.type !== "arrow") continue;
    const start = s.props?.start;
    const end = s.props?.end;
    let a = find(start?.boundShapeId);
    let b = find(end?.boundShapeId);
    // tldraw v3: arrow bindings are separate records (terminal: start|end)
    if (bindingsFor) {
      for (const bl of bindingsFor(s.id)) {
        const bound = find(bl.toId);
        if (bl.terminal === "start" && bound) a = bound;
        else if (bl.terminal === "end" && bound) b = bound;
        else if (!bl.terminal && bound) b = bound;
      }
    }
    if (!a) a = nearest(s.x + (start?.x ?? 0), s.y + (start?.y ?? 0));
    if (!b) b = nearest(s.x + (end?.x ?? 0), s.y + (end?.y ?? 0));
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
