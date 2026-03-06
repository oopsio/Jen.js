import { readdirSync, statSync } from "fs";
import { join, resolve, relative } from "path";
import type { ApiHandler, ApiConfig } from "./router";

/**
 * API route module with optional config
 */
export interface ApiModule {
  default: ApiHandler;
  config?: ApiConfig;
}

/**
 * Loaded API route info
 */
export interface LoadedRoute {
  path: string;
  handler: ApiHandler;
  config?: ApiConfig;
}

/**
 * Loader for scanning and loading API route files
 *
 * @example
 * ```ts
 * const loader = new ApiLoader();
 * const routes = await loader.loadRoutes('./src/api');
 * // Routes format: [
 * //   { path: '/api/hello', handler: ..., config: ... },
 * //   { path: '/api/posts/[id]', handler: ..., config: ... },
 * //   { path: '/api/files/[...slug]', handler: ..., config: ... }
 * // ]
 * ```
 */
export class ApiLoader {
  /**
   * Load all API routes from a directory
   *
   * @param apiDir Directory to scan for route files (e.g., 'src/api')
   * @param baseRoute Base route prefix (default: '/api')
   * @returns Array of loaded routes
   */
  async loadRoutes(apiDir: string, baseRoute = "/api"): Promise<LoadedRoute[]> {
    const routes: LoadedRoute[] = [];
    const fullPath = resolve(apiDir);

    try {
      await this.scanDirectory(fullPath, baseRoute, routes);
    } catch (err) {
      console.error(`Failed to load API routes from ${apiDir}:`, err);
    }

    // Sort routes by specificity: exact > dynamic > catch-all
    routes.sort((a, b) => {
      const aIsCatchAll = a.path.includes("[...");
      const bIsCatchAll = b.path.includes("[...");
      const aIsDynamic = a.path.includes("[");
      const bIsDynamic = b.path.includes("[");

      if (aIsCatchAll && !bIsCatchAll) return 1;
      if (!aIsCatchAll && bIsCatchAll) return -1;
      if (aIsDynamic && !bIsDynamic) return 1;
      if (!aIsDynamic && bIsDynamic) return -1;

      return a.path.length - b.path.length;
    });

    return routes;
  }

  /**
   * Recursively scan directory for API route files
   *
   * @private
   */
  private async scanDirectory(
    dir: string,
    baseRoute: string,
    routes: LoadedRoute[],
  ): Promise<void> {
    const entries = readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      // Skip hidden files and directories
      if (entry.name.startsWith(".")) continue;

      if (entry.isDirectory()) {
        await this.scanDirectory(fullPath, baseRoute, routes);
      } else if (this.isRouteFile(entry.name)) {
        const routePath = this.filePathToRoute(fullPath, baseRoute);
        const module = await this.loadModule(fullPath);

        if (module && typeof module.default === "function") {
          routes.push({
            path: routePath,
            handler: module.default,
            config: module.config,
          });
        }
      }
    }
  }

  /**
   * Check if file is a valid route file
   *
   * @private
   */
  private isRouteFile(filename: string): boolean {
    return (
      /^[^.][^/]*\.(ts|tsx|js|jsx)$/.test(filename) &&
      !filename.endsWith(".d.ts")
    );
  }

  /**
   * Convert file path to API route path
   *
   * @private
   * @example
   * ```
   * src/api/hello.ts -> /api/hello
   * src/api/posts/[id].ts -> /api/posts/[id]
   * src/api/files/[...slug].ts -> /api/files/[...slug]
   * ```
   */
  private filePathToRoute(filePath: string, baseRoute: string): string {
    let route = filePath
      .replace(/\\/g, "/") // Windows path separator
      .replace(/\.(ts|tsx|js|jsx)$/, "") // Remove extension
      .replace(/\/index$/, ""); // Remove /index

    // Extract path after 'api' directory
    const apiIndex = route.lastIndexOf("/api");
    if (apiIndex !== -1) {
      route = route.slice(apiIndex);
    }

    return baseRoute + route;
  }

  /**
   * Dynamically import a module
   *
   * @private
   */
  private async loadModule(filePath: string): Promise<ApiModule | null> {
    try {
      // Convert Windows path to file:// URL
      let importPath = filePath;
      if (process.platform === "win32") {
        // Normalize: backslashes â†’ forward slashes
        const normalized = filePath.replace(/\\/g, "/");
        // Add file:// scheme (with third slash for absolute paths)
        importPath = "file:///" + normalized;
      }

      // Handle both CommonJS and ESM
      const module = await import(importPath);
      return module as ApiModule;
    } catch (err) {
      console.error(`Failed to load API route ${filePath}:`, err);
      return null;
    }
  }
}

/**
 * Create a middleware function for Express-like servers
 *
 * @param routes Loaded API routes
 * @returns Express middleware function
 *
 * @example
 * ```ts
 * import express from 'express';
 * import { createApiMiddleware } from '../api/loader';
 * import { ApiRouter } from '../api/router';
 *
 * const app = express();
 * const loader = new ApiLoader();
 * const routes = await loader.loadRoutes('./src/api');
 *
 * const router = new ApiRouter();
 * routes.forEach(route => router.register(route.path, route.handler));
 *
 * app.use(createApiMiddleware(routes));
 * ```
 */
export function createApiMiddleware(routes: LoadedRoute[]) {
  return async (req: any, res: any, next: any) => {
    // Only handle API routes
    if (!req.url.startsWith("/api")) {
      return next();
    }

    // Find matching route
    const match = findMatchingRoute(req.path, routes);

    if (!match) {
      return next(); // Let next middleware handle 404
    }

    try {
      // Set up request/response
      req.params = match.params;

      // Execute handler
      await match.route.handler(req, res);
    } catch (err) {
      console.error("API handler error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  };
}

/**
 * Find matching route using simple path matching
 *
 * @private
 */
function findMatchingRoute(requestPath: string, routes: LoadedRoute[]) {
  for (const route of routes) {
    const match = matchPath(requestPath, route.path);
    if (match) {
      return { route, params: match };
    }
  }
  return null;
}

/**
 * Match a request path against a route pattern
 *
 * @private
 */
function matchPath(
  requestPath: string,
  routePath: string,
): Record<string, string | string[]> | null {
  const routeParts = routePath.split("/").filter(Boolean);
  const requestParts = requestPath.split("/").filter(Boolean);

  // Skip 'api' prefix
  if (routeParts[0] === "api") routeParts.shift();
  if (requestParts[0] === "api") requestParts.shift();

  const params: Record<string, string | string[]> = {};
  let routeIndex = 0;
  let requestIndex = 0;

  while (routeIndex < routeParts.length && requestIndex < requestParts.length) {
    const routePart = routeParts[routeIndex];
    const requestPart = requestParts[requestIndex];

    if (routePart.startsWith("[...")) {
      // Catch-all
      const paramName = routePart.slice(4, -1);
      const remaining = requestParts.slice(requestIndex);
      params[paramName] = remaining;
      requestIndex = requestParts.length;
    } else if (routePart.startsWith("[")) {
      // Dynamic segment
      const paramName = routePart.slice(1, -1);
      params[paramName] = requestPart;
      requestIndex++;
    } else if (routePart === requestPart) {
      // Exact match
      requestIndex++;
    } else {
      // No match
      return null;
    }

    routeIndex++;
  }

  // Check if all parts matched
  if (
    routeIndex === routeParts.length &&
    requestIndex === requestParts.length
  ) {
    return params;
  }

  return null;
}
