import type { FrameworkConfig } from "../core/config.js";
import type { RouteEntry } from "../core/routes/scan.js";
import type { LoaderContext, RouteModule } from "../core/types.js";

import { h } from "preact";
import renderToString from "preact-render-to-string";
import { pathToFileURL } from "node:url";
import { join, dirname, basename } from "node:path";
import { mkdirSync, existsSync } from "node:fs";
import esbuild from "esbuild";

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
  url: URL;
  params: Record<string, string>;
  query: Record<string, string>;
  headers: Record<string, string>;
  cookies: Record<string, string>;
}) {
  const { config, route, url, params, query, headers, cookies } = opts;

  // Transpile route file if needed
  let moduleUrl = route.filePath;
  if (route.filePath.endsWith('.tsx') || route.filePath.endsWith('.ts')) {
    const outfile = getCachePath(route.filePath);
    await esbuild.build({
      entryPoints: [route.filePath],
      outfile,
      format: 'esm',
      platform: 'node', // Use node platform for SSR to support built-ins
      target: 'es2022',
      bundle: true, // Bundle to resolve local imports (simple)
      external: ['preact', 'preact-render-to-string', 'jenjs'], // Keep framework externals
      write: true
    });
    moduleUrl = outfile;
  }
  
  // Cache busting for dynamic import
  const mod: RouteModule = await import(pathToFileURL(moduleUrl).href + "?t=" + Date.now());

  const loaderCtx: LoaderContext = {
    url,
    params,
    query,
    headers,
    cookies
  };

  let data: any = null;
  if (typeof mod.loader === "function") {
    data = await mod.loader(loaderCtx);
  }

  const Page = mod.default;

  const app = h(Page as any, { data, params, query });

  const bodyHtml = renderToString(app);

  const headParts: string[] = [];
  headParts.push(...config.inject.head);

  if (mod.Head) {
    try {
      const headNode = h(mod.Head as any, { data, params, query });
      const headHtml = renderToString(headNode);
      headParts.push(headHtml);
    } catch {}
  }

  headParts.push(`<link rel="stylesheet" href="/styles.css">`);

  // Serialize framework data WITHOUT HTML escaping quotes
  // Only escape </script to prevent script injection
  const frameworkDataStr = JSON.stringify({ data, params, query }, null, 2)
    .replace(/<\/script/g, "<\\/script");

  // Use URL pathname as stable route ID
  const routeId = route.urlPath === "/" ? "route_index" : `route_${route.urlPath.slice(1).replace(/\//g, "_")}`;

  const html = `<!doctype html>
<html>
<head>
${headParts.join("\n")}
</head>
<body>
<div id="app">${bodyHtml}</div>
<script id="__FRAMEWORK_DATA__" type="application/json">
${frameworkDataStr}
</script>
<script type="module">
  import { hydrateClient } from "/__runtime/hydrate.js";
  hydrateClient(${JSON.stringify(`/__hydrate?id=${routeId}`)});
</script>
${config.inject.bodyEnd.join("\n")}
</body>
</html>`;

  return html;
}
