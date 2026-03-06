// In-memory rate limiter with automatic cleanup
// No persistent storage - resets on server restart
// Windows per IP: 10 requests per minute

const REQUESTS_PER_MINUTE = 10;
const WINDOW_MS = 60 * 1000;
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

interface RateLimitEntry {
  requests: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of store.entries()) {
    if (entry.resetAt < now) {
      store.delete(ip);
    }
  }
}, CLEANUP_INTERVAL);

export const rateLimiter = {
  check(ip: string): boolean {
    const now = Date.now();
    const entry = store.get(ip);

    if (!entry || entry.resetAt < now) {
      // New window
      store.set(ip, {
        requests: 1,
        resetAt: now + WINDOW_MS,
      });
      return true;
    }

    // Existing window
    if (entry.requests < REQUESTS_PER_MINUTE) {
      entry.requests++;
      return true;
    }

    return false;
  },
};
