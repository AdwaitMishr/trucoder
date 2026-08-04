import Editor from "@monaco-editor/react";
import { useTheme } from "../theme";
import type { Lang } from "../types";

const MONACO_LANG: Record<Lang, string> = {
  java: "java",
  javascript: "javascript",
  python: "python",
};

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

  return (
    <Editor
      height="100%"
      language={MONACO_LANG[language]}
      value={value}
      onChange={(v) => onChange(v ?? "")}
      theme={monacoTheme}
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
