import { renderWithOptions } from "./ssr.js";
/**
 * In-memory storage for ISR cache entries.
 * Persists across requests using stale-while-revalidate pattern.
 */
const isrCache = new Map();
/**
 * Global default revalidation interval (seconds).
 * Can be overridden per-route via RouteEntry.revalidateSeconds.
 * Defaults to 1 hour.
 */
let defaultRevalidateSeconds = 3600;
let isrConfig = {
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
export function setIsrConfig(config) {
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
export function getIsrConfig() {
    return { ...isrConfig };
}
/**
 * Log debug message if ISR debug mode is enabled.
 *
 * @param message Log message
 * @param args Additional log arguments
 */
function debugLog(message, ...args) {
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
function isRevalidationNeeded(entry) {
    const now = Date.now();
    const revalidateTtl = (entry.revalidateSeconds ?? defaultRevalidateSeconds) * 1000;
    const age = now - entry.timestamp;
    return age > revalidateTtl;
}
/**
 * Enqueue a background revalidation task.
 * Respects maxConcurrentRevalidations to prevent overwhelming the server.
 *
 * @param fn Async function to execute in background
 */
async function enqueueRevalidation(fn) {
    // Wait for slot to become available if at capacity
    while (concurrentRevalidations >= isrConfig.maxConcurrentRevalidations) {
        await new Promise((resolve) => setTimeout(resolve, 10));
    }
    concurrentRevalidations++;
    try {
        await fn();
    }
    finally {
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
export async function getIsrHtml(config, route, ctx, options) {
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
                }
                catch (err) {
                    debugLog(`Background revalidation failed for ${pathname}:`, err);
                    // Keep serving stale cache on error; don't propagate failure
                }
                finally {
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
    }
    else if ("revalidateSeconds" in route &&
        typeof route.revalidateSeconds === "number") {
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
export function setIsrCache(routePath, html, options) {
    const now = Date.now();
    const revalidateTtl = options?.revalidate ?? defaultRevalidateSeconds;
    isrCache.set(routePath, {
        html,
        timestamp: now,
        revalidateSeconds: revalidateTtl,
        revalidating: false,
    });
    debugLog(`Manually set ISR cache for ${routePath} with TTL ${revalidateTtl}s`);
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
export function invalidateIsrCache(routePath) {
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
export function clearIsrCache() {
    isrCache.clear();
    debugLog("Cleared entire ISR cache");
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
export function getIsrStats() {
    const now = Date.now();
    const entries = [];
    let revalidatingCount = 0;
    for (const [pathname, entry] of isrCache.entries()) {
        const age = (now - entry.timestamp) / 1000;
        const revalidateSeconds = entry.revalidateSeconds ?? defaultRevalidateSeconds;
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
export async function waitForRevalidations(timeout = 30000) {
    const startTime = Date.now();
    const promises = [];
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
            new Promise((_, reject) => setTimeout(() => reject(new Error("Revalidation timeout")), timeout)),
        ]);
    }
    catch (err) {
        const elapsed = Date.now() - startTime;
        debugLog(`Revalidation wait timed out after ${elapsed}ms`);
    }
}
