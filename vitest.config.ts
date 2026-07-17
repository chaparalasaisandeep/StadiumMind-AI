import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./tests/setup.tsx",
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/tests/e2e/**",
      "**/.{idea,git,cache,output,temp}/**"
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/**",
        "dist/**",
        "tests/**",
        "server.ts",
        "server-ai.ts",
        "vite.config.ts",
        "vitest.config.ts",
        "playwright.config.ts",
        "src/main.tsx",
      ],
      thresholds: {
        statements: 90,
        branches: 65,
        functions: 90,
        lines: 90,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
