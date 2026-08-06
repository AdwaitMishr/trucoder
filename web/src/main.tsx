import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
// monaco-editor's package.json exports map blocks bare subpath + ?worker
// imports, so resolve the worker file relative to src instead.
import editorWorker from "../node_modules/monaco-editor/esm/vs/editor/editor.worker.js?worker";
import App from "./App";
import { ThemeProvider } from "./theme";
import { SettingsProvider } from "./settings";
import "./styles.css";

// Use the locally bundled monaco (no runtime CDN fetch) and route every
// worker to the editor worker — syntax highlighting works fine; language
// services (IntelliSense) are disabled anyway because the sandbox judges.
(self as any).MonacoEnvironment = {
  getWorker: () => new editorWorker(),
};
loader.config({ monaco });

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <SettingsProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </SettingsProvider>
    </ThemeProvider>
  </React.StrictMode>
);
