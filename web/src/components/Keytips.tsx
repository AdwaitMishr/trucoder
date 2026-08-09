/** Muted keybind hints at the bottom of the app shell — monkeytype's
 *  Keytips pattern ("tab + enter - restart test"), kept quiet. */

const TIPS: { keys: string; label: string }[] = [
  { keys: "⌘ K", label: "commands" },
  { keys: "⌘ ⇧ T", label: "theme" },
  { keys: "⌘ ↵", label: "run" },
  { keys: "⌘ ⇧ ↵", label: "submit" },
];

export default function Keytips() {
  return (
    <div className="keytips" aria-hidden="true">
      {TIPS.map((t) => (
        <span className="keytip" key={t.label}>
          <span className="keytip-keys">
            {t.keys.split(" ").map((k) => (
              <kbd key={k}>{k}</kbd>
            ))}
          </span>
          <span className="keytip-label">{t.label}</span>
        </span>
      ))}
    </div>
  );
}
