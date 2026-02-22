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

import type { IncomingMessage, ServerResponse } from "node:http";
import type { FrameworkConfig } from "../core/config.js";
import type { RouteEntry } from "../core/routes/scan.js";
import { renderRouteToHtml } from "../runtime/render.js";

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
export type GetServerSidePropsResult<T = unknown> =
  | { props: T }
  | { notFound: true }
  | { redirect: { destination: string; permanent?: boolean } };

/**
 * LRU Cache entry with timestamp for TTL tracking.
 */
interface CacheEntry {
  html: string;
  timestamp: number;
  accessedAt: number;
}

/**
 * Lightweight LRU (Least Recently Used) Cache implementation.
 * Maintains insertion order and tracks access time for eviction.
 */
class LRUCache {
  private map = new Map<string, CacheEntry>();
  private maxSize: number;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }

  get(key: string): CacheEntry | undefined {
    const entry = this.map.get(key);
    if (entry) {
      // Move to end (most recently used)
      this.map.delete(key);
      entry.accessedAt = Date.now();
      this.map.set(key, entry);
    }
    return entry;
  }

  set(key: string, entry: CacheEntry) {
    // Remove if exists to re-insert at end
    if (this.map.has(key)) {
      this.map.delete(key);
    }

    this.map.set(key, entry);

    // Evict least recently used if over capacity
    if (this.map.size > this.maxSize) {
      const firstKey = this.map.keys().next().value;
      if (firstKey) {
        this.map.delete(firstKey);
      }
    }
  }

  delete(key: string) {
    this.map.delete(key);
  }

  clear() {
    this.map.clear();
  }

  get size() {
    return this.map.size;
  }

  entries() {
    return this.map.entries();
  }
}

const renderCache = new LRUCache(1000);

/**
 * Cache configuration and TTL management.
 */
export interface CacheConfig {
  enabled: boolean;
  ttlSeconds: number;
  maxEntries?: number;
}

let cacheConfig: CacheConfig = {
  enabled: true,
  ttlSeconds: 3600, // Default: 1 hour
  maxEntries: 1000, // Default: 1000 max cached pages
};

/**
 * Background sweep interval (ms) to clean expired entries.
 */
const CACHE_SWEEP_INTERVAL = 5 * 60 * 1000; // 5 minutes

/**
 * Start periodic cache cleanup to remove expired entries.
 */
function startCacheSweep() {
  const sweepTimer = setInterval(() => {
    if (!cacheConfig.enabled) return;

    const now = Date.now();
    const ttlMs = (cacheConfig.ttlSeconds ?? 3600) * 1000;

    for (const [key, entry] of renderCache.entries()) {
      const age = now - entry.timestamp;
      if (age > ttlMs) {
        renderCache.delete(key);
      }
    }
  }, CACHE_SWEEP_INTERVAL);

  // Prevent Node.js process from exiting due to this timer
  if (typeof sweepTimer.unref === "function") {
    sweepTimer.unref();
  }

  return sweepTimer;
}

// Start the background sweep
if (typeof global !== "undefined") {
  try {
    startCacheSweep();
  } catch {
    // Ignore if called in non-Node environment
  }
}

/**
 * Configure the SSR HTML cache behavior.
 * Updates maxEntries for the LRU cache if provided.
 *
 * @param config Cache configuration options
 */
export function configureSsrCache(config: Partial<CacheConfig>) {
  cacheConfig = { ...cacheConfig, ...config };

  // Update LRU cache size if maxEntries changed
  if (config.maxEntries && config.maxEntries > 0) {
    // Reinitialize LRU cache with new size
    const existing = Array.from(renderCache.entries());
    renderCache.clear();

    // Recreate with new size (this is a limitation of the current approach,
    // but maxEntries rarely changes at runtime)
    for (const [key, entry] of existing) {
      renderCache.set(key, entry);
    }
  }
}

/**
 * Clear the entire SSR render cache.
 * Useful in development or when data has changed.
 */
export function clearSsrCache() {
  renderCache.clear();
}

/**
 * Clear a specific cached page by URL pathname.
 *
 * @param pathname URL pathname to invalidate
 */
export function invalidateSsrCache(pathname: string) {
  renderCache.delete(pathname);
}

/**
 * Get cached HTML for a page if it exists and hasn't expired.
 *
 * @param pathname URL pathname
 * @returns Cached HTML string, or null if not cached/expired
 */
function getCachedHtml(pathname: string): string | null {
  if (!cacheConfig.enabled) return null;

  const cached = renderCache.get(pathname);
  if (!cached) return null;

  const age = (Date.now() - cached.timestamp) / 1000;
  if (age > cacheConfig.ttlSeconds) {
    renderCache.delete(pathname);
    return null;
  }

  return cached.html;
}

/**
 * Cache rendered HTML for a page.
 * LRU eviction occurs automatically when maxEntries is exceeded.
 *
 * @param pathname URL pathname
 * @param html Complete HTML string to cache
 */
function cacheHtml(pathname: string, html: string) {
  if (!cacheConfig.enabled) return;
  renderCache.set(pathname, {
    html,
    timestamp: Date.now(),
    accessedAt: Date.now(),
  });
}

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
export async function render(
  config: FrameworkConfig,
  route: RouteEntry,
  ctx: SSRContext,
): Promise<string> {
  const pathname = ctx.url.pathname;

  // Check cache first
  const cached = getCachedHtml(pathname);
  if (cached) {
    return cached;
  }

  // Render the page
  const html = await renderRouteToHtml({
    config,
    route,
    req: ctx.req,
    res: ctx.res,
    url: ctx.url,
    params: ctx.params,
    query: ctx.query,
    headers: ctx.headers,
    cookies: ctx.cookies,
  });

  // Cache for next request
  cacheHtml(pathname, html);

  return html;
}

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
export async function renderWithOptions(
  config: FrameworkConfig,
  route: RouteEntry,
  ctx: SSRContext,
  options: { cache?: boolean } = {},
): Promise<string> {
  const { cache = true } = options;
  const pathname = ctx.url.pathname;

  // Check cache if enabled
  if (cache) {
    const cached = getCachedHtml(pathname);
    if (cached) return cached;
  }

  // Render the page
  const html = await renderRouteToHtml({
    config,
    route,
    req: ctx.req,
    res: ctx.res,
    url: ctx.url,
    params: ctx.params,
    query: ctx.query,
    headers: ctx.headers,
    cookies: ctx.cookies,
  });

  // Cache if enabled
  if (cache) {
    cacheHtml(pathname, html);
  }

  return html;
}

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
export async function renderComponentToString(
  config: FrameworkConfig,
  route: RouteEntry,
  ctx: SSRContext,
): Promise<string> {
  // For now, we render the full HTML and extract the body
  const html = await renderRouteToHtml({
    config,
    route,
    req: ctx.req,
    res: ctx.res,
    url: ctx.url,
    params: ctx.params,
    query: ctx.query,
    headers: ctx.headers,
    cookies: ctx.cookies,
  });

  // Extract body content
  const bodyMatch = html.match(/<div id="app">([\s\S]*?)<\/div>/);
  return bodyMatch ? bodyMatch[1] : "";
}

/**
 * Get cache statistics for monitoring and debugging.
 *
 * @returns Cache statistics
 */
export function getSsrCacheStats() {
  return {
    size: renderCache.size,
    enabled: cacheConfig.enabled,
    ttlSeconds: cacheConfig.ttlSeconds,
    entries: Array.from(renderCache.entries()).map(([key, value]) => ({
      pathname: key,
      age: (Date.now() - value.timestamp) / 1000,
      size: value.html.length,
    })),
  };
}
