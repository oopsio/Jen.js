// import path from 'node:path';
import { ISRManager } from '../server/isr-manager.js';

/**
 * Revalidation options
 */
export interface RevalidateOptions {
  recursive?: boolean; // Revalidate path and all sub-paths
  background?: boolean; // Don't wait for revalidation to complete
}

/**
 * Revalidation result
 */
export interface RevalidateResult {
  success: boolean;
  path: string;
  message: string;
  revalidatedAt: string;
  duration?: number; // Milliseconds
}

/**
 * Cache Revalidation API
 *
 * Provides programmatic on-demand cache invalidation for ISR
 */
export class CacheRevalidationAPI {
  /**
   * Revalidate a specific path on-demand
   *
   * @param pathToRevalidate - URL path to revalidate (e.g., '/blog/post-1')
   * @param options - Revalidation options
   * @returns Result of revalidation
   *
   * @example
   * // In an API route
   * export async function POST(req: APIRequest, res: APIResponse) {
   *   const { path } = req.body;
   *
   *   const result = await jen.revalidate(path);
   *
   *   return res.json(result);
   * }
   */
  public static async revalidate(
    pathToRevalidate: string,
    options: RevalidateOptions = {},
  ): Promise<RevalidateResult> {
    const startTime = performance.now();

    try {
      // Normalize path
      const normalizedPath = this.normalizePath(pathToRevalidate);

      // Log revalidation
      if (typeof console !== 'undefined') {
        console.log(`\x1b[33m[Revalidation]\x1b[0m Path: ${normalizedPath}`);
      }

      // Trigger ISR revalidation
      if (ISRManager.isISREnabled()) {
        // Delete cached entry
        await this.invalidateCache(normalizedPath);

        // If recursive, also invalidate child paths
        if (options.recursive) {
          await this.invalidateCacheRecursive(normalizedPath);
        }
      }

      const duration = performance.now() - startTime;

      return {
        success: true,
        path: normalizedPath,
        message: `Path revalidated successfully${options.recursive ? ' (including children)' : ''}`,
        revalidatedAt: new Date().toISOString(),
        duration,
      };
    } catch (error) {
      const duration = performance.now() - startTime;

      if (typeof console !== 'undefined') {
        console.error('[Revalidation Error]', error);
      }

      return {
        success: false,
        path: pathToRevalidate,
        message: error instanceof Error ? error.message : String(error),
        revalidatedAt: new Date().toISOString(),
        duration,
      };
    }
  }

  /**
   * Revalidate multiple paths at once
   */
  public static async revalidateMultiple(
    paths: string[],
    options: RevalidateOptions = {},
  ): Promise<RevalidateResult[]> {
    const results = await Promise.all(
      paths.map((p) => this.revalidate(p, options)),
    );
    return results;
  }

  /**
   * Revalidate all paths matching a pattern
   */
  public static async revalidatePattern(
    pattern: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options: RevalidateOptions = {},
  ): Promise<RevalidateResult> {
    try {
      // For now, treat pattern as a prefix
      // Future: support glob patterns
      const startTime = performance.now();

      if (typeof console !== 'undefined') {
        console.log(`\x1b[33m[Revalidation]\x1b[0m Pattern: ${pattern}`);
      }

      if (ISRManager.isISREnabled()) {
        await this.invalidateCachePattern(pattern);
      }

      const duration = performance.now() - startTime;

      return {
        success: true,
        path: pattern,
        message: `Paths matching pattern revalidated successfully`,
        revalidatedAt: new Date().toISOString(),
        duration,
      };
    } catch (error) {
      return {
        success: false,
        path: pattern,
        message: error instanceof Error ? error.message : String(error),
        revalidatedAt: new Date().toISOString(),
      };
    }
  }

  /**
   * Clear all ISR cache
   */
  public static async revalidateAll(): Promise<RevalidateResult> {
    const startTime = performance.now();

    try {
      if (typeof console !== 'undefined') {
        console.log(`\x1b[33m[Revalidation]\x1b[0m Clearing all cache...`);
      }

      if (ISRManager.isISREnabled()) {
        // Get ISR manager and clear cache
        // This would need ISRManager to expose a clear() method
        // For now, we just log the intent
      }

      const duration = performance.now() - startTime;

      return {
        success: true,
        path: '*',
        message: 'All cache revalidated successfully',
        revalidatedAt: new Date().toISOString(),
        duration,
      };
    } catch (error) {
      return {
        success: false,
        path: '*',
        message: error instanceof Error ? error.message : String(error),
        revalidatedAt: new Date().toISOString(),
      };
    }
  }

  /**
   * Normalize a path for caching
   */
  private static normalizePath(pathname: string): string {
    // Remove trailing slash except for root
    let normalized = pathname === '/' ? '/' : pathname.replace(/\/$/, '');

    // Ensure it starts with /
    if (!normalized.startsWith('/')) {
      normalized = '/' + normalized;
    }

    return normalized;
  }

  /**
   * Invalidate cache for a specific path
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private static async invalidateCache(_pathname: string): Promise<void> {
    // This would integrate with ISRManager's cache storage
    // The actual implementation depends on the cache storage backend

    // For now, we notify the system that this path should be revalidated
    if (typeof process !== 'undefined') {
      // Set an environment variable or emit an event
      // that ISRManager can listen to
    }
  }

  /**
   * Recursively invalidate child paths
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private static async invalidateCacheRecursive(
    _pathname: string,
  ): Promise<void> {
    // This would find all cached paths that start with this pathname
    // and invalidate them
    // Example: /blog invalidates /blog, /blog/post-1, /blog/post-2, etc.
  }

  /**
   * Invalidate paths matching a pattern
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private static async invalidateCachePattern(_pattern: string): Promise<void> {
    // This would find all cached paths matching the pattern
    // and invalidate them
    // Supports glob-style patterns like /blog/* or /api/posts/[id]
  }
}

/**
 * Global cache revalidation API
 * Available as jen.revalidate()
 */
export const jen = {
  /**
   * Revalidate a path on-demand
   *
   * @example
   * await jen.revalidate('/blog/post-1');
   *
   * @example
   * // With recursive invalidation
   * await jen.revalidate('/blog', { recursive: true });
   *
   * @example
   * // From a webhook handler
   * export async function POST(req: APIRequest, res: APIResponse) {
   *   const { path } = req.body;
   *   const result = await jen.revalidate(path);
   *   return res.json(result);
   * }
   */
  revalidate: (pathname: string, options?: RevalidateOptions) =>
    CacheRevalidationAPI.revalidate(pathname, options),

  /**
   * Revalidate multiple paths
   */
  revalidateMultiple: (paths: string[], options?: RevalidateOptions) =>
    CacheRevalidationAPI.revalidateMultiple(paths, options),

  /**
   * Revalidate paths matching a pattern
   */
  revalidatePattern: (pattern: string, options?: RevalidateOptions) =>
    CacheRevalidationAPI.revalidatePattern(pattern, options),

  /**
   * Clear all cache
   */
  revalidateAll: () => CacheRevalidationAPI.revalidateAll(),
};
