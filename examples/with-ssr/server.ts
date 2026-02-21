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

import { createApp } from "../../src/server/app.js";
import { log } from "../../src/shared/log.js";
import { printBanner } from "../../src/cli/banner.js";
import { createServer as createViteServer, build as buildWithVite } from "vite";

/**
 * Global configuration object loaded from jen.config.js.
 * Holds all framework settings including site directories, server ports, build options, etc.
 */
let config: any = null;

/**
 * Loads the Jen.js framework configuration from jen.config.js.
 * Attempts multiple resolution paths to support different project layouts:
 * 1. CWD/jen.config.js (for example projects)
 * 2. CWD/../../jen.config.js (for monorepo setups)
 * 3. ./jen.config.js (fallback to root project config)
 *
 * @throws {Error} If no configuration file is found or config is invalid
 */
async function loadConfig() {
  try {
    // Try loading config from CWD first (for examples)
    const cwdConfigPath = resolve(process.cwd(), "jen.config.js");
    if (existsSync(cwdConfigPath)) {
      // Use file URL with cache-bust for dynamic imports
      const url = new URL("file://" + cwdConfigPath.replace(/\\/g, "/"));
      url.searchParams.set("t", Date.now().toString());
      config = (await import(url.href)).default;
    } else {
      // Fall back to root config
      const rootPath = resolve(process.cwd(), "./jen.config.js");
      const url = new URL("file://" + rootPath.replace(/\\/g, "/"));
      url.searchParams.set("t", Date.now().toString());
      config = (await import(url.href)).default;
    }
  } catch (e) {
    // Final fallback
    const fallbackUrl = new URL("file://" + resolve("./jen.config.js").replace(/\\/g, "/"));
    fallbackUrl.searchParams.set("t", Date.now().toString());
    config = (await import(fallbackUrl.href)).default;
  }
}

/**
 * Determines the server mode from command line arguments.
 * Defaults to "dev" if no argument is provided.
 * "dev" = development server with HMR
 * "build" = static site generation
 * "start" = production server
 */
const mode = process.argv[2] ?? "dev";
const isDev = mode === "dev";

/**
 * Starts the development or production HTTP server.
 * In development mode, integrates Vite for Hot Module Replacement (HMR).
 * In production mode, serves pre-built static files.
 *
 * Server middleware chain:
 * 1. Vite HMR middleware (dev only)
 * 2. Application routing and rendering
 * 3. Error handling and fallback responses
 *
 * Gracefully shuts down on SIGINT (Ctrl+C).
 */
async function main() {
  await loadConfig();

  let viteServer: any = null;

  // Initialize Vite server in dev mode
  // Disabled for SSR example - Vite middleware doesn't work well with SSR routes
  // In production, use separate dev server or build step
  if (isDev && false) {
    viteServer = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
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

/**
 * Builds the site for production using Vite's build pipeline.
 * Minifies JavaScript using Terser and separates vendor code (Preact) into its own chunk.
 *
 * Output directory is configured via config.distDir or defaults to "dist".
 *
 * @throws {Error} If the build fails; exits process with code 1
 */
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
    log.error(`Build failed: ${err.message}`);
    process.exit(1);
  }
}

if (mode === "build") {
  buildOnly();
} else {
  main();
}
