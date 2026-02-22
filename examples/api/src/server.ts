/**
 * Vanilla Node.js HTTP server with Jen.js API loader
 * No external dependencies - uses built-in Node.js modules only
 */

import { createServer, IncomingMessage, ServerResponse } from "http";
import { readFileSync } from "fs";
import { join } from "path";
import { ApiLoader } from "../../../src/api/loader";
import { ApiRouter } from "../../../src/api/router";
import { createApiRequest, createApiResponse } from "../../../src/api/router";

const PORT = process.env.PORT || 3000;
const apiRouter = new ApiRouter();

/**
 * Parse URL and extract path and query
 */
function parseUrl(url: string) {
  const [path, search] = url.split("?");
  return { path, search: search ? `?${search}` : "" };
}

/**
 * Send JSON response
 */
function sendJson(res: ServerResponse, statusCode: number, data: any) {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

/**
 * Send HTML response
 */
function sendHtml(res: ServerResponse, statusCode: number, html: string) {
  res.writeHead(statusCode, { "Content-Type": "text/html; charset=utf-8" });
  res.end(html);
}

/**
 * Load and register all API routes from src/api directory
 */
async function setupApiRoutes() {
  const loader = new ApiLoader();

  try {
    // Get the directory of this file, then navigate to api folder
    const serverDir = import.meta.url
      .replace("file:///", "")
      .replace(/\//g, "\\")
      .split("\\")
      .slice(0, -1)
      .join("\\");
    const apiDir = join(serverDir, "api");

    // Load routes with empty base route since we'll prepend /api ourselves
    const routes = await loader.loadRoutes(apiDir, "");

    console.log(`✅ Loaded ${routes.length} API routes:`);

    // Register each route with /api prefix
    routes.forEach((route) => {
      const fullPath = "/api" + route.path;
      apiRouter.register(fullPath, route.handler);
      console.log(`   ${fullPath}`);
    });
  } catch (err) {
    console.error("❌ Failed to load API routes:", err);
  }
}

/**
 * Main request handler
 */
async function handleRequest(req: IncomingMessage, res: ServerResponse) {
  const { path, search } = parseUrl(req.url || "/");

  // API routes
  if (path.startsWith("/api/")) {
    const match = apiRouter.match(path);

    if (!match) {
      return sendJson(res, 404, {
        error: "API route not found",
        path,
      });
    }

    try {
      const apiReq = await createApiRequest(req, match.params);
      const apiRes = createApiResponse(res);
      await match.handler(apiReq, apiRes);
    } catch (err) {
      console.error("API handler error:", err);
      sendJson(res, 500, {
        error: "Internal server error",
        message:
          process.env.NODE_ENV === "development"
            ? (err as Error).message
            : undefined,
      });
    }
    return;
  }

  // Health check
  if (path === "/health") {
    return sendJson(res, 200, {
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  }

  // Root page
  if (path === "/" || path === "") {
    return sendHtml(
      res,
      200,
      `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Jen.js API Example</title>
      <style>
        body { font-family: sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; background: #fafafa; }
        code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-family: monospace; }
        pre { background: #222; color: #0f0; padding: 15px; border-radius: 4px; overflow: auto; font-size: 13px; }
        h2 { margin-top: 30px; color: #333; }
        h1 { color: #0066cc; }
        a { color: #0066cc; text-decoration: none; }
        a:hover { text-decoration: underline; }
        ul { line-height: 1.8; }
        li { margin-bottom: 8px; }
      </style>
    </head>
    <body>
      <h1>🚀 Jen.js API Routes Example</h1>
      <p>Vanilla Node.js HTTP server with file-based API routing.</p>

      <h2>Quick Test</h2>
      <pre>
# Hello World
curl http://localhost:3000/api/hello

# List todos
curl http://localhost:3000/api/todos

# Create todo
curl -X POST http://localhost:3000/api/todos \\
  -H "Content-Type: application/json" \\
  -d '{"title":"My todo"}'

# Get single todo
curl http://localhost:3000/api/todos/1

# Update todo
curl -X PUT http://localhost:3000/api/todos/1 \\
  -H "Content-Type: application/json" \\
  -d '{"completed":true}'

# Delete todo
curl -X DELETE http://localhost:3000/api/todos/1

# Search
curl "http://localhost:3000/api/search?q=framework&limit=5"

# User profile
curl http://localhost:3000/api/users/123/profile

# Files (catch-all)
curl http://localhost:3000/api/files/docs/guide.md
      </pre>

      <h2>Features</h2>
      <ul>
        <li>✅ File-based routing (/src/api/*.ts → /api/*)</li>
        <li>✅ Dynamic routes ([id], [...slug])</li>
        <li>✅ HTTP methods (GET, POST, PUT, DELETE)</li>
        <li>✅ Query parameters</li>
        <li>✅ Request body parsing</li>
        <li>✅ Type-safe TypeScript</li>
        <li>✅ Zero external dependencies</li>
      </ul>

      <h2>API Endpoints</h2>
      <ul>
        <li><strong>GET /api/hello</strong> - Hello world example</li>
        <li><strong>GET|POST /api/todos</strong> - List and create todos</li>
        <li><strong>GET|PUT|DELETE /api/todos/[id]</strong> - Single todo operations</li>
        <li><strong>GET /api/search?q=term</strong> - Search with query params</li>
        <li><strong>GET /api/users/[id]/profile</strong> - Nested dynamic routes</li>
        <li><strong>GET /api/files/[...path]</strong> - Catch-all routes</li>
        <li><strong>POST /api/upload</strong> - File upload example</li>
      </ul>

      <h2>Documentation</h2>
      <p>See <code>README.md</code> for full documentation and examples.</p>

      <hr style="margin-top: 40px; border: none; border-top: 1px solid #ddd;">
      <p style="color: #666; font-size: 14px;">Built with Jen.js • Powered by Preact • Vanilla Node.js</p>
    </body>
    </html>
  `,
    );
  }

  // 404
  sendHtml(
    res,
    404,
    `
    <!DOCTYPE html>
    <html>
    <head><title>404 Not Found</title></head>
    <body style="font-family: sans-serif; max-width: 600px; margin: 50px auto;">
      <h1>404 - Not Found</h1>
      <p>The requested path does not exist.</p>
      <p><a href="/">Back to home</a></p>
    </body>
    </html>
  `,
  );
}

/**
 * Start server
 */
async function start() {
  await setupApiRoutes();

  const server = createServer(handleRequest);

  server.listen(PORT, () => {
    console.log(`\n✨ Jen.js API Server running at http://localhost:${PORT}\n`);
    console.log(`📡 No dependencies - using vanilla Node.js HTTP\n`);
  });
}

start().catch(console.error);
