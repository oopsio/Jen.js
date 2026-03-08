import { Pipeline } from "./pipeline.js";
import { MiddlewareRegistry } from "./registry.js";
import { Context } from "./context.js";
import { log } from "../shared/log.js";

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
   * Catches any uncaught errors and sends a safe 500 response.
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
    try {
      const ctx = new Context(req, res);
      const fn = Pipeline.compose(this.globalMiddleware);
      await fn(ctx, async () => {});
    } catch (err) {
      // Uncaught error in middleware pipeline
      log.error(`[Kernel] Uncaught error: ${err}`);
      if (err && err.stack) {
        log.error(`Stack: ${err.stack}`);
      }

      // If headers already sent, destroy socket
      if (res.headersSent) {
        log.error("[Kernel] Headers already sent, destroying socket");
        if (res.socket && !res.socket.destroyed) {
          res.socket.destroy();
        }
        return;
      }

      // Try to send a safe 500 response
      try {
        res.statusCode = 500;
        res.setHeader("content-type", "text/html; charset=utf-8");
        res.setHeader("cache-control", "no-store, no-cache, must-revalidate");
        res.end(
          `<!DOCTYPE html>
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
  </style>
</head>
<body>
  <div class="container">
    <h1>500 - Internal Server Error</h1>
    <p>The server encountered an unexpected error while processing your request.</p>
    <p>Our team has been notified. Please try again later.</p>
  </div>
</body>
</html>`,
        );
      } catch (e) {
        log.error(`[Kernel] Failed to send error response: ${e}`);
        // Last resort: destroy socket
        if (res.socket && !res.socket.destroyed) {
          res.socket.destroy();
        }
      }
    }
  }

  /**
   * Processes a request through global middleware plus a registered middleware group.
   * Retrieves middleware from the registry by group name and composes them with global middleware.
   * Useful for route-specific or feature-specific middleware chains.
   * Catches any uncaught errors and sends a safe 500 response.
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
    try {
      const ctx = new Context(req, res);
      const registry = MiddlewareRegistry.get();
      const groupMw = registry.getGroup(groupName);
      const fn = Pipeline.compose([...this.globalMiddleware, ...groupMw]);
      await fn(ctx, async () => {});
    } catch (err) {
      // Uncaught error in middleware pipeline
      log.error(
        `[Kernel] Uncaught error in middleware group "${groupName}": ${err}`,
      );
      if (err && err.stack) {
        log.error(`Stack: ${err.stack}`);
      }

      // If headers already sent, destroy socket
      if (res.headersSent) {
        log.error("[Kernel] Headers already sent, destroying socket");
        if (res.socket && !res.socket.destroyed) {
          res.socket.destroy();
        }
        return;
      }

      // Try to send a safe 500 response
      try {
        res.statusCode = 500;
        res.setHeader("content-type", "application/json");
        res.setHeader("cache-control", "no-store, no-cache, must-revalidate");
        res.end(
          JSON.stringify({
            error: "Internal Server Error",
            message:
              "An unexpected error occurred while processing your request.",
          }),
        );
      } catch (e) {
        log.error(`[Kernel] Failed to send error response: ${e}`);
        // Last resort: destroy socket
        if (res.socket && !res.socket.destroyed) {
          res.socket.destroy();
        }
      }
    }
  }
}
