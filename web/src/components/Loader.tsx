import Mascot from "./Mascot";

/**
 * The one loader every screen shares. The mascot runs a Geometry Dash
 * level: the level strip scrolls left, the chip jumps spikes, flips
 * through a gravity portal and shrinks through a mini portal.
 *
 * Performance: pure CSS transforms only (translate3d / rotate / scale) —
 * two composited layers (the level strip, the cube), zero layout or paint
 * per frame. The loop is seamless: the strip is 200% wide with a 100%
 * pattern period, so translateX(-50%) wraps identically.
 */
export default function Loader() {
  return (
    <div className="gd-center" role="status" aria-label="loading">
      <div className="gd-stage">
        <div className="gd-level" aria-hidden="true">
          {/* one pattern period: spike, spike (repeats at +50% for the wrap) */}
          <span className="gd-spike" style={{ left: "40%" }} />
          <span className="gd-spike" style={{ left: "55%" }} />
          <span className="gd-spike" style={{ left: "90%" }} />
          <span className="gd-spike" style={{ left: "105%" }} />
        </div>
        <div className="gd-ground" aria-hidden="true" />
        <div className="gd-cube">
          <Mascot state="running" size={26} />
        </div>
      </div>
    </div>
  );
}
