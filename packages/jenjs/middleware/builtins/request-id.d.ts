/**
 * Request ID middleware that assigns unique identifiers to incoming requests.
 * Enables request tracing and correlation across logs and API calls.
 *
 * If the client provides an X-Request-ID header, that ID is used. Otherwise, a new UUID is generated.
 * The request ID is attached to both the response header (for client visibility) and ctx.state
 * (for other middleware like logger to use in log entries).
 *
 * This middleware should be registered early in the chain to ensure all downstream handlers
 * have access to the request ID.
 *
 * @returns Middleware function.
 *
 * @example
 * kernel.use(requestId);
 * // All requests now have a unique X-Request-ID header
 * // Available in ctx.state.requestId for logging and tracing
 */
export function requestId(ctx: any, next: any): Promise<void>;
