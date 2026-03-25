/**
 * Cache manager integration tests
 */
import { describe, it, expect, beforeEach } from 'bun:test';
import { CacheManager } from '../cache/cache-manager.js';
import { MemoryStorage } from '../storage/memory-storage.js';
import type { ISRConfig, RouteMetadata } from '../types.js';

describe('CacheManager', () => {
  let cacheManager: CacheManager;
  let storage: MemoryStorage;

  const config: ISRConfig = {
    cacheDir: '.cache/test',
    maxRetries: 2,
    retryDelay: 50,
  };

  beforeEach(() => {
    storage = new MemoryStorage();
    cacheManager = new CacheManager(storage, config);
  });

  describe('Cache miss', () => {
    it('should render, store, and return on cache miss', async () => {
      const route: RouteMetadata = { path: '/test', revalidate: 60 };
      const render = async () => '<div>Hello</div>';

      const result = await cacheManager.getPage(route, render);

      expect(result.status).toBe('MISS');
      expect(result.html).toBe('<div>Hello</div>');
    });

    it('should handle render errors', async () => {
      const route: RouteMetadata = { path: '/error', revalidate: 60 };
      const render = async () => {
        throw new Error('Render failed');
      };

      expect(async () => {
        await cacheManager.getPage(route, render);
      }).toThrow();
    });
  });

  describe('Cache hit (fresh)', () => {
    it('should return fresh cache without re-rendering', async () => {
      const route: RouteMetadata = { path: '/test', revalidate: 3600 };
      let renderCount = 0;
      const render = async () => {
        renderCount++;
        return `<div>Render ${renderCount}</div>`;
      };

      // First request: cache miss
      const result1 = await cacheManager.getPage(route, render);
      expect(result1.status).toBe('MISS');
      expect(renderCount).toBe(1);

      // Second request: cache hit (fresh)
      const result2 = await cacheManager.getPage(route, render);
      expect(result2.status).toBe('HIT_FRESH');
      expect(renderCount).toBe(1); // No additional render
      expect(result2.html).toBe('<div>Render 1</div>');
    });

    it('should include cache age in response', async () => {
      const route: RouteMetadata = { path: '/test', revalidate: 3600 };
      const render = async () => '<div>Test</div>';

      await cacheManager.getPage(route, render);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const result = await cacheManager.getPage(route, render);
      expect(result.age).toBeDefined();
      expect(result.age! >= 100).toBe(true);
    });
  });

  describe('Cache hit (stale)', () => {
    it('should return stale cache while queuing regeneration', async () => {
      const route: RouteMetadata = { path: '/test', revalidate: 0.1 }; // 0.1 seconds
      let renderCount = 0;
      const render = async () => {
        renderCount++;
        // Simulate async render work
        await new Promise((resolve) => setTimeout(resolve, 50));
        return `<div>Render ${renderCount}</div>`;
      };

      // First request: cache miss
      const result1 = await cacheManager.getPage(route, render);
      expect(result1.status).toBe('MISS');
      expect(result1.html).toBe('<div>Render 1</div>');

      // Wait for cache to become stale
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Second request: cache hit (stale) - returns immediately
      const result2 = await cacheManager.getPage(route, render);
      expect(result2.status).toBe('HIT_STALE');
      expect(result2.html).toBe('<div>Render 1</div>'); // Still serving old content

      // Background regeneration should be queued and will complete shortly
      // Wait for it to finish
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Verify background render completed
      expect(renderCount).toBe(2);
    });

    it('should prevent duplicate regenerations', async () => {
      const route: RouteMetadata = { path: '/test', revalidate: 0.05 };
      let renderCount = 0;
      const render = async () => {
        renderCount++;
        await new Promise((resolve) => setTimeout(resolve, 100)); // Slow render
        return `<div>Render ${renderCount}</div>`;
      };

      // First request
      await cacheManager.getPage(route, render);

      // Wait for stale
      await new Promise((resolve) => setTimeout(resolve, 60));

      // Multiple simultaneous requests
      await Promise.all([
        cacheManager.getPage(route, render),
        cacheManager.getPage(route, render),
        cacheManager.getPage(route, render),
      ]);

      // Wait for background regeneration
      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(renderCount).toBe(2); // Only 1 background render (not 3)
    });
  });

  describe('No revalidation (infinite freshness)', () => {
    it('should always return fresh if revalidate is undefined', async () => {
      const route: RouteMetadata = { path: '/test' }; // No revalidate
      let renderCount = 0;
      const render = async () => {
        renderCount++;
        return `<div>Render ${renderCount}</div>`;
      };

      await cacheManager.getPage(route, render);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const result = await cacheManager.getPage(route, render);
      expect(result.status).toBe('HIT_FRESH');
      expect(renderCount).toBe(1);
    });
  });

  describe('Invalidation', () => {
    it('should remove cache entry', async () => {
      const route: RouteMetadata = { path: '/test', revalidate: 3600 };
      const render = async () => '<div>Test</div>';

      await cacheManager.getPage(route, render);
      await cacheManager.invalidate('/test');

      const result = await cacheManager.getPage(route, render);
      expect(result.status).toBe('MISS');
    });
  });

  describe('Metadata', () => {
    it('should return metadata without content', async () => {
      const route: RouteMetadata = { path: '/test', revalidate: 3600 };
      const render = async () => '<div>Test</div>';

      await cacheManager.getPage(route, render);

      const metadata = await cacheManager.getMetadata('/test');
      expect(metadata).toBeDefined();
      expect(metadata?.cached).toBe(true);
      expect(metadata?.age).toBeDefined();
    });

    it('should return null for non-existent cache', async () => {
      const metadata = await cacheManager.getMetadata('/nonexistent');
      expect(metadata).toBeNull();
    });
  });
});
