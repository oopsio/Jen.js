/**
 * Middleware Pipeline - Sequential async middleware execution
 */
import type {
  MiddlewareContext,
  MiddlewareHandler,
  NextFunction,
  MiddlewarePipelineConfig,
} from './types';

export class MiddlewarePipeline {
  private middlewares: Array<{ handler: MiddlewareHandler; name: string }> = [];
  private config: MiddlewarePipelineConfig;

  constructor(config: MiddlewarePipelineConfig = {}) {
    this.config = {
      errorBoundary: true,
      maxBodySize: 10 * 1024 * 1024, // 10MB
      timeout: 30000, // 30 seconds
      ...config,
    };
  }

  /**
   * Register middleware
   */
  use(name: string, handler: MiddlewareHandler, priority?: number): this {
    this.middlewares.push({ handler, name });

    // Sort by priority (lower = first)
    this.middlewares.sort((a, b) => {
      const aPriority = priority ?? this.getMiddlewarePriority(a.name);
      const bPriority = priority ?? this.getMiddlewarePriority(b.name);
      return aPriority - bPriority;
    });

    return this;
  }

  /**
   * Get priority for middleware
   */
  private getMiddlewarePriority(name: string): number {
    const priorityMap: Record<string, number> = {
      'error-boundary': 0,
      'request-logger': 10,
      'body-parser': 20,
      cors: 30,
      custom: 100,
    };
    return priorityMap[name] || 100;
  }

  /**
   * Execute middleware pipeline
   */
  async execute(context: MiddlewareContext): Promise<void> {
    let index = 0;

    const next: NextFunction = async () => {
      if (index >= this.middlewares.length) {
        return;
      }

      const { handler, name } = this.middlewares[index++];

      try {
        await handler(context, next);
      } catch (error) {
        // Handle middleware errors
        if (this.config.errorBoundary) {
          console.error(`[Middleware Error] ${name}:`, error);
          context.error = error as Error;
          context.statusCode = 500;

          // Continue to error handlers
          if (index < this.middlewares.length) {
            await next();
          }
        } else {
          throw error;
        }
      }
    };

    // Execute first middleware
    await next();
  }

  /**
   * Get registered middlewares
   */
  getMiddlewares(): string[] {
    return this.middlewares.map((m) => m.name);
  }

  /**
   * Clear all middlewares
   */
  clear(): void {
    this.middlewares = [];
  }
}
