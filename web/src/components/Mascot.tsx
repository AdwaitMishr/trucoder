import { useEffect, useRef, useState } from "react";

export type MascotState = "idle" | "running" | "correct" | "wrong";

const FACES: Record<MascotState, React.ReactNode> = {
  idle: (
    <>
      <path className="mc-eye-l" d="M7.3 8.4 L9.7 10.3 L7.3 12.2" />
      <path className="mc-eye-r" d="M16.7 8.4 L14.3 10.3 L16.7 12.2" />
      <path d="M9.2 15.2 H14.8" />
    </>
  ),
  running: (
    <>
      <path d="M7.3 8.4 L9.7 10.3 L7.3 12.2" />
      <path d="M16.7 8.4 L14.3 10.3 L16.7 12.2" />
      <path className="mc-dot1" d="M9.2 15.4 H10.4" />
      <path className="mc-dot2" d="M11.6 15.4 H12.8" />
      <path className="mc-dot3" d="M14 15.4 H15.2" />
    </>
  ),
  correct: (
    <>
      <path d="M7.4 9.6 Q8.5 8.2 9.6 9.6" />
      <path d="M14.4 9.6 Q15.5 8.2 16.6 9.6" />
      <path d="M7.8 15.2 A4.2 4.2 0 0 0 16.2 15.2 Z" fill="currentColor" stroke="none" />
    </>
  ),
  wrong: (
    <>
      <path d="M7.2 8.6 L9.9 10.8 L7.2 13" />
      <path d="M16.8 8.6 L14.1 10.8 L16.8 13" />
      <path d="M9.6 15.4 L10.8 16.6 L12 15.4 L13.2 16.6 L14.4 15.4" />
    </>
  ),
};

const STROKE_PROPS = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const ChipShell = () => <rect x="2" y="2.5" width="20" height="19" rx="5.5" />;

/**
 * The TruCoder mascot: the `>_<` chip. One SVG, one shared shell; state
 * changes transition as a two-layer crossfade (old face out, new face in
 * with a pop/shake). Ambient animations (blink, loader dots) live on the
 * face paths so they never fight the layer transition. Wrapper color tints
 * the whole mascot — pass color: var(--err) for failure states if wanted.
 */
export default function Mascot({
  state = "idle",
  size = 24,
  className = "",
}: {
  state?: MascotState;
  size?: number;
  className?: string;
}) {
  const [shown, setShown] = useState<MascotState>(state);
  const [leaving, setLeaving] = useState<MascotState | null>(null);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      setShown(state);
      return;
    }
    if (state === shown) return;
    setLeaving(shown);
    setShown(state);
    const t = setTimeout(() => setLeaving(null), 260);
    return () => clearTimeout(t);
  }, [state, shown]);

  const layer = (s: MascotState, key: string) => (
    <svg
      key={key}
      className={`mc-face mc-face-${s} ${key === "old" ? "mc-leaving" : ""}`}
      viewBox="0 0 24 24"
      aria-hidden="true"
      {...STROKE_PROPS}
    >
      <ChipShell />
      {FACES[s]}
    </svg>
  );

  return (
    <span
      className={`mascot mascot-${state} ${leaving ? "mascot-switching" : ""} ${className}`}
      style={{ width: size, height: size }}
    >
      {leaving ? layer(leaving, "old") : null}
      {layer(shown, "new")}
    </span>
  );
}
