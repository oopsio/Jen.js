/**
 * Core cache management with SWR (Stale-While-Revalidate) pattern
 */
import type {
  CacheEntry,
  ISRConfig,
  ISRResponse,
  RenderFunction,
  RouteMetadata,
  IStorageProvider,
} from '../types.js';
import { FreshnessChecker } from '../freshness/freshness-checker.js';

export class CacheManager {
  private renderQueue: Set<string> = new Set();

  constructor(
    private storage: IStorageProvider,
    private config: ISRConfig,
  ) {}

  /**
   * Get page with SWR pattern
   *
   * Flow:
   * 1. Cache miss → full SSR, store, return
   * 2. Cache hit (fresh) → return immediately
   * 3. Cache hit (stale) → return stale, queue regeneration
   */
  async getPage(
    route: RouteMetadata,
    render: RenderFunction,
  ): Promise<ISRResponse> {
    const cacheKey = this.getCacheKey(route.path);
    const cached = await this.storage.get(cacheKey);

    // Cache miss
    if (!cached) {
      return this.handleCacheMiss(cacheKey, route, render);
    }

    // Check freshness
    const freshness = FreshnessChecker.check(
      cached.timestamp,
      route.revalidate,
    );

    // Fresh cache
    if (freshness.isFresh) {
      return {
        html: cached.html,
        status: 'HIT_FRESH',
        age: freshness.age,
      };
    }

    // Stale cache: return immediately, queue regeneration
    this.queueRegeneration(cacheKey, route, render);

    return {
      html: cached.html,
      status: 'HIT_STALE',
      age: freshness.age,
    };
  }

  /**
   * Handle cache miss: render, store, return
   */
  private async handleCacheMiss(
    cacheKey: string,
    route: RouteMetadata,
    render: RenderFunction,
  ): Promise<ISRResponse> {
    try {
      const html = await render(route.path);
      const entry: CacheEntry = {
        html,
        timestamp: Date.now(),
      };

      await this.storage.set(cacheKey, entry);

      return {
        html,
        status: 'MISS',
      };
    } catch (error) {
      throw new Error(`Failed to render page ${route.path}: ${String(error)}`, {
        cause: error,
      });
    }
  }

  /**
   * Queue background regeneration (non-blocking)
   */
  private queueRegeneration(
    cacheKey: string,
    route: RouteMetadata,
    render: RenderFunction,
  ): void {
    // Prevent duplicate regenerations
    if (this.renderQueue.has(cacheKey)) {
      return;
    }

    this.renderQueue.add(cacheKey);

    // Fire and forget with error handling
    this.regenerateInBackground(cacheKey, route, render).catch((error) => {
      console.error(`Background regeneration failed for ${route.path}:`, error);
    });
  }

  /**
   * Regenerate page in background with retry logic
   */
  private async regenerateInBackground(
    cacheKey: string,
    route: RouteMetadata,
    render: RenderFunction,
    attempt: number = 1,
  ): Promise<void> {
    try {
      const html = await render(route.path);
      const entry: CacheEntry = {
        html,
        timestamp: Date.now(),
      };

      await this.storage.set(cacheKey, entry);
    } catch {
      // Retry logic
      if (attempt < this.config.maxRetries) {
        await this.delay(this.config.retryDelay);
        return this.regenerateInBackground(
          cacheKey,
          route,
          render,
          attempt + 1,
        );
      }

      // After max retries, preserve old cache (don't delete)
      console.error(
        `Max retries reached for ${route.path}, preserving old cache`,
      );
    } finally {
      // Always remove from queue when done (success or failure)
      this.renderQueue.delete(cacheKey);
    }
  }

  /**
   * Invalidate specific route cache
   */
  async invalidate(path: string): Promise<void> {
    const cacheKey = this.getCacheKey(path);
    await this.storage.delete(cacheKey);
  }

  /**
   * Invalidate all cache
   */
  async invalidateAll(): Promise<void> {
    // This would need to be implemented by storage provider if it supports bulk deletion
    console.warn('invalidateAll not yet implemented');
  }

  /**
   * Get cache metadata without content
   */
  async getMetadata(path: string): Promise<{
    cached: boolean;
    age?: number;
    staleIn?: number;
  } | null> {
    const cacheKey = this.getCacheKey(path);
    const cached = await this.storage.get(cacheKey);

    if (!cached) {
      return null;
    }

    const age = Date.now() - cached.timestamp;
    return {
      cached: true,
      age,
    };
  }

  /**
   * Normalize path to cache key
   */
  private getCacheKey(path: string): string {
    return path.replace(/^\/+|\/+$/g, '') || 'index';
  }

  /**
   * Helper for async delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
