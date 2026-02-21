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

import type { FrameworkConfig } from "../core/config.js";
import type { RouteEntry } from "../core/routes/scan.js";
import type { SSRContext } from "./ssr.js";
import { renderWithOptions } from "./ssr.js";

/**
 * ISR cache entry tracking HTML content, generation timestamp, and revalidation metadata.
 * Implements stale-while-revalidate pattern by separating expiry from revalidation.
 */
interface IsrCacheEntry {
  /** Cached HTML content */
  html: string;
  /** Timestamp when HTML was generated */
  timestamp: number;
  /** Custom revalidation interval (seconds), or undefined to use global default */
  revalidateSeconds?: number;
  /** Whether a background revalidation is currently in progress */
  revalidating: boolean;
  /** Promise for in-flight revalidation, used to coalesce concurrent requests */
  revalidationPromise?: Promise<void>;
}

/**
 * In-memory storage for ISR cache entries.
 * Persists across requests using stale-while-revalidate pattern.
 */
const isrCache = new Map<string, IsrCacheEntry>();

/**
 * Global default revalidation interval (seconds).
 * Can be overridden per-route via RouteEntry.revalidateSeconds.
 * Defaults to 1 hour.
 */
let defaultRevalidateSeconds = 3600;

/**
 * Configuration for ISR behavior.
 * Can be modified via setIsrConfig().
 */
interface IsrConfig {
  /** Global default revalidation interval in seconds */
  defaultRevalidateSeconds: number;
  /** Maximum concurrent background revalidations */
  maxConcurrentRevalidations: number;
  /** Whether to log ISR activity */
  debug: boolean;
}

let isrConfig: IsrConfig = {
  defaultRevalidateSeconds: 3600,
  maxConcurrentRevalidations: 5,
  debug: false,
};

/** Counter to track concurrent revalidations */
let concurrentRevalidations = 0;

/**
 * Configure ISR behavior globally.
 * Allows customization of revalidation intervals and concurrency.
 *
 * @param config Partial ISR configuration to merge
 *
 * @example
 * ```typescript
 * import * as ISR from './isr.ts';
 *
 * ISR.setIsrConfig({
 *   defaultRevalidateSeconds: 300, // 5 minutes
 *   debug: true
 * });
 * ```
 */
export function setIsrConfig(config: Partial<IsrConfig>): void {
  isrConfig = { ...isrConfig, ...config };
  if (config.defaultRevalidateSeconds !== undefined) {
    defaultRevalidateSeconds = config.defaultRevalidateSeconds;
  }
}

/**
 * Get the current ISR configuration.
 *
 * @returns Current ISR configuration
 */
export function getIsrConfig(): Readonly<IsrConfig> {
  return { ...isrConfig };
}

/**
 * Log debug message if ISR debug mode is enabled.
 *
 * @param message Log message
 * @param args Additional log arguments
 */
function debugLog(message: string, ...args: unknown[]): void {
  if (isrConfig.debug) {
    console.log(`[ISR] ${message}`, ...args);
  }
}

/**
 * Determine if cached HTML has exceeded its revalidation TTL.
 * Returns true if the cache should be regenerated in the background.
 *
 * @param entry ISR cache entry to check
 * @returns true if revalidation is needed
 */
function isRevalidationNeeded(entry: IsrCacheEntry): boolean {
  const now = Date.now();
  const revalidateTtl =
    (entry.revalidateSeconds ?? defaultRevalidateSeconds) * 1000;
  const age = now - entry.timestamp;
  return age > revalidateTtl;
}

/**
 * Enqueue a background revalidation task.
 * Respects maxConcurrentRevalidations to prevent overwhelming the server.
 *
 * @param fn Async function to execute in background
 */
async function enqueueRevalidation(fn: () => Promise<void>): Promise<void> {
  // Wait for slot to become available if at capacity
  while (concurrentRevalidations >= isrConfig.maxConcurrentRevalidations) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  concurrentRevalidations++;
  try {
    await fn();
  } finally {
    concurrentRevalidations--;
  }
}

/**
 * Main ISR entry point: fetch or generate cached HTML for a route.
 * Implements stale-while-revalidate pattern:
 * - Serves cached HTML immediately if available
 * - Regenerates in background if expired (without blocking response)
 * - Regenerates on-demand if no cache exists
 *
 * This function integrates seamlessly with Jen.js's render() function.
 *
 * @param config Framework configuration
 * @param route Route entry being requested
 * @param ctx SSR context with request/response metadata
 * @param options ISR-specific options
 * @param options.revalidate Override revalidation TTL (seconds), overrides route.revalidateSeconds
 * @returns Cached or freshly rendered HTML
 *
 * @throws Error if rendering fails and no cache exists
 *
 * @example
 * ```typescript
 * import * as ISR from './isr.ts';
 * import { getIsrHtml, setIsrConfig } from './isr.ts';
 *
 * // Setup
 * setIsrConfig({ defaultRevalidateSeconds: 300, debug: true });
 *
 * // In route handler
 * app.get('/:path(*)', async (req, res) => {
 *   try {
 *     const html = await getIsrHtml(config, route, {
 *       req, res, url, params, query, headers, cookies
 *     });
 *     res.setHeader('content-type', 'text/html; charset=utf-8');
 *     res.end(html);
 *   } catch (err) {
 *     res.statusCode = 500;
 *     res.end('Rendering failed');
 *   }
 * });
 *
 * // Per-route override
 * const html = await getIsrHtml(config, route, ctx, {
 *   revalidate: 60 // Regenerate every 60 seconds for this request
 * });
 * ```
 */
export async function getIsrHtml(
  config: FrameworkConfig,
  route: RouteEntry,
  ctx: SSRContext,
  options?: { revalidate?: number },
): Promise<string> {
  const pathname = ctx.url.pathname;
  const now = Date.now();

  // Lookup existing cache entry
  const cached = isrCache.get(pathname);

  // If we have cached content, serve it immediately
  if (cached) {
    debugLog(`Cache hit for ${pathname}`);

    // Check if revalidation is needed (stale-while-revalidate pattern)
    const needsRevalidation = isRevalidationNeeded(cached);

    if (needsRevalidation && !cached.revalidating) {
      debugLog(`Initiating background revalidation for ${pathname}`);

      // Mark as revalidating and enqueue background task
      cached.revalidating = true;
      cached.revalidationPromise = enqueueRevalidation(async () => {
        try {
          const freshHtml = await renderWithOptions(config, route, ctx, {
            cache: false,
          });
          cached.html = freshHtml;
          cached.timestamp = now;
          debugLog(`Background revalidation complete for ${pathname}`);
        } catch (err) {
          debugLog(`Background revalidation failed for ${pathname}:`, err);
          // Keep serving stale cache on error; don't propagate failure
        } finally {
          cached.revalidating = false;
        }
      });
    }

    // Return cached HTML immediately (stale-while-revalidate pattern)
    return cached.html;
  }

  // No cache exists - render on-demand and cache result
  debugLog(`Cache miss, rendering on-demand for ${pathname}`);
  const html = await renderWithOptions(config, route, ctx, { cache: false });

  // Determine revalidation TTL (order of precedence)
  let revalidateTtl = defaultRevalidateSeconds;
  if (options?.revalidate !== undefined) {
    revalidateTtl = options.revalidate;
  } else if (
    "revalidateSeconds" in route &&
    typeof route.revalidateSeconds === "number"
  ) {
    revalidateTtl = route.revalidateSeconds;
  }

  // Store in ISR cache
  isrCache.set(pathname, {
    html,
    timestamp: now,
    revalidateSeconds: revalidateTtl,
    revalidating: false,
  });

  debugLog(`Cached ${pathname} with TTL ${revalidateTtl}s`);
  return html;
}

/**
 * Manually set or update ISR cache for a route.
 * Useful for programmatic cache invalidation and updates.
 *
 * @param routePath URL pathname to cache (e.g., "/", "/about", "/posts/123")
 * @param html Complete HTML document to cache
 * @param options Cache options
 * @param options.revalidate Custom revalidation interval (seconds), overrides default
 *
 * @example
 * ```typescript
 * import { setIsrCache } from './isr.ts';
 *
 * // After updating a blog post
 * app.post('/api/posts/:id', async (req, res) => {
 *   // ... update database ...
 *
 *   // Regenerate and cache the post page
 *   const html = await renderPost(req.params.id);
 *   setIsrCache(`/posts/${req.params.id}`, html, { revalidate: 3600 });
 *
 *   res.json({ success: true });
 * });
 * ```
 */
export function setIsrCache(
  routePath: string,
  html: string,
  options?: { revalidate?: number },
): void {
  const now = Date.now();
  const revalidateTtl = options?.revalidate ?? defaultRevalidateSeconds;

  isrCache.set(routePath, {
    html,
    timestamp: now,
    revalidateSeconds: revalidateTtl,
    revalidating: false,
  });

  debugLog(
    `Manually set ISR cache for ${routePath} with TTL ${revalidateTtl}s`,
  );
}

/**
 * Invalidate ISR cache for a specific route.
 * Forces regeneration on next request.
 *
 * @param routePath URL pathname to invalidate
 *
 * @example
 * ```typescript
 * import { invalidateIsrCache } from './isr.ts';
 *
 * app.post('/api/posts/:id/publish', async (req, res) => {
 *   // ... publish logic ...
 *   invalidateIsrCache(`/posts/${req.params.id}`);
 *   res.json({ success: true });
 * });
 * ```
 */
export function invalidateIsrCache(routePath: string): void {
  isrCache.delete(routePath);
  debugLog(`Invalidated ISR cache for ${routePath}`);
}

/**
 * Clear the entire ISR cache.
 * Useful after bulk data updates or deployment.
 *
 * @example
 * ```typescript
 * import { clearIsrCache } from './isr.ts';
 *
 * // After re-importing data
 * await importDataFromSources();
 * clearIsrCache();
 * ```
 */
export function clearIsrCache(): void {
  isrCache.clear();
  debugLog("Cleared entire ISR cache");
}

/**
 * ISR cache statistics for monitoring and debugging.
 * Provides insights into cache size, age, and revalidation status.
 */
export interface IsrStats {
  /** Total number of cached routes */
  size: number;
  /** Array of individual cache entry statistics */
  entries: IsrStatEntry[];
  /** Number of routes currently revalidating */
  revalidating: number;
  /** Concurrent revalidation limit */
  maxConcurrentRevalidations: number;
  /** Global default revalidation interval */
  defaultRevalidateSeconds: number;
}

/**
 * Statistics for a single ISR cache entry.
 */
export interface IsrStatEntry {
  /** URL pathname being cached */
  pathname: string;
  /** Age of cached content in seconds */
  age: number;
  /** Revalidation TTL for this entry in seconds */
  revalidateSeconds: number;
  /** Size of cached HTML in bytes */
  size: number;
  /** Whether this entry is currently revalidating */
  revalidating: boolean;
}

/**
 * Get comprehensive ISR cache statistics.
 * Useful for monitoring cache health and performance.
 *
 * Returns cache size, entry details (age, TTL, size), and revalidation status.
 * All ages are calculated at call time.
 *
 * @returns ISR cache statistics
 *
 * @example
 * ```typescript
 * import { getIsrStats } from './isr.ts';
 *
 * app.get('/admin/isr-stats', (req, res) => {
 *   const stats = getIsrStats();
 *   console.log(`Cache size: ${stats.size} routes`);
 *   console.log(`Revalidating: ${stats.revalidating}/${stats.maxConcurrentRevalidations}`);
 *
 *   stats.entries.forEach(entry => {
 *     console.log(`${entry.pathname}: age=${entry.age}s, ttl=${entry.revalidateSeconds}s`);
 *   });
 *
 *   res.json(stats);
 * });
 * ```
 */
export function getIsrStats(): IsrStats {
  const now = Date.now();
  const entries: IsrStatEntry[] = [];
  let revalidatingCount = 0;

  for (const [pathname, entry] of isrCache.entries()) {
    const age = (now - entry.timestamp) / 1000;
    const revalidateSeconds =
      entry.revalidateSeconds ?? defaultRevalidateSeconds;

    entries.push({
      pathname,
      age,
      revalidateSeconds,
      size: entry.html.length,
      revalidating: entry.revalidating,
    });

    if (entry.revalidating) {
      revalidatingCount++;
    }
  }

  return {
    size: isrCache.size,
    entries,
    revalidating: revalidatingCount,
    maxConcurrentRevalidations: isrConfig.maxConcurrentRevalidations,
    defaultRevalidateSeconds,
  };
}

/**
 * Wait for all in-flight revalidations to complete.
 * Useful in testing or graceful shutdown scenarios.
 *
 * @param timeout Maximum time to wait in milliseconds (default: 30000)
 * @returns Promise that resolves when all revalidations complete or timeout occurs
 *
 * @example
 * ```typescript
 * import { waitForRevalidations } from './isr.ts';
 *
 * // In graceful shutdown
 * process.on('SIGTERM', async () => {
 *   console.log('Waiting for revalidations to complete...');
 *   await waitForRevalidations(5000);
 *   server.close();
 * });
 * ```
 */
export async function waitForRevalidations(timeout = 30000): Promise<void> {
  const startTime = Date.now();
  const promises: Promise<void>[] = [];

  for (const entry of isrCache.values()) {
    if (entry.revalidating && entry.revalidationPromise) {
      promises.push(entry.revalidationPromise);
    }
  }

  if (promises.length === 0) {
    return;
  }

  try {
    await Promise.race([
      Promise.all(promises),
      new Promise<void>((_, reject) =>
        setTimeout(() => reject(new Error("Revalidation timeout")), timeout),
      ),
    ]);
  } catch (err) {
    const elapsed = Date.now() - startTime;
    debugLog(`Revalidation wait timed out after ${elapsed}ms`);
  }
}

/**
 * Type guard and extension for RouteEntry to support ISR revalidation metadata.
 *
 * Allows RouteEntry objects to optionally include revalidateSeconds property:
 *
 * ```typescript
 * // In your route file (e.g., src/pages/blog.tsx)
 * export const revalidateSeconds = 300; // Revalidate every 5 minutes
 *
 * // Or define on route metadata
 * const routeEntry: RouteEntry & { revalidateSeconds?: number } = {
 *   id: 'blog',
 *   filePath: '/app/src/pages/blog.tsx',
 *   urlPath: '/blog',
 *   pattern: '^/blog/?$',
 *   paramNames: [],
 *   revalidateSeconds: 300
 * };
 * ```
 *
 * When getIsrHtml() is called with such a route, it automatically uses the
 * route-specific revalidateSeconds if present.
 */
declare global {
  // Extend RouteEntry type to support optional revalidateSeconds
  // Users can add this property to their route definitions
}
