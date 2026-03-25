/**
 * Cache Plugin
 * Provides caching layer for resolved routes and modules
 */

import type { Plugin, PluginContext } from '../types.js';

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number;
}

export class CachePlugin implements Plugin {
  name = '@jen/cache';
  version = '1.0.0';
  description = 'Provides caching for routes and modules';

  private resolveIdCache = new Map<string, CacheEntry<string | null>>();
  private loadCache = new Map<string, CacheEntry<string | null>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  async init(context: PluginContext): Promise<void> {
    if (context.isDev) {
      console.log('[Plugin] Cache initialized');
    }
  }

  /**
   * Get cached resolveId result
   */
  getCachedResolveId(id: string): string | null | undefined {
    const entry = this.resolveIdCache.get(id);
    if (!entry) return undefined;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.resolveIdCache.delete(id);
      return undefined;
    }

    return entry.value;
  }

  /**
   * Set resolveId cache
   */
  setCachedResolveId(id: string, value: string | null): void {
    this.resolveIdCache.set(id, {
      value,
      timestamp: Date.now(),
      ttl: this.DEFAULT_TTL,
    });
  }

  /**
   * Get cached load result
   */
  getCachedLoad(id: string): string | null | undefined {
    const entry = this.loadCache.get(id);
    if (!entry) return undefined;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.loadCache.delete(id);
      return undefined;
    }

    return entry.value;
  }

  /**
   * Set load cache
   */
  setCachedLoad(id: string, value: string | null): void {
    this.loadCache.set(id, {
      value,
      timestamp: Date.now(),
      ttl: this.DEFAULT_TTL,
    });
  }

  /**
   * Clear all caches
   */
  clear(): void {
    this.resolveIdCache.clear();
    this.loadCache.clear();
  }

  async destroy(): Promise<void> {
    this.clear();
  }
}
