import type { ViteDevServer } from 'vite';

/**
 * Data loader context - passed to load() function
 */
export interface LoadContext {
  url: string;
  pathname: string;
  params?: Record<string, string>;
  query?: Record<string, string | string[]>;
  headers?: Headers;
}

/**
 * Data loader result - data to pass as props to component
 */
export interface LoadResult {
  props: Record<string, unknown>;
  revalidate?: number; // ISR revalidation time in seconds
  redirect?: string; // Optional redirect URL
  notFound?: boolean; // Optional 404 response
}

/**
 * Data loader function type
 */
export type DataLoader = (
  context: LoadContext,
) => LoadResult | Promise<LoadResult>;

export interface PageModule {
  default: unknown; // Component
  load?: DataLoader;
  server?: DataLoader; // Alias for load()
}

/**
 * Data Loader Manager
 */
export class DataLoaderManager {
  /**
   * Load data for a page using its load() or server() function
   */
  public static async loadPageData(
    filePath: string,
    vite: ViteDevServer,
    context: LoadContext,
  ): Promise<LoadResult | null> {
    const module = (await vite.ssrLoadModule(filePath)) as PageModule;

    // Try load() first, then server()
    const loader = module.load || module.server;

    if (!loader || typeof loader !== 'function') {
      // No data loader, return null
      return null;
    }

    // Call the loader function
    const result = await loader(context);

    // Validate result
    if (!result || typeof result !== 'object') {
      throw new Error('Data loader must return an object with { props, ... }');
    }

    if (!('props' in result) || typeof result.props !== 'object') {
      throw new Error('Data loader must return { props: {...}, ... }');
    }

    return result as LoadResult;
  }

  /**
   * Build context from request
   */
  public static buildContext(
    url: string,
    headers?: Record<string, string | string[]>,
  ): LoadContext {
    const urlObj = new URL(url, 'http://localhost');

    return {
      url,
      pathname: urlObj.pathname,
      query: Object.fromEntries(urlObj.searchParams),
      headers: headers ? new Headers(headers as HeadersInit) : undefined,
    };
  }

  /**
   * Handle redirect response
   */
  public static createRedirectResponse(location: string): Response {
    return new Response(null, {
      status: 307,
      headers: {
        Location: location,
      },
    });
  }

  /**
   * Handle not found response
   */
  public static createNotFoundResponse(
    message: string = 'Page not found',
  ): Response {
    return new Response(message, {
      status: 404,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
}
