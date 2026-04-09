import type { RequestHandler } from '../types.js';
import { ContextBuilder } from '../middleware/index.js';
import { RuntimeConfig } from '../config/config.js';
import * as jenRouter from './jen_router.cjs';
const { RouteMatcher } = jenRouter;

/**
 * Internal route handler data structure.
 */
interface RouteData {
  /** The request handler executing the route logic */
  handler: RequestHandler;
  /** Optional absolute path to a .tsx file for the route */
  filePathTsx?: string;
  /** Optional absolute path to a .jsx file for the route */
  filePathJsx?: string;
}

/**
 * High-level TypeScript Router Mapping.
 * Combines a fast WASM-based matcher for rapid URL resolution with
 * a standard TS map storing the corresponding execution handlers.
 */
export class RouterMap {
  /** Handler storage (separate from WASM router) */
  private static routeStorage = new Map<string, RouteData>();
  /** High-performance WASM-based route matcher */
  private static matcher = new RouteMatcher();
  private static initialized = false;

  /**
   * Registers a route to both the TS storage map and the WASM matcher.
   *
   * @param path The URL path pattern (e.g. `/users/:id`)
   * @param filePathTsx Absolute path to `.tsx` handler file
   * @param filePathJsx Absolute path to `.jsx` handler file
   * @param handler The asynchronous request handler function
   */
  public static registerRoute(
    path: string,
    filePathTsx: string | undefined,
    filePathJsx: string | undefined,
    handler: RequestHandler,
  ): void {
    const cleanPath = path === '/' ? '/' : path.replace(/\/$/, '');
    this.routeStorage.set(cleanPath, { handler, filePathTsx, filePathJsx });

    if (!this.initialized) {
      if (
        RuntimeConfig?.zone?.basePath &&
        typeof this.matcher.set_base_path === 'function'
      ) {
        this.matcher.set_base_path(RuntimeConfig.zone.basePath);
      }
      this.initialized = true;
    }

    // Register in WASM matcher for fast route resolution
    this.matcher.register(cleanPath, filePathTsx || '', filePathJsx || '');
  }

  private static getFilePath(
    filePathTsx: string,
    filePathJsx: string,
    request: Request,
  ): string {
    const url = new URL(request.url);
    const forceJs = url.searchParams.get('version') === 'js';

    if (forceJs && filePathJsx) {
      return filePathJsx;
    }

    return filePathTsx || filePathJsx || '';
  }

  /**
   * Resolves an incoming HTTP Request using the registered routes.
   * First runs middleware pipeline, then uses the WASM matcher to extract
   * dynamic parameters before calling the appropriate TS handler.
   *
   * @param request The inbound web Request object
   * @returns A promise resolving to the generated Response
   */
  public static async resolveRequest(request: Request): Promise<Response> {
    // Execute middleware pipeline if enabled (lazy import to avoid circular dependency)
    const { MiddlewareManager } =
      await import('../server/middleware-manager.js');

    if (MiddlewareManager.isEnabled()) {
      const context = await MiddlewareManager.executeMiddleware(request);

      // If middleware set a response, return it
      if (context.response) {
        return context.response;
      }

      // If middleware set error status code, return error response
      if (context.error && context.statusCode >= 400) {
        return ContextBuilder.buildResponse(context);
      }
    }

    const url = new URL(request.url);
    const pathName =
      url.pathname === '/' ? '/' : url.pathname.replace(/\/$/, '');

    // Use WASM-based router for O(1) static and efficient dynamic route matching
    const match = this.matcher.match_route(pathName);

    if (match.found) {
      // Static routes: direct lookup by exact pathname
      let routeData = this.routeStorage.get(match.pathname);

      // Dynamic routes: the WASM matcher returns the resolved URL (e.g. /users/123)
      // but routeStorage is keyed by the pattern (e.g. /users/:id).
      // Fall back to pattern-matching against stored dynamic keys.
      if (!routeData) {
        for (const [pattern, data] of this.routeStorage) {
          if (!pattern.includes(':')) continue;
          const regex = new RegExp(
            '^' + pattern.replace(/:[^\s/]+/g, '([^/]+)') + '$',
          );
          if (regex.test(match.pathname)) {
            routeData = data;
            break;
          }
        }
      }

      if (routeData) {
        const filePath = this.getFilePath(
          match.filePathTsx,
          match.filePathJsx,
          request,
        );

        // Parse params from JSON
        const params = JSON.parse(match.params);

        return await routeData.handler(request, {
          url: match.pathname,
          params,
          filePath,
        });
      }
    }

    return new Response('Not Found', { status: 404 });
  }
}
