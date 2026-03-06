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

import type { IncomingMessage, ServerResponse } from "node:http";
import {
  readFileSync,
  existsSync,
  statSync,
  writeFileSync,
  mkdirSync,
} from "node:fs";
import { join, basename } from "node:path";
import { createHash } from "node:crypto";
import esbuild from "esbuild";
import { pathToFileURL } from "node:url";

/** Supported HTTP methods for API routes. */
export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "HEAD"
  | "OPTIONS";

/** Query parameter type after coercion (strings remain strings, numeric strings stay strings). */
export type QueryValue = string | number | boolean | null;

/** Validation error response. */
export interface ValidationError {
  error: string;
  field?: string;
  details?: string;
}

/**
 * API route handler execution context.
 * Contains request data and response objects passed to all API handler functions.
 */
export interface ApiRouteContext {
  /** Node.js IncomingMessage with raw request properties. */
  req: IncomingMessage;
  /** Node.js ServerResponse for writing response. */
  res: ServerResponse;
  /** Request URL object with pathname, search, query parameters. */
  url: URL;
  /** HTTP method as literal union type (GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS). */
  method: HttpMethod;
  /** Query string parameters parsed from URL with type coercion (?key=value). */
  query: Record<string, QueryValue>;
  /** Parsed request body (JSON if Content-Type is application/json, else raw string). */
  body: unknown;
  /** Route path parameters extracted from dynamic segments (e.g., [id], [slug]). */
  params: Record<string, string>;
}

/**
 * API handler function executed for a specific HTTP method.
 * Receives context with request data and response object.
 *
 * Return value is automatically serialized:
 * - Response: Sent as-is with status and headers
 * - string: Sent as text/plain; charset=utf-8
 * - object: Sent as application/json (JSON.stringify'd)
 * - null: Sent as JSON null
 *
 * Handler can also manually set response (res.write/res.end) and return null;
 * the framework will not double-send if res.writableEnded is true.
 *
 * @param ctx - Execution context with request and response objects
 * @returns Result value or promise resolving to result
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
 * API route module interface.
 * Exported from api/*.ts files as named exports for each HTTP method.
 *
 * Example api/users/[id].ts:
 *   export const GET = async (ctx) => {
 *     return { userId: ctx.params.id, ...userData };
 *   };
 *   export const DELETE = async (ctx) => {
 *     deleteUser(ctx.params.id);
 *     return { status: "deleted" };
 *   };
 *
 * Supported methods:
 * - GET: Retrieve data
 * - POST: Create new resource
 * - PUT: Replace resource
 * - DELETE: Remove resource
 * - PATCH: Partial update
 * - HEAD: Like GET but no body
 * - OPTIONS: Describe available methods
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

/** Default max request body size: 10MB. */
export const DEFAULT_MAX_BODY_SIZE = 10 * 1024 * 1024;

/** Cache directory for transpiled API routes. */
const apiCacheDir = join(process.cwd(), "node_modules", ".jen", "api-cache");

/**
 * Coerce query parameter value to appropriate type.
 * - "true" / "false" → boolean
 * - numeric strings → number
 * - empty string → null
 * - otherwise → string
 *
 * @param value - Raw query string value
 * @returns Coerced value
 */
function coerceQueryValue(value: string): QueryValue {
  if (value === "true") return true;
  if (value === "false") return false;
  if (value === "") return null;
  const num = Number(value);
  if (!isNaN(num) && value.trim() !== "") return num;
  return value;
}

/**
 * Validate and parse query parameters with type coercion.
 * Prevents type confusion bugs like `query.limit + 10` returning "10010" string.
 *
 * @param url - URL object with search parameters
 * @returns Parsed query parameters with coerced types
 */
export function validateQuery(url: URL): Record<string, QueryValue> {
  const query: Record<string, QueryValue> = {};
  for (const [key, value] of url.searchParams.entries()) {
    query[key] = coerceQueryValue(value);
  }
  return query;
}

/**
 * Validate request body with size limit.
 * Default max size is 10MB. Throws ValidationError if exceeded or invalid JSON.
 *
 * @param body - Parsed body object
 * @param bodySize - Size of body in bytes
 * @param maxSize - Maximum allowed body size in bytes (default 10MB)
 * @returns true if body is valid
 * @throws ValidationError if body exceeds maxSize
 */
export function validateBody(
  body: unknown,
  bodySize: number,
  maxSize: number = DEFAULT_MAX_BODY_SIZE,
): boolean {
  if (bodySize > maxSize) {
    throw {
      error: "Payload too large",
      field: "body",
      details: `Max size is ${maxSize} bytes, got ${bodySize} bytes`,
    } as ValidationError;
  }
  return true;
}

/**
 * Transpile a TypeScript API route file to JavaScript.
 * Uses esbuild to convert TS + JS, bundle dependencies, and output as ESM.
 * The transpiled file is cached in node_modules/.jen/api-cache with a timestamp
 * in the filename to allow side-by-side versions if the file changes.
 *
 * Bundles the route with external dependencies excluded (preact, jenjs).
 * This enables tree-shaking of server-only exports like loader().
 *
 * @param filePath - Absolute path to .ts file
 * @returns Path to transpiled .mjs file in cache directory
 * @throws If esbuild fails to transpile
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
    bundle: true,
    external: ["preact", "preact-render-to-string", "jenjs"],
    write: true,
  });

  return outfile;
}

/**
 * Attempt to route and handle an API request.
 * Returns true if the request was handled (success or error response sent),
 * false if no matching API route exists (caller should try next handler).
 *
 * Routing:
 * - /api/endpoint → site/api/endpoint.ts
 * - /api/users/123 → site/api/users/[id].ts (dynamic params supported)
 * - /api/ (no segments) → 404
 *
 * Resolution order:
 * 1. Try exact file match (e.g., /api/hello → api/hello.ts)
 * 2. Try dynamic route match (e.g., /api/123 → api/[id].ts)
 *
 * Process:
 * 1. Validate request starts with /api/
 * 2. Resolve route file (exact or dynamic match)
 * 3. Transpile if TypeScript
 * 4. Load module and find handler for HTTP method
 * 5. Parse request body with size limit
 * 6. Validate query and body
 * 7. Call handler with context
 * 8. Serialize response (Response, string, or object)
 *
 * All errors send JSON response with error message.
 * HTTP 413 (Payload Too Large) if body exceeds 10MB.
 * HTTP 405 (Method Not Allowed) if method handler not exported.
 * HTTP 404 if no matching route file.
 * HTTP 500 if handler throws or transpilation fails.
 *
 * @param opts - Options containing request, response, and site directory
 * @returns true if handled, false if no API route found
 */
export async function tryHandleApiRoute(opts: {
  req: IncomingMessage;
  res: ServerResponse;
  siteDir: string;
  maxBodySize?: number;
}): Promise<boolean> {
  const { req, res, siteDir, maxBodySize = DEFAULT_MAX_BODY_SIZE } = opts;

  const url = new URL(
    req.url ?? "/",
    `http://${req.headers.host ?? "localhost"}`,
  );
  const methodStr = (req.method ?? "GET").toUpperCase();

  // Validate method is one of the allowed HTTP methods
  const allowedMethods: HttpMethod[] = [
    "GET",
    "POST",
    "PUT",
    "DELETE",
    "PATCH",
    "HEAD",
    "OPTIONS",
  ];
  const method = methodStr as HttpMethod;
  if (!allowedMethods.includes(method)) {
    res.statusCode = 405;
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.setHeader("allow", allowedMethods.join(", "));
    res.end(JSON.stringify({ error: `${methodStr} not allowed` }));
    return true;
  }

  // Only handle /api/* requests
  if (!url.pathname.startsWith("/api/")) return false;

  // Extract path segments after /api/ prefix
  const pathParts = url.pathname
    .slice("/api/".length)
    .split("/")
    .filter(Boolean);

  // /api/ with no segments is 404
  if (pathParts.length === 0) {
    res.statusCode = 404;
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "API route not found" }));
    return true;
  }

  // Resolve route file (exact match or dynamic)
  let apiFile: string | null = null;
  let routeParams: Record<string, string> = {};

  // Try exact file match: /api/hello/world → api/hello/world.ts
  const exactPath = join(
    process.cwd(),
    siteDir,
    "api",
    `${pathParts.join("/")}.ts`,
  );
  if (existsSync(exactPath)) {
    apiFile = exactPath;
  } else {
    // Try dynamic route match: /api/users/123 → api/users/[id].ts
    const basePath = join(process.cwd(), siteDir, "api");
    for (let i = pathParts.length; i >= 1; i--) {
      const staticSegments = pathParts.slice(0, i);
      const dynamicSegments = pathParts.slice(i);

      // Simple approach: check api/[param].ts for /api/123
      // TODO: Support nested dynamic routes like api/users/[id]/posts/[postId].ts
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

  // Transpile TypeScript to JavaScript
  let moduleUrl = apiFile;
  if (apiFile.endsWith(".ts")) {
    moduleUrl = await transpileApiRoute(apiFile);
  }

  // Load module and get method handlers
  let mod: ApiRouteModule;
  try {
    // Cache-busting query param ensures fresh module (important in dev mode)
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

  // Get handler for the HTTP method
  const handler = mod[method as keyof ApiRouteModule];
  if (!handler) {
    res.statusCode = 405;
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.setHeader("allow", Object.keys(mod).join(", "));
    res.end(JSON.stringify({ error: `${method} not allowed` }));
    return true;
  }

  // Parse request body with size limit
  let body: unknown;
  let bodySize = 0;
  try {
    const result = await readRequestBody(req, maxBodySize);
    body = result.body;
    bodySize = result.size;

    // Validate body size
    validateBody(body, bodySize, maxBodySize);
  } catch (err: any) {
    if (err.error === "Payload too large") {
      res.statusCode = 413;
      res.setHeader("content-type", "application/json; charset=utf-8");
      res.end(JSON.stringify({ error: err.error, details: err.details }));
      return true;
    }
    res.statusCode = 400;
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "Bad request", details: err.message }));
    return true;
  }

  // Validate and coerce query parameters
  let query: Record<string, QueryValue>;
  try {
    query = validateQuery(url);
  } catch (err: any) {
    res.statusCode = 400;
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.end(
      JSON.stringify({
        error: "Invalid query parameters",
        details: err.message,
      }),
    );
    return true;
  }

  // Build handler context
  const ctx: ApiRouteContext = {
    req,
    res,
    url,
    method,
    query,
    body,
    params: routeParams,
  };

  // Execute handler and serialize response
  try {
    const result = await handler(ctx);

    // If handler manually wrote response, don't double-send
    if (res.writableEnded) return true;

    // Serialize Response object
    if (result instanceof Response) {
      res.statusCode = result.status;
      result.headers.forEach((v, k) => res.setHeader(k, v));
      const buf = Buffer.from(await result.arrayBuffer());
      res.end(buf);
      return true;
    }

    // Serialize string as plain text
    if (typeof result === "string") {
      res.statusCode = 200;
      res.setHeader("content-type", "text/plain; charset=utf-8");
      res.end(result);
      return true;
    }

    // Serialize object as JSON (null is valid)
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
 * Parse request body based on Content-Type header with size limit enforcement.
 * Reads all chunks from the request stream and deserializes based on content type.
 *
 * - GET/HEAD: Returns { body: null, size: 0 } (no body expected)
 * - JSON (application/json): Parses and returns object; throws on invalid JSON
 * - Other: Returns { body: { __raw }, size: byteLength }
 *
 * Throws ValidationError if body size exceeds maxSize.
 *
 * This function is shared between different request handlers in the framework.
 *
 * @param req - Node.js IncomingMessage to read body from
 * @param maxSize - Maximum allowed body size in bytes (default 10MB)
 * @returns Object with parsed body and size in bytes
 * @throws ValidationError if body exceeds maxSize or invalid JSON
 */
async function readRequestBody(
  req: IncomingMessage,
  maxSize: number = DEFAULT_MAX_BODY_SIZE,
): Promise<{ body: unknown; size: number }> {
  const method = (req.method ?? "GET").toUpperCase();
  // Methods without bodies per HTTP spec
  if (method === "GET" || method === "HEAD") return { body: null, size: 0 };

  // Read all body chunks with size limit check
  const chunks: Buffer[] = [];
  let totalSize = 0;

  try {
    for await (const chunk of req) {
      totalSize += chunk.length;
      if (totalSize > maxSize) {
        throw {
          error: "Payload too large",
          field: "body",
          details: `Max size is ${maxSize} bytes, got at least ${totalSize} bytes`,
        } as ValidationError;
      }
      chunks.push(Buffer.from(chunk));
    }
  } catch (err: any) {
    // Re-throw validation errors
    if (err.error === "Payload too large") throw err;
    throw new Error(`Failed to read request body: ${err.message}`);
  }

  if (chunks.length === 0) return { body: null, size: 0 };

  const bodyBuffer = Buffer.concat(chunks);
  const raw = bodyBuffer.toString("utf8");
  const ct = (req.headers["content-type"] ?? "").toString();

  // Try to parse JSON
  if (ct.includes("application/json")) {
    try {
      return { body: JSON.parse(raw), size: bodyBuffer.byteLength };
    } catch (err: any) {
      throw new Error(`Invalid JSON: ${err.message}`);
    }
  }

  // Return raw body for non-JSON content
  return { body: { __raw: raw }, size: bodyBuffer.byteLength };
}
