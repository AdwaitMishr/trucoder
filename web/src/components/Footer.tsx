import { PiTerminal } from "react-icons/pi";

export default function Footer() {
  return (
    <footer className="footer">
      <span className="brand-mark">
        <PiTerminal size={13} />
      </span>
      <span className="footer-brand">trucoder</span>
      <span className="muted">· learn by doing ·</span>
    </footer>
  );
}
