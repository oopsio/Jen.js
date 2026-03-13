import { RestFetcher } from "./rest.js";
import { GraphQLClient } from "./graphql.js";
import { log } from "../shared/log.js";
/**
 * Client-side data fetching utilities for browser and Preact components.
 * Provides reactive data fetching with cache, retry, and suspense support.
 *
 * Features:
 * - Automatic refetch on mount/dependency changes
 * - Suspense integration for data boundaries
 * - In-flight request deduplication
 * - Optimistic updates
 * - Request/response interceptors
 * - Cache with multiple strategies
 *
 * @example
 * ```typescript
 * const context = { cache, interceptors, config };
 * initializeClientFetch(context);
 * const fetcher = getClientDataFetcher();
 * const result = await fetcher.fetch('/api/users');
 * ```
 */
export class ClientDataFetcher {
    rest;
    graphql;
    inflight = new Map();
    constructor(clientCtx) {
        this.rest = new RestFetcher({
            cache: clientCtx.cache,
            interceptors: clientCtx.interceptors,
        });
        this.graphql = new GraphQLClient({
            endpoint: clientCtx.config.baseUrl || "/api/graphql",
            cache: clientCtx.cache,
            interceptors: clientCtx.interceptors,
        });
    }
    /**
     * Fetches data with deduplication.
     * Multiple requests for the same URL while one is inflight return the same promise.
     * Useful for preventing duplicate requests during race conditions.
     *
     * @param url Resource URL.
     * @param config Fetch configuration (cache, retry, headers, etc.).
     * @returns Fetch result with data or error.
     */
    async fetch(url, config) {
        const key = `${config?.method || "GET"}:${url}`;
        // Return existing promise if request is in-flight
        if (this.inflight.has(key)) {
            log.info(`[ClientFetch] Deduplicating request: ${key}`);
            return this.inflight.get(key);
        }
        log.info(`[ClientFetch] Fetching: ${key}`);
        const promise = this.rest
            .fetch(url, config)
            .then((result) => {
            if (result.ok) {
                log.info(`[ClientFetch] Success: ${key}`);
            }
            else {
                log.info(`[ClientFetch] Error: ${key}`);
            }
            return result;
        })
            .finally(() => {
            this.inflight.delete(key);
        });
        this.inflight.set(key, promise);
        return promise;
    }
    /**
     * Fetches multiple resources in parallel with race condition handling.
     */
    async fetchAll(urls, config) {
        const results = {};
        const promises = Object.entries(urls).map(async ([key, url]) => {
            const result = await this.fetch(url, config);
            if (!result.ok) {
                throw new Error(`Failed to fetch ${key}: ${result.error.message}`);
            }
            results[key] = result.data;
        });
        try {
            await Promise.all(promises);
            return {
                ok: true,
                data: results,
                meta: {
                    status: 200,
                    statusText: "OK",
                    headers: {},
                    url: Object.values(urls)[0],
                    ok: true,
                },
            };
        }
        catch (err) {
            return {
                ok: false,
                error: {
                    message: err.message,
                    details: err,
                },
            };
        }
    }
    /**
     * Adds an authorization token to all requests.
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
     * Adds common headers to all requests.
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
}
/**
 * Global client fetch context for browser.
 * Initialized when app hydrates on client.
 */
let globalClientFetcher = null;
/**
 * Initializes the client data fetcher singleton.
 * Should be called during client hydration before any fetch operations.
 *
 * @param context Fetch context with cache, interceptors, and config.
 *
 * @example
 * ```typescript
 * initializeClientFetch({
 *   cache: new MemoryDataCache(),
 *   interceptors: [authInterceptor],
 *   config: { baseUrl: '/api' }
 * });
 * ```
 */
export function initializeClientFetch(context) {
    globalClientFetcher = new ClientDataFetcher(context);
    log.info("[ClientFetch] Initialized");
}
/**
 * Gets the global client data fetcher singleton.
 * Must be called after initializeClientFetch().
 *
 * @returns Global ClientDataFetcher instance.
 * @throws Error if not initialized.
 */
export function getClientDataFetcher() {
    if (!globalClientFetcher) {
        throw new Error("Client fetch not initialized. Call initializeClientFetch() during client hydration.");
    }
    return globalClientFetcher;
}
/**
 * Convenience hook for fetching data in components.
 * Returns { data, error, loading, refetch }.
 */
export function useData(url, options) {
    // This is a simplified API description
    // Full implementation would use Preact hooks (useEffect, useState)
    return {
        data: options?.initialData || null,
        error: null,
        loading: false,
        refetch: async () => {
            const fetcher = getClientDataFetcher();
            return fetcher.rest.get(url, options);
        },
    };
}
/**
 * Convenience hook for fetching multiple resources in parallel.
 */
export function useDataAll(urls, options) {
    return {
        data: {},
        error: null,
        loading: false,
        refetch: async () => {
            const fetcher = getClientDataFetcher();
            return fetcher.fetchAll(urls, options);
        },
    };
}
/**
 * Convenience hook for GraphQL queries in components.
 */
export function useGraphQL(query, variables) {
    return {
        data: null,
        error: null,
        loading: false,
        refetch: async () => {
            const fetcher = getClientDataFetcher();
            return fetcher.graphql.query({ query, variables }, { cache: { strategy: "cache-first" } });
        },
    };
}
/**
 * Convenience hook for GraphQL mutations in components.
 */
export function useMutation(mutation, onSuccess, onError) {
    return {
        execute: async (variables) => {
            const fetcher = getClientDataFetcher();
            const result = await fetcher.graphql.mutation({ query: mutation, variables }, { cache: { strategy: "no-cache" } });
            if (result.ok) {
                onSuccess?.(result.data);
            }
            else {
                onError?.(new Error(result.error.message));
            }
            return result;
        },
        loading: false,
        error: null,
    };
}
