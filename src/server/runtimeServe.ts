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

import { buildSync } from "esbuild";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { basename, dirname } from "node:path";
import { pathToFileURL } from "node:url";
import {
  vueEsbuildPlugin,
  svelteEsbuildPlugin,
} from "../compilers/esbuild-plugins.js";

/**
 * Cache for compiled hydration modules.
 * Stores transpiled JS code and computed ETag hash per source file path.
 * Cache is invalidated when files change (via invalidateCache).
 */
const cache = new Map<string, { js: string; etag: string }>();

/**
 * Compute SHA-1 hash (ETag) for a string.
 * Used for HTTP cache validation and deduplicating compiled output.
 *
 * @param s - String to hash
 * @returns Hex-encoded SHA-1 hash
 */
function etagOf(s: string) {
  return createHash("sha1").update(s).digest("hex");
}

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
export function runtimeHydrateModule() {
  // Browser-safe runtime (ESM) using CDN preact (fast + zero bundler)
  return `
import { hydrate } from "https://esm.sh/preact@10.25.4";
import { h } from "https://esm.sh/preact@10.25.4";

function getFrameworkData() {
  const el = document.getElementById("__FRAMEWORK_DATA__");
  if (!el) return null;
  try { return JSON.parse(el.textContent || "null"); } catch { return null; }
}

export async function hydrateClient(entryPath) {
  const data = getFrameworkData();
  const mod = await import(entryPath);
  const Page = mod.default;
  const app = h(Page, {
    data: data?.data ?? null,
    params: data?.params ?? {},
    query: data?.query ?? {}
  });
  const root = document.getElementById("app");
  if (!root) return;
  hydrate(app, root);
}
`;
}

/**
 * Clear cached compiled module for a file path.
 * Called when a source file changes during development to ensure fresh compilation
 * on next request.
 *
 * @param filePath - Absolute file path to invalidate
 */
export function invalidateCache(filePath: string) {
  cache.delete(filePath);
}

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
export function buildHydrationModule(routeIdOrPath: string) {
  // routeIdOrPath is a file path; future versions may support route IDs via config
  let filePath = routeIdOrPath;

  // Return fallback if file doesn't exist
  if (!existsSync(filePath)) {
    return `export default function Page(){ return null }`;
  }

  const key = filePath;

  // Return cached result if available (invalidated by invalidateCache)
  if (cache.has(key)) {
    return cache.get(key)!.js;
  }

  // Create proxy file to enable tree-shaking of server-only exports (loader, middleware, etc.)
  // The proxy re-exports only the default component, letting esbuild eliminate other exports
  const fileName = basename(filePath);
  const dir = dirname(filePath);
  const proxyContent = `export { default } from "./${fileName}";`;

  try {
    // Transpile proxy with esbuild for browser-safe JavaScript
    const jsOutput = buildSync({
      stdin: {
        contents: proxyContent,
        resolveDir: dir, // Resolve imports relative to route directory
        sourcefile: "hydration-proxy.tsx",
        loader: "tsx", // Support TypeScript and JSX
      },
      format: "esm",
      platform: "browser", // Browser-specific optimizations
      bundle: true, // Inline dependencies (except external)
      write: false, // Return code instead of writing file
      sourcemap: "inline", // Include source map for debugging
      jsx: "automatic", // Automatic JSX transform (Preact)
      jsxImportSource: "preact",
      define: {
        "process.env.NODE_ENV": JSON.stringify("development"),
      },
      // Preact and runtime must be available in browser (loaded separately)
      external: [
        "preact",
        "preact/hooks",
        "preact/jsx-runtime",
        "preact-render-to-string",
      ],
      // TODO: Add plugin support for Vue/Svelte components
      // plugins: [vueEsbuildPlugin(), svelteEsbuildPlugin()],
    }).outputFiles?.[0]?.text;

    if (!jsOutput) {
      console.error("[HYDRATION] Failed to build module for:", filePath);
      return `export default function Page(){ return null }`;
    }

    // Cache result with ETag
    const etag = etagOf(jsOutput);
    cache.set(key, { js: jsOutput, etag });
    return jsOutput;
  } catch (err) {
    console.error("[HYDRATION] Build error for", filePath, ":", err);
    return `export default function Page(){ return null }`;
  }
}

/**
 * Retrieve the ETag (cache hash) for a compiled hydration module.
 * Used for HTTP conditional requests (If-None-Match, 304 Not Modified).
 *
 * @param filePath - Route file path
 * @returns ETag hash string or null if not cached
 */
export function getHydrationEtag(filePath: string) {
  const v = cache.get(filePath);
  return v?.etag ?? null;
}
