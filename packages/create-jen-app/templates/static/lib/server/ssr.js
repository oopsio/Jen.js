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
import { renderRouteToHtml } from "../runtime/render.js";
/**
 * HTML rendering cache for performance optimization.
 * Cache key is URL pathname. Useful for frequently accessed pages.
 * In production, consider using Redis or external cache for distributed rendering.
 */
const renderCache = new Map();
let cacheConfig = {
  enabled: true,
  ttlSeconds: 3600, // Default: 1 hour
};
/**
 * Configure the SSR HTML cache behavior.
 *
 * @param config Cache configuration options
 */
export function configureSsrCache(config) {
  cacheConfig = { ...cacheConfig, ...config };
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
export function invalidateSsrCache(pathname) {
  renderCache.delete(pathname);
}
/**
 * Get cached HTML for a page if it exists and hasn't expired.
 *
 * @param pathname URL pathname
 * @returns Cached HTML string, or null if not cached/expired
 */
function getCachedHtml(pathname) {
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
 *
 * @param pathname URL pathname
 * @param html Complete HTML string to cache
 */
function cacheHtml(pathname, html) {
  if (!cacheConfig.enabled) return;
  renderCache.set(pathname, { html, timestamp: Date.now() });
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
export async function render(config, route, ctx) {
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
export async function renderWithOptions(config, route, ctx, options = {}) {
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
export async function renderComponentToString(config, route, ctx) {
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
