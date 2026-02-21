import type { IncomingMessage, ServerResponse } from "node:http";
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
    params: Record<string, string>;
}
/**
 * API handler function.
 * Return Response, string, or object (auto JSON).
 */
export type ApiHandler = (ctx: ApiRouteContext) => Promise<Response | string | Record<string, any> | null> | Response | string | Record<string, any> | null;
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
/**
 * Try to handle an API route.
 * Returns true if handled (success or error), false if no route found.
 *
 * Routes:
 *   /api/hello → site/api/hello.ts (GET, POST, etc.)
 *   /api/users/123 → site/api/users/[id].ts
 */
export declare function tryHandleApiRoute(opts: {
    req: IncomingMessage;
    res: ServerResponse;
    siteDir: string;
}): Promise<boolean>;
