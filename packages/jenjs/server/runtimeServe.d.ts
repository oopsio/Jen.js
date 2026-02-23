/**
 * Generate the browser-safe hydration runtime code.
 * Uses CDN-hosted Preact (esm.sh) for minimal payload and no bundler overhead.
 * This runtime is injected into the page and provides hydration primitives.
 *
 * Note: In production, consider self-hosting the Preact bundle for better performance
 * and reliability (no external CDN dependency).
 *
 * @returns ES module code string for browser hydration runtime
 */
export declare function runtimeHydrateModule(): string;
/**
 * Clear cached compiled module for a file path.
 * Called when a source file changes during development to ensure fresh compilation
 * on next request.
 *
 * @param filePath - Absolute file path to invalidate
 */
export declare function invalidateCache(filePath: string): void;
/**
 * Build a client-side hydration module for a route.
 * Takes a route file path, extracts the default component export,
 * transpiles to browser-executable JavaScript with Preact imports resolved.
 *
 * How it works:
 * 1. Create a proxy file that re-exports only the default component
 *    This allows tree-shaking to remove server-only exports (loader, middleware, etc.)
 * 2. Use esbuild buildSync to transpile and bundle with Preact
 * 3. Cache the result with ETag for HTTP conditional requests
 * 4. Return JS code or fallback to empty component on error
 *
 * Transpilation:
 * - Format: ESM (for client-side import)
 * - Platform: browser (not Node.js)
 * - JSX: Automatic via Preact JSX runtime
 * - Sourcemap: Inline for debugging in browser DevTools
 * - External: Preact and runtime libs (assumed available in browser)
 *
 * Caching:
 * - Cache is per-file-path; invalidated via invalidateCache() when file changes
 * - ETag allows HTTP 304 Not Modified responses
 * - Development mode trusts explicit invalidation (file watcher triggers it)
 *
 * Error handling:
 * - Failed builds return empty Page component (graceful degradation)
 * - Errors are logged but don't stop request
 *
 * @param routeIdOrPath - File path to route component (e.g., "./routes/index.tsx")
 *   Note: routeId support for future config-based resolution
 * @returns ES module JavaScript code (browser-executable)
 */
export declare function buildHydrationModule(routeIdOrPath: string): string;
/**
 * Retrieve the ETag (cache hash) for a compiled hydration module.
 * Used for HTTP conditional requests (If-None-Match, 304 Not Modified).
 *
 * @param filePath - Route file path
 * @returns ETag hash string or null if not cached
 */
export declare function getHydrationEtag(filePath: string): string | null;
