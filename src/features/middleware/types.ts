/*
 * Middleware Feature Types
 */

/**
 * Middleware feature configuration
 */
export interface MiddlewareFeature {
  enabled?: boolean;
  order?: number;
  exclude?: string[];
}

/**
 * Middleware handler function
 */
export type MiddlewareHandler = (
  context: any,
  next: () => Promise<void>,
) => Promise<void>;
