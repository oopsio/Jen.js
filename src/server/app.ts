import type { IncomingMessage, ServerResponse } from "node:http";
import { existsSync, readFileSync, watch, FSWatcher } from "node:fs";
import { join, extname, resolve } from "node:path";
import { createScssCompiler } from "../css/compiler.js";
import type { FrameworkConfig } from "../core/config.js";
import { scanRoutes } from "../core/routes/scan.js";
import { matchRoute } from "../core/routes/match.js";
import { createAdvancedRouter } from "../core/routes/orchestrator.js";
import { log } from "../shared/log.js";
import { Kernel } from "../middleware/kernel.js";
import { renderRouteToHtml } from "../runtime/render.js";
import { HMR_CLIENT_SCRIPT } from "../runtime/hmr.js";
import { headersToObject, parseCookies } from "../core/http.js";
import { tryHandleApiRoute } from "./api-routes.js";
import {
  buildHydrationModule,
  runtimeHydrateModule,
  invalidateCache,
} from "./runtimeServe.js";
import {
  invalidateVueCache,
  invalidateSvelteCache,
} from "../compilers/esbuild-plugins.js";
import { fontServeMiddleware } from "../fonts/inject.js";
import { createServerActionsMiddleware } from "../server-actions/middleware.js";
import { isFeatureEnabled } from "../core/features.js";
import { runQuery } from "../graphql/index.js";
import { I18n } from "../i18n/index.js";
import sirv from "sirv";

/**
 * Manages the lifecycle of file watchers and HMR connections.
 * Ensures proper cleanup on shutdown to prevent memory leaks.
 */
class AppLifecycle {
  private watcher: FSWatcher | null = null;
  private debounceTimer: NodeJS.Timeout | null = null;
  private hmrClients = new Set<ServerResponse>();

  setWatcher(watcher: FSWatcher) {
    this.watcher = watcher;
  }

  setDebounceTimer(timer: NodeJS.Timeout) {
    this.debounceTimer = timer;
  }

  addHmrClient(client: ServerResponse) {
    this.hmrClients.add(client);
  }

  removeHmrClient(client: ServerResponse) {
    this.hmrClients.delete(client);
  }

  getHmrClients() {
    return this.hmrClients;
  }

  /**
   * Properly closes all resources.
   * Called on server shutdown.
   */
  async close() {
    // Clear debounce timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    // Close all HMR connections
    for (const client of this.hmrClients) {
      if (!client.writableEnded && !client.destroyed) {
        client.end();
      }
    }
    this.hmrClients.clear();

    // Close file watcher
    if (this.watcher) {
      return new Promise<void>((resolve) => {
        const w = this.watcher;
        if (w) {
          w.close();
          this.watcher = null;
        }
        resolve();
      });
    }
  }
}



/**
 * Local middleware type for composing request handlers in the app middleware chain.
 * Each middleware receives the request context and a next() function to pass to the next middleware.
 */
type Middleware = (ctx: any, next: () => Promise<void>) => Promise<void>;

/**
 * HTML template for 500 Internal Server Error responses.
 * Used when middleware or request handlers throw uncaught exceptions.
 */
const ERROR_500_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>500 - Internal Server Error</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: #f5f5f5;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 60px auto;
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    h1 {
      color: #d32f2f;
      margin: 0 0 20px 0;
      font-size: 32px;
    }
    p {
      color: #666;
      line-height: 1.6;
      margin: 10px 0;
    }
    .error-details {
      background: #fafafa;
      border-left: 4px solid #d32f2f;
      padding: 15px;
      margin: 20px 0;
      font-family: monospace;
      font-size: 12px;
      color: #333;
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-word;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>500 - Internal Server Error</h1>
    <p>The server encountered an unexpected error while processing your request.</p>
    <p>Our team has been notified. Please try again later.</p>
    <div class="error-details" id="details" style="display:none;"></div>
  </div>
</body>
</html>`;

/**
 * Sends a safe 500 error response, checking if headers have already been sent.
 * If headers were sent, attempts to destroy the socket to prevent further data transmission.
 * Logs the error with stack trace for debugging.
 *
 * @param res Node.js ServerResponse object
 * @param error Error object or string to log
 * @param showDetails Whether to include error details in response (dev mode)
 */
function sendSafeError(
  res: ServerResponse,
  error: Error | string,
  showDetails: boolean = false,
) {
  const errorMsg = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : "";

  // Log error with full stack trace
  log.error(`[Error] ${errorMsg}`);
  if (errorStack) {
    log.error(`Stack:\n${errorStack}`);
  }

  // If headers already sent, destroy socket to prevent data corruption
  if (res.headersSent) {
    log.error("[Error Response] Headers already sent, destroying socket");
    if (res.socket && !res.socket.destroyed) {
      res.socket.destroy();
    }
    return;
  }

  // Send 500 response with safe error template
  try {
    let html = ERROR_500_TEMPLATE;

    if (showDetails && errorStack) {
      // In dev mode, include error details
      html = html.replace('id="details" style="display:none;"', 'id="details"');
      html = html.replace(
        "<script>",
        `<script>
document.getElementById('details').textContent = ${JSON.stringify(errorStack)};
`,
      );
    }

    res.statusCode = 500;
    res.setHeader("content-type", "text/html; charset=utf-8");
    res.setHeader("cache-control", "no-store, no-cache, must-revalidate");
    res.end(html);
  } catch (e) {
    // If error sending response, just try to end the response
    log.error(`[Error Response] Failed to send error page: ${e}`);
    try {
      res.end();
    } catch {
      // Last resort: destroy socket
      if (res.socket && !res.socket.destroyed) {
        res.socket.destroy();
      }
    }
  }
}

/**
 * Server mode determines rendering strategy and asset serving behavior.
 * - "dev": Development mode with HMR, live SCSS compilation, file watching
 * - "prod": Production mode with pre-built assets, no live compilation
 */
type AppMode = "dev" | "prod";

/**
 * Creates and configures the main HTTP application handler.
 *
 * Initializes the middleware chain for handling requests in the following order:
 * 1. Request logging
 * 2. Internal runtime modules (hydration, HMR)
 * 3. API route handling
 * 4. Static dist directory serving (prod mode)
 * 5. SCSS compilation (dev mode)
 * 6. Site assets serving (dev mode)
 * 7. Server-side rendering (SSR) of route pages
 * 8. 404 fallback
 *
 * In development mode, sets up file watching on the site directory to enable:
 * - Hot Module Replacement (HMR) via Server-Sent Events (SSE)
 * - Hot CSS reload for SCSS changes
 * - Full page reload for JavaScript/TypeScript/framework file changes
 * - Module and compiler cache invalidation
 *
 * @param opts Configuration object
 * @param opts.config Jen.js framework configuration with routes, directories, etc.
 * @param opts.mode "dev" for development or "prod" for production
 * @param opts.viteServer Optional Vite dev server instance for HMR (dev mode only)
 *
 * @returns Promise resolving to an object with handle() method for processing HTTP requests
 *
 * @throws {Error} If route scanning fails due to invalid route patterns
 */
export async function createApp(opts: {
  config: FrameworkConfig;
  mode: AppMode;
  viteServer?: any;
}) {
  const { config, mode, viteServer } = opts;

  /**
   * Lifecycle manager for watchers and HMR connections.
   * Ensures proper cleanup on app shutdown.
   */
  const lifecycle = new AppLifecycle();

  if (mode === "dev") {
    const sitePath = join(process.cwd(), config.siteDir);
    log.info(`[HMR] Watching ${sitePath} for changes...`);

    try {
      const watcher = watch(
        sitePath,
        { recursive: true },
        (eventType, filename) => {
          if (!filename) return;

          /**
           * Filter out files that should not trigger HMR notifications.
           * Temporary files, build artifacts, and hidden files cause infinite loops
           * or are not meant for hot reload.
           */
          if (
            filename.startsWith(".") ||
            filename.includes("node_modules") ||
            filename.endsWith("~") ||
            filename.endsWith(".tmp") ||
            filename.endsWith(".esbuild.mjs") || // Ignore build artifacts
            filename.includes("\\.") || // Windows hidden files
            filename.includes("/.") // Unix hidden files
          ) {
            return;
          }

          /**
           * Debounce timer prevents multiple rapid change notifications.
           * Filesystem watchers often emit multiple events for a single file change.
           * This delay coalesces rapid changes into a single notification (100ms threshold).
           * maxWait cap prevents indefinite waiting on continuous changes.
           */
          let debounceTimer = setTimeout(() => {
            const ext = extname(filename);
            // Normalize path
            const fullPath = join(sitePath, filename);
            log.info(`[HMR] Change detected: ${filename}`);

            if (ext === ".css" || ext === ".scss") {
              /**
               * For CSS/SCSS changes, send a style-update event.
               * This allows the client to reload CSS without full page reload,
               * preserving component state and providing better developer experience.
               */
              const cssName = filename.replace(/\.scss$/, ".css");

              for (const client of lifecycle.getHmrClients()) {
                if (!client.writableEnded && !client.destroyed) {
                  client.write(
                    `event: style-update\ndata: ${JSON.stringify({ file: cssName })}\n\n`,
                  );
                }
              }
            } else {
              /**
               * For JavaScript/TypeScript/component changes, invalidate build caches
               * and send a full reload event.
               * Cache invalidation ensures the latest code is loaded on next request.
               */
              invalidateCache(fullPath);
              if (ext === ".vue") invalidateVueCache(fullPath);
              if (ext === ".svelte") invalidateSvelteCache(fullPath);

              // Full reload for JS/TS/Vue/Svelte/Other
              for (const client of lifecycle.getHmrClients()) {
                if (!client.writableEnded && !client.destroyed) {
                  client.write(`event: reload\ndata: {}\n\n`);
                }
              }
            }
          }, 100);

          // Use unref() to allow Node.js to exit if this is the only pending operation
          if (debounceTimer.unref) {
            debounceTimer.unref();
          }
          lifecycle.setDebounceTimer(debounceTimer);
        },
      );

      // Store watcher for cleanup on shutdown
      lifecycle.setWatcher(watcher);
    } catch (err) {
      log.warn(`[HMR] Watch failed: ${err}`);
    }
  }

  /**
   * Scans the site directory for route files and compiles route patterns.
   * Routes are discovered by filename pattern and file extensions configured in config.
   * See scanRoutes() for details on route naming conventions.
   */
  const routes = scanRoutes(config);
  const router = createAdvancedRouter(routes, config);
  log.info(`Routes discovered: ${routes.length}`);
  for (const r of routes) log.info(`  ${r.urlPath} -> ${r.filePath}`);

  const serveAssets = sirv(join(process.cwd(), config.siteDir), {
    dev: mode === "dev",
    etag: true,
  });

  const serveDist = sirv(join(process.cwd(), config.distDir), {
    dev: mode === "dev",
    etag: true,
  });

  // Font serving middleware
  const fontCacheDir = join(
    process.cwd(),
    config.build?.cacheDir ?? ".jen",
    "fonts",
  );
  const serveFonts = fontServeMiddleware(fontCacheDir);

  // Server actions middleware
  const serverActionsMiddleware = await createServerActionsMiddleware({
    config,
  });

  const middlewares: Middleware[] = [
    async (ctx, next) => {
      try {
        log.info(`${ctx.req.method} ${ctx.url.pathname}`);

        // i18n middleware
        if (config.features?.i18n !== false) {
          const locales = config.i18n?.locales || ["en", "es"];
          const defaultLocale = config.i18n?.defaultLocale || "en";
          const firstSegment = ctx.url.pathname.split("/")[1];
          const locale = locales.includes(firstSegment)
            ? firstSegment
            : defaultLocale;
          ctx.i18n = new I18n(locale as any);
        }

        await next();
      } catch (err) {
        sendSafeError(
          ctx.res,
          err instanceof Error ? err : new Error(String(err)),
          mode === "dev",
        );
      }
    },

    async (ctx, next) => {
      try {
        // GraphQL endpoint
        if (ctx.url.pathname === "/graphql" && config.features?.graphql) {
          if (ctx.req.method !== "POST") {
            ctx.res.statusCode = 405;
            ctx.res.end("Method Not Allowed");
            return;
          }

          let body = "";
          ctx.req.on("data", (chunk: Buffer) => (body += chunk.toString()));
          await new Promise((resolve) => ctx.req.on("end", resolve));

          const { query, variables } = JSON.parse(body);
          const result = await runQuery(query, variables);

          ctx.res.statusCode = 200;
          ctx.res.setHeader("content-type", "application/json");
          ctx.res.end(JSON.stringify(result));
          return;
        }

        // runtime internal modules
        if (ctx.url.pathname === "/__runtime/hydrate.js") {
          ctx.res.statusCode = 200;
          ctx.res.setHeader(
            "content-type",
            "application/javascript; charset=utf-8",
          );
          ctx.res.end(runtimeHydrateModule());
          return;
        }

        if (ctx.url.pathname === "/__runtime/island-hydration-client.js") {
          ctx.res.statusCode = 200;
          ctx.res.setHeader(
            "content-type",
            "application/javascript; charset=utf-8",
          );
          const islandCode = `
import { hydrate } from "https://esm.sh/preact@10";
import { h } from "https://esm.sh/preact@10";

function extractIslands() {
  const islands = [];
  const html = document.documentElement.outerHTML;
  const regex = /<!--__ISLAND_(LOAD|IDLE|VISIBLE)__:([^:]+):([^:]+):(.+?)-->/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const strategy = match[1].toLowerCase();
    const id = match[2];
    const component = match[3];
    const propsStr = match[4].replace(/\\\\u003c/g, "<");
    try {
      islands.push({
        id, component, strategy,
        props: JSON.parse(propsStr),
      });
    } catch (e) {
      console.warn('Failed to parse island ' + id);
    }
  }
  return islands;
}

async function hydrateIsland(island) {
  const target = document.getElementById(island.id);
  if (!target) {
    console.warn('Island target #' + island.id + ' not found');
    return;
  }
  try {
    const hydrationUrl = '/__hydrate?file=' + encodeURIComponent(island.component);
    const mod = await import(hydrationUrl);
    const Component = mod.default;
    if (!Component) {
      console.warn('Component not exported from ' + island.component);
      return;
    }
    const app = h(Component, island.props);
    hydrate(app, target);
  } catch (err) {
    console.error('Failed to hydrate island ' + island.id + ':', err);
  }
}

function hydrateWithStrategy(islands) {
  for (const island of islands) {
    switch (island.strategy) {
      case 'load':
        hydrateIsland(island);
        break;
      case 'idle':
        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => hydrateIsland(island));
        } else {
          setTimeout(() => hydrateIsland(island), 2000);
        }
        break;
      case 'visible':
        if ('IntersectionObserver' in window) {
          const target = document.getElementById(island.id);
          if (target) {
            const observer = new IntersectionObserver((entries) => {
              if (entries[0].isIntersecting) {
                hydrateIsland(island);
                observer.disconnect();
              }
            }, { threshold: 0.1 });
            observer.observe(target);
          }
        } else {
          setTimeout(() => hydrateIsland(island), 3000);
        }
        break;
    }
  }
}

export function initializeIslands() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const islands = extractIslands();
      hydrateWithStrategy(islands);
    });
  } else {
    const islands = extractIslands();
    hydrateWithStrategy(islands);
  }
}

initializeIslands();
`;
          ctx.res.end(islandCode);
          return;
        }

        // HMR Endpoint (SSE)
        if (ctx.url.pathname === "/__hmr" && mode === "dev") {
          ctx.res.statusCode = 200;
          ctx.res.setHeader("content-type", "text/event-stream");
          ctx.res.setHeader("cache-control", "no-cache");
          ctx.res.setHeader("connection", "keep-alive");

          ctx.res.write("data: connected\n\n");
          lifecycle.addHmrClient(ctx.res);

          ctx.req.on("close", () => {
            lifecycle.removeHmrClient(ctx.res);
          });

          // Cleanup on response error
          ctx.res.on("error", () => {
            lifecycle.removeHmrClient(ctx.res);
          });

          return;
        }

        if (ctx.url.pathname === "/__hydrate") {
          const file = ctx.url.searchParams.get("file");
          if (!file) {
            ctx.res.statusCode = 400;
            ctx.res.end("missing file");
            return;
          }

          const js = buildHydrationModule(file);

          ctx.res.statusCode = 200;
          ctx.res.setHeader(
            "content-type",
            "application/javascript; charset=utf-8",
          );
          ctx.res.setHeader("cache-control", "no-store");
          ctx.res.end(js);
          return;
        }

        await next();
      } catch (err) {
        sendSafeError(
          ctx.res,
          err instanceof Error ? err : new Error(String(err)),
          mode === "dev",
        );
      }
    },

    async (ctx, next) => {
      try {
        // Font serving (with proper cache headers)
        const handled = await serveFonts(ctx.req, ctx.res);
        if (handled) return;
        await next();
      } catch (err) {
        sendSafeError(
          ctx.res,
          err instanceof Error ? err : new Error(String(err)),
          mode === "dev",
        );
      }
    },

    async (ctx, next) => {
      try {
        // Server actions
        await serverActionsMiddleware(ctx, next);
      } catch (err) {
        sendSafeError(
          ctx.res,
          err instanceof Error ? err : new Error(String(err)),
          mode === "dev",
        );
      }
    },

    async (ctx, next) => {
      try {
        // API routes
        const handled = await tryHandleApiRoute({
          req: ctx.req,
          res: ctx.res,
          siteDir: config.siteDir,
        });
        if (handled) return;
        await next();
      } catch (err) {
        sendSafeError(
          ctx.res,
          err instanceof Error ? err : new Error(String(err)),
          mode === "dev",
        );
      }
    },

    async (ctx, next) => {
      try {
        // dist
        if (mode === "prod") {
          await new Promise<void>((resolve) => {
            serveDist(ctx.req as any, ctx.res as any, () => resolve());
          });
          if (ctx.res.writableEnded || ctx.res.headersSent) return;
        }
        await next();
      } catch (err) {
        sendSafeError(
          ctx.res,
          err instanceof Error ? err : new Error(String(err)),
          mode === "dev",
        );
      }
    },

    async (ctx, next) => {
      try {
        // SCSS Compilation (Dev)
        if (mode === "dev" && ctx.url.pathname.endsWith(".css")) {
          let scssFile: string | null = null;

          const basePath = resolve(process.cwd());

          if (ctx.url.pathname === "/styles.css") {
            // Global SCSS
            if (config.css?.globalScss) {
              // Already includes siteDir if needed, but add it if it doesn't
              const scssPath = config.css.globalScss.startsWith(config.siteDir)
                ? config.css.globalScss
                : join(config.siteDir, config.css.globalScss);
              scssFile = join(basePath, scssPath);
              console.log(
                "[DEBUG CSS] Looking for global SCSS:",
                scssFile,
                "exists:",
                existsSync(scssFile),
              );
            } else {
              console.log("[DEBUG CSS] No config.css.globalScss found");
            }
          } else {
            // Map /foo.css -> siteDir/foo.scss
            const rel = ctx.url.pathname.slice(1);
            const tryPath = join(
              basePath,
              config.siteDir,
              rel.replace(/\.css$/, ".scss"),
            );
            if (existsSync(tryPath)) {
              scssFile = tryPath;
            }
          }

          if (scssFile && existsSync(scssFile)) {
            const compiler = createScssCompiler();
            const result = compiler.compile({
              inputPath: scssFile,
              minified: false,
              sourceMap: true,
            });

            if (result.error) {
              ctx.res.statusCode = 500;
              ctx.res.setHeader("content-type", "text/css");
              ctx.res.end(
                `/* SCSS Error: ${result.error.replace(
                  /\*\//g,
                  "* /",
                )} */ body::before { position:fixed; top:0; left:0; width:100%; content: "SCSS Error: ${result.error
                  .replace(/\\/g, "\\\\")
                  .replace(
                    /"/g,
                    '\\"',
                  )}"; display: block; background: red; color: white; padding: 1em; z-index:9999; white-space: pre-wrap; }`,
              );
              return;
            }

            ctx.res.statusCode = 200;
            ctx.res.setHeader("content-type", "text/css");
            ctx.res.end(result.css);
            return;
          }
        }
        await next();
      } catch (err) {
        sendSafeError(
          ctx.res,
          err instanceof Error ? err : new Error(String(err)),
          mode === "dev",
        );
      }
    },

    async (ctx, next) => {
      try {
        // site assets in dev
        if (mode === "dev") {
          await new Promise<void>((resolve) => {
            serveAssets(ctx.req as any, ctx.res as any, () => resolve());
          });
          if (ctx.res.writableEnded || ctx.res.headersSent) return;
        }
        await next();
      } catch (err) {
        sendSafeError(
          ctx.res,
          err instanceof Error ? err : new Error(String(err)),
          mode === "dev",
        );
      }
    },

    async (ctx, next) => {
      try {
        // Advanced routing with guards, redirects, and 404 handling
        if (ctx.req.method !== "GET") return next();

        const reqHeaders = headersToObject(ctx.req.headers);
        const cookies = parseCookies(ctx.req);

        // Use advanced router to resolve the route
        const resolution = await router.resolve(
          ctx.url.pathname,
          ctx.url,
          reqHeaders,
          cookies,
        );

        if (resolution.type === "redirect") {
          // Handle redirects (both app-level and route-level)
          router.handleRedirect(
            ctx.res,
            resolution.location,
            resolution.status,
          );
          return;
        }

        if (resolution.type === "not_found") {
          // Handle 404 responses
          await router.handle404(ctx.res, resolution.pathname);
          return;
        }

        // Route matched - render the page
        if (resolution.type !== "matched") return next();

        const html = await renderRouteToHtml({
          config,
          route: resolution.route,
          req: ctx.req,
          res: ctx.res,
          url: ctx.url,
          params: resolution.params,
          query: resolution.query,
          headers: reqHeaders,
          cookies,
        });

        let finalHtml = html;
        if (mode === "dev") {
          // Inject HMR client
          finalHtml = html.replace(
            "</body>",
            `<script>${HMR_CLIENT_SCRIPT}</script></body>`,
          );
        }

        ctx.res.statusCode = 200;
        ctx.res.setHeader("content-type", "text/html; charset=utf-8");
        ctx.res.end(finalHtml);
      } catch (err: any) {
        // Middleware may have sent a response (redirect/json)
        if (
          err &&
          (err.message === "__REDIRECT__" || err.message === "__JSON__")
        ) {
          return; // Response already sent
        }
        sendSafeError(
          ctx.res,
          err instanceof Error ? err : new Error(String(err)),
          mode === "dev",
        );
      }
    },
  ];

  const kernel = new Kernel();
  middlewares.forEach((m) => kernel.use(m));

  return {
    async handle(req: IncomingMessage, res: ServerResponse) {
      const start = Date.now();
      const originalEnd = res.end.bind(res);
      
      res.end = function(...args: any[]) {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
        return originalEnd(...args);
      };
      
      await kernel.handle(req, res);
    },

    /**
     * Gracefully closes the app and cleans up resources.
     * Should be called on server shutdown.
     */
    async close() {
      await lifecycle.close();
    },
  };
}
