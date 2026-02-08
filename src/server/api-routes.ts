import type { IncomingMessage, ServerResponse } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { join, basename } from "node:path";
import esbuild from "esbuild";
import { pathToFileURL } from "node:url";

/**
 * API route handler context.
 */
export interface ApiRouteContext {
  req: IncomingMessage;
  res: ServerResponse;
  url: URL;
  method: string;
  query: Record<string, string>;
  body: any;
  params: Record<string, string>; // For dynamic routes like [id]
}

/**
 * API handler function.
 * Return Response, string, or object (auto JSON).
 */
export type ApiHandler = (
  ctx: ApiRouteContext,
) =>
  | Promise<Response | string | Record<string, any> | null>
  | Response
  | string
  | Record<string, any>
  | null;

/**
 * API route module.
 * Export GET, POST, PUT, DELETE, etc.
 */
export interface ApiRouteModule {
  GET?: ApiHandler;
  POST?: ApiHandler;
  PUT?: ApiHandler;
  DELETE?: ApiHandler;
  PATCH?: ApiHandler;
  HEAD?: ApiHandler;
  OPTIONS?: ApiHandler;
}

const apiCacheDir = join(process.cwd(), "node_modules", ".jen", "api-cache");

/**
 * Transpile API route file (TS → JS).
 */
async function transpileApiRoute(filePath: string): Promise<string> {
  const outfile = join(
    apiCacheDir,
    basename(filePath).replace(/\.ts$/, `.${Date.now()}.mjs`),
  );

  await esbuild.build({
    entryPoints: [filePath],
    outfile,
    format: "esm",
    platform: "node",
    target: "es2022",
    bundle: false,
    external: ["preact", "preact-render-to-string", "jenjs"],
    write: true,
  });

  return outfile;
}

/**
 * Try to handle an API route.
 * Returns true if handled (success or error), false if no route found.
 *
 * Routes:
 *   /api/hello → site/api/hello.ts (GET, POST, etc.)
 *   /api/users/123 → site/api/users/[id].ts
 */
export async function tryHandleApiRoute(opts: {
  req: IncomingMessage;
  res: ServerResponse;
  siteDir: string;
}): Promise<boolean> {
  const { req, res, siteDir } = opts;

  const url = new URL(
    req.url ?? "/",
    `http://${req.headers.host ?? "localhost"}`,
  );
  const method = (req.method ?? "GET").toUpperCase();

  // Must start with /api/
  if (!url.pathname.startsWith("/api/")) return false;

  const pathParts = url.pathname
    .slice("/api/".length)
    .split("/")
    .filter(Boolean);

  if (pathParts.length === 0) {
    res.statusCode = 404;
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "API route not found" }));
    return true;
  }

  // Try exact match first: /api/hello → api/hello.ts
  let apiFile: string | null = null;
  let routeParams: Record<string, string> = {};

  const exactPath = join(
    process.cwd(),
    siteDir,
    "api",
    `${pathParts.join("/")}.ts`,
  );
  if (existsSync(exactPath)) {
    apiFile = exactPath;
  } else {
    // Try dynamic route: /api/users/123 → api/users/[id].ts
    const basePath = join(process.cwd(), siteDir, "api");
    for (let i = pathParts.length; i >= 1; i--) {
      const staticSegments = pathParts.slice(0, i);
      const dynamicSegments = pathParts.slice(i);

      const tryDynamic = join(
        basePath,
        ...staticSegments.map((s) => `[${s}]`),
        `[${staticSegments[staticSegments.length - 1]}].ts`,
      );
      // Actually, try: api/[id].ts for /api/123
      // and api/users/[id].ts for /api/users/123

      // Simple approach: check api/[param].ts
      if (staticSegments.length === 0 && dynamicSegments.length === 1) {
        const paramFile = join(basePath, `[${dynamicSegments[0]}].ts`);
        if (existsSync(paramFile)) {
          apiFile = paramFile;
          routeParams[dynamicSegments[0]] = dynamicSegments[0];
          break;
        }
      }
    }
  }

  if (!apiFile) {
    res.statusCode = 404;
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "API route not found" }));
    return true;
  }

  // Transpile if TS
  let moduleUrl = apiFile;
  if (apiFile.endsWith(".ts")) {
    moduleUrl = await transpileApiRoute(apiFile);
  }

  // Load module
  let mod: ApiRouteModule;
  try {
    mod = await import(pathToFileURL(moduleUrl).href + `?t=${Date.now()}`);
  } catch (err: any) {
    res.statusCode = 500;
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.end(
      JSON.stringify({
        error: "Failed to load API route",
        details: err.message,
      }),
    );
    return true;
  }

  // Find handler for method
  const handler = mod[method as keyof ApiRouteModule];
  if (!handler) {
    res.statusCode = 405;
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.setHeader("allow", Object.keys(mod).join(", "));
    res.end(JSON.stringify({ error: `${method} not allowed` }));
    return true;
  }

  // Read body
  const body = await readRequestBody(req);

  // Build context
  const ctx: ApiRouteContext = {
    req,
    res,
    url,
    method,
    query: Object.fromEntries(url.searchParams.entries()),
    body,
    params: routeParams,
  };

  // Execute handler
  try {
    const result = await handler(ctx);

    // Handler already sent response
    if (res.writableEnded) return true;

    // Handle Response
    if (result instanceof Response) {
      res.statusCode = result.status;
      result.headers.forEach((v, k) => res.setHeader(k, v));
      const buf = Buffer.from(await result.arrayBuffer());
      res.end(buf);
      return true;
    }

    // Handle string
    if (typeof result === "string") {
      res.statusCode = 200;
      res.setHeader("content-type", "text/plain; charset=utf-8");
      res.end(result);
      return true;
    }

    // Handle object (JSON)
    res.statusCode = 200;
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.end(JSON.stringify(result ?? null));
    return true;
  } catch (err: any) {
    res.statusCode = 500;
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.end(
      JSON.stringify({ error: "Internal server error", details: err.message }),
    );
    return true;
  }
}

/**
 * Read request body (shared with old API handler).
 */
async function readRequestBody(req: IncomingMessage): Promise<any> {
  const method = (req.method ?? "GET").toUpperCase();
  if (method === "GET" || method === "HEAD") return null;

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.from(chunk));
  }
  if (chunks.length === 0) return null;

  const raw = Buffer.concat(chunks).toString("utf8");
  const ct = (req.headers["content-type"] ?? "").toString();

  if (ct.includes("application/json")) {
    try {
      return JSON.parse(raw);
    } catch {
      return { __raw: raw };
    }
  }

  return { __raw: raw };
}
