import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.tsx"],
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["node_modules", ".next", "out", "build", "dist"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/**/*.test.{ts,tsx}",
        "vitest.setup.tsx",
        "vitest.config.ts",
        ".next/",
        "out/",
        "build/",
        "dist/",
        "src/app/**/*.tsx", // Next.js pages/components - test logic separately
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
});