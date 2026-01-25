import type { IncomingMessage, ServerResponse } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import sirv from "sirv";

import type { FrameworkConfig } from "../core/config.js";
import { scanRoutes } from "../core/routes/scan.js";
import { matchRoute } from "../core/routes/match.js";
import { log } from "../shared/log.js";
import { compose } from "../middleware/runner.js";
import type { Middleware } from "../middleware/types.js";
import { renderRouteToHtml } from "../runtime/render.js";
import { headersToObject, parseCookies } from "../core/http.js";

type AppMode = "dev" | "prod";

export async function createApp(opts: { config: FrameworkConfig; mode: AppMode }) {
  const { config, mode } = opts;

  const routes = scanRoutes(config);
  log.info(`Routes discovered: ${routes.length}`);
  for (const r of routes) log.info(`  ${r.urlPath} -> ${r.filePath}`);

  // static assets
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
      // basic logger
      log.info(`${ctx.req.method} ${ctx.url.pathname}`);
      await next();
    },

    async (ctx, next) => {
      // serve dist first in prod
      if (mode === "prod") {
        let handled = false;
        await new Promise<void>((resolve) => {
          serveDist(ctx.req as any, ctx.res as any, () => resolve());
          handled = ctx.res.headersSent;
        });
        if (ctx.res.writableEnded || ctx.res.headersSent) return;
      }
      await next();
    },

    async (ctx, next) => {
      // serve site assets in dev
      if (mode === "dev") {
        await new Promise<void>((resolve) => {
          serveAssets(ctx.req as any, ctx.res as any, () => resolve());
        });
        if (ctx.res.writableEnded || ctx.res.headersSent) return;
      }
      await next();
    },

    async (ctx, next) => {
      // SSR route handler
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

      ctx.res.statusCode = 200;
      ctx.res.setHeader("content-type", "text/html; charset=utf-8");
      ctx.res.end(html);
    },

    async (ctx) => {
      // 404
      ctx.res.statusCode = 404;
      ctx.res.setHeader("content-type", "text/plain; charset=utf-8");
      ctx.res.end("404 Not Found");
    }
  ];

  const appMiddleware = compose(middlewares);

  return {
    async handle(req: IncomingMessage, res: ServerResponse) {
      const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
      await appMiddleware({ req, res, url }, async () => {});
    }
  };
            }
        
