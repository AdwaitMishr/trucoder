import { useEffect, useState } from "react";
import {
  PiXBold,
  PiCode,
  PiKeyboard,
  PiFlask,
  PiPalette,
  PiWarning,
} from "react-icons/pi";
import {
  FONT_PRESETS,
  useSettings,
  type EditorSettings,
} from "../settings";
import ThemeSelector from "./ThemeSelector";

type Section = "editor" | "shortcuts" | "advanced" | "theme";

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      className={`toggle ${on ? "on" : ""}`}
      onClick={() => onChange(!on)}
    >
      <span className="toggle-knob" />
    </button>
  );
}

function Select<T extends string | number>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <select
      className="settings-select"
      value={String(value)}
      onChange={(e) => {
        const raw = e.target.value;
        const opt = options.find((o) => String(o.value) === raw);
        if (opt) onChange(opt.value);
      }}
    >
      {options.map((o) => (
        <option key={String(o.value)} value={String(o.value)}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function Row({
  label,
  desc,
  children,
}: {
  label: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="settings-row">
      <div>
        <div className="settings-label">{label}</div>
        {desc && <div className="settings-desc">{desc}</div>}
      </div>
      {children}
    </div>
  );
}

const SHORTCUTS: { keys: string; action: string }[] = [
  { keys: "Ctrl/⌘ + Enter", action: "run — visible public tests" },
  { keys: "Ctrl/⌘ + Shift + Enter", action: "submit — public + hidden tests" },
  { keys: "Ctrl/⌘ + Shift + Z", action: "toggle zen mode" },
  { keys: "Esc", action: "close dialogs" },
];

const SITE_SHORTCUTS: { keys: string; action: string }[] = [
  { keys: "Ctrl/⌘ + K", action: "command palette — search anything" },
  { keys: "Ctrl/⌘ + Shift + T", action: "theme selector" },
];

export default function SettingsModal({
  open,
  onClose,
  initialTab = "editor",
}: {
  open: boolean;
  onClose: () => void;
  initialTab?: Section;
}) {
  const [section, setSection] = useState<Section>("editor");

  useEffect(() => {
    if (open) setSection(initialTab);
  }, [open, initialTab]);
  const { settings, update, reset } = useSettings();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-label="settings">
        <div className="modal-sidebar">
          <h2>Settings</h2>
          <button
            className={section === "editor" ? "active" : ""}
            onClick={() => setSection("editor")}
          >
            <PiCode size={15} /> Code Editor
          </button>
          <button
            className={section === "theme" ? "active" : ""}
            onClick={() => setSection("theme")}
          >
            <PiPalette size={15} /> Theme
          </button>
          <button
            className={section === "shortcuts" ? "active" : ""}
            onClick={() => setSection("shortcuts")}
          >
            <PiKeyboard size={15} /> Shortcuts
          </button>
          <button
            className={section === "advanced" ? "active" : ""}
            onClick={() => setSection("advanced")}
          >
            <PiFlask size={15} /> Advanced
          </button>
        </div>

        <div className="modal-main">
          <div className="modal-head">
            <h3>
              {section === "editor"
                ? "Code Editor"
                : section === "theme"
                  ? "Theme"
                  : section === "shortcuts"
                    ? "Shortcuts"
                    : "Advanced"}
            </h3>
            <button className="ghost" onClick={onClose} title="close">
              <PiXBold size={16} />
            </button>
          </div>

          {section === "editor" && (
            <div className="settings-body">
              <Row label="Font">
                <Select
                  value={settings.font}
                  options={FONT_PRESETS.map((f) => ({ value: f, label: f }))}
                  onChange={(font) => update({ font })}
                />
              </Row>
              <Row label="Font size">
                <Select
                  value={settings.fontSize}
                  options={[12, 13, 14, 15, 16, 18, 20, 22].map((n) => ({
                    value: n,
                    label: `${n}px`,
                  }))}
                  onChange={(fontSize) => update({ fontSize })}
                />
              </Row>
              <Row label="Font ligatures" desc="connects character pairs (fi, ->, =>)">
                <Toggle
                  on={settings.ligatures}
                  onChange={(v) => update({ ligatures: v })}
                />
              </Row>
              <Row label="Key binding" desc="vi-style modal editing">
                <Select<EditorSettings["keyBinding"]>
                  value={settings.keyBinding}
                  options={[
                    { value: "standard", label: "Standard" },
                    { value: "vim", label: "Vim" },
                  ]}
                  onChange={(keyBinding) => update({ keyBinding })}
                />
              </Row>
              <Row label="Tab size">
                <Select<EditorSettings["tabSize"]>
                  value={settings.tabSize}
                  options={[
                    { value: 2, label: "2 spaces" },
                    { value: 4, label: "4 spaces" },
                    { value: 8, label: "8 spaces" },
                  ]}
                  onChange={(tabSize) => update({ tabSize })}
                />
              </Row>
              <Row label="Word wrap" desc="wrap long lines instead of scrolling">
                <Toggle
                  on={settings.wordWrap}
                  onChange={(v) => update({ wordWrap: v })}
                />
              </Row>
              <Row label="Relative line numbers" desc="count lines from the cursor">
                <Toggle
                  on={settings.relativeLineNumbers}
                  onChange={(v) => update({ relativeLineNumbers: v })}
                />
              </Row>
            </div>
          )}

          {section === "theme" && (
            <div className="settings-body">
              <ThemeSelector inline />
            </div>
          )}

          {section === "shortcuts" && (
            <div className="settings-body">
              <div className="settings-note">Site-wide (work anywhere):</div>
              {SITE_SHORTCUTS.map((s) => (
                <div key={s.keys} className="shortcut-row">
                  <kbd>{s.keys}</kbd>
                  <span>{s.action}</span>
                </div>
              ))}
              <div className="settings-note">While the editor is focused:</div>
              {SHORTCUTS.map((s) => (
                <div key={s.keys} className="shortcut-row">
                  <kbd>{s.keys}</kbd>
                  <span>{s.action}</span>
                </div>
              ))}
            </div>
          )}

          {section === "advanced" && (
            <div className="settings-body">
              <div className="settings-note">
                <PiWarning size={13} />
                <span>
                  Settings are stored in this browser only (localStorage). They
                  do not follow you across devices.
                </span>
              </div>
              <Row label="Reset all settings" desc="back to factory defaults">
                <button className="btn run" onClick={reset}>
                  reset
                </button>
              </Row>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
