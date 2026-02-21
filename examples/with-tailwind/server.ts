/*
 * This file is part of Jen.js.
 * Copyright (C) 2026 oopsio
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

#!/usr/bin/env node
/**
 * Development server for Jen.js blog example
 * Fully TypeScript + TSX compatible
 */

import "esbuild-register"; // <-- Just import to hook TS/TSX support
import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// -----------------------------------------------------------------------------
// 1️⃣ Directory helpers
// -----------------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const blogDir = dirname(__filename);
const exampleDir = dirname(blogDir);
const rootDir = dirname(exampleDir);

const mode = process.argv[2] ?? "dev";
const isDev = mode === "dev";

// -----------------------------------------------------------------------------
// 2️⃣ Main server function
// -----------------------------------------------------------------------------
async function main() {
  console.log(`[SERVER] Starting in ${isDev ? "DEV" : "PROD"} mode...`);

  // Load blog config directly (TSX/TS supported by esbuild-register)
  const configPath = join(blogDir, "jen.config.ts");
  const configModule = await import(pathToFileURL(configPath).href);
  const config = configModule.default;

  // Load framework app creator
  const appPath = join(rootDir, "src/server/app.ts"); // your server app can be TS
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

// -----------------------------------------------------------------------------
// 3️⃣ Start the server
// -----------------------------------------------------------------------------
main().catch((err) => {
  console.error("[SERVER] ❌ Error:", err);
  process.exit(1);
});
