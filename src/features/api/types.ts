/*
 * API Feature Types
 */

/**
 * API feature configuration
 */
export interface ApiFeature {
  enabled?: boolean;
  prefix?: string;
  cache?: boolean;
}

/**
 * Context for API route handling
 */
export interface ApiRouteContext {
  method: string;
  path: string;
  query?: Record<string, string>;
  headers?: Record<string, string>;
  body?: any;
}
