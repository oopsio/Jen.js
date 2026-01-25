import type { FrameworkConfig } from "../core/config.js";
import type { RouteEntry } from "../core/routes/scan.js";
import type { LoaderContext, RouteModule } from "../core/types.js";

import { h } from "preact";
import renderToString from "preact-render-to-string";

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
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

  const mod: RouteModule = await import(route.filePath);

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
