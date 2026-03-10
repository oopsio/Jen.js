/**
 * Rate limiter for telemetry API
 * Limits requests per IP address
 */
class RateLimiter {
  store = new Map();
  limit = 10;
  windowMs = 60 * 1000; // 60 seconds
  check(ip) {
    const now = Date.now();
    const entry = this.store.get(ip);
    // Reset if window has expired
    if (!entry || now > entry.resetTime) {
      this.store.set(ip, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return true;
    }
    // Check if limit exceeded
    if (entry.count >= this.limit) {
      return false;
    }
    // Increment and allow
    entry.count++;
    return true;
  }
  reset() {
    this.store.clear();
  }
}
export const rateLimiter = new RateLimiter();
