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
import { Pipeline } from "./pipeline.js";
import { MiddlewareRegistry } from "./registry.js";
import { Context } from "./context.js";
/**
 * Core HTTP request handler that manages middleware execution and request context.
 *
 * The Kernel implements a middleware pipeline pattern:
 * 1. Receives Node.js req and res objects
 * 2. Wraps them in a Context object with helper methods and properties
 * 3. Composes registered middlewares into a callable pipeline
 * 4. Executes the pipeline with the context for request processing
 *
 * Middlewares can:
 * - Access/modify request and response via ctx.req, ctx.res, ctx.response
 * - Read/set cookies, headers, query params, route params
 * - Store and retrieve shared state in ctx.state
 * - Call ctx.response.json() or other response builders
 * - Control flow via next() to continue to next middleware
 */
export class Kernel {
  /**
   * Array of global middleware functions that run for every request.
   * Middlewares are stored in order of registration (use() calls).
   * Executed sequentially in Pipeline.compose().
   */
  globalMiddleware = [];
  constructor() {}
  /**
   * Registers a middleware function to run for all requests.
   * Middleware can be a function, a class constructor, or an object with handle() method.
   *
   * @param mw Middleware function: (ctx, next) => Promise<void>
   *           Or class with: new MyMiddleware().handle(ctx, next)
   *
   * @example
   * kernel.use(async (ctx, next) => {
   *   console.log(`${ctx.req.method} ${ctx.url.pathname}`);
   *   await next();
   * });
   */
  use(mw) {
    this.globalMiddleware.push(mw);
  }
  /**
   * Processes an HTTP request through the global middleware pipeline.
   * Creates a Context wrapping the request/response, composes middlewares, and executes them.
   *
   * @param req Node.js IncomingMessage (HTTP request object)
   * @param res Node.js ServerResponse (HTTP response object)
   *
   * @returns Promise that resolves when middleware chain completes
   *
   * @example
   * const server = createServer((req, res) => {
   *   kernel.handle(req, res);
   * });
   */
  async handle(req, res) {
    const ctx = new Context(req, res);
    const fn = Pipeline.compose(this.globalMiddleware);
    await fn(ctx, async () => {});
  }
  /**
   * Processes a request through global middleware plus a registered middleware group.
   * Retrieves middleware from the registry by group name and composes them with global middleware.
   * Useful for route-specific or feature-specific middleware chains.
   *
   * @param req Node.js IncomingMessage
   * @param res Node.js ServerResponse
   * @param groupName Name of the middleware group registered in MiddlewareRegistry
   *
   * @returns Promise that resolves when complete middleware chain executes
   *
   * @example
   * // Given a group named "apiMiddleware" with auth and logging
   * await kernel.handleWithGroup(req, res, "apiMiddleware");
   */
  async handleWithGroup(req, res, groupName) {
    const ctx = new Context(req, res);
    const registry = MiddlewareRegistry.get();
    const groupMw = registry.getGroup(groupName);
    const fn = Pipeline.compose([...this.globalMiddleware, ...groupMw]);
    await fn(ctx, async () => {});
  }
}
