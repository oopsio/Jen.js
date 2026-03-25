/**
 * Middleware Engine - Built-in middleware system for Jen.js
 */

// Types
export type {
  MiddlewareContext,
  NextFunction,
  MiddlewareHandler,
  Middleware,
  MiddlewarePipelineConfig,
  CORSOptions,
  BodyParserOptions,
} from './types.js';
export { MiddlewareError } from './types.js';

// Pipeline
export { MiddlewarePipeline } from './pipeline.js';

// Built-in Middleware
export { BodyParser } from './body-parser.js';
export { CORS } from './cors.js';
export { ErrorBoundary } from './error-boundary.js';
export { RequestLogger } from './request-logger.js';

// Context
export { ContextBuilder } from './context-builder.js';

// Imports for factory
import { CORS } from './cors.js';
import { BodyParser } from './body-parser.js';
import { ErrorBoundary } from './error-boundary.js';
import { RequestLogger } from './request-logger.js';
import { MiddlewarePipeline } from './pipeline.js';

/**
 * Middleware Factory - Easy setup of common middleware
 */
export class MiddlewareFactory {
  static createCORS(options = {}) {
    return new CORS(options);
  }

  static createBodyParser(options = {}) {
    return new BodyParser(options);
  }

  static createErrorBoundary(isDev?: boolean) {
    return new ErrorBoundary(isDev);
  }

  static createRequestLogger(isDev?: boolean) {
    return new RequestLogger(isDev);
  }

  static createPipeline(config = {}) {
    return new MiddlewarePipeline(config);
  }
}
