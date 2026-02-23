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

/**
 * Jen.js Data Fetching Module
 *
 * Comprehensive data fetching infrastructure with support for:
 * - REST/HTTP APIs with automatic retry and timeout handling
 * - GraphQL queries and mutations with error handling
 * - Multi-backend caching (memory, Redis, custom)
 * - Cache strategies (cache-first, network-first, stale-while-revalidate)
 * - Request/response interceptors
 * - Server-side and client-side fetching
 * - Type-safe configuration and results
 *
 * Key exports:
 * - Types: FetchResult, DataFetchConfig, CacheBackend, etc.
 * - REST: RestFetcher, createRestFetcher
 * - GraphQL: GraphQLClient, createGraphQLClient
 * - Cache: MemoryDataCache, NoOpCache, createCacheKey
 * - Server: ServerDataFetcher, initializeServerFetch, getServerDataFetcher
 * - Client: ClientDataFetcher, initializeClientFetch, getClientDataFetcher
 */

// Type exports
export type {
  HttpMethod,
  FetchOptions,
  FetchMeta,
  FetchSuccess,
  FetchError,
  FetchResult,
  GraphQLRequest,
  GraphQLResponse,
  CacheEntry,
  CacheBackend,
  CacheStrategy,
  CacheConfig,
  DataFetchConfig,
  FetchInterceptor,
  LoaderContext,
  ServerFetchContext,
  ClientFetchContext,
  RevalidationConfig,
} from "./types.js";

// Cache exports
export {
  MemoryDataCache,
  NoOpCache,
  createCacheKey,
  executeCacheStrategy,
} from "./cache.js";

// REST/HTTP exports
export {
  RestFetcher,
  createRestFetcher,
} from "./rest.js";

// GraphQL exports
export {
  GraphQLClient,
  createGraphQLClient,
  GraphQLQueryBuilder,
} from "./graphql.js";

// Server-side exports
export {
  ServerDataFetcher,
  initializeServerFetch,
  getServerDataFetcher,
  fetchData,
  queryGraphQL,
  createDataLoader,
  createParallelDataLoader,
  createConditionalDataLoader,
  createResilientDataLoader,
} from "./server.js";
export type {
  DataLoader,
} from "./server.js";

// Client-side exports
export {
  ClientDataFetcher,
  initializeClientFetch,
  getClientDataFetcher,
  useData,
  useDataAll,
  useGraphQL,
  useMutation,
} from "./client.js";
