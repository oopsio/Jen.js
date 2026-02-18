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
