import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Inject the git commit the bundle was built from — shown in the GD
// easter egg ("build <sha>") so the deployed version is always verifiable.
function buildCommit(): string {
  try {
    return execSync("git rev-parse --short HEAD", { cwd: fileURLToPath(new URL("..", import.meta.url)) })
      .toString()
      .trim();
  } catch {
    return "dev";
  }
}

export default defineConfig({
  define: {
    __BUILD_COMMIT__: JSON.stringify(buildCommit()),
  },
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
