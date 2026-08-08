import Mascot from "./Mascot";

/**
 * The one loader every screen shares. The mascot runs a Geometry Dash
 * level: the level strip scrolls left, the chip jumps spikes with a full
 * 360° spin and lands flat on its face, wordmark below the stage.
 *
 * Performance: pure CSS transforms only (translate3d / rotate / scale) —
 * two composited layers (the level strip, the cube), zero layout or paint
 * per frame. The loop is seamless: the strip is 200% wide with a 100%
 * pattern period, so translateX(-50%) wraps identically.
 */
export default function Loader() {
  return (
    <div className="gd-center" role="status" aria-label="loading">
      <div className="gd-stack">
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
        <div className="gd-brand" aria-hidden="true">
          <span className="brand-tru">tru</span>
          <span className="brand-coder">coder</span>
        </div>
      </div>
    </div>
  );
}
