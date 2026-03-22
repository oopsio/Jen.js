import type { RequestHandler } from '../types';
import { ContextBuilder } from '../middleware';
import { RouteMatcher } from './jen_router.js';

interface RouteData {
  handler: RequestHandler;
  filePathTsx?: string;
  filePathJsx?: string;
}

export class RouterMap {
  // Handler storage (separate from WASM router)
  private static routeStorage = new Map<string, RouteData>();
  // High-performance WASM-based route matcher
  private static matcher = new RouteMatcher();

  public static registerRoute(
    path: string,
    filePathTsx: string | undefined,
    filePathJsx: string | undefined,
    handler: RequestHandler,
  ): void {
    const cleanPath = path === '/' ? '/' : path.replace(/\/$/, '');
    this.routeStorage.set(cleanPath, { handler, filePathTsx, filePathJsx });

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

  public static async resolveRequest(request: Request): Promise<Response> {
    // Execute middleware pipeline if enabled (lazy import to avoid circular dependency)
    const { MiddlewareManager } = await import('../server/middleware-manager');

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
      const routeData = this.routeStorage.get(match.pathname);
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
