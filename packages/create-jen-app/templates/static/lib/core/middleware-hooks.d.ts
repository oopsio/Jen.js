import type { IncomingMessage, ServerResponse } from "node:http";
/**
 * Context object passed to route middleware functions.
 * Provides access to request data and response methods.
 *
 * Route middleware executes before the page loader and renderer.
 * Middleware can:
 * - Check authentication and authorization
 * - Validate or transform request data
 * - Set response headers or status codes
 * - Attach data for use in loaders and page components
 * - Short-circuit rendering by calling redirect() or json()
 *
 * Execution flow:
 * 1. Route middleware array executes sequentially
 * 2. Each middleware receives this context
 * 3. Middleware can call next() implicitly by returning/not throwing
 * 4. Early termination via redirect() or json() throws a sentinel error
 * 5. After middleware, the loader runs with middleware.data pre-populated
 *
 * Example use cases:
 * - Authentication: Check user session, throw redirect to login if needed
 * - Data enrichment: Populate ctx.data with user info for the page
 * - Response control: Set custom headers, status codes, CORS headers
 * - Request validation: Validate params/query, return error JSON if invalid
 */
export interface RouteMiddlewareContext {
  /**
   * Node.js IncomingMessage with request method, URL, headers, etc.
   * Direct access for advanced use cases not covered by the context.
   */
  req: IncomingMessage;
  /**
   * Node.js ServerResponse for sending responses.
   * Methods status(), setHeader(), redirect(), and json() wrap this.
   */
  res: ServerResponse;
  /**
   * Parsed URL object with pathname, searchParams, host, etc.
   * Same URL available in LoaderContext; middleware and loader see the same URL.
   */
  url: URL;
  /**
   * Route parameters extracted from the URL path by route matching.
   * For route "/posts/:id" matching "/posts/42", yields { id: "42" }.
   */
  params: Record<string, string>;
  /**
   * Query string parameters from the URL search string.
   * For "/search?q=test&limit=10", yields { q: "test", limit: "10" }.
   */
  query: Record<string, string>;
  /**
   * HTTP request headers as a normalized object.
   * Keys are lowercase; values are strings or comma-separated lists.
   */
  headers: Record<string, string>;
  /**
   * Parsed HTTP cookies as an object.
   * Keys are cookie names; values are decoded cookie values.
   */
  cookies: Record<string, string>;
  /**
   * Data object that middleware can populate.
   * Data is passed to the loader and page component.
   * Useful for sharing computed values (user info, locale, etc.) from middleware to components.
   *
   * @example
   * ctx.data.userId = 42;  // Set in auth middleware
   * ctx.data.locale = 'en'; // Set in i18n middleware
   * // Then in loader and page: function Page({ data }) { ... data.userId ... }
   */
  data?: Record<string, any>;
  /**
   * Sets the HTTP response status code.
   * Default is 200 (OK) unless changed by middleware.
   * Returns this for method chaining.
   *
   * @param code HTTP status code (200, 404, 500, etc.)
   * @returns This context for chaining with other methods
   *
   * @example ctx.status(404).json({ error: "Not found" });
   */
  status: (code: number) => RouteMiddlewareContext;
  /**
   * Sets an HTTP response header.
   * Multiple calls with the same key overwrite previous values.
   * Returns this for method chaining.
   *
   * @param key Header name (Content-Type, Set-Cookie, etc.)
   * @param value Header value
   * @returns This context for chaining
   *
   * @example ctx.setHeader("Cache-Control", "no-cache").setHeader("X-Custom", "value");
   */
  setHeader: (key: string, value: string) => RouteMiddlewareContext;
  /**
   * Sends a redirect response and stops middleware execution.
   * Sets Location header and sends the response.
   * Default status code is 302 (temporary redirect); 301 is permanent.
   *
   * Throws a sentinel error ("__REDIRECT__") to stop further execution.
   * This error is caught by executeRouteMiddleware() and not re-thrown.
   *
   * @param url Destination URL for the redirect
   * @param statusCode HTTP status code; defaults to 302 (temporary redirect)
   * @throws Error with message "__REDIRECT__" to stop execution
   *
   * @example
   * if (!user) ctx.redirect("/login", 302);  // Never returns; throw is implicit
   */
  redirect: (url: string, statusCode?: number) => never;
  /**
   * Sends a JSON response and stops middleware execution.
   * Sets Content-Type and sends JSON-stringified data.
   * Useful for API errors or early JSON responses.
   *
   * Throws a sentinel error ("__JSON__") to stop further execution.
   * This error is caught and not re-thrown.
   *
   * @param data Object or value to JSON-encode and send
   * @param statusCode HTTP status code; defaults to 200 (OK)
   * @throws Error with message "__JSON__" to stop execution
   *
   * @example
   * if (!params.id) ctx.json({ error: "Missing id" }, 400);  // Never returns
   */
  json: (data: any, statusCode?: number) => never;
}
/**
 * Middleware function that executes for a specific route before rendering.
 *
 * Signature:
 * - Accepts RouteMiddlewareContext
 * - Returns nothing (void or Promise<void>)
 * - Can be sync or async
 *
 * Behavior:
 * - Return/resolve to continue to next middleware or rendering
 * - Call ctx.redirect() or ctx.json() to send response and stop
 * - Throw an error to propagate error to error handler
 * - Modifying ctx.data shares values with loader and page
 *
 * @example
 * const authMiddleware: RouteMiddleware = async (ctx) => {
 *   const user = await getUser(ctx.cookies.sessionId);
 *   if (!user) ctx.redirect("/login");
 *   ctx.data.user = user;  // Available in loader and page
 * };
 */
export type RouteMiddleware = (
  ctx: RouteMiddlewareContext,
) => Promise<void> | void;
/**
 * Type definitions note:
 * Route module types (middleware field, hydrate field) are defined in core/types.ts.
 * This module provides the middleware execution engine and context object.
 */
/**
 * Creates a middleware context object from request data.
 * Called by the renderer before executing route middleware.
 *
 * Initializes:
 * - All request data (req, res, url, params, query, headers, cookies)
 * - Empty data object for middleware to populate
 * - Helper methods (status, setHeader, redirect, json) as chainable methods
 *
 * @param opts Configuration with raw request data
 * @param opts.req Node.js IncomingMessage
 * @param opts.res Node.js ServerResponse
 * @param opts.url Parsed URL from request
 * @param opts.params Route parameters from URL path
 * @param opts.query Query string parameters
 * @param opts.headers Normalized headers object
 * @param opts.cookies Parsed cookies from Cookie header
 *
 * @returns Initialized RouteMiddlewareContext ready for middleware execution
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
 * Executes an array of route middleware sequentially for a route.
 *
 * Execution model:
 * 1. Iterates through middlewares in order
 * 2. Each middleware is awaited (even if synchronous)
 * 3. Middleware can populate ctx.data for use by loader and page
 * 4. If middleware calls ctx.redirect() or ctx.json(), error is caught and re-thrown
 * 5. Other errors are propagated immediately
 *
 * Control flow:
 * - Normal completion: all middlewares finish and function returns
 * - Early exit: middleware calls ctx.redirect() or ctx.json()
 * - Error: middleware throws or ctx.redirect()/json() throws sentinel error
 *
 * Side effects:
 * - Response headers, status, and body may be sent by middleware
 * - ctx.data may be modified by middleware
 * - Should only be called in server context (SSR); not during SSG build
 *
 * @param middlewares Array of middleware functions to execute
 * @param ctx RouteMiddlewareContext created by createRouteMiddlewareContext()
 *
 * @returns Promise that resolves if all middlewares complete normally
 * @throws Error with message "__REDIRECT__" if middleware calls ctx.redirect()
 * @throws Error with message "__JSON__" if middleware calls ctx.json()
 * @throws Error from middleware if it throws
 */
export declare function executeRouteMiddleware(
  middlewares: RouteMiddleware[],
  ctx: RouteMiddlewareContext,
): Promise<void>;
