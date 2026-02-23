import type { IncomingMessage, ServerResponse } from "node:http";
import type { FrameworkConfig } from "../core/config.js";
import type { RouteEntry } from "../core/routes/scan.js";
/**
 * Server-side rendering context passed to render() function.
 * Contains all necessary information to render a page on the server.
 */
export interface SSRContext {
    req: IncomingMessage;
    res: ServerResponse;
    url: URL;
    params: Record<string, string>;
    query: Record<string, string>;
    headers: Record<string, string>;
    cookies: Record<string, string>;
}
/**
 * Server-side props context passed to getServerSideProps().
 * Provides access to request, params, and query string.
 */
export interface GetServerSidePropsContext {
    req: IncomingMessage;
    res: ServerResponse;
    params: Record<string, string>;
    query: Record<string, string>;
    headers: Record<string, string>;
    cookies: Record<string, string>;
    url: URL;
}
/**
 * Return type from getServerSideProps().
 * Can return notFound for 404, redirect for redirects, or props for rendering.
 */
export type GetServerSidePropsResult<T = any> = {
    props: T;
} | {
    notFound: true;
} | {
    redirect: {
        destination: string;
        permanent?: boolean;
    };
};
/**
 * Cache configuration and TTL management.
 */
export interface CacheConfig {
    enabled: boolean;
    ttlSeconds: number;
}
/**
 * Configure the SSR HTML cache behavior.
 *
 * @param config Cache configuration options
 */
export declare function configureSsrCache(config: Partial<CacheConfig>): void;
/**
 * Clear the entire SSR render cache.
 * Useful in development or when data has changed.
 */
export declare function clearSsrCache(): void;
/**
 * Clear a specific cached page by URL pathname.
 *
 * @param pathname URL pathname to invalidate
 */
export declare function invalidateSsrCache(pathname: string): void;
/**
 * Core SSR render function: converts a component/template to HTML string.
 * This is the main entry point for server-side rendering in Jen.js.
 *
 * Handles:
 * 1. Cache lookup for performance
 * 2. Module compilation (TS/JSX/Vue/Svelte → JS)
 * 3. Route middleware execution
 * 4. Loader function invocation (getServerSideProps pattern)
 * 5. Component rendering to HTML string
 * 6. Head management and hydration script injection
 * 7. HTML caching for subsequent requests
 *
 * @param config Framework configuration
 * @param route Route entry being rendered
 * @param ctx Complete SSR context with request/response and metadata
 * @returns Complete HTML document as a string
 * @throws Error if rendering fails
 *
 * @example
 * ```typescript
 * const html = await render(config, route, {
 *   req, res, url, params, query, headers, cookies
 * });
 * res.setHeader("content-type", "text/html; charset=utf-8");
 * res.end(html);
 * ```
 */
export declare function render(config: FrameworkConfig, route: RouteEntry, ctx: SSRContext): Promise<string>;
/**
 * Advanced SSR render with optional caching control.
 * Allows per-request cache bypass for revalidation.
 *
 * @param config Framework configuration
 * @param route Route entry being rendered
 * @param ctx Complete SSR context
 * @param options Render options
 * @param options.cache Whether to use/update cache (default: true)
 * @returns Complete HTML document
 *
 * @example
 * ```typescript
 * const html = await renderWithOptions(config, route, ctx, {
 *   cache: false // Bypass cache for this request
 * });
 * ```
 */
export declare function renderWithOptions(config: FrameworkConfig, route: RouteEntry, ctx: SSRContext, options?: {
    cache?: boolean;
}): Promise<string>;
/**
 * Manual HTML rendering of a component to string (no full document).
 * Useful when you need just the component HTML without head/body wrapper.
 *
 * This is a low-level API primarily for internal use.
 * For typical routing, use render() instead.
 *
 * @param config Framework configuration
 * @param route Route to render
 * @param ctx SSR context
 * @returns Just the component body HTML (no <!doctype>, no <head>, no hydration)
 */
export declare function renderComponentToString(config: FrameworkConfig, route: RouteEntry, ctx: SSRContext): Promise<string>;
/**
 * Get cache statistics for monitoring and debugging.
 *
 * @returns Cache statistics
 */
export declare function getSsrCacheStats(): {
    size: number;
    enabled: boolean;
    ttlSeconds: number;
    entries: {
        pathname: string;
        age: number;
        size: number;
    }[];
};
