#!/usr/bin/env node
/**
 * Development server for Jen.js blog example
 * Fully TypeScript + TSX compatible
 */

import "esbuild-register"; // <-- Just import to hook TS/TSX support

import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// ─────────────────────────────────────────────────────────────────────────────
// Directory helpers
// ─────────────────────────────────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const blogDir = dirname(__filename);
const mode = process.argv[2] ?? "dev";
const isDev = mode === "dev";

// ─────────────────────────────────────────────────────────────────────────────
// Main server function
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`[SERVER] Starting in ${isDev ? "DEV" : "PROD"} mode...`);

  // Load blog config directly (TSX/TS supported by esbuild-register)
  const configPath = join(blogDir, "jen.config.ts");
  const configModule = await import(pathToFileURL(configPath).href);
  const config = configModule.default;

  // Load framework app creator from lib
  const appPath = join(blogDir, "lib/server/app.js");
  const appModule = await import(pathToFileURL(appPath).href);
  const { createApp } = appModule;

  console.log(`[SERVER] Creating app...`);
  const app = await createApp({
    config,
    mode: isDev ? "dev" : "prod",
  });

  // Create HTTP server
  const server = createServer(
    async (req: IncomingMessage, res: ServerResponse) => {
      try {
        await app.handle(req, res);
      } catch (err: any) {
        res.statusCode = 500;
        res.setHeader("content-type", "text/plain; charset=utf-8");
        res.end("Internal Server Error\n\n" + (err?.stack ?? String(err)));
        console.error("[SERVER] Error in request:", err);
      }
    },
  );

  server.listen(config.server.port, config.server.hostname, () => {
    console.log(
      `[SERVER] ✅ Running on http://${config.server.hostname}:${config.server.port} (${isDev ? "DEV" : "PROD"})`,
    );
  });

  process.on("SIGINT", () => {
    console.log("[SERVER] Shutting down...");
    server.close(() => process.exit(0));
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Start the server
// ─────────────────────────────────────────────────────────────────────────────

main().catch((err) => {
  console.error("[SERVER] ❌ Error:", err);
  process.exit(1);
});
