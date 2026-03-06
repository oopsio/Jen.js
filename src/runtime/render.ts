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
import type { LoaderContext, RouteModule } from "../core/types.js";
import type { RouteMiddleware } from "../core/middleware-hooks.js";
import {
  createRouteMiddlewareContext,
  executeRouteMiddleware,
} from "../core/middleware-hooks.js";
import {
  scanLayouts,
  buildLayoutHierarchy,
  resolveLayoutStack,
  renderWithLayoutStack,
  collectLayoutHeads,
} from "../core/layouts/index.js";
import { createIslandMarker } from "./islands.js";

import { h } from "preact";
import renderToString from "preact-render-to-string";
import { pathToFileURL } from "node:url";
import { join, dirname, basename } from "node:path";
import {
  mkdirSync,
  existsSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { createHash } from "node:crypto";
import esbuild from "esbuild";
import {
  vueEsbuildPlugin,
  svelteEsbuildPlugin,
} from "../compilers/esbuild-plugins.js";

/**
 * Maximum data size for serialization (1MB).
 * Prevents DoS attacks via extremely large payloads.
 */
const MAX_DATA_SIZE = 1024 * 1024; // 1MB

/**
 * Escapes HTML special characters to prevent injection attacks.
 * Used when serializing user data or dynamic values into HTML attributes or script content.
 *
 * @param s The string to escape.
 * @returns The escaped string safe for inclusion in HTML.
 */
function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/**
 * Recursively escapes all strings in an object to prevent XSS attacks.
 * Traverses nested objects, arrays, and all string values.
 * Non-string, non-object values are returned as-is.
 *
 * @param value The value to escape (can be any type).
 * @returns A new object with all strings escaped.
 */
function recursivelyEscapeStrings(value: any): any {
  if (typeof value === "string") {
    return escapeHtml(value);
  }
  if (Array.isArray(value)) {
    return value.map(recursivelyEscapeStrings);
  }
  if (value !== null && typeof value === "object") {
    const escaped: Record<string, any> = {};
    for (const [key, val] of Object.entries(value)) {
      escaped[key] = recursivelyEscapeStrings(val);
    }
    return escaped;
  }
  // Return primitives (numbers, booleans, null, undefined) as-is
  return value;
}

/**
 * In-memory deduplication map for concurrent transpile requests.
 * Prevents race conditions where multiple concurrent requests transpile the same file.
 * Maps from cache key to a Promise that resolves to the output file path.
 */
const transpileInProgress = new Map<string, Promise<string>>();

/**
 * Computes a hash of the file content to track changes.
 * Uses SHA-256 to create a unique hash of the source file.
 * This enables cache invalidation when the file changes.
 *
 * @param filePath The absolute path to the file.
 * @returns A short hash of the file content (first 8 chars).
 */
function getFileHash(filePath: string): string {
  try {
    const content = readFileSync(filePath, "utf-8");
    const hash = createHash("sha256").update(content).digest("hex");
    return hash.slice(0, 8);
  } catch {
    return "unknown";
  }
}

/**
 * Gets the modification time of a file.
 * Used to detect stale cache entries.
 *
 * @param filePath The absolute path to the file.
 * @returns The modification time in milliseconds, or 0 if file doesn't exist.
 */
function getFileMtime(filePath: string): number {
  try {
    return statSync(filePath).mtimeMs;
  } catch {
    return 0;
  }
}

/**
 * Resolves the cache directory path for compiled route modules.
 * Cache key includes file hash to track changes.
 * Cache is stored in node_modules/.jen/cache to leverage .gitignore and keep the workspace clean.
 * Path names are flattened to avoid nested directory creation issues on Windows.
 *
 * Cache metadata file (.meta) stores:
 * - Original file modification time
 * - File content hash
 * - Cache creation time
 *
 * @param filePath The absolute path to the original source file.
 * @returns Object with cache file path and metadata file path.
 */
function getCachePath(filePath: string): {
  cachePath: string;
  metaPath: string;
} {
  const cacheDir = join(process.cwd(), "node_modules", ".jen", "cache");
  if (!existsSync(cacheDir)) {
    mkdirSync(cacheDir, { recursive: true });
  }

  // Flatten path and append file hash for uniqueness
  const flatName = filePath.replace(/[\\/:]/g, "_").replace(/^_+/, "");
  const fileHash = getFileHash(filePath);
  const cacheName = `${flatName}_${fileHash}`;

  const cachePath = join(cacheDir, cacheName + ".mjs");
  const metaPath = join(cacheDir, cacheName + ".meta");

  return { cachePath, metaPath };
}

/**
 * Checks if cache is still valid (file hasn't changed).
 * Compares file hash and modification time from metadata.
 *
 * @param filePath The absolute path to the source file.
 * @param metaPath The absolute path to the metadata file.
 * @returns true if cache is valid, false if file changed or metadata missing.
 */
function isCacheValid(filePath: string, metaPath: string): boolean {
  try {
    const meta = JSON.parse(readFileSync(metaPath, "utf-8"));
    const currentHash = getFileHash(filePath);
    const currentMtime = getFileMtime(filePath);

    // Check if file hash or mtime changed
    return meta.fileHash === currentHash && meta.fileMtime === currentMtime;
  } catch {
    return false;
  }
}

/**
 * Writes cache metadata to track file state.
 * Stores file hash, mtime, and cache time for future validation.
 *
 * @param filePath The absolute path to the source file.
 * @param metaPath The absolute path to the metadata file.
 */
function writeCacheMeta(filePath: string, metaPath: string): void {
  try {
    const meta = {
      filePath,
      fileHash: getFileHash(filePath),
      fileMtime: getFileMtime(filePath),
      cacheTime: Date.now(),
    };
    writeFileSync(metaPath, JSON.stringify(meta, null, 2));
  } catch (err) {
    // Non-critical: log but don't fail transpilation
    console.warn(`Failed to write cache metadata: ${metaPath}`, err);
  }
}

/**
 * Renders a route module to a complete HTML document.
 * This function handles the entire server-side rendering pipeline:
 * 1. Compiles TypeScript/JSX/Vue/Svelte to JavaScript if needed
 * 2. Imports the compiled route module
 * 3. Executes route-level middleware
 * 4. Calls the loader to fetch data
 * 5. Renders the component to HTML using Preact
 * 6. Wraps the component HTML in a full document with hydration metadata if enabled
 *
 * Compilation is performed at request-time in development (for fast iteration) and at build-time in production.
 * The route module must export a default Preact component and may optionally export a loader function,
 * middleware, a Head component, and hydration strategy metadata.
 *
 * @param opts Configuration and context for rendering.
 * @param opts.config The framework configuration.
 * @param opts.route The route entry being rendered.
 * @param opts.req The Node.js IncomingMessage (optional for SSG).
 * @param opts.res The Node.js ServerResponse (optional for SSG).
 * @param opts.url The parsed request URL.
 * @param opts.params Dynamic route parameters extracted from the URL.
 * @param opts.query Query string parameters.
 * @param opts.headers HTTP request headers.
 * @param opts.cookies Parsed cookies from the request.
 * @returns The complete HTML document as a string.
 * @throws Error if the route module fails to compile, import, or render.
 */
export async function renderRouteToHtml(opts: {
  config: FrameworkConfig;
  route: RouteEntry;
  req?: any; // IncomingMessage (optional for SSG)
  res?: any; // ServerResponse (optional for SSG)
  url: URL;
  params: Record<string, string>;
  query: Record<string, string>;
  headers: Record<string, string>;
  cookies: Record<string, string>;
}) {
  const { config, route, url, params, query, headers, cookies } = opts;

  // Scan and build layout hierarchy for this route
  const layoutEntries = scanLayouts(config);
  const applicableLayouts = buildLayoutHierarchy(
    layoutEntries,
    route.filePath,
    config.siteDir,
  );
  const layoutStack = await resolveLayoutStack(applicableLayouts);

  // Transpile route file if needed. TypeScript and JSX require compilation to JavaScript.
  // Vue and Svelte components also need transpilation to Preact-compatible JavaScript.
  let moduleUrl = route.filePath;
  const ext = route.filePath.slice(-4).toLowerCase();
  const requiresTranspile = [".tsx", ".ts", ".vue", ".svelte"].some((e) =>
    route.filePath.toLowerCase().endsWith(e),
  );

  if (requiresTranspile) {
    const { cachePath, metaPath } = getCachePath(route.filePath);

    // Check if valid cache exists (file hasn't changed)
    if (existsSync(cachePath) && isCacheValid(route.filePath, metaPath)) {
      moduleUrl = cachePath;
    } else {
      // Use deduplication map to prevent concurrent transpile races
      const cacheKey = cachePath;

      if (transpileInProgress.has(cacheKey)) {
        // Another request is already transpiling this file, wait for it
        moduleUrl = await transpileInProgress.get(cacheKey)!;
      } else {
        // Start transpilation and store promise for deduplication
        const transpilePromise = (async () => {
          try {
            await esbuild.build({
              entryPoints: [route.filePath],
              outfile: cachePath,
              format: "esm",
              platform: "node", // Node platform for SSR supports built-ins like fs, path, etc.
              target: "es2022",
              bundle: true, // Bundle all local imports into a single file for simplicity.
              external: ["preact", "preact-render-to-string", "jenjs"], // Keep framework imports external.
              write: true,
              plugins: [vueEsbuildPlugin(), svelteEsbuildPlugin()],
            });
            // Write metadata after successful transpilation
            writeCacheMeta(route.filePath, metaPath);
            return cachePath;
          } finally {
            // Remove from in-progress map when done
            transpileInProgress.delete(cacheKey);
          }
        })();

        transpileInProgress.set(cacheKey, transpilePromise);
        moduleUrl = await transpilePromise;
      }
    }
  }

  // Cache busting via query parameter ensures fresh module evaluation even if file is unchanged.
  // This is critical because esbuild may use cached builds and we need the latest code for SSR.
  let mod: RouteModule;
  try {
    mod = await import(pathToFileURL(moduleUrl).href + "?t=" + Date.now());
  } catch (err) {
    throw new Error(
      `Failed to import route module ${route.filePath}: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  // Execute route middleware if present. Middleware runs only in server context (not during SSG with empty req/res).
  // Middleware can access the request, manipulate context data, or short-circuit rendering by throwing redirect/json signals.
  let middlewareData: Record<string, any> = {};

  if (opts.req && opts.res) {
    const middlewareCtx = createRouteMiddlewareContext({
      req: opts.req,
      res: opts.res,
      url,
      params,
      query,
      headers,
      cookies,
    });

    const middlewares: RouteMiddleware[] = [];
    if (mod.middleware) {
      if (Array.isArray(mod.middleware)) {
        middlewares.push(...mod.middleware);
      } else {
        middlewares.push(mod.middleware);
      }
    }

    try {
      await executeRouteMiddleware(middlewares, middlewareCtx);
      middlewareData = middlewareCtx.data || {};
    } catch (err: any) {
      // Middleware may throw special error messages to signal redirect or JSON responses.
      // These are handled by the caller and should not be caught here.
      if (err.message === "__REDIRECT__" || err.message === "__JSON__") {
        throw err;
      }
      throw err;
    }
  }

  // Build the loader context with request data and middleware results.
  // The loader receives both raw request data and enriched data from middleware.
  const loaderCtx: LoaderContext = {
    url,
    params,
    query,
    headers,
    cookies,
    data: middlewareData, // Pass middleware data to loader.
  };

  // Call the optional loader function to fetch/prepare data for the page.
  // Loader results are passed as props to the page component.
  let data: any = null;
  if (typeof mod.loader === "function") {
    data = await mod.loader(loaderCtx);
  }

  if (!mod.default) {
    throw new Error(
      `Route module ${route.filePath} does not export a default component`,
    );
  }

  const Page = mod.default;

  // Check if hydration is disabled. Set to false for purely static pages with no client-side interactivity.
  const shouldHydrate = mod.hydrate !== false;

  // Render with layout hierarchy wrapping the page component
  const app = renderWithLayoutStack(layoutStack, Page, {
    data,
    params,
    query,
  });

  // Render the page component (with layouts) to a static HTML string.
  // Preact rendering at this stage is purely static; hydration happens on the client.
  let bodyHtml = renderToString(app);

  // Check for island components that need selective hydration on the client.
  // Islands are opt-in interactive components within otherwise static pages.
  // Each island is marked with __island and __hydrationStrategy metadata and will be hydrated by the client.
  for (const [key, value] of Object.entries(mod)) {
    if (
      typeof value === "function" &&
      (value as any).__island &&
      (value as any).__hydrationStrategy
    ) {
      const strategy = (value as any).__hydrationStrategy;
      const componentPath = route.filePath;
      const islandId = `island-${Math.random().toString(36).slice(2, 9)}`;
      const marker = createIslandMarker(islandId, componentPath, strategy, {});
      // Inject marker before closing app div.
      bodyHtml = bodyHtml.replace("</div>", `${marker}</div>`);
    }
  }

  // Collect all head elements from configuration, layout components, and the route's Head component.
  // Head components are collected from root layout to page, allowing each layer to contribute meta tags.
  const headParts: string[] = [];
  headParts.push(...config.inject.head);

  // Collect heads from layout stack
  const layoutHeads = collectLayoutHeads(layoutStack, mod.Head, {
    data,
    params,
    query,
  });
  for (const headNode of layoutHeads) {
    try {
      const headHtml = renderToString(headNode);
      headParts.push(headHtml);
    } catch (err) {
      console.error(
        `Failed to render Head component:`,
        err instanceof Error ? err.message : String(err),
      );
    }
  }

  // Global stylesheet link is always injected. This file is compiled from SCSS in development and build time.
  headParts.push(`<link rel="stylesheet" href="/styles.css">`);

  // Build the complete HTML document with semantic structure.
  // The div#app is the mount point for hydration on the client.
  let html = `<!doctype html>
<html>
<head>
${headParts.join("\n")}
</head>
<body>
<div id="app">${bodyHtml}</div>`;

  // Only inject hydration script if enabled for this route.
  // Hydration-disabled routes are purely static and require no JavaScript.
  if (shouldHydrate) {
    // Validate data size before serialization to prevent DoS attacks.
    const dataToSerialize = { data, params, query };
    const frameworkData = recursivelyEscapeStrings(dataToSerialize);
    const frameworkDataStr = JSON.stringify(frameworkData, null, 2);

    // Check size of serialized data
    if (frameworkDataStr.length > MAX_DATA_SIZE) {
      throw new Error(
        `Framework data exceeds maximum size of ${MAX_DATA_SIZE} bytes. ` +
          `Current size: ${frameworkDataStr.length} bytes. This may indicate a DoS attempt or excessive data in loader/middleware.`,
      );
    }

    const hydrateFile = `/__hydrate?file=${encodeURIComponent(route.filePath)}`;

    html += `
  <script id="__FRAMEWORK_DATA__" type="application/json">
  ${frameworkDataStr}
  </script>
  <script type="module">
  import { hydrateClient } from "/__runtime/hydrate.js";
  import { initializeIslands } from "/__runtime/island-hydration-client.js";
  hydrateClient(${JSON.stringify(hydrateFile)});
  initializeIslands();
  </script>`;
  }

  // Inject any additional scripts or markup configured to run at the end of body.
  // Useful for analytics, telemetry, or polyfills that should load after DOM is ready.
  html += `
${config.inject.bodyEnd.join("\n")}
</body>
</html>`;

  return html;
}
