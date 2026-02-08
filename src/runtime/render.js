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
