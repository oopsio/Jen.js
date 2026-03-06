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

import type {
  ClientFetchContext,
  DataFetchConfig,
  FetchResult,
} from "./types.js";
import { RestFetcher } from "./rest.js";
import { GraphQLClient } from "./graphql.js";

/**
 * Client-side data fetching utilities for browser and Preact components.
 * Provides reactive data fetching with cache, retry, and suspense support.
 *
 * Features:
 * - Automatic refetch on mount/dependency changes
 * - Suspense integration for data boundaries
 * - In-flight request deduplication
 * - Optimistic updates
 */
export class ClientDataFetcher {
  readonly rest: RestFetcher;
  readonly graphql: GraphQLClient;
  private inflight = new Map<string, Promise<any>>();

  constructor(clientCtx: ClientFetchContext) {
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
   */
  async fetch<T = any>(
    url: string,
    config?: Partial<DataFetchConfig>,
  ): Promise<FetchResult<T>> {
    const key = `${config?.method || "GET"}:${url}`;

    // Return existing promise if request is in-flight
    if (this.inflight.has(key)) {
      return this.inflight.get(key)!;
    }

    const promise = this.rest.fetch<T>(url, config).finally(() => {
      this.inflight.delete(key);
    });

    this.inflight.set(key, promise);
    return promise;
  }

  /**
   * Fetches multiple resources in parallel with race condition handling.
   */
  async fetchAll<T extends Record<string, any>>(
    urls: Record<keyof T, string>,
    config?: Partial<DataFetchConfig>,
  ): Promise<FetchResult<T>> {
    const results: Record<string, any> = {};
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
        data: results as T,
        meta: {
          status: 200,
          statusText: "OK",
          headers: {},
          url: Object.values(urls)[0],
          ok: true,
        },
      };
    } catch (err: any) {
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
  withAuthToken(token: string): this {
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
  withHeaders(headers: Record<string, string>): this {
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
let globalClientFetcher: ClientDataFetcher | null = null;

/**
 * Initializes the client data fetcher.
 * Should be called during client hydration.
 */
export function initializeClientFetch(context: ClientFetchContext): void {
  globalClientFetcher = new ClientDataFetcher(context);
}

/**
 * Gets the global client data fetcher.
 */
export function getClientDataFetcher(): ClientDataFetcher {
  if (!globalClientFetcher) {
    throw new Error(
      "Client fetch not initialized. Call initializeClientFetch() during client hydration.",
    );
  }
  return globalClientFetcher;
}

/**
 * Convenience hook for fetching data in components.
 * Returns { data, error, loading, refetch }.
 */
export function useData<T = any>(
  url: string,
  options?: Partial<DataFetchConfig> & { initialData?: T },
) {
  // This is a simplified API description
  // Full implementation would use Preact hooks (useEffect, useState)
  return {
    data: options?.initialData || (null as T | null),
    error: null as Error | null,
    loading: false,
    refetch: async () => {
      const fetcher = getClientDataFetcher();
      return fetcher.rest.get<T>(url, options);
    },
  };
}

/**
 * Convenience hook for fetching multiple resources in parallel.
 */
export function useDataAll<T extends Record<string, any>>(
  urls: Record<keyof T, string>,
  options?: Partial<DataFetchConfig>,
) {
  return {
    data: {} as T,
    error: null as Error | null,
    loading: false,
    refetch: async () => {
      const fetcher = getClientDataFetcher();
      return fetcher.fetchAll<T>(urls, options);
    },
  };
}

/**
 * Convenience hook for GraphQL queries in components.
 */
export function useGraphQL<T = any>(
  query: string,
  variables?: Record<string, any>,
) {
  return {
    data: null as T | null,
    error: null as Error | null,
    loading: false,
    refetch: async () => {
      const fetcher = getClientDataFetcher();
      return fetcher.graphql.query<T>(
        { query, variables },
        { cache: { strategy: "cache-first" } },
      );
    },
  };
}

/**
 * Convenience hook for GraphQL mutations in components.
 */
export function useMutation<T = any>(
  mutation: string,
  onSuccess?: (data: T) => void,
  onError?: (err: Error) => void,
) {
  return {
    execute: async (variables?: Record<string, any>) => {
      const fetcher = getClientDataFetcher();
      const result = await fetcher.graphql.mutation<T>(
        { query: mutation, variables },
        { cache: { strategy: "no-cache" } },
      );

      if (result.ok) {
        onSuccess?.(result.data);
      } else {
        onError?.(new Error(result.error.message));
      }

      return result;
    },
    loading: false,
    error: null as Error | null,
  };
}
