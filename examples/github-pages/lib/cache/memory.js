import { log } from "../shared/log.js";
/**
 * In-memory cache implementation using a JavaScript Map.
 * Stores key-value pairs with optional time-to-live (TTL) expiration.
 * Useful for development, testing, or single-process deployments.
 * Not suitable for multi-process environments (values isolated per process).
 *
 * @example
 * ```typescript
 * const cache = new MemoryCache();
 * cache.set("user:123", { id: 123, name: "John" }, 3600000); // 1 hour
 * const user = cache.get("user:123");
 * cache.delete("user:123");
 * ```
 */
export class MemoryCache {
    /** Internal store mapping cache keys to values with metadata. */
    store = new Map();
    timers = new Map();
    /**
     * Store a value in cache with optional time-to-live.
     * If TTL is specified, the entry is automatically deleted after ttlMs milliseconds.
     * @param key - Cache key identifier.
     * @param value - Value to store (can be any type).
     * @param ttlMs - Time-to-live in milliseconds. If omitted, entry persists until deleted.
     *
     * @example
     * ```typescript
     * cache.set("data", { foo: "bar" }, 5000); // Expires in 5 seconds
     * ```
     */
    set(key, value, ttlMs) {
        try {
            // Clear existing timer if any
            if (this.timers.has(key)) {
                clearTimeout(this.timers.get(key));
                this.timers.delete(key);
            }
            const now = Date.now();
            const entry = {
                value,
                createdAt: now,
                expiresAt: ttlMs ? now + ttlMs : undefined,
            };
            this.store.set(key, entry);
            // Set up auto-expiration if TTL provided
            if (ttlMs && ttlMs > 0) {
                const timer = setTimeout(() => {
                    this.store.delete(key);
                    this.timers.delete(key);
                    log.info(`Cache entry expired: ${key}`);
                }, ttlMs);
                this.timers.set(key, timer);
                log.info(`Cache set: ${key} (TTL: ${ttlMs}ms)`);
            }
            else {
                log.info(`Cache set: ${key} (no expiration)`);
            }
        }
        catch (error) {
            log.error(`Cache set failed for ${key}: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    /**
     * Retrieve a value from cache.
     * Returns undefined if key does not exist or has expired.
     * @param key - Cache key identifier.
     * @returns Stored value or undefined if not found.
     *
     * @example
     * ```typescript
     * const user = cache.get("user:123");
     * if (user) console.log(user.name);
     * ```
     */
    get(key) {
        try {
            const entry = this.store.get(key);
            if (!entry) {
                return undefined;
            }
            // Check if expired
            if (entry.expiresAt && Date.now() > entry.expiresAt) {
                this.delete(key);
                return undefined;
            }
            log.info(`Cache hit: ${key}`);
            return entry.value;
        }
        catch (error) {
            log.error(`Cache get failed for ${key}: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    /**
     * Remove a value from cache.
     * Safe to call on non-existent keys (no-op).
     * @param key - Cache key identifier.
     *
     * @example
     * ```typescript
     * cache.delete("user:123");
     * ```
     */
    delete(key) {
        try {
            // Clear timer if exists
            if (this.timers.has(key)) {
                clearTimeout(this.timers.get(key));
                this.timers.delete(key);
            }
            const deleted = this.store.delete(key);
            if (deleted) {
                log.info(`Cache deleted: ${key}`);
            }
        }
        catch (error) {
            log.error(`Cache delete failed for ${key}: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    /**
     * Check if a key exists in cache.
     * @param key - Cache key identifier.
     * @returns True if key exists and hasn't expired.
     */
    has(key) {
        const entry = this.store.get(key);
        if (!entry)
            return false;
        // Check expiration
        if (entry.expiresAt && Date.now() > entry.expiresAt) {
            this.delete(key);
            return false;
        }
        return true;
    }
    /**
     * Clear all cache entries.
     * WARNING: This removes all cached data!
     *
     * @example
     * ```typescript
     * cache.clear(); // Remove all entries
     * ```
     */
    clear() {
        try {
            // Clear all timers
            for (const timer of this.timers.values()) {
                clearTimeout(timer);
            }
            this.timers.clear();
            const size = this.store.size;
            this.store.clear();
            log.info(`Cache cleared (${size} entries removed)`);
        }
        catch (error) {
            log.error(`Cache clear failed: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    /**
     * Get the number of entries in cache.
     * Note: Includes expired entries until they are auto-deleted or explicitly removed.
     * @returns Number of cache entries.
     */
    size() {
        return this.store.size;
    }
    /**
     * Get all cache keys.
     * @returns Array of all cache keys (including potentially expired ones).
     */
    keys() {
        return Array.from(this.store.keys());
    }
    /**
     * Get cache statistics.
     * @returns Object with size and expiration info.
     */
    stats() {
        let withTTL = 0;
        for (const entry of this.store.values()) {
            if (entry.expiresAt)
                withTTL++;
        }
        return {
            total: this.store.size,
            withTTL,
            keys: this.keys(),
        };
    }
}
