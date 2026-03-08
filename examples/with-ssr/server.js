import { createServer as createHttpServer } from "node:http";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { existsSync } from "node:fs";
import net from "node:net";

import { createApp } from "../../dist/src/server/app.js";
import { log } from "../../dist/src/shared/log.js";
import { printBanner } from "../../dist/src/cli/banner.js";
import { createServer as createViteServer, build as buildWithVite } from "vite";
import { injectFonts } from "../../dist/src/fonts/inject.js";
import { GracefulShutdown } from "../../dist/src/core/lifecycle.js";

/**
 * Find an available port (Windows fix for port 0 reservation issues)
 */
function findAvailablePort(hostname = "127.0.0.1") {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, hostname, () => {
      const port = server.address().port;
      server.close(() => {
        // Delay before using the port to avoid Windows TIME_WAIT race condition
        setTimeout(() => resolve(port), 500);
      });
    });
    server.on("error", reject);
  });
}

/**
 * Global configuration object loaded from jen.config.js.
 * Holds all framework settings including site directories, server ports, build options, etc.
 */
let config = null;

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
      config = (await import(cwdConfigPath)).default;
    } else {
      // Fall back to root config
      config = (await import(resolve(process.cwd(), "../../jen.config.js")))
        .default;
    }
  } catch (e) {
    // Final fallback
    config = (await import("./jen.config.js")).default;
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
 * Gracefully shuts down on SIGTERM and SIGINT with proper cleanup of:
 * - In-flight requests (30s timeout)
 * - File watchers and HMR connections
 * - Vite dev server
 * - Database connections (if any)
 * - Cache flush
 */
async function main() {
  await loadConfig();

  // Inject fonts configuration into config.inject.head
  // This automatically adds Google Fonts links and local @font-face CSS
  injectFonts(config);

  let viteServer = null;

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

  // Initialize graceful shutdown manager
  const shutdown = new GracefulShutdown();

  const server = createHttpServer(async (req, res) => {
    // Check if we're shutting down
    if (shutdown.isShuttingDown_()) {
      res.statusCode = 503;
      res.setHeader("content-type", "text/plain; charset=utf-8");
      res.end("Server is shutting down");
      return;
    }

    // Track request for graceful shutdown
    shutdown.trackRequest(req);

    // Clean up request tracking when it ends
    res.on("finish", () => {
      shutdown.releaseRequest(req);
    });
    res.on("close", () => {
      shutdown.releaseRequest(req);
    });

    try {
      // In dev mode, use Vite middleware for HMR and module serving
      if (isDev && viteServer) {
        // Let Vite handle HMR and module requests
        viteServer.middlewares(req, res, () => {
          // If Vite didn't handle it, pass to app
          app.handle(req, res).catch((err) => {
            res.statusCode = 500;
            res.setHeader("content-type", "text/plain; charset=utf-8");
            res.end("Internal Server Error\n\n" + (err?.stack ?? String(err)));
          });
        });
      } else {
        await app.handle(req, res);
      }
    } catch (err) {
      res.statusCode = 500;
      res.setHeader("content-type", "text/plain; charset=utf-8");
      res.end("Internal Server Error\n\n" + (err?.stack ?? String(err)));
    }
  });

  // Find an available port if config specifies port 0
  let portToUse =
    config.server.port === 0
      ? await findAvailablePort(config.server.hostname)
      : config.server.port;

  let retries = 0;
  const maxRetries = 5;

  function tryListen() {
    server.listen(portToUse, config.server.hostname, () => {
      printBanner(portToUse, isDev ? "development" : "production");
    });
  }

  server.on("error", async (err) => {
    if (err.code === "EADDRINUSE") {
      retries++;
      if (retries < maxRetries) {
        log.warn(
          `[Server] Port ${portToUse} in use, retrying... (${retries}/${maxRetries})`,
        );
        server.removeAllListeners("error");
        await new Promise((r) => setTimeout(r, 200 * retries)); // Exponential backoff
        portToUse = await findAvailablePort(config.server.hostname);
        tryListen();
      } else {
        log.error(
          `[Server] Failed to bind after ${maxRetries} retries. Try setting PORT environment variable.`,
        );
        process.exit(1);
      }
    } else {
      log.error(`[Server] Error: ${err.message}`);
      process.exit(1);
    }
  });

  tryListen();

  // Register signal handlers for graceful shutdown
  shutdown.registerSignalHandlers(async () => {
    try {
      // Stop accepting new requests
      log.info("[Graceful Shutdown] Stopping HTTP server");
      server.close();

      // Close app resources (watchers, HMR clients)
      log.info("[Graceful Shutdown] Closing app resources");
      if (app.close) {
        await app.close();
      }

      // Close Vite server
      if (viteServer) {
        log.info("[Graceful Shutdown] Closing Vite server");
        await viteServer.close();
      }

      log.info("[Graceful Shutdown] All resources closed");
    } catch (err) {
      log.warn(`[Graceful Shutdown] Error during shutdown: ${err.message}`);
    }
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

  // Inject fonts configuration into config.inject.head
  injectFonts(config);

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
  } catch (err) {
    log.error(`Build failed: ${err.message}`);
    process.exit(1);
  }
}

if (mode === "build") {
  buildOnly();
} else {
  main();
}
