/**
 * ISR Manager - Integrates ISR system into Jen.js framework
 */
import { RuntimeConfig } from '../config/config';
import { RouteMetadataExtractor } from '../isr';
import { ISRFactory, ISRRequestHandler } from '../isr';
import type { ViteDevServer } from 'vite';
import type { RouteMetadata } from '../isr';
import { SsrEngine } from './ssr';

export class ISRManager {
  private static isrHandler: ISRRequestHandler | null = null;
  private static isEnabled: boolean = false;

  /**
   * Initialize ISR system (called once at startup)
   */
  public static async initialize(vite: ViteDevServer): Promise<void> {
    if (!RuntimeConfig.isr?.enabled) {
      this.isEnabled = false;
      return;
    }

    this.isEnabled = true;

    // Create render function that uses Jen.js SSR engine
    const render = async (path: string): Promise<string> => {
      // Find the file path for this route (simplified - in real use, would look up from route registry)
      // For now, we'll handle this at the handler level
      return '<html><body>Placeholder</body></html>';
    };

    // Create ISR handler based on environment
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
      this.isrHandler = ISRFactory.createProd(
        render,
        RuntimeConfig.isr.cacheDir || '.cache/isr',
        {
          maxRetries: RuntimeConfig.isr.maxRetries || 3,
          retryDelay: RuntimeConfig.isr.retryDelay || 1000,
        },
      );
    } else {
      this.isrHandler = ISRFactory.createDev(render, {
        maxRetries: 1,
        retryDelay: 500,
      });
    }
  }

  /**
   * Check if ISR is enabled
   */
  public static isISREnabled(): boolean {
    return this.isEnabled && this.isrHandler !== null;
  }

  /**
   * Extract route metadata from page module exports
   */
  public static async extractMetadata(
    filePath: string,
    urlPath: string,
    moduleExports: Record<string, any>,
  ): Promise<RouteMetadata> {
    let metadata = await RouteMetadataExtractor.fromModule(
      filePath,
      urlPath,
      moduleExports,
    );

    // Apply global revalidate fallback
    if (RuntimeConfig.isr?.globalRevalidate !== undefined) {
      metadata = RouteMetadataExtractor.applyGlobalConfig(
        metadata,
        RuntimeConfig.isr.globalRevalidate,
      );
    }

    return metadata;
  }

  /**
   * Handle request through ISR pipeline
   * Returns null if ISR should be skipped, otherwise returns Response
   */
  public static async handleRequest(
    request: Request,
    filePath: string,
    urlPath: string,
    moduleExports: Record<string, any>,
    vite: ViteDevServer,
  ): Promise<Response | null> {
    if (!this.isISREnabled() || !this.isrHandler) {
      return null;
    }

    // Only cache GET requests
    if (request.method !== 'GET') {
      return null;
    }

    try {
      // Extract metadata from module
      const metadata = await this.extractMetadata(filePath, urlPath, moduleExports);

      // Skip caching if no revalidate set and not explicitly enabled
      if (metadata.revalidate === undefined && !RuntimeConfig.isr?.globalRevalidate) {
        return null;
      }

      // Create SSR render function scoped to this route
      const renderFunction = async (): Promise<string> => {
        return SsrEngine.renderPage(filePath, urlPath, vite);
      };

      // Create a minimal handler that uses our custom render
      const cacheManager = ISRFactory.createCacheManager(
        // We need to get the storage from the handler - for now use a simplified approach
        this.getCacheStorage(),
        {
          cacheDir: RuntimeConfig.isr?.cacheDir || '.cache/isr',
          maxRetries: RuntimeConfig.isr?.maxRetries || 3,
          retryDelay: RuntimeConfig.isr?.retryDelay || 1000,
        },
      );

      // Get page with SWR pattern
      const result = await cacheManager.getPage(metadata, renderFunction);

      // Build response with cache headers
      const headers = new Headers({
        'Content-Type': 'text/html; charset=utf-8',
        'X-Cache-Status': result.status,
      });

      if (result.age !== undefined) {
        headers.append('X-Cache-Age', String(Math.floor(result.age / 1000)));
      }

      // Add appropriate cache control headers
      if (result.status === 'HIT_FRESH') {
        headers.append('Cache-Control', 'public, max-age=31536000');
      } else if (result.status === 'HIT_STALE') {
        headers.append(
          'Cache-Control',
          'public, max-age=0, stale-while-revalidate=31536000',
        );
      }

      return new Response(result.html, { status: 200, headers });
    } catch (error) {
      // Log ISR error but don't block - fall through to normal rendering
      console.error('ISR request failed, falling back to standard rendering:', error);
      return null;
    }
  }

  /**
   * Get cache storage instance (lazy initialized)
   */
  private static getCacheStorage() {
    // Import here to avoid circular dependencies
    const { MemoryStorage } = require('../isr');
    return new MemoryStorage();
  }
}
