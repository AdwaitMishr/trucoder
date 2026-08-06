import { useState } from "react";
import {
  PiCode,
  PiKeyboard,
  PiFlask,
  PiWarning,
} from "react-icons/pi";
import { XIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  FONT_PRESETS,
  useSettings,
  type EditorSettings,
} from "../settings";

type Section = "editor" | "shortcuts" | "advanced";

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
      <div className="settings-row-text">
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

export default function SettingsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { settings, update, reset } = useSettings();
  const [section, setSection] = useState<Section>("editor");

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="settings-dialog" showCloseButton={false}>
        <Tabs
          orientation="vertical"
          value={section}
          onValueChange={(v) => setSection(v as Section)}
          className="settings-tabs"
        >
          <TabsList className="settings-tablist">
            <TabsTrigger value="editor">
              <PiCode size={15} />
              <span>Code Editor</span>
            </TabsTrigger>
            <TabsTrigger value="shortcuts">
              <PiKeyboard size={15} />
              <span>Shortcuts</span>
            </TabsTrigger>
            <TabsTrigger value="advanced">
              <PiFlask size={15} />
              <span>Advanced</span>
            </TabsTrigger>
          </TabsList>

          <div className="settings-panel">
            <DialogHeader className="settings-head">
              <DialogTitle>
                {section === "editor"
                  ? "Code Editor"
                  : section === "shortcuts"
                    ? "Shortcuts"
                    : "Advanced"}
              </DialogTitle>
              <DialogClose className="settings-close" title="close">
                <XIcon size={16} />
              </DialogClose>
            </DialogHeader>

            <TabsContent value="editor" className="settings-body">
              <Row label="Font">
                <Select
                  value={settings.font}
                  onValueChange={(font) =>
                    update({ font: font as EditorSettings["font"] })
                  }
                >
                  <SelectTrigger className="settings-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_PRESETS.map((f) => (
                      <SelectItem key={f} value={f}>
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Row>
              <Row label="Font size">
                <Select
                  value={String(settings.fontSize)}
                  onValueChange={(v) => update({ fontSize: Number(v) })}
                >
                  <SelectTrigger className="settings-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[12, 13, 14, 15, 16, 18, 20, 22].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}px
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Row>
              <Row label="Font ligatures" desc="connects character pairs (fi, ->, =>)">
                <Switch
                  checked={settings.ligatures}
                  onCheckedChange={(v) => update({ ligatures: v })}
                />
              </Row>
              <Row label="Key binding" desc="vi-style modal editing">
                <Select
                  value={settings.keyBinding}
                  onValueChange={(v) =>
                    update({ keyBinding: v as EditorSettings["keyBinding"] })
                  }
                >
                  <SelectTrigger className="settings-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="vim">Vim</SelectItem>
                  </SelectContent>
                </Select>
              </Row>
              <Row label="Tab size">
                <Select
                  value={String(settings.tabSize)}
                  onValueChange={(v) =>
                    update({ tabSize: Number(v) as EditorSettings["tabSize"] })
                  }
                >
                  <SelectTrigger className="settings-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 spaces</SelectItem>
                    <SelectItem value="4">4 spaces</SelectItem>
                    <SelectItem value="8">8 spaces</SelectItem>
                  </SelectContent>
                </Select>
              </Row>
              <Row label="Word wrap" desc="wrap long lines instead of scrolling">
                <Switch
                  checked={settings.wordWrap}
                  onCheckedChange={(v) => update({ wordWrap: v })}
                />
              </Row>
              <Row
                label="Relative line numbers"
                desc="count lines from the cursor"
              >
                <Switch
                  checked={settings.relativeLineNumbers}
                  onCheckedChange={(v) => update({ relativeLineNumbers: v })}
                />
              </Row>
            </TabsContent>

            <TabsContent value="shortcuts" className="settings-body">
              <div className="settings-note">
                These shortcuts work while the editor is focused.
              </div>
              {SHORTCUTS.map((s) => (
                <div key={s.keys} className="shortcut-row">
                  <kbd>{s.keys}</kbd>
                  <span>{s.action}</span>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="advanced" className="settings-body">
              <div className="settings-note">
                <PiWarning size={13} />
                <span>
                  Settings are stored in this browser only (localStorage). They
                  do not follow you across devices.
                </span>
              </div>
              <Row label="Reset all settings" desc="back to factory defaults">
                <Button variant="destructive" size="sm" onClick={reset}>
                  reset
                </Button>
              </Row>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
