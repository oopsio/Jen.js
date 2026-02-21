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
  data?: Record<string, any>;
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
export declare function createRouteMiddlewareContext(opts: {
  req: IncomingMessage;
  res: ServerResponse;
  url: URL;
  params: Record<string, string>;
  query: Record<string, string>;
  headers: Record<string, string>;
  cookies: Record<string, string>;
}): RouteMiddlewareContext;
/**
 * Execute route middlewares in sequence.
 * If any middleware calls redirect() or json(), it throws and stops execution.
 */
export declare function executeRouteMiddleware(
  middlewares: RouteMiddleware[],
  ctx: RouteMiddlewareContext,
): Promise<void>;
