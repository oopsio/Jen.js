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
