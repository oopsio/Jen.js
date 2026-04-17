/**
 * Generic Cache Store with TTL support
 */
export interface CacheValue<T = any> {
  value: T;
  expiresAt: number | null; // Unix timestamp in milliseconds, null = persistent
}

export interface CacheOptions {
  ttl?: number; // Time-to-live in seconds
}

export class GlobalCache {
  private static store = new Map<string, CacheValue>();

  /**
   * Set a value in the cache
   */
  public static set<T>(key: string, value: T, options: CacheOptions = {}): void {
    const expiresAt = options.ttl ? Date.now() + options.ttl * 1000 : null;
    this.store.set(key, { value, expiresAt });
  }

  /**
   * Get a value from the cache
   */
  public static get<T>(key: string): T | null {
    const entry = this.store.get(key);
    
    if (!entry) return null;

    // Check for expiration
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value;
  }

  /**
   * Delete a value from the cache
   */
  public static delete(key: string): boolean {
    return this.store.delete(key);
  }

  /**
   * Clear all cache entries
   */
  public static clear(): void {
    this.store.clear();
  }

  /**
   * Remove all expired entries
   */
  public static purgeExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (entry.expiresAt && now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Register a memory cleanup interval (optional)
   */
  private static cleanupInterval = typeof setInterval !== 'undefined' 
    ? setInterval(() => this.purgeExpired(), 60000) // Every minute
    : null;
}
