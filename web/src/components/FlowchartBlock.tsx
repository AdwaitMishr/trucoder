import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import {
  PiArrowSquareOut,
  PiFrameCorners,
  PiMinus,
  PiPlus,
  PiX,
} from "react-icons/pi";
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
const MIN_SCALE = 0.2;
const MAX_SCALE = 4;

/** Renders a simple DAG flowchart as inline SVG (no external dependencies).
 *  Layers come from longest-path layering; nodes flow left to right.
 *  An expand button opens a fullscreen canvas viewer: pan by drag, zoom by
 *  wheel / pinch / buttons / double-click, fit on open. */
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

  const svgW = (maxLayer + 1) * (NODE_W + GX) - GX + 2 * GUTTER;
  const svgH = maxRows * (NODE_H + GY) - GY + 2 * GUTTER;

  const svg = (
    <svg
      viewBox={`${-GUTTER} ${-GUTTER} ${svgW} ${svgH}`}
      width={svgW}
      height={svgH}
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
  const [view, setView] = useState({ x: 0, y: 0, s: 1 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ dist: number } | null>(null);
  const drag = useRef<{ x: number; y: number } | null>(null);

  const fit = useCallback(() => {
    const el = canvasRef.current;
    if (!el) return;
    const vw = el.clientWidth;
    const vh = el.clientHeight;
    // 24px breathing room around the diagram; never upscale beyond natural
    // size — 12px labels stay crisp
    const s = Math.min((vw - 24) / svgW, (vh - 24) / svgH, 1);
    setView({ s, x: (vw - svgW * s) / 2, y: (vh - svgH * s) / 2 });
  }, [svgW, svgH]);

  useLayoutEffect(() => {
    if (!open) return;
    fit();
    closeRef.current?.focus();
  }, [open, fit]);

  const zoomAt = useCallback((cx: number, cy: number, factor: number) => {
    setView((v) => {
      const s = Math.min(MAX_SCALE, Math.max(MIN_SCALE, v.s * factor));
      const wx = (cx - v.x) / v.s;
      const wy = (cy - v.y) / v.s;
      return { s, x: cx - wx * s, y: cy - wy * s };
    });
  }, []);

  // wheel zoom — native listener so preventDefault works (React wheel is passive)
  useEffect(() => {
    if (!open) return;
    const el = canvasRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      zoomAt(e.clientX - r.left, e.clientY - r.top, e.deltaY < 0 ? 1.1 : 1 / 1.1);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [open, zoomAt]);

  // keyboard: Escape closes, +/-/0 zoom
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      else if (e.key === "+" || e.key === "=") zoomAt(window.innerWidth / 2, window.innerHeight / 2, 1.25);
      else if (e.key === "-") zoomAt(window.innerWidth / 2, window.innerHeight / 2, 0.8);
      else if (e.key === "0") fit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, zoomAt, fit]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // ignore drags that start on controls/close — they keep their own clicks
    if ((e.target as HTMLElement).closest(".flow-controls, .flow-close")) return;
    canvasRef.current?.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = { dist: Math.hypot(a.x - b.x, a.y - b.y) };
      drag.current = null;
    } else {
      drag.current = { x: e.clientX, y: e.clientY };
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const p = pointers.current.get(e.pointerId);
    if (!p) return;
    const dx = e.clientX - p.x;
    const dy = e.clientY - p.y;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const el = canvasRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (pointers.current.size === 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const midX = (a.x + b.x) / 2 - r.left;
      const midY = (a.y + b.y) / 2 - r.top;
      zoomAt(midX, midY, dist / pinch.current.dist);
      pinch.current.dist = dist;
    } else if (drag.current && pointers.current.size === 1) {
      setView((v) => ({ ...v, x: v.x + dx, y: v.y + dy }));
    }
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (pointers.current.size === 0) drag.current = null;
  };

  const onDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = canvasRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    zoomAt(e.clientX - r.left, e.clientY - r.top, 2);
  };

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
          className="flow-canvas"
          ref={canvasRef}
          role="dialog"
          aria-modal="true"
          aria-label={block.title ?? "flowchart"}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onDoubleClick={onDoubleClick}
        >
          <div
            className="flow-stage"
            style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.s})` }}
          >
            {svg}
          </div>
          <div className="flow-controls">
            <button
              className="flow-zoom-btn"
              onClick={() => zoomAt(window.innerWidth / 2, window.innerHeight / 2, 0.8)}
              aria-label="zoom out"
              title="zoom out"
            >
              <PiMinus size={15} />
            </button>
            <span className="flow-scale-label">{Math.round(view.s * 100)}%</span>
            <button
              className="flow-zoom-btn"
              onClick={() => zoomAt(window.innerWidth / 2, window.innerHeight / 2, 1.25)}
              aria-label="zoom in"
              title="zoom in"
            >
              <PiPlus size={15} />
            </button>
            <span className="flow-ctrl-divider" />
            <button className="flow-zoom-btn" onClick={fit} aria-label="fit to screen" title="fit to screen">
              <PiFrameCorners size={15} />
            </button>
          </div>
          <button
            className="flow-close"
            ref={closeRef}
            onClick={() => setOpen(false)}
            aria-label="close fullscreen"
          >
            <PiX size={18} />
          </button>
        </div>
      )}
    </figure>
  );
}
