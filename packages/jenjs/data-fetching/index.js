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
// Cache exports
export { MemoryDataCache, NoOpCache, createCacheKey, executeCacheStrategy, } from "./cache.js";
// REST/HTTP exports
export { RestFetcher, createRestFetcher } from "./rest.js";
// GraphQL exports
export { GraphQLClient, createGraphQLClient, GraphQLQueryBuilder, } from "./graphql.js";
// Server-side exports
export { ServerDataFetcher, initializeServerFetch, getServerDataFetcher, fetchData, queryGraphQL, createDataLoader, createParallelDataLoader, createConditionalDataLoader, createResilientDataLoader, } from "./server.js";
// Client-side exports
export { ClientDataFetcher, initializeClientFetch, getClientDataFetcher, useData, useDataAll, useGraphQL, useMutation, } from "./client.js";
