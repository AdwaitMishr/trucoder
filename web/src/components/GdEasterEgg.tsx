import { GdStage } from "./Loader";

/**
 * Bottom-of-page easter egg: scroll past the last content and extra
 * space opens with the Geometry Dash loop running and the wordmark
 * below it. Purely decorative (aria-hidden).
 */
export default function GdEasterEgg() {
  return (
    <section className="gd-ee" aria-hidden="true">
      <GdStage />
      <div className="gd-brand">
        <span className="brand-tru">tru</span>
        <span className="brand-coder">coder</span>
      </div>
      <div className="gd-build">build {__BUILD_COMMIT__}</div>
    </section>
  );
}
