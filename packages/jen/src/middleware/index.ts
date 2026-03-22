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
} from './types';
export { MiddlewareError } from './types';

// Pipeline
export { MiddlewarePipeline } from './pipeline';

// Built-in Middleware
export { BodyParser } from './body-parser';
export { CORS } from './cors';
export { ErrorBoundary } from './error-boundary';
export { RequestLogger } from './request-logger';

// Context
export { ContextBuilder } from './context-builder';

// Imports for factory
import { CORS } from './cors';
import { BodyParser } from './body-parser';
import { ErrorBoundary } from './error-boundary';
import { RequestLogger } from './request-logger';
import { MiddlewarePipeline } from './pipeline';

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
