import { RestFetcher } from "./rest.js";
import { GraphQLClient } from "./graphql.js";
/**
 * Server-side data fetching utilities for use in loaders and middleware.
 * Provides access to REST and GraphQL clients with proper cache integration.
 *
 * Server fetchers have access to:
 * - Backend cache (memory, Redis, etc.)
 * - Request/response interceptors
 * - Loader context (URL, params, headers, cookies)
 */
export class ServerDataFetcher {
  rest;
  graphql;
  context;
  constructor(serverCtx) {
    this.rest = new RestFetcher({
      cache: serverCtx.cache,
      interceptors: serverCtx.interceptors,
    });
    this.graphql = new GraphQLClient({
      endpoint: serverCtx.config.baseUrl || "https://api.example.com/graphql",
      cache: serverCtx.cache,
      interceptors: serverCtx.interceptors,
    });
    this.context = serverCtx.loaderContext;
  }
  /**
   * Returns loader context information for conditional data fetching.
   * Useful for customizing requests based on route params, headers, etc.
   */
  getLoaderContext() {
    return this.context;
  }
  /**
   * Creates a request interceptor that adds authentication headers.
   * Common pattern for API authentication.
   */
  withAuthToken(token) {
    this.rest.addInterceptor({
      beforeRequest: (req) => {
        req.headers = {
          ...req.headers,
          Authorization: `Bearer ${token}`,
        };
        return req;
      },
    });
    return this;
  }
  /**
   * Creates a request interceptor that adds common headers.
   */
  withHeaders(headers) {
    this.rest.addInterceptor({
      beforeRequest: (req) => {
        req.headers = {
          ...req.headers,
          ...headers,
        };
        return req;
      },
    });
    return this;
  }
  /**
   * Adds request tracing/logging interceptor.
   */
  withLogging(logger) {
    const log = logger || console.log;
    this.rest.addInterceptor({
      beforeRequest: (req) => {
        log(`[ServerFetch] ${req.method} ${req.headers}`);
        return req;
      },
      afterResponse: (res) => {
        log(`[ServerFetch] Response: ${res.ok ? "ok" : "error"}`);
        return res;
      },
    });
    return this;
  }
}
/**
 * Global cache instance for server-side fetching.
 * Should be initialized during app startup with the configured cache backend.
 */
let globalServerCache = null;
/**
 * Initializes the global server fetch context.
 * Called during app startup to set up cache and interceptors.
 */
export function initializeServerFetch(context) {
  globalServerCache = context;
}
/**
 * Gets the server data fetcher for use in loaders and middleware.
 * Must be called after initializeServerFetch().
 */
export function getServerDataFetcher(loaderCtx) {
  if (!globalServerCache) {
    throw new Error(
      "Server fetch not initialized. Call initializeServerFetch() during app startup.",
    );
  }
  return new ServerDataFetcher({
    ...globalServerCache,
    loaderContext: loaderCtx,
  });
}
/**
 * Convenience function for quick REST GET requests in loaders.
 * Uses the global server fetch context.
 */
export async function fetchData(url, loaderCtx) {
  const fetcher = getServerDataFetcher(loaderCtx);
  return fetcher.rest.get(url);
}
/**
 * Convenience function for GraphQL queries in loaders.
 */
export async function queryGraphQL(query, variables, loaderCtx) {
  const fetcher = getServerDataFetcher(loaderCtx);
  return fetcher.graphql.query({ query, variables });
}
/**
 * Creates a data loader that wraps error handling and logging.
 */
export function createDataLoader(fn) {
  return async (loaderCtx) => {
    try {
      const fetcher = getServerDataFetcher(loaderCtx);
      return await fn(fetcher);
    } catch (err) {
      console.error("[DataLoader] Error:", err);
      throw err;
    }
  };
}
/**
 * Parallel data loader for fetching multiple resources concurrently.
 */
export function createParallelDataLoader(loaders) {
  return async (loaderCtx) => {
    const fetcher = getServerDataFetcher(loaderCtx);
    const results = {};
    const promises = Object.entries(loaders).map(async ([key, loader]) => {
      try {
        results[key] = await loader(loaderCtx);
      } catch (err) {
        console.error(`[DataLoader] ${String(key)} failed:`, err);
        throw err;
      }
    });
    await Promise.all(promises);
    return results;
  };
}
/**
 * Conditional data loader that fetches based on route params or query.
 */
export function createConditionalDataLoader(condition, loader, fallback) {
  return async (loaderCtx) => {
    if (condition(loaderCtx)) {
      return loader(loaderCtx);
    }
    return fallback;
  };
}
/**
 * Error-tolerant data loader with fallback value.
 */
export function createResilientDataLoader(loader, fallback) {
  return async (loaderCtx) => {
    try {
      return await loader(loaderCtx);
    } catch (err) {
      console.warn("[DataLoader] Using fallback due to error:", err);
      return fallback;
    }
  };
}
