import { defineProject } from "vitest/config";

export default defineProject({
  test: {
    name: "e2e",
    include: ["**/*.test.ts"],
    setupFiles: ["setup.ts"],
    maxWorkers: 1,
    globals: true,
    isolate: false,
  },
});
