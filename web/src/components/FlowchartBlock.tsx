import { useEffect, useId, useRef, useState } from "react";
import { PiArrowSquareOut, PiX } from "react-icons/pi";
import type { FlowchartBlock } from "../types";

const NODE_W = 150;
const NODE_H = 46;
const GX = 72;
const GY = 34;
// labels wider than a node spill past it; the gutter keeps them inside the
// viewBox so the first/last node labels never get clipped at the svg edge
const GUTTER = 48;
// mono 12px ≈ 7.2px/char: a 150px node fits ~20 chars. Longer labels get a
// smaller font instead of spilling over the node box.
const MAX_NODE_CHARS = 20;

/** Renders a simple DAG flowchart as inline SVG (no external dependencies).
 *  Layers come from longest-path layering; nodes flow left to right.
 *  An expand button opens a fullscreen overlay with the diagram at its
 *  natural size (scrollable when larger than the viewport). */
export default function Flowchart({ block }: { block: FlowchartBlock }) {
  const markerId = `tcarrow-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const { nodes, edges } = block;
  const n = nodes.length;

  // longest-path layering (fixpoint, capped at n passes so cyclic graphs
  // terminate — cycles just push layers forward)
  const layer = new Array(n).fill(0);
  let changed = true;
  for (let pass = 0; pass < n && changed; pass++) {
    changed = false;
    for (const e of edges) {
      if (layer[e.to] < layer[e.from] + 1) {
        layer[e.to] = layer[e.from] + 1;
        changed = true;
      }
    }
  }

  const byLayer = new Map<number, number[]>();
  for (let i = 0; i < n; i++) {
    const l = layer[i];
    if (!byLayer.has(l)) byLayer.set(l, []);
    byLayer.get(l)!.push(i);
  }
  const maxLayer = Math.max(...byLayer.keys());
  const maxRows = Math.max(...[...byLayer.values()].map((m) => m.length));

  const pos: { x: number; y: number }[] = new Array(n);
  for (const [l, members] of byLayer) {
    members.forEach((nodeId, row) => {
      pos[nodeId] = { x: l * (NODE_W + GX), y: row * (NODE_H + GY) };
    });
  }

  const width = (maxLayer + 1) * (NODE_W + GX) - GX;
  const height = maxRows * (NODE_H + GY) - GY;

  const svg = (
    <svg
      viewBox={`${-GUTTER} ${-GUTTER} ${width + 2 * GUTTER} ${height + 2 * GUTTER}`}
      width={width + 2 * GUTTER}
      height={height + 2 * GUTTER}
      role="img"
      aria-label={block.title ?? "flowchart"}
      className="flowchart-svg"
    >
      <defs>
        <marker
          id={markerId}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" className="flow-arrow" />
        </marker>
      </defs>
      {edges.map((e, i) => {
        const a = pos[e.from];
        const b = pos[e.to];
        const x1 = a.x + NODE_W;
        const y1 = a.y + NODE_H / 2;
        const x2 = b.x;
        const y2 = b.y + NODE_H / 2;
        const mx = (x1 + x2) / 2;
        return (
          <g key={i}>
            <path
              d={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`}
              fill="none"
              className="flow-edge"
              markerEnd={`url(#${markerId})`}
            />
            {e.label && (
              <text
                x={mx}
                y={(y1 + y2) / 2 - 6}
                textAnchor="middle"
                className="flow-edge-label"
              >
                {e.label}
              </text>
            )}
          </g>
        );
      })}
      {nodes.map((label, i) => (
        <g key={i}>
          <rect
            x={pos[i].x}
            y={pos[i].y}
            width={NODE_W}
            height={NODE_H}
            rx={8}
            className="flow-node"
          />
          <text
            x={pos[i].x + NODE_W / 2}
            y={pos[i].y + NODE_H / 2}
            textAnchor="middle"
            dominantBaseline="central"
            className="flow-node-label"
            style={{ fontSize: label.length > MAX_NODE_CHARS ? 10 : 12 }}
          >
            {label}
          </text>
        </g>
      ))}
    </svg>
  );

  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  return (
    <figure className="flowchart">
      <div className="flowchart-head">
        {block.title && <figcaption className="flowchart-title">{block.title}</figcaption>}
        <button
          className="flow-expand"
          onClick={() => setOpen(true)}
          aria-label="view fullscreen"
          title="view fullscreen"
        >
          <PiArrowSquareOut size={15} />
        </button>
      </div>
      <div className="flowchart-scroll">{svg}</div>
      {open && (
        <div
          className="flowchart-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={block.title ?? "flowchart"}
          onClick={() => setOpen(false)}
        >
          <div className="flowchart-overlay-box" onClick={(e) => e.stopPropagation()}>
            <div className="flowchart-overlay-head">
              <span className="flowchart-overlay-title">
                {block.title ?? "flowchart"}
              </span>
              <button
                className="flow-expand"
                onClick={() => setOpen(false)}
                aria-label="close fullscreen"
                ref={closeRef}
              >
                <PiX size={16} />
              </button>
            </div>
            <div className="flowchart-overlay-body">{svg}</div>
          </div>
        </div>
      )}
    </figure>
  );
}
