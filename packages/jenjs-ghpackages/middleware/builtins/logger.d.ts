/**
 * Middleware that logs HTTP requests and responses with timing information.
 * Records the request method and path on entry, then logs the status code and elapsed time on exit.
 * If a request ID is set in ctx.state.requestId (typically by request-id middleware),
 * it is included in log lines for request tracing.
 *
 * This middleware should be registered early in the middleware chain to capture timing
 * for all downstream handlers.
 *
 * Log format:
 * - Request: "[requestId] -> METHOD /path"
 * - Response: "[requestId] <- METHOD /path 200 (45.32ms)"
 *
 * @returns Middleware function.
 *
 * @example
 * kernel.use(logger);
 */
export function logger(ctx: any, next: any): Promise<void>;
