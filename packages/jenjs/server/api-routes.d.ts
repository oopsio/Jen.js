import type { IncomingMessage, ServerResponse } from "node:http";
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
  /** HTTP method in uppercase (GET, POST, PUT, DELETE, PATCH, etc.). */
  method: string;
  /** Query string parameters parsed from URL (?key=value). */
  query: Record<string, string>;
  /** Parsed request body (JSON if Content-Type is application/json, else raw string). */
  body: any;
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
 * 5. Parse request body
 * 6. Call handler with context
 * 7. Serialize response (Response, string, or object)
 *
 * All errors send JSON response with error message.
 * HTTP 405 (Method Not Allowed) if method handler not exported.
 * HTTP 404 if no matching route file.
 * HTTP 500 if handler throws or transpilation fails.
 *
 * @param opts - Options containing request, response, and site directory
 * @returns true if handled, false if no API route found
 */
export declare function tryHandleApiRoute(opts: {
  req: IncomingMessage;
  res: ServerResponse;
  siteDir: string;
}): Promise<boolean>;
