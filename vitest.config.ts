import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    /** E2E usa `dist/cli.js`; correr `npm run test:e2e` após build. */
    exclude: ["**/node_modules/**", "**/dist/**", "tests/e2e/**"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: ["src/cli.ts", "**/*.d.ts", "**/*.config.*"],
      reporter: ["text", "text-summary", "html"],
      reportsDirectory: "./coverage",
    },
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
