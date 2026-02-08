/**
 * Rate limiting middleware
 * Protects against brute force and DDoS attacks
 */
export function rateLimit(options = {}) {
  const defaults = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: "Too many requests, please try again later.",
    statusCode: 429,
  };
  const opts = { ...defaults, ...options };

  const hits = new Map();

  // Cleanup old records every minute to prevent memory leak
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of hits.entries()) {
      if (now > record.resetTime) {
        hits.delete(key);
      }
    }
  }, 60 * 1000);

  return async (ctx, next) => {
    // Get IP address - check for X-Forwarded-For header (proxy)
    let ip = ctx.req.headers["x-forwarded-for"];
    if (typeof ip === "string") {
      ip = ip.split(",")[0].trim(); // Get first IP if multiple
    } else {
      ip = ctx.req.socket.remoteAddress || "unknown";
    }

    const now = Date.now();
    let record = hits.get(ip);

    if (!record || now > record.resetTime) {
      record = {
        count: 0,
        resetTime: now + opts.windowMs,
        firstRequest: now,
      };
      hits.set(ip, record);
    }

    record.count++;
    const remaining = opts.max - record.count;

    // Set rate limit headers (similar to GitHub API)
    ctx.response.header("RateLimit-Limit", opts.max);
    ctx.response.header("RateLimit-Remaining", Math.max(0, remaining));
    ctx.response.header("RateLimit-Reset", Math.ceil(record.resetTime / 1000));

    if (record.count > opts.max) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      ctx.response.header("Retry-After", retryAfter);
      ctx.response.status(opts.statusCode).json({
        error: opts.message,
        retryAfter,
      });
      return;
    }

    await next();
  };
}
