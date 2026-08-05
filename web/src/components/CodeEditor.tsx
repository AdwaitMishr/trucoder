import { useEffect } from "react";
import Editor from "@monaco-editor/react";
import { useTheme } from "../theme";
import type { Lang } from "../types";

const MONACO_LANG: Record<Lang, string> = {
  java: "java",
  javascript: "javascript",
  python: "python",
};

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
  language: Lang;
  value: string;
  onChange: (v: string) => void;
}) {
  const { theme } = useTheme();
  const monacoTheme = theme.kind === "dark" ? "vs-dark" : "vs";

  // When the language switches, Monaco's worker re-evaluates the model and can
  // add diagnostics asynchronously — disable them and clear any that appear,
  // including ones the worker emits a beat after the switch.
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

  function handleMount(editor: any, monaco: any) {
    (window as any).__tcEditor = editor;
    (window as any).__tcMonaco = monaco;
    disableDiagnostics(monaco);
    const model = editor.getModel?.();
    if (model) {
      clearMarkers(monaco, model);
      setTimeout(() => clearMarkers(monaco, model), 500);
    }
  }

  return (
    <Editor
      height="100%"
      language={MONACO_LANG[language]}
      value={value}
      onChange={(v) => onChange(v ?? "")}
      theme={monacoTheme}
      onMount={handleMount}
      options={{
        fontSize: 14,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 4,
        padding: { top: 14, bottom: 14 },
        cursorBlinking: "smooth",
        fontFamily: "ui-monospace, 'SF Mono', 'JetBrains Mono', Menlo, Consolas, monospace",
      }}
    />
  );
}
