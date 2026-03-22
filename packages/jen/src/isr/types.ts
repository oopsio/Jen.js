/**
 * Incremental Static Regeneration (ISR) Configuration & Types
 */

/**
 * Route metadata including revalidation settings
 */
export interface RouteMetadata {
  path: string;
  revalidate?: number; // in seconds, undefined = no revalidation
  isDynamic?: boolean;
}

/**
 * Cached page data structure
 */
export interface CacheEntry {
  html: string;
  timestamp: number; // Unix epoch in milliseconds
}

/**
 * Freshness check result
 */
export interface FreshnessResult {
  isFresh: boolean;
  isStale: boolean;
  age: number; // milliseconds
}

/**
 * Background regeneration job
 */
export interface RegenerationJob {
  path: string;
  timestamp: number;
  attempts: number;
}

/**
 * ISR request result
 */
export type CacheStatus = 'MISS' | 'HIT_FRESH' | 'HIT_STALE';

export interface ISRResponse {
  html: string;
  status: CacheStatus;
  age?: number; // milliseconds
}

/**
 * Storage provider interface
 */
export interface IStorageProvider {
  get(key: string): Promise<CacheEntry | null>;
  set(key: string, entry: CacheEntry): Promise<void>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
}

/**
 * Render function type
 */
export type RenderFunction = (path: string) => Promise<string>;

/**
 * ISR configuration
 */
export interface ISRConfig {
  cacheDir: string;
  maxRetries: number;
  retryDelay: number; // milliseconds
}
