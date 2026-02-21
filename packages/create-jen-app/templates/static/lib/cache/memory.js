/*
 * This file is part of Jen.js.
 * Copyright (C) 2026 oopsio
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */
/**
 * In-memory cache implementation using a JavaScript Map.
 * Stores key-value pairs with optional time-to-live (TTL) expiration.
 * Useful for development, testing, or single-process deployments.
 * Not suitable for multi-process environments (values isolated per process).
 * Note: Expired entries are deleted asynchronously via setTimeout; memory is not
 * compacted if clear() or delete() are never called on expired keys.
 */
export class MemoryCache {
    /** Internal store mapping cache keys to arbitrary values. */
    store = new Map();
    /**
     * Store a value in cache with optional time-to-live.
     * If TTL is specified, the entry is automatically deleted after ttlMs milliseconds.
     * @param key - Cache key identifier.
     * @param value - Value to store (can be any type; recommend serializable for consistency).
     * @param ttlMs - Time-to-live in milliseconds. If omitted, entry persists until delete() or process restart.
     */
    set(key, value, ttlMs) {
        this.store.set(key, value);
        if (ttlMs)
            setTimeout(() => this.store.delete(key), ttlMs);
    }
    /**
     * Retrieve a value from cache.
     * Returns undefined if key does not exist or has expired.
     * @param key - Cache key identifier.
     * @returns Stored value or undefined if not found.
     */
    get(key) {
        return this.store.get(key);
    }
    /**
     * Remove a value from cache.
     * Safe to call on non-existent keys (no-op).
     * @param key - Cache key identifier.
     */
    delete(key) {
        this.store.delete(key);
    }
}
