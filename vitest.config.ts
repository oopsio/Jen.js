import { defineConfig } from "vitest/config";
import path from "path";
import { fileURLToPath } from "url";

// Fix for __dirname in ESM environments
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  test: {
    reporters: ["default"],
    environment: "node",
    globals: true,
    include: ["tests/**/*.test.ts", "tests/**/*.spec.ts"],
    coverage: {
      provider: "v8", // You must specify a provider: 'v8' or 'istanbul'
      reporter: ["json"],
      reportsDirectory: "./coverage/json", // cleaner to put it in a subfolder
      exclude: ["node_modules/", "tests/"],
    },
  },
  resolve: {
    alias: {
      "@src": path.resolve(__dirname, "./src"),
    },
  },
});
