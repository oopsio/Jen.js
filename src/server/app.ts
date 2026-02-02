import type { IncomingMessage, ServerResponse } from "node:http";
import { existsSync, readFileSync, watch } from "node:fs";
import { join, extname } from "node:path";

import sirv from "sirv";

import { createScssCompiler } from "../css/compiler.js";
import type { FrameworkConfig } from "../core/config.js";
import { scanRoutes } from "../core/routes/scan.js";
import { matchRoute } from "../core/routes/match.js";
import { log } from "../shared/log.js";
import { Kernel } from "../middleware/kernel.js";
import type { Middleware } from "../middleware/types.js";
import { renderRouteToHtml } from "../runtime/render.js";
import { HMR_CLIENT_SCRIPT } from "../runtime/hmr.js";
import { headersToObject, parseCookies } from "../core/http.js";
import { tryHandleApiRoute } from "./api.js";
import { buildHydrationModule, runtimeHydrateModule, invalidateCache } from "./runtimeServe.js";

type AppMode = "dev" | "prod";

export async function createApp(opts: { config: FrameworkConfig; mode: AppMode }) {
  const { config, mode } = opts;

  // HMR / Live Reload Setup
  const hmrClients = new Set<ServerResponse>();
  
  if (mode === "dev") {
    const sitePath = join(process.cwd(), config.siteDir);
    log.info(`[HMR] Watching ${sitePath} for changes...`);
    
    // Recursive watch (Node 20+)
    let debounceTimer: NodeJS.Timeout;
    
    try {
      watch(sitePath, { recursive: true }, (eventType, filename) => {
        if (!filename) return;

        // Ignore common temporary/hidden files to prevent infinite loops
        if (
          filename.startsWith(".") ||
          filename.includes("node_modules") ||
          filename.endsWith("~") ||
          filename.endsWith(".tmp") ||
          filename.endsWith(".esbuild.mjs") || // Ignore build artifacts
          filename.includes("\\.") || // Windows hidden files
          filename.includes("/.")     // Unix hidden files
        ) {
          return;
        }
        
        // Debounce to avoid double events
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          const ext = extname(filename);
          // Normalize path
          const fullPath = join(sitePath, filename);
          log.info(`[HMR] Change detected: ${filename}`);

          if (ext === ".css" || ext === ".scss") {
            // Hot CSS
            const cssName = filename.replace(/\.scss$/, ".css");
            
            for (const client of hmrClients) {
              client.write(`event: style-update\ndata: ${JSON.stringify({ file: cssName })}\n\n`);
            }
          } else {
            // Invalidate hydration cache for changed file
            invalidateCache(fullPath);

            // Full reload for JS/TS/Other
            for (const client of hmrClients) {
              client.write(`event: reload\ndata: {}\n\n`);
            }
          }
        }, 100);
      });
    } catch (err) {
      log.warn(`[HMR] Watch failed: ${err}`);
    }
  }

  const routes = scanRoutes(config);
  log.info(`Routes discovered: ${routes.length}`);
  for (const r of routes) log.info(`  ${r.urlPath} -> ${r.filePath}`);

  const serveAssets = sirv(join(process.cwd(), config.siteDir), {
    dev: mode === "dev",
    etag: true
  });

  const serveDist = sirv(join(process.cwd(), config.distDir), {
    dev: mode === "dev",
    etag: true
  });

  const middlewares: Middleware[] = [
    async (ctx, next) => {
      log.info(`${ctx.req.method} ${ctx.url.pathname}`);
      await next();
    },

    async (ctx, next) => {
      // runtime internal modules
      if (ctx.url.pathname === "/__runtime/hydrate.js") {
        ctx.res.statusCode = 200;
        ctx.res.setHeader("content-type", "application/javascript; charset=utf-8");
        ctx.res.end(runtimeHydrateModule());
        return;
      }

      // HMR Endpoint (SSE)
      if (ctx.url.pathname === "/__hmr" && mode === "dev") {
        ctx.res.statusCode = 200;
        ctx.res.setHeader("content-type", "text/event-stream");
        ctx.res.setHeader("cache-control", "no-cache");
        ctx.res.setHeader("connection", "keep-alive");
        
        ctx.res.write("data: connected\n\n");
        hmrClients.add(ctx.res);
        
        ctx.req.on("close", () => {
          hmrClients.delete(ctx.res);
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
        ctx.res.setHeader("content-type", "application/javascript; charset=utf-8");
        ctx.res.setHeader("cache-control", "no-store");
        ctx.res.end(js);
        return;
          }
      

      await next();
    },

    async (ctx, next) => {
      // API routes
      const handled = await tryHandleApiRoute({
        req: ctx.req,
        res: ctx.res,
        siteDir: config.siteDir
      });
      if (handled) return;
      await next();
    },

    async (ctx, next) => {
      // dist
      if (mode === "prod") {
        await new Promise<void>((resolve) => {
          serveDist(ctx.req as any, ctx.res as any, () => resolve());
        });
        if (ctx.res.writableEnded || ctx.res.headersSent) return;
      }
      await next();
    },

    async (ctx, next) => {
      // SCSS Compilation (Dev)
      if (mode === "dev" && ctx.url.pathname.endsWith(".css")) {
        let scssFile: string | null = null;

        if (ctx.url.pathname === "/styles.css") {
          scssFile = join(process.cwd(), config.css.globalScss);
        } else {
          // Map /foo.css -> siteDir/foo.scss
          const rel = ctx.url.pathname.slice(1);
          const tryPath = join(process.cwd(), config.siteDir, rel.replace(/\.css$/, ".scss"));
          if (existsSync(tryPath)) {
            scssFile = tryPath;
          }
        }

        if (scssFile && existsSync(scssFile)) {
          const compiler = createScssCompiler();
          const result = compiler.compile({
            inputPath: scssFile,
            minified: false,
            sourceMap: true
          });

          if (result.error) {
            ctx.res.statusCode = 500;
            ctx.res.setHeader("content-type", "text/css");
            ctx.res.end(
              `/* SCSS Error: ${result.error.replace(
                /\*\//g,
                "* /"
              )} */ body::before { position:fixed; top:0; left:0; width:100%; content: "SCSS Error: ${result.error
                .replace(/\\/g, "\\\\")
                .replace(/"/g, '\\"')
              }"; display: block; background: red; color: white; padding: 1em; z-index:9999; white-space: pre-wrap; }`
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
    },

    async (ctx, next) => {
      // site assets in dev
      if (mode === "dev") {
        await new Promise<void>((resolve) => {
          serveAssets(ctx.req as any, ctx.res as any, () => resolve());
        });
        if (ctx.res.writableEnded || ctx.res.headersSent) return;
      }
      await next();
    },

    async (ctx, next) => {
      // SSR
      if (ctx.req.method !== "GET") return next();

      const m = matchRoute(routes, ctx.url.pathname);
      if (!m) return next();

      const reqHeaders = headersToObject(ctx.req.headers);
      const cookies = parseCookies(ctx.req);

      const query: Record<string, string> = {};
      for (const [k, v] of ctx.url.searchParams.entries()) query[k] = v;

      const html = await renderRouteToHtml({
        config,
        route: m.route,
        url: ctx.url,
        params: m.params,
        query,
        headers: reqHeaders,
        cookies
      });

      let finalHtml = html;
      if (mode === "dev") {
        // Inject HMR client
        finalHtml = html.replace("</body>", `<script>${HMR_CLIENT_SCRIPT}</script></body>`);
      }

      ctx.res.statusCode = 200;
      ctx.res.setHeader("content-type", "text/html; charset=utf-8");
      ctx.res.end(finalHtml);
    },

        async (ctx) => {
          ctx.res.statusCode = 404;
          ctx.res.setHeader("content-type", "text/plain; charset=utf-8");
          ctx.res.end("404 Not Found");
        }
      ];
    
      const kernel = new Kernel();
      middlewares.forEach(m => kernel.use(m));
    
      return {
        async handle(req: IncomingMessage, res: ServerResponse) {
          await kernel.handle(req, res);
        }
      };
    }
    
