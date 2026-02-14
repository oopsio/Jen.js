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

import { createServer as createHttpServer } from "node:http";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { existsSync } from "node:fs";

import { createApp } from "@src/server/app.js";
import { log } from "@src/shared/log.js";
import { printBanner } from "@src/cli/banner.js";
import { createServer as createViteServer, build as buildWithVite } from "vite";

let config: any = null;

async function loadConfig() {
  try {
    // Try loading config from CWD first (for examples)
    const cwdConfigPath = resolve(process.cwd(), "jen.config.js");
    if (existsSync(cwdConfigPath)) {
      config = (await import(cwdConfigPath)).default;
    } else {
      // Fall back to root config
      config = (await import(resolve(process.cwd(), "../../jen.config.js"))).default;
    }
  } catch (e) {
    // Final fallback  
    config = (await import("./jen.config.js")).default;
  }
}

const mode = process.argv[2] ?? "dev";
const isDev = mode === "dev";

async function main() {
  await loadConfig();

  let viteServer: any = null;

  // Initialize Vite server in dev mode
  if (isDev) {
    viteServer = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          protocol: "ws",
          host: config.server.hostname,
          port: config.server.port,
        },
      },
      appType: "spa",
    });
  }

  const app = await createApp({
    config,
    mode: isDev ? "dev" : "prod",
    viteServer,
  });

  const server = createHttpServer(async (req, res) => {
    try {
      // In dev mode, use Vite middleware for HMR and module serving
      if (isDev && viteServer) {
        // Let Vite handle HMR and module requests
        viteServer.middlewares(req, res, () => {
          // If Vite didn't handle it, pass to app
          app.handle(req, res).catch((err: any) => {
            res.statusCode = 500;
            res.setHeader("content-type", "text/plain; charset=utf-8");
            res.end("Internal Server Error\n\n" + (err?.stack ?? String(err)));
          });
        });
      } else {
        await app.handle(req, res);
      }
    } catch (err: any) {
      res.statusCode = 500;
      res.setHeader("content-type", "text/plain; charset=utf-8");
      res.end("Internal Server Error\n\n" + (err?.stack ?? String(err)));
    }
  });

  server.listen(config.server.port, config.server.hostname, () => {
    printBanner(config.server.port, isDev ? "development" : "production");
  });

  process.on("SIGINT", async () => {
    log.warn("SIGINT received, shutting down...");
    if (viteServer) {
      await viteServer.close();
    }
    server.close(() => process.exit(0));
  });
}

async function buildOnly() {
  await loadConfig();
  try {
    log.info("Building with Vite...");
    await buildWithVite({
      build: {
        outDir: config.distDir || "dist",
        minify: "terser",
        sourcemap: false,
        rollupOptions: {
          output: {
            manualChunks: {
              vendor: ["preact"],
            },
          },
        },
      },
    });
    log.info("Build complete!");
  } catch (err: any) {
    log.error("Build failed:", err.message);
    process.exit(1);
  }
}

if (mode === "build") {
  buildOnly();
} else {
  main();
}
