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

import type { CacheBackend, CacheEntry, CacheStrategy } from "./types.js";

/**
 * In-memory cache implementation for data fetching.
 * Supports TTL-based expiration and tag-based invalidation.
 * Suitable for development and single-process deployments.
 */
export class MemoryDataCache implements CacheBackend {
  private store = new Map<string, CacheEntry>();
  private tags = new Map<string, Set<string>>();

  /**
   * Retrieves a cached value by key.
   * Returns null if key doesn't exist or entry has expired.
   */
  async get<T = any>(key: string): Promise<T | null> {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;

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
  async set<T = any>(
    key: string,
    value: T,
    ttl: number = 60000, // 1 minute default
    tags?: string[],
  ): Promise<void> {
    const entry: CacheEntry<T> = {
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
        this.tags.get(tag)!.add(key);
      }
    }
  }

  /**
   * Deletes a specific cache entry.
   */
  async delete(key: string): Promise<void> {
    this.store.delete(key);
    this.cleanupTags(key);
  }

  /**
   * Clears all cache entries.
   */
  async clear(): Promise<void> {
    this.store.clear();
    this.tags.clear();
  }

  /**
   * Invalidates all cache entries with specified tags.
   * Useful for mass cache busting after data mutations.
   */
  async invalidate(tags: string[]): Promise<void> {
    const keysToDelete = new Set<string>();

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
  private cleanupTags(key: string): void {
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
  private estimateMemory(): number {
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
export class NoOpCache implements CacheBackend {
  async get<T = any>(): Promise<T | null> {
    return null;
  }

  async set<T = any>(): Promise<void> {
    // No-op
  }

  async delete(): Promise<void> {
    // No-op
  }

  async clear(): Promise<void> {
    // No-op
  }

  async invalidate(): Promise<void> {
    // No-op
  }
}

/**
 * Creates a cache key from a URL and optional parameters.
 * Ensures consistent key generation across requests.
 */
export function createCacheKey(
  url: string,
  options?: {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
  },
): string {
  let key = url;

  if (options?.method && options.method !== "GET") {
    key += `|${options.method}`;
  }

  if (options?.body) {
    const bodyStr =
      typeof options.body === "string" ? options.body : JSON.stringify(options.body);
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
function hashString(str: string): string {
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
export async function executeCacheStrategy<T>(
  strategy: CacheStrategy,
  {
    key,
    cache,
    fetchFn,
    ttl = 60000,
    tags,
  }: {
    key: string;
    cache: CacheBackend;
    fetchFn: () => Promise<T>;
    ttl?: number;
    tags?: string[];
  },
): Promise<{ data: T; cached: boolean }> {
  switch (strategy) {
    case "cache-first": {
      const cached = await cache.get<T>(key);
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
      } catch {
        const cached = await cache.get<T>(key);
        if (cached !== null) {
          return { data: cached, cached: true };
        }
        throw;
      }
    }

    case "stale-while-revalidate": {
      const cached = await cache.get<T>(key);
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
