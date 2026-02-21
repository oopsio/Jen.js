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
import { createRouteMiddlewareContext, executeRouteMiddleware, } from "../core/middleware-hooks.js";
import { createIslandMarker } from "./islands.js";
import { h } from "preact";
import renderToString from "preact-render-to-string";
import { pathToFileURL } from "node:url";
import { join } from "node:path";
import { mkdirSync, existsSync } from "node:fs";
import esbuild from "esbuild";
import { vueEsbuildPlugin, svelteEsbuildPlugin, } from "../compilers/esbuild-plugins.js";
/**
 * Escapes HTML special characters to prevent injection attacks.
 * Used when serializing user data or dynamic values into HTML attributes or script content.
 *
 * @param s The string to escape.
 * @returns The escaped string safe for inclusion in HTML.
 */
function escapeHtml(s) {
    return s
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}
/**
 * Resolves the cache directory path for compiled route modules.
 * Transpiled TypeScript/JSX/Vue/Svelte routes are cached to avoid repeated compilation.
 * Cache is stored in node_modules/.jen/cache to leverage .gitignore and keep the workspace clean.
 * Path names are flattened to avoid nested directory creation issues on Windows.
 *
 * @param filePath The absolute path to the original source file.
 * @returns The absolute path to the cached compiled output file.
 */
function getCachePath(filePath) {
    const cacheDir = join(process.cwd(), "node_modules", ".jen", "cache");
    if (!existsSync(cacheDir)) {
        mkdirSync(cacheDir, { recursive: true });
    }
    // Flatten path to avoid directory structure issues.
    const flatName = filePath.replace(/[\\/:]/g, "_").replace(/^_+/, "");
    return join(cacheDir, flatName + ".mjs");
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
export async function renderRouteToHtml(opts) {
    const { config, route, url, params, query, headers, cookies } = opts;
    // Transpile route file if needed. TypeScript and JSX require compilation to JavaScript.
    // Vue and Svelte components also need transpilation to Preact-compatible JavaScript.
    let moduleUrl = route.filePath;
    const ext = route.filePath.slice(-4).toLowerCase();
    const requiresTranspile = [".tsx", ".ts", ".vue", ".svelte"].some((e) => route.filePath.toLowerCase().endsWith(e));
    if (requiresTranspile) {
        const outfile = getCachePath(route.filePath);
        await esbuild.build({
            entryPoints: [route.filePath],
            outfile,
            format: "esm",
            platform: "node", // Node platform for SSR supports built-ins like fs, path, etc.
            target: "es2022",
            bundle: true, // Bundle all local imports into a single file for simplicity.
            external: ["preact", "preact-render-to-string", "jenjs"], // Keep framework imports external.
            write: true,
            plugins: [vueEsbuildPlugin(), svelteEsbuildPlugin()],
        });
        moduleUrl = outfile;
    }
    // Cache busting via query parameter ensures fresh module evaluation even if file is unchanged.
    // This is critical because esbuild may use cached builds and we need the latest code for SSR.
    let mod;
    try {
        mod = await import(pathToFileURL(moduleUrl).href + "?t=" + Date.now());
    }
    catch (err) {
        throw new Error(`Failed to import route module ${route.filePath}: ${err instanceof Error ? err.message : String(err)}`);
    }
    // Execute route middleware if present. Middleware runs only in server context (not during SSG with empty req/res).
    // Middleware can access the request, manipulate context data, or short-circuit rendering by throwing redirect/json signals.
    let middlewareData = {};
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
        const middlewares = [];
        if (mod.middleware) {
            if (Array.isArray(mod.middleware)) {
                middlewares.push(...mod.middleware);
            }
            else {
                middlewares.push(mod.middleware);
            }
        }
        try {
            await executeRouteMiddleware(middlewares, middlewareCtx);
            middlewareData = middlewareCtx.data || {};
        }
        catch (err) {
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
    const loaderCtx = {
        url,
        params,
        query,
        headers,
        cookies,
        data: middlewareData, // Pass middleware data to loader.
    };
    // Call the optional loader function to fetch/prepare data for the page.
    // Loader results are passed as props to the page component.
    let data = null;
    if (typeof mod.loader === "function") {
        data = await mod.loader(loaderCtx);
    }
    if (!mod.default) {
        throw new Error(`Route module ${route.filePath} does not export a default component`);
    }
    const Page = mod.default;
    // Check if hydration is disabled. Set to false for purely static pages with no client-side interactivity.
    const shouldHydrate = mod.hydrate !== false;
    const app = h(Page, { data, params, query });
    // Render the page component to a static HTML string.
    // Preact rendering at this stage is purely static; hydration happens on the client.
    let bodyHtml = renderToString(app);
    // Check for island components that need selective hydration on the client.
    // Islands are opt-in interactive components within otherwise static pages.
    // Each island is marked with __island and __hydrationStrategy metadata and will be hydrated by the client.
    for (const [key, value] of Object.entries(mod)) {
        if (typeof value === "function" &&
            value.__island &&
            value.__hydrationStrategy) {
            const strategy = value.__hydrationStrategy;
            const componentPath = route.filePath;
            const islandId = `island-${Math.random().toString(36).slice(2, 9)}`;
            const marker = createIslandMarker(islandId, componentPath, strategy, {});
            // Inject marker before closing app div.
            bodyHtml = bodyHtml.replace("</div>", `${marker}</div>`);
        }
    }
    // Collect all head elements from configuration and the route's Head component.
    // Head components allow per-route customization of meta tags, title, links, etc.
    const headParts = [];
    headParts.push(...config.inject.head);
    if (mod.Head) {
        try {
            const headNode = h(mod.Head, { data, params, query });
            const headHtml = renderToString(headNode);
            headParts.push(headHtml);
        }
        catch (err) {
            console.error(`Failed to render Head component for ${route.filePath}:`, err instanceof Error ? err.message : String(err));
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
        // Serialize loader and route data for the client. Must escape </script to prevent injection attacks.
        // The client uses this data to reconstruct the component tree and populate props.
        const frameworkDataStr = JSON.stringify({ data, params, query }, null, 2).replace(/<\/script/gi, "<\\/script");
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
