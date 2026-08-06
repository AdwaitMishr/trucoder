// monaco-vim imports "monaco-editor/esm/vs/editor/editor.api" and uses its
// named exports (KeyCode, editor, Position, ...). That subpath fails monaco's
// exports-map resolution (no .js extension, no default export), so this shim
// bridges it to the same monaco instance the app uses — one monaco, no
// duplication. The named re-exports mirror editor.api's export list.
import * as monaco from "monaco-editor";

export default monaco;
export const KeyCode = monaco.KeyCode;
export const KeyMod = monaco.KeyMod;
export const editor = monaco.editor;
export const languages = monaco.languages;
export const Position = monaco.Position;
export const Range = monaco.Range;
export const Selection = monaco.Selection;
export const SelectionDirection = monaco.SelectionDirection;
export const Token = monaco.Token;
export const Uri = monaco.Uri;
export const Emitter = monaco.Emitter;
export const CancellationTokenSource = monaco.CancellationTokenSource;
export const MarkerSeverity = monaco.MarkerSeverity;
export const MarkerTag = monaco.MarkerTag;
