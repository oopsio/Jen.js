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

import { h } from "preact";
import renderToString from "preact-render-to-string";
import { pathToFileURL } from "node:url";
import esbuild from "esbuild";
function escapeHtml(s) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
export async function renderRouteToHtml(opts) {
  const { config, route, url, params, query, headers, cookies } = opts;
  // Transpile route file if needed
  let moduleUrl = route.filePath;
  if (route.filePath.endsWith(".tsx") || route.filePath.endsWith(".ts")) {
    const result = await esbuild.build({
      entryPoints: [route.filePath],
      outfile: route.filePath.replace(/\.(tsx?|jsx?)$/, ".esbuild.mjs"),
      format: "esm",
      platform: "browser",
      target: "es2022",
      bundle: false,
      write: true,
    });
    moduleUrl = route.filePath.replace(/\.(tsx?|jsx?)$/, ".esbuild.mjs");
  }
  const mod = await import(pathToFileURL(moduleUrl).href);
  const loaderCtx = {
    url,
    params,
    query,
    headers,
    cookies,
  };
  let data = null;
  if (typeof mod.loader === "function") {
    data = await mod.loader(loaderCtx);
  }
  const Page = mod.default;
  const app = h(Page, { data, params, query });
  const bodyHtml = renderToString(app);
  const headParts = [];
  headParts.push(...config.inject.head);
  if (mod.Head) {
    try {
      const headNode = h(mod.Head, { data, params, query });
      const headHtml = renderToString(headNode);
      headParts.push(headHtml);
    } catch {}
  }
  headParts.push(`<link rel="stylesheet" href="/styles.css">`);
  const payload = escapeHtml(JSON.stringify({ data, params, query }));
  const hydrationEntry = `/__hydrate?file=${encodeURIComponent(route.filePath)}`;
  const html = `<!doctype html>
<html>
<head>
${headParts.join("\n")}
</head>
<body>
<div id="app">${bodyHtml}</div>
<script id="__FRAMEWORK_DATA__" type="application/json">${payload}</script>
<script type="module">
  import { hydrateClient } from "/__runtime/hydrate.js";
  hydrateClient(${JSON.stringify(hydrationEntry)});
</script>
${config.inject.bodyEnd.join("\n")}
</body>
</html>`;
  return html;
}
