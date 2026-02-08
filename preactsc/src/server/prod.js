import http from "http";
import fs from "fs";
import path from "path";

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

// Security: Validate manifest data
function validateManifest(manifest) {
  if (!Array.isArray(manifest)) {
    throw new Error("Invalid manifest: expected array");
  }

  return manifest.map((item) => {
    if (typeof item.id !== "string" || !item.id.match(/^[a-z0-9_-]+$/i)) {
      throw new Error(`Invalid component id: ${item.id}`);
    }
    if (typeof item.path !== "string" || !item.path.startsWith(".")) {
      throw new Error(`Invalid component path: ${item.path}`);
    }
    return {
      id: item.id,
      path: item.path,
      name: item.name || "",
      props: item.props || {},
    };
  });
}

export async function startProdServer(outDir) {
  const PORT = 3000;

  // Load the built server module
  const serverModule = await import(path.join(outDir, "server.js"));
  const App = serverModule.default || serverModule;

  // Load and validate manifest
  let manifest;
  try {
    const manifestData = JSON.parse(
      fs.readFileSync(path.join(outDir, "manifest.json"), "utf-8"),
    );
    manifest = validateManifest(manifestData);
  } catch (err) {
    throw new Error(`Invalid manifest: ${err.message}`);
  }

  const server = http.createServer(async (req, res) => {
    try {
      // Security: Validate request URL
      const url = new URL(req.url, "http://localhost");
      const pathname = url.pathname;

      if (pathname === "/") {
        // Import renderApp from the built server
        const { renderApp } = await import(path.join(outDir, "server.js"));

        let html;
        if (renderApp) {
          const result = await renderApp(App);
          html = result.html;
        } else {
          // Fallback: just render the app component
          const preactRender = await import("preact-render-to-string");
          const preact = await import("preact");
          html = preactRender.render(preact.createElement(App));
        }

        // Security: Escape HTML and manifest to prevent XSS
        const escapedManifest = escapeJson(manifest);
        const clientManifestScript = `<script id="__PRSC_DATA__" type="application/json">${escapedManifest}</script>`;

        const clientBootloader = `<script type="module">
import { render, createElement as h } from "preact";

const manifest = JSON.parse(document.getElementById('__PRSC_DATA__').textContent);

async function hydrateClients() {
  for (const component of manifest) {
    const placeholder = document.querySelector(\`[data-prsc-id="\${component.id}"]\`);
    if (!placeholder) continue;

    try {
      const mod = await import(component.path);
      const Component = mod.default || mod;
      render(h(Component, component.props), placeholder);
    } catch (err) {
      console.error(\`Failed to hydrate \${component.id}:\`, err);
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', hydrateClients);
} else {
  hydrateClients();
}
</script>`;

        const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PRSC App</title>
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
    console.log(`[PRSC] Production server running on http://localhost:${PORT}`);
  });

  return server;
}
