/**
 * Rate limiting middleware that protects against brute force and DDoS attacks.
 * Tracks request count per client IP within a time window and rejects excess requests.
 * Uses in-memory storage, suitable for single-server deployments; use Redis for distributed systems.
 *
 * Automatically cleans up expired records every minute to prevent memory leaks.
 * Respects X-Forwarded-For header for deployments behind a proxy or load balancer.
 *
 * @param options Rate limiting configuration.
 * @param options.windowMs Time window in milliseconds (default: 15 minutes).
 * @param options.max Maximum requests per IP per window (default: 100).
 * @param options.message Error message sent to rate-limited clients (default: "Too many requests...").
 * @param options.statusCode HTTP status for rate-limited responses (default: 429 Too Many Requests).
 * @returns Middleware function.
 *
 * @example
 * kernel.use(rateLimit({
 *   windowMs: 15 * 60 * 1000,
 *   max: 100
 * }));
 */
export function rateLimit(options?: {}): (ctx: any, next: any) => Promise<void>;
