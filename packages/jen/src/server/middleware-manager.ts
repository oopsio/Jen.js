/**
 * Middleware Manager - Integrates middleware system with Jen.js framework
 */
import { RuntimeConfig } from '../config/config';
import {
  MiddlewarePipeline,
  ContextBuilder,
  BodyParser,
  CORS,
  ErrorBoundary,
  RequestLogger,
  MiddlewareContext,
} from '../middleware';

export class MiddlewareManager {
  private static pipeline: MiddlewarePipeline | null = null;

  /**
   * Initialize middleware system based on runtime config
   */
  public static initialize(): void {
    if (!RuntimeConfig.middleware?.enabled) {
      return;
    }

    const config = RuntimeConfig.middleware;
    this.pipeline = new MiddlewarePipeline({
      errorBoundary: config.errorBoundary ?? true,
    });

    // Add built-in middleware in order
    if (config.errorBoundary ?? true) {
      const isDev = process.env.NODE_ENV !== 'production';
      this.pipeline.use(
        'error-boundary',
        new ErrorBoundary(isDev).handler,
        0, // Highest priority
      );
    }

    if (config.requestLogger ?? true) {
      const isDev = process.env.NODE_ENV !== 'production';
      this.pipeline.use(
        'request-logger',
        new RequestLogger(isDev).handler,
        10,
      );
    }

    if (config.bodyParser) {
      const options = typeof config.bodyParser === 'object' ? config.bodyParser : {};
      this.pipeline.use(
        'body-parser',
        new BodyParser(options).handler,
        20,
      );
    }

    if (config.cors) {
      const options = typeof config.cors === 'object' ? config.cors : {};
      this.pipeline.use('cors', new CORS(options).handler, 30);
    }

    // Add custom middleware
    if (config.custom && Array.isArray(config.custom)) {
      for (const custom of config.custom) {
        this.pipeline.use(custom.name, custom.handler, custom.priority ?? 100);
      }
    }
  }

  /**
   * Check if middleware is enabled and initialized
   */
  public static isEnabled(): boolean {
    return (
      (RuntimeConfig.middleware?.enabled ?? true) && this.pipeline !== null
    );
  }

  /**
   * Execute middleware pipeline for a request
   */
  public static async executeMiddleware(
    request: Request,
  ): Promise<MiddlewareContext> {
    if (!this.pipeline) {
      this.initialize();
    }

    // Build context from request
    const context = ContextBuilder.build(request);

    // Execute pipeline
    await this.pipeline?.execute(context);

    return context;
  }

  /**
   * Get the middleware pipeline (for advanced usage)
   */
  public static getPipeline(): MiddlewarePipeline | null {
    return this.pipeline;
  }

  /**
   * Reset middleware system (for testing)
   */
  public static reset(): void {
    this.pipeline = null;
  }
}
