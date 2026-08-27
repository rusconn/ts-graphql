import { builtinModules } from "node:module";

import { defineConfig } from "vite";

import { dependencies } from "./package.json" with { type: "json" };

export default defineConfig({
  build: {
    target: "es2023",
    sourcemap: true,
    rollupOptions: {
      external: [/^node:.+/, ...builtinModules, ...Object.keys(dependencies)],
    },
    lib: {
      entry: {
        server: "src/app/server",
        instrumentation: "src/instrumentation",
      },
      fileName: "[name]",
      formats: ["es"],
    },
  },
  define: {
    "import.meta.vitest": "undefined",
  },
});
