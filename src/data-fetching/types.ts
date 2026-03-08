/**
 * Core types for the data fetching system.
 * Supports REST, GraphQL, and custom fetch operations with caching.
 */

/**
 * HTTP request method type
 */
export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "HEAD"
  | "OPTIONS";

/**
 * Request options for data fetching
 */
export interface FetchOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number; // milliseconds
  credentials?: "include" | "same-origin" | "omit";
  signal?: AbortSignal;
}

/**
 * Response metadata from a fetch operation
 */
export interface FetchMeta {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  url: string;
  ok: boolean;
  cached?: boolean;
}

/**
 * Successful data fetch result
 */
export interface FetchSuccess<T> {
  ok: true;
  data: T;
  meta: FetchMeta;
}

/**
 * Failed data fetch result with error details
 */
export interface FetchError {
  ok: false;
  error: {
    message: string;
    code?: string;
    status?: number;
    details?: any;
  };
  meta?: Partial<FetchMeta>;
}

/**
 * Union type for fetch operation result
 */
export type FetchResult<T = any> = FetchSuccess<T> | FetchError;

/**
 * GraphQL query/mutation request structure
 */
export interface GraphQLRequest {
  query: string;
  variables?: Record<string, any>;
  operationName?: string;
}

/**
 * GraphQL response structure
 */
export interface GraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: Array<string | number>;
    extensions?: Record<string, any>;
  }>;
  extensions?: Record<string, any>;
}

/**
 * Cache entry structure with metadata
 */
export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  tags?: string[]; // For invalidation
}

/**
 * Cache backend interface for pluggable implementations
 */
export interface CacheBackend {
  get<T = any>(key: string): Promise<T | null>;
  set<T = any>(
    key: string,
    value: T,
    ttl?: number,
    tags?: string[],
  ): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  invalidate(tags: string[]): Promise<void>;
}

/**
 * Cache strategy options
 */
export type CacheStrategy =
  | "no-cache"
  | "cache-first"
  | "stale-while-revalidate"
  | "network-first";

/**
 * Cache configuration for fetch operations
 */
export interface CacheConfig {
  enabled?: boolean;
  strategy?: CacheStrategy;
  ttl?: number; // milliseconds
  tags?: string[];
}

/**
 * Advanced fetch configuration combining cache and request options
 */
export interface DataFetchConfig extends FetchOptions {
  cache?: CacheConfig | boolean;
  retry?: {
    attempts?: number;
    delay?: number; // milliseconds
    backoff?: "linear" | "exponential";
  };
  timeout?: number;
  baseUrl?: string; // Base URL for relative requests
}

/**
 * Fetch interceptor for request/response transformation
 */
export interface FetchInterceptor {
  beforeRequest?(request: FetchOptions): FetchOptions | Promise<FetchOptions>;
  afterResponse?<T>(
    response: FetchResult<T>,
  ): FetchResult<T> | Promise<FetchResult<T>>;
  onError?(error: FetchError): FetchError | Promise<FetchError>;
}

/**
 * Loader context passed to data fetchers in routes
 */
export interface LoaderContext {
  url: URL;
  params: Record<string, string>;
  query: Record<string, string>;
  headers: Record<string, string>;
  cookies: Record<string, string>;
  data?: Record<string, any>;
}

/**
 * Server-side data fetcher context with cache access
 */
export interface ServerFetchContext {
  cache: CacheBackend;
  interceptors: FetchInterceptor[];
  config: DataFetchConfig;
  loaderContext?: LoaderContext;
}

/**
 * Client-side data fetcher context
 */
export interface ClientFetchContext {
  cache: CacheBackend;
  interceptors: FetchInterceptor[];
  config: DataFetchConfig;
}

/**
 * Revalidation strategy for incremental static regeneration
 */
export interface RevalidationConfig {
  enabled?: boolean;
  interval?: number; // milliseconds
  tags?: string[];
  onRevalidate?: (tags: string[]) => Promise<void>;
}
