/**
 * Jen.js API Routes System
 *
 * File-based API routing system inspired by Next.js API Routes.
 * All files in the `api/` directory are automatically mapped to `/api/*` routes.
 *
 * @example
 * ```
 * Directory structure:
 * src/api/
 *   hello.ts              -> GET /api/hello
 *   posts.ts              -> GET|POST /api/posts
 *   posts/[id].ts         -> GET /api/posts/123
 *   files/[...slug].ts    -> GET /api/files/a/b/c
 *   admin/[[...path]].ts  -> GET /api/admin or /api/admin/a/b
 * ```
 *
 * @example Usage in handler
 * ```ts
 * // src/api/hello.ts
 * import type { ApiRequest, ApiResponse } from '../api';
 *
 * export default function handler(req: ApiRequest, res: ApiResponse) {
 *   res.status(200).json({ message: 'Hello from Jen.js!' });
 * }
 *
 * // Optional config
 * export const config = {
 *   maxDuration: 60,
 *   bodyParser: { sizeLimit: '10mb' }
 * };
 * ```
 */

export {
  ApiRouter,
  parseQuery,
  parseCookies,
  createApiRequest,
  createApiResponse,
} from "./router";
export type {
  ApiRequest,
  ApiResponse,
  ApiHandler,
  ApiConfig,
  RouteMatch,
} from "./router";

export { ApiLoader, createApiMiddleware } from "./loader";
export type { ApiModule, LoadedRoute } from "./loader";

// Re-export for convenience
export type {
  IncomingMessage as NodeRequest,
  ServerResponse as NodeResponse,
} from "http";

