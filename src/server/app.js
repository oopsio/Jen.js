import { join } from "node:path";
import sirv from "sirv";
import { scanRoutes } from "../core/routes/scan.js";
import { matchRoute } from "../core/routes/match.js";
import { log } from "../shared/log.js";
import { compose } from "../middleware/runner.js";
import { renderRouteToHtml } from "../runtime/render.js";
import { headersToObject, parseCookies } from "../core/http.js";
import { tryHandleApiRoute } from "./api.js";
import { buildHydrationModule, runtimeHydrateModule } from "./runtimeServe.js";
export async function createApp(opts) {
  const { config, mode } = opts;
  const routes = scanRoutes(config);
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
  const middlewares = [
    async (ctx, next) => {
      log.info(`${ctx.req.method} ${ctx.url.pathname}`);
      await next();
    },
    async (ctx, next) => {
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
    },
    async (ctx, next) => {
      // API routes
      const handled = await tryHandleApiRoute({
        req: ctx.req,
        res: ctx.res,
        siteDir: config.siteDir,
      });
      if (handled) return;
      await next();
    },
    async (ctx, next) => {
      // dist
      if (mode === "prod") {
        await new Promise((resolve) => {
          serveDist(ctx.req, ctx.res, () => resolve());
        });
        if (ctx.res.writableEnded || ctx.res.headersSent) return;
      }
      await next();
    },
    async (ctx, next) => {
      // site assets in dev
      if (mode === "dev") {
        await new Promise((resolve) => {
          serveAssets(ctx.req, ctx.res, () => resolve());
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
      const query = {};
      for (const [k, v] of ctx.url.searchParams.entries()) query[k] = v;
      const html = await renderRouteToHtml({
        config,
        route: m.route,
        url: ctx.url,
        params: m.params,
        query,
        headers: reqHeaders,
        cookies,
      });
      ctx.res.statusCode = 200;
      ctx.res.setHeader("content-type", "text/html; charset=utf-8");
      ctx.res.end(html);
    },
    async (ctx) => {
      ctx.res.statusCode = 404;
      ctx.res.setHeader("content-type", "text/plain; charset=utf-8");
      ctx.res.end("404 Not Found");
    },
  ];
  const appMiddleware = compose(middlewares);
  return {
    async handle(req, res) {
      const url = new URL(
        req.url ?? "/",
        `http://${req.headers.host ?? "localhost"}`,
      );
      await appMiddleware({ req, res, url }, async () => {});
    },
  };
}
