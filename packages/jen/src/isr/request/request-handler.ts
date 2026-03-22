/**
 * Request lifecycle handler with ISR integration
 */
import type { RouteMetadata, RenderFunction } from '../types';
import { CacheManager } from '../cache/cache-manager';

/**
 * ISR-aware request handler
 */
export class ISRRequestHandler {
  constructor(
    private cacheManager: CacheManager,
    private render: RenderFunction,
  ) {}

  /**
   * Process request through ISR pipeline
   * Returns Response with cache metadata headers
   */
  async handle(request: Request, route: RouteMetadata): Promise<Response> {
    // Only cache GET requests
    if (request.method !== 'GET') {
      const html = await this.render(route.path);
      return new Response(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    // Get page with SWR pattern
    const result = await this.cacheManager.getPage(route, this.render);

    // Build response with cache status headers
    const headers = new Headers({
      'Content-Type': 'text/html; charset=utf-8',
      'X-Cache-Status': result.status,
    });

    if (result.age !== undefined) {
      headers.append('X-Cache-Age', String(Math.floor(result.age / 1000)));
    }

    if (result.status === 'HIT_FRESH') {
      headers.append('Cache-Control', 'public, max-age=31536000');
    } else if (result.status === 'HIT_STALE') {
      // Tell browser cache can still serve stale
      headers.append(
        'Cache-Control',
        'public, max-age=0, stale-while-revalidate=31536000',
      );
    }

    return new Response(result.html, {
      status: 200,
      headers,
    });
  }
}
