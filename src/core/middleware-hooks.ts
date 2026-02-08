import type { IncomingMessage, ServerResponse } from "node:http";

/**
 * Route middleware context. Available to middleware functions.
 */
export interface RouteMiddlewareContext {
  req: IncomingMessage;
  res: ServerResponse;
  url: URL;
  params: Record<string, string>;
  query: Record<string, string>;
  headers: Record<string, string>;
  cookies: Record<string, string>;
  // Allow middleware to attach data for use in loaders/page
  data?: Record<string, any>;
  // Response helpers
  status: (code: number) => RouteMiddlewareContext;
  setHeader: (key: string, value: string) => RouteMiddlewareContext;
  redirect: (url: string, statusCode?: number) => never;
  json: (data: any, statusCode?: number) => never;
}

/**
 * Route middleware function signature.
 * Return undefined/void to continue to next middleware/page.
 * Call ctx.redirect() or ctx.json() to short-circuit.
 */
export type RouteMiddleware = (
  ctx: RouteMiddlewareContext,
) => Promise<void> | void;

/**
 * Note: Route module types (middleware, hydrate fields) are defined in core/types.ts
 * This module just provides the middleware execution primitives.
 */

/**
 * Create middleware context from request.
 * Called by server before rendering route.
 */
export function createRouteMiddlewareContext(opts: {
  req: IncomingMessage;
  res: ServerResponse;
  url: URL;
  params: Record<string, string>;
  query: Record<string, string>;
  headers: Record<string, string>;
  cookies: Record<string, string>;
}): RouteMiddlewareContext {
  const ctx: RouteMiddlewareContext = {
    ...opts,
    data: {},
    status: function (code: number) {
      this.res.statusCode = code;
      return this;
    },
    setHeader: function (key: string, value: string) {
      this.res.setHeader(key, value);
      return this;
    },
    redirect: function (url: string, statusCode = 302) {
      this.res.statusCode = statusCode;
      this.res.setHeader("location", url);
      this.res.end();
      throw new Error("__REDIRECT__");
    },
    json: function (data: any, statusCode = 200) {
      this.res.statusCode = statusCode;
      this.res.setHeader("content-type", "application/json; charset=utf-8");
      this.res.end(JSON.stringify(data));
      throw new Error("__JSON__");
    },
  };

  return ctx;
}

/**
 * Execute route middlewares in sequence.
 * If any middleware calls redirect() or json(), it throws and stops execution.
 */
export async function executeRouteMiddleware(
  middlewares: RouteMiddleware[],
  ctx: RouteMiddlewareContext,
): Promise<void> {
  for (const mw of middlewares) {
    try {
      await mw(ctx);
    } catch (err: any) {
      if (err.message === "__REDIRECT__" || err.message === "__JSON__") {
        throw err;
      }
      throw err;
    }
  }
}
