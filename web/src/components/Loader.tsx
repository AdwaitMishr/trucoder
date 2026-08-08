import Mascot from "./Mascot";

/**
 * The one loader every screen shares: the trucoder wordmark with a
 * left-to-right shine sweep (the old GD level now lives in the
 * bottom-of-page easter egg — components/GdEasterEgg.tsx).
 *
 * Performance: the sweep animates background-position only — no layout,
 * no paint of the text itself. Reduced motion -> static wordmark.
 */
export default function Loader() {
  return (
    <div className="ld-center" role="status" aria-label="loading">
      <span className="ld-word">trucoder</span>
    </div>
  );
}

/**
 * The Geometry Dash stage (level strip + jumping cube). Used by the
 * bottom-of-page easter egg so the loop keeps running after a load.
 * Transforms only: two composited layers, zero layout/paint per frame.
 */
export function GdStage() {
  return (
    <div className="gd-stage">
      <div className="gd-level" aria-hidden="true">
        {/* spikes every 64px: exactly 3 visible in the 128px window at
            any scroll position; four passages per loop (10/35/60/85%) */}
        <span className="gd-spike" style={{ left: "0%" }} />
        <span className="gd-spike" style={{ left: "16.67%" }} />
        <span className="gd-spike" style={{ left: "33.33%" }} />
        <span className="gd-spike" style={{ left: "50%" }} />
        <span className="gd-spike" style={{ left: "66.67%" }} />
        <span className="gd-spike" style={{ left: "83.33%" }} />
        <span className="gd-spike" style={{ left: "100%" }} />
      </div>
      <div className="gd-cube">
        <Mascot state="running" size={16} />
      </div>
    </div>
  );
}
