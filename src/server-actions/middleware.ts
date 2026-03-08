import type { IncomingMessage, ServerResponse } from "node:http";
import { existsSync } from "node:fs";
import { pathToFileURL } from "node:url";
import esbuild from "esbuild";
import { basename, join } from "node:path";
import { log } from "../shared/log.js";
import { headersToObject, parseCookies } from "../core/http.js";
import {
  scanServerActions,
  matchServerAction,
  type ServerActionEntry,
} from "./scan.js";
import { createServerActionContext, executeServerAction } from "./handler.js";
import type { ServerActionModule, ServerActionContext } from "./types.js";
import type { FrameworkConfig } from "../core/config.js";

/** Cache directory for transpiled server actions. */
const actionsCacheDir = join(
  process.cwd(),
  "node_modules",
  ".jen",
  "actions-cache",
);

/**
 * Transpile a TypeScript server action file to JavaScript.
 * Uses esbuild to convert TS → JS and output as ESM.
 */
async function transpileServerAction(filePath: string): Promise<string> {
  const outfile = join(
    actionsCacheDir,
    basename(filePath).replace(/\.ts$/, `.${Date.now()}.mjs`),
  );

  await esbuild.build({
    entryPoints: [filePath],
    outfile,
    format: "esm",
    platform: "node",
    target: "es2022",
    bundle: false,
    external: ["preact", "preact-render-to-string", "jenjs"],
    write: true,
  });

  return outfile;
}

/**
 * Load a server action module and extract its configuration and handler.
 */
async function loadServerActionModule(
  filePath: string,
): Promise<ServerActionModule> {
  let moduleUrl = filePath;

  // Transpile TypeScript to JavaScript if needed
  if (filePath.endsWith(".ts") || filePath.endsWith(".tsx")) {
    moduleUrl = await transpileServerAction(filePath);
  }

  try {
    // Cache-busting query param for dev mode
    const mod = await import(
      pathToFileURL(moduleUrl).href + `?t=${Date.now()}`
    );
    return mod.default ? { default: mod.default, ...mod } : mod;
  } catch (err: any) {
    log.error(`Failed to load server action: ${err.message}`);
    throw new Error(`Failed to load server action module: ${err.message}`);
  }
}

/**
 * Create a middleware that handles server actions.
 * Scans the actions directory and routes requests to action handlers.
 *
 * Routes server action requests to /actions/* endpoints and executes them
 * with validation, error handling, and streaming support.
 */
export async function createServerActionsMiddleware(opts: {
  config: FrameworkConfig;
}): Promise<(ctx: any, next: () => Promise<void>) => Promise<void>> {
  const { config } = opts;

  // Scan actions directory once at startup
  const actions = scanServerActions(config);
  log.info(`Server actions discovered: ${actions.length}`);
  for (const a of actions) {
    log.info(`  ${a.actionPath} (${a.name})`);
  }

  // Cache loaded action modules
  const moduleCache = new Map<string, ServerActionModule>();

  return async (ctx, next) => {
    // Only handle /actions/* requests
    if (!ctx.url.pathname.startsWith("/actions/")) {
      return next();
    }

    // Extract action path (remove /actions prefix)
    const actionPath = ctx.url.pathname.slice("/actions".length);

    // Match against discovered actions
    const match = matchServerAction(actions, actionPath);
    if (!match) {
      ctx.res.statusCode = 404;
      ctx.res.setHeader("content-type", "application/json; charset=utf-8");
      ctx.res.end(
        JSON.stringify({ success: false, message: "Action not found" }),
      );
      return;
    }

    const { action, params } = match;

    try {
      // Load action module (use cache to avoid reloading)
      let actionModule = moduleCache.get(action.id);
      if (!actionModule) {
        actionModule = await loadServerActionModule(action.filePath);
        moduleCache.set(action.id, actionModule);
      }

      // Extract configuration
      const metadata = actionModule.metadata || {};
      const validation = actionModule.validation;
      const handler = actionModule.default;

      if (!handler || typeof handler !== "function") {
        ctx.res.statusCode = 500;
        ctx.res.setHeader("content-type", "application/json; charset=utf-8");
        ctx.res.end(
          JSON.stringify({
            success: false,
            message: "Invalid action: no handler exported",
          }),
        );
        return;
      }

      // Create action context
      const reqHeaders = headersToObject(ctx.req.headers);
      const cookies = parseCookies(ctx.req);

      const actionCtx = await createServerActionContext({
        req: ctx.req,
        res: ctx.res,
        url: ctx.url,
        params,
        headers: reqHeaders,
        cookies,
      });

      // Execute server action
      await executeServerAction({
        handler,
        ctx: actionCtx,
        validation,
      });
    } catch (err: any) {
      log.error(`Server action error: ${err.message}`);

      if (!ctx.res.headersSent) {
        ctx.res.statusCode = 500;
        ctx.res.setHeader("content-type", "application/json; charset=utf-8");
      }

      if (!ctx.res.writableEnded) {
        ctx.res.end(
          JSON.stringify({
            success: false,
            message: "Internal server error",
          }),
        );
      }
    }
  };
}
