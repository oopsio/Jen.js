/**
 * Cache layer module providing two implementations:
 * - MemoryCache: In-memory Map-based cache for single-process deployments.
 * - RedisCache: API contract for distributed caching (requires external redis library).
 *
 * Choose MemoryCache for development/testing or single-instance production.
 * Choose RedisCache for multi-process or distributed environments (must install redis separately).
 */
export * from "./memory";
export * from "./redis";
