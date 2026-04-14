import { defineConfig } from "vitest/config";

/** Testes E2E (subprocesso `node dist/cli.js`). Correr após `npm run build`. */
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/e2e/**/*.test.ts"],
  },
});
