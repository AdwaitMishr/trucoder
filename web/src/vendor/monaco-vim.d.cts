// Minimal types for the vendored, patched monaco-vim UMD build.
export interface VimAdapter {
  dispose(): void;
  on(event: string, cb: (...args: any[]) => void): void;
  setStatusBar(statusBar: any): void;
}
export function initVimMode(
  editor: any,
  statusbarNode?: HTMLElement | null
): VimAdapter;
export const StatusBar: any;
export const VimMode: any;
