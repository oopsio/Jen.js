/**
 * Middleware System Types
 */

/**
 * Middleware context - provides deep access to request/response and state
 */
export interface MiddlewareContext {
  // Request properties
  request: Request;
  method: string;
  url: URL;
  pathname: string;
  query: URLSearchParams;
  headers: Headers;

  // Response control
  response?: Response;
  statusCode: number;
  responseHeaders: Headers;

  // Body parsing
  body?: unknown;
  rawBody?: string | ArrayBuffer;
  contentType?: string;
  contentLength?: number;

  // State management
  state: Record<string, unknown>;
  locals: Record<string, unknown>;

  // Request metadata
  startTime: number;
  ip?: string;
  userAgent?: string;

  // Error tracking
  error?: Error;
}

/**
 * Next function to pass control to next middleware
 */
export type NextFunction = () => Promise<void>;

/**
 * Middleware handler function
 */
export type MiddlewareHandler = (
  context: MiddlewareContext,
  next: NextFunction,
) => Promise<void>;

/**
 * Middleware definition
 */
export interface Middleware {
  name: string;
  handler: MiddlewareHandler;
  priority?: number; // Lower = executes first
}

/**
 * Middleware pipeline configuration
 */
export interface MiddlewarePipelineConfig {
  errorBoundary?: boolean;
  maxBodySize?: number;
  timeout?: number;
}

/**
 * CORS configuration
 */
export interface CORSOptions {
  origin?: string | string[] | ((origin: string) => boolean);
  methods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

/**
 * Body parser options
 */
export interface BodyParserOptions {
  maxSize?: number;
  encoding?: string;
  strict?: boolean;
}

/**
 * Middleware error
 */
export class MiddlewareError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public context?: MiddlewareContext,
  ) {
    super(message);
    this.name = 'MiddlewareError';
  }
}
