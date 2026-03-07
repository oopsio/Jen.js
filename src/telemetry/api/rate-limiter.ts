/**
 * Rate limiter for telemetry API
 * Limits requests per IP address
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private readonly limit: number = 10;
  private readonly windowMs: number = 60 * 1000; // 60 seconds

  check(ip: string): boolean {
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

  reset(): void {
    this.store.clear();
  }
}

export const rateLimiter = new RateLimiter();
