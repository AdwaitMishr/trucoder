import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { useTheme } from "../theme";
import { THEMES, type ThemeDef } from "../themes";
import { FONT_STACKS, useSettings } from "../settings";

const MONACO_LANG: Record<string, string> = {
  java: "java",
  javascript: "javascript",
  typescript: "typescript",
  python: "python",
  cpp: "cpp",
};

function hexToRgba(hex: string, a: number): string {
  const n = hex.replace("#", "");
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

/** Monaco only accepts theme names matching [a-zA-Z0-9-]. Ported monkeytype
 *  ids contain underscores (rose_pine, miami_nights, ...) which make
 *  defineTheme throw "Illegal theme name!" and kill the editor. Sanitized
 *  names must stay unique: modern-dolch-light and modern_dolch_light both
 *  collapse to the same name, so later duplicates get a -2 suffix. */
const monacoNameById = new Map<string, string>();
{
  const seen = new Map<string, number>();
  for (const t of THEMES) {
    const base = `trucoder-${t.id.replace(/[^a-zA-Z0-9-]/g, "-")}`;
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    monacoNameById.set(t.id, n === 0 ? base : `${base}-${n + 1}`);
  }
}
const monacoThemeName = (id: string) => monacoNameById.get(id) ?? `trucoder-${id}`;

/** Build a Monaco editor theme that mirrors a TruCoder theme: the chrome
 *  (background, foreground, caret, selection, line numbers, gutter, widgets)
 *  is tinted from the theme palette while token colors are inherited from the
 *  matching light/dark base so syntax highlighting stays crisp. */
function defineEditorTheme(monaco: any, t: ThemeDef) {
  const c = t.colors;
  monaco.editor.defineTheme(monacoThemeName(t.id), {
    base: t.kind === "dark" ? "vs-dark" : "vs",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": c.bg,
      "editor.foreground": c.ink,
      "editorCursor.foreground": c.caret,
      "editor.selectionBackground": hexToRgba(c.accent, 0.28),
      "editor.inactiveSelectionBackground": hexToRgba(c.accent, 0.1),
      "editor.lineHighlightBackground": c.surface2,
      "editorLineNumber.foreground": c.muted,
      "editorLineNumber.activeForeground": c.ink,
      "editorGutter.background": c.bg,
      "editorWidget.background": c.surface,
      "editorWidget.border": c.hairline,
      "editorIndentGuide.background1": c.hairline,
      "editorIndentGuide.activeBackground1": hexToRgba(c.muted, 0.5),
      "scrollbarSlider.background": hexToRgba(c.muted, 0.3),
      "scrollbarSlider.hoverBackground": hexToRgba(c.muted, 0.45),
    },
  });
}

/** Turn off Monaco's JS/TS diagnostics. The sandbox (not Monaco) is the judge,
 *  and the harness stubs are fragments (and start with unused parameters), so
 *  its type-checking only produces spurious squiggles on valid code. */
function disableDiagnostics(monaco: any) {
  try {
    ["javascript", "typescript"].forEach((kind) => {
      const defaults = monaco.languages.typescript[`${kind}Defaults`];
      defaults.setDiagnosticsOptions({
        noSemanticValidation: true,
        noSyntaxValidation: true,
      });
      defaults.setCompilerOptions({
        noUnusedLocals: false,
        noUnusedParameters: false,
      });
    });
  } catch {
    /* non-fatal */
  }
}

/** Clear every marker currently on the model (by owner), so no squiggles show. */
function clearMarkers(monaco: any, model: any) {
  try {
    const marks: any[] = monaco.editor.getModelMarkers({ resource: model.uri });
    const owners = [...new Set(marks.map((m: any) => m.owner))];
    owners.forEach((o) => monaco.editor.setModelMarkers(model, o, []));
  } catch {
    /* non-fatal */
  }
}

export default function CodeEditor({
  language,
  value,
  onChange,
}: {
  language: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const { theme } = useTheme();
  const { settings } = useSettings();
  const editorRef = useRef<any>(null);
  const statusRef = useRef<HTMLDivElement | null>(null);
  const vimRef = useRef<any>(null);
  const [editorReady, setEditorReady] = useState(false);

  // When the language switches, Monaco's worker re-evaluates the model and can
  // add diagnostics asynchronously — disable them and clear any that appear.
  useEffect(() => {
    const monaco = (window as any).__tcMonaco;
    const ed = (window as any).__tcEditor;
    if (!monaco || !ed) return;
    disableDiagnostics(monaco);
    const model = ed.getModel();
    if (!model) return;
    clearMarkers(monaco, model);
    const t = setTimeout(() => clearMarkers(monaco, model), 500);
    return () => clearTimeout(t);
  }, [language]);

  // Vim key bindings (monaco-vim). Loaded lazily — the chunk only downloads
  // when vim mode is enabled. Runs when the setting changes or the editor
  // finishes mounting (the editor arrives asynchronously after first render).
  useEffect(() => {
    if (!editorReady) return;
    const ed = editorRef.current;
    if (!ed) return;
    if (settings.keyBinding === "vim") {
      let cancelled = false;
      import("../vendor/monaco-vim.cjs")
        .then(({ initVimMode }) => {
          if (cancelled || !editorRef.current) return;
          vimRef.current?.dispose?.();
          vimRef.current = initVimMode(editorRef.current, statusRef.current);
        })
        .catch((err) => {
          console.warn("vim mode failed to load:", err);
        });
      return () => {
        cancelled = true;
        vimRef.current?.dispose?.();
        vimRef.current = null;
      };
    }
    vimRef.current?.dispose?.();
    vimRef.current = null;
  }, [settings.keyBinding, editorReady]);

  function beforeMount(monaco: any) {
    (window as any).__tcMonaco = monaco;
    THEMES.forEach((t) => defineEditorTheme(monaco, t));
    disableDiagnostics(monaco);
  }

  function handleMount(editor: any, monaco: any) {
    editorRef.current = editor;
    (window as any).__tcEditor = editor;
    disableDiagnostics(monaco);
    const model = editor.getModel?.();
    if (model) {
      clearMarkers(monaco, model);
      setTimeout(() => clearMarkers(monaco, model), 500);
    }
    setEditorReady(true);
  }

  return (
    <div className="editor-surface">
      <Editor
        height="100%"
        language={MONACO_LANG[language] ?? "javascript"}
        value={value}
        onChange={(v) => onChange(v ?? "")}
        theme={monacoThemeName(theme.id)}
        beforeMount={beforeMount}
        onMount={handleMount}
        options={{
          fontFamily: FONT_STACKS[settings.font],
          fontSize: settings.fontSize,
          fontLigatures: settings.ligatures,
          tabSize: settings.tabSize,
          insertSpaces: true,
          wordWrap: settings.wordWrap ? "on" : "off",
          lineNumbers: settings.relativeLineNumbers ? "relative" : "on",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 14, bottom: 14 },
          cursorBlinking: "smooth",
        }}
      />
      <div ref={statusRef} className="vim-statusbar" />
    </div>
  );
}
