import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // monaco-vim's dist imports this bare subpath, which monaco's exports
      // map cannot resolve; point it at a shim that re-exports the same
      // monaco instance (see src/monaco-shim.ts).
      "monaco-editor/esm/vs/editor/editor.api": fileURLToPath(
        new URL("./src/monaco-shim.ts", import.meta.url)
      ),
    },
  },
  server: {
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        // monaco is big (~4MB) and rarely changes — own chunk = better caching
        manualChunks: {
          monaco: ["monaco-editor"],
        },
      },
    },
  },
});
