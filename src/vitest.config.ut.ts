import { defineProject } from "vitest/config";

export default defineProject({
  test: {
    name: "ut",
    includeSource: ["**/*.ts"],
    exclude: ["**/*.test.ts"],
    globals: true,
    isolate: false,
  },
});
