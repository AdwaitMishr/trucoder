import { useId } from "react";
import type { FlowchartBlock } from "../types";

const NODE_W = 150;
const NODE_H = 46;
const GX = 72;
const GY = 34;

/** Renders a simple DAG flowchart as inline SVG (no external dependencies).
 *  Layers come from longest-path layering; nodes flow left to right. */
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

  return (
    <figure className="flowchart">
      {block.title && <figcaption className="flowchart-title">{block.title}</figcaption>}
      <div className="flowchart-scroll">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width={width}
          height={height}
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
              >
                {label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </figure>
  );
}
