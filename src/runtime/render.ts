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
import { createIslandMarker } from "./islands.js";

import { h } from "preact";
import renderToString from "preact-render-to-string";
import { pathToFileURL } from "node:url";
import { join, dirname, basename } from "node:path";
import { mkdirSync, existsSync } from "node:fs";
import esbuild from "esbuild";
import { vueEsbuildPlugin, svelteEsbuildPlugin } from "../compilers/esbuild-plugins.js";

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getCachePath(filePath: string) {
  const cacheDir = join(process.cwd(), "node_modules", ".jen", "cache");
  if (!existsSync(cacheDir)) {
    mkdirSync(cacheDir, { recursive: true });
  }
  // Flatten path to avoid directory structure issues
  const flatName = filePath.replace(/[\\/:]/g, "_").replace(/^_+/, "");
  return join(cacheDir, flatName + ".mjs");
}

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

  // Transpile route file if needed
  let moduleUrl = route.filePath;
  const ext = route.filePath.slice(-4).toLowerCase();
  const requiresTranspile = [".tsx", ".ts", ".vue", ".svelte"].some((e) =>
    route.filePath.toLowerCase().endsWith(e),
  );

  if (requiresTranspile) {
    const outfile = getCachePath(route.filePath);
    await esbuild.build({
      entryPoints: [route.filePath],
      outfile,
      format: "esm",
      platform: "node", // Use node platform for SSR to support built-ins
      target: "es2022",
      bundle: true, // Bundle to resolve local imports (simple)
      external: ["preact", "preact-render-to-string", "jenjs"], // Keep framework externals
      write: true,
      plugins: [vueEsbuildPlugin(), svelteEsbuildPlugin()],
    });
    moduleUrl = outfile;
  }

  // Cache busting for dynamic import
  let mod: RouteModule;
  try {
    mod = await import(
      pathToFileURL(moduleUrl).href + "?t=" + Date.now()
    );
  } catch (err) {
    throw new Error(`Failed to import route module ${route.filePath}: ${err instanceof Error ? err.message : String(err)}`);
  }

  // Execute route middleware if present (only in server context)
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
       if (err.message === "__REDIRECT__" || err.message === "__JSON__") {
         // Already sent response
         throw err;
       }
       throw err;
     }
   }

   const loaderCtx: LoaderContext = {
     url,
     params,
     query,
     headers,
     cookies,
     data: middlewareData, // Pass middleware data to loader
   };

  let data: any = null;
  if (typeof mod.loader === "function") {
    data = await mod.loader(loaderCtx);
  }

  if (!mod.default) {
    throw new Error(`Route module ${route.filePath} does not export a default component`);
  }

  const Page = mod.default;

  // Check if hydration is disabled
  const shouldHydrate = mod.hydrate !== false;

  const app = h(Page as any, { data, params, query });

  let bodyHtml = renderToString(app);

  // If this module exports island components, add hydration markers
  // Look for components marked with __island metadata
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
      // Mark location in HTML for client to find
      // Note: In a real implementation, we'd track island renders more carefully
    }
  }

  const headParts: string[] = [];
  headParts.push(...config.inject.head);

  if (mod.Head) {
    try {
      const headNode = h(mod.Head as any, { data, params, query });
      const headHtml = renderToString(headNode);
      headParts.push(headHtml);
    } catch (err) {
      console.error(`Failed to render Head component for ${route.filePath}:`, err instanceof Error ? err.message : String(err));
    }
  }

  headParts.push(`<link rel="stylesheet" href="/styles.css">`);

  // Build HTML
  let html = `<!doctype html>
<html>
<head>
${headParts.join("\n")}
</head>
<body>
<div id="app">${bodyHtml}</div>`;

  // Only inject hydration script if enabled
  if (shouldHydrate) {
    // Serialize framework data with proper escaping
    // Escape </script to prevent script injection
    const frameworkDataStr = JSON.stringify(
      { data, params, query },
      null,
      2,
    ).replace(/<\/script/gi, "<\\/script");

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

  html += `
${config.inject.bodyEnd.join("\n")}
</body>
</html>`;

  return html;
}
