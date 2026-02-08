import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { analyzeComponents } from "../compiler/analyzer.js";
import { renderApp } from "../runtime/server.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Security: HTML escaping to prevent XSS
function escapeHtml(text) {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Security: JSON escaping to prevent XSS in script tags
function escapeJson(obj) {
  return JSON.stringify(obj)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

export async function startDevServer(entryFile, initialComponents) {
  const PORT = 3000;
  let App = null;
  let components = initialComponents;

  // Load the entry module
  async function loadApp() {
    // Clear require cache
    delete require.cache?.[entryFile];

    try {
      const mod = await import(entryFile + `?t=${Date.now()}`);
      return mod.default || mod;
    } catch (err) {
      console.error("Error loading app:", err);
      return null;
    }
  }

  App = await loadApp();

  const server = http.createServer(async (req, res) => {
    try {
      // Security: Prevent open redirects and validate URL
      const url = new URL(req.url, "http://localhost");
      const pathname = url.pathname;

      if (pathname === "/__prsc_hot") {
        res.writeHead(200, { "Content-Type": "text/event-stream" });
        res.write("data: connected\n\n");
        return;
      }

      if (pathname === "/") {
        // Reload app on each request (simple dev mode)
        App = await loadApp();
        components = analyzeComponents(entryFile);

        if (!App) {
          res.writeHead(500, { "Content-Type": "text/html" });
          res.end("<h1>Error loading app</h1>");
          return;
        }

        const { html, manifest } = await renderApp(App);

        // Security: Escape manifest to prevent XSS
        const escapedManifest = escapeJson(manifest);
        const clientManifestScript = `<script id="__PRSC_DATA__" type="application/json">${escapedManifest}</script>`;

        const clientBootloader = `<script>
(function() {
  const manifestEl = document.getElementById('__PRSC_DATA__');
  if (!manifestEl) return;
  const manifest = JSON.parse(manifestEl.textContent);
  console.log('PRSC manifest:', manifest);
})();
</script>`;

        const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PRSC Dev</title>
  <script type="importmap">
{
  "imports": {
    "preact": "https://cdn.jsdelivr.net/npm/preact@10.20.0/dist/preact.module.js",
    "preact/hooks": "https://cdn.jsdelivr.net/npm/preact@10.20.0/hooks/dist/hooks.module.js"
  }
}
  </script>
</head>
<body>
  <div id="root">${escapeHtml(html)}</div>
  ${clientManifestScript}
  ${clientBootloader}
</body>
</html>`;

        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(fullHtml);
        return;
      }

      // 404
      res.writeHead(404, { "Content-Type": "text/html" });
      res.end("<h1>Not Found</h1>");
    } catch (err) {
      console.error("Server error:", err);
      res.writeHead(500, { "Content-Type": "text/html" });
      // Security: Don't expose internal error details to client
      res.end(
        "<h1>Server Error</h1><p>An error occurred. Check server logs.</p>",
      );
    }
  });

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`[PRSC] Dev server running on http://localhost:${PORT}`);
    console.log(`[PRSC] Watching: ${entryFile}`);
  });

  return server;
}
