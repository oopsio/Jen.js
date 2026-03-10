/**
 * In-memory cache implementation for data fetching.
 * Supports TTL-based expiration and tag-based invalidation.
 * Suitable for development and single-process deployments.
 */
export class MemoryDataCache {
  store = new Map();
  tags = new Map();
  /**
   * Retrieves a cached value by key.
   * Returns null if key doesn't exist or entry has expired.
   */
  async get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    // Check expiration
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.store.delete(key);
      this.cleanupTags(key);
      return null;
    }
    return entry.data;
  }
  /**
   * Stores a value in cache with optional TTL and tags.
   */
  async set(
    key,
    value,
    ttl = 60000, // 1 minute default
    tags,
  ) {
    const entry = {
      data: value,
      timestamp: Date.now(),
      ttl,
      tags,
    };
    this.store.set(key, entry);
    // Register tags for invalidation
    if (tags) {
      for (const tag of tags) {
        if (!this.tags.has(tag)) {
          this.tags.set(tag, new Set());
        }
        this.tags.get(tag).add(key);
      }
    }
  }
  /**
   * Deletes a specific cache entry.
   */
  async delete(key) {
    this.store.delete(key);
    this.cleanupTags(key);
  }
  /**
   * Clears all cache entries.
   */
  async clear() {
    this.store.clear();
    this.tags.clear();
  }
  /**
   * Invalidates all cache entries with specified tags.
   * Useful for mass cache busting after data mutations.
   */
  async invalidate(tags) {
    const keysToDelete = new Set();
    for (const tag of tags) {
      const keys = this.tags.get(tag);
      if (keys) {
        for (const key of keys) {
          keysToDelete.add(key);
        }
      }
    }
    for (const key of keysToDelete) {
      this.store.delete(key);
    }
    // Clean up tag mappings
    for (const tag of tags) {
      this.tags.delete(tag);
    }
  }
  /**
   * Internal helper to clean up tag references when a key is deleted.
   */
  cleanupTags(key) {
    for (const keySet of this.tags.values()) {
      keySet.delete(key);
    }
  }
  /**
   * Returns cache statistics for debugging.
   */
  getStats() {
    return {
      size: this.store.size,
      tags: this.tags.size,
      memory: this.estimateMemory(),
    };
  }
  /**
   * Rough estimate of memory usage (for monitoring).
   */
  estimateMemory() {
    let bytes = 0;
    for (const [key, entry] of this.store) {
      bytes += key.length * 2; // Rough UTF-16 estimate
      bytes += JSON.stringify(entry.data).length;
    }
    return bytes;
  }
}
/**
 * NoOp cache implementation that doesn't cache anything.
 * Used when caching is disabled or for testing.
 */
export class NoOpCache {
  async get() {
    return null;
  }
  async set() {
    // No-op
  }
  async delete() {
    // No-op
  }
  async clear() {
    // No-op
  }
  async invalidate() {
    // No-op
  }
}
/**
 * Creates a cache key from a URL and optional parameters.
 * Ensures consistent key generation across requests.
 */
export function createCacheKey(url, options) {
  let key = url;
  if (options?.method && options.method !== "GET") {
    key += `|${options.method}`;
  }
  if (options?.body) {
    const bodyStr =
      typeof options.body === "string"
        ? options.body
        : JSON.stringify(options.body);
    key += `|${hashString(bodyStr)}`;
  }
  if (options?.headers) {
    const headerStr = JSON.stringify(options.headers);
    key += `|${hashString(headerStr)}`;
  }
  return key;
}
/**
 * Simple hash function for generating consistent cache keys.
 */
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}
/**
 * Cache strategy executor for handling different cache modes.
 */
export async function executeCacheStrategy(
  strategy,
  { key, cache, fetchFn, ttl = 60000, tags },
) {
  switch (strategy) {
    case "cache-first": {
      const cached = await cache.get(key);
      if (cached !== null) {
        return { data: cached, cached: true };
      }
      const fresh = await fetchFn();
      await cache.set(key, fresh, ttl, tags);
      return { data: fresh, cached: false };
    }
    case "network-first": {
      try {
        const fresh = await fetchFn();
        await cache.set(key, fresh, ttl, tags);
        return { data: fresh, cached: false };
      } catch (error) {
        const cached = await cache.get(key);
        if (cached !== null) {
          return { data: cached, cached: true };
        }
        throw error;
      }
    }
    case "stale-while-revalidate": {
      const cached = await cache.get(key);
      // Return cached immediately, revalidate in background
      if (cached !== null) {
        fetchFn()
          .then((fresh) => cache.set(key, fresh, ttl, tags))
          .catch(() => {
            /* Silently fail background revalidation */
          });
        return { data: cached, cached: true };
      }
      const fresh = await fetchFn();
      await cache.set(key, fresh, ttl, tags);
      return { data: fresh, cached: false };
    }
    case "no-cache":
    default: {
      const fresh = await fetchFn();
      return { data: fresh, cached: false };
    }
  }
}
