/**
 * Error Boundary Middleware - Catches and handles errors gracefully
 */
import type { MiddlewareContext, NextFunction } from './types';
import { MiddlewareError } from './types';

export class ErrorBoundary {
  private isDevelopment: boolean;

  constructor(isDevelopment: boolean = process.env.NODE_ENV !== 'production') {
    this.isDevelopment = isDevelopment;
  }

  /**
   * Get handler
   */
  get handler() {
    return this.middleware();
  }

  /**
   * Middleware handler for error boundary
   */
  middleware() {
    return async (context: MiddlewareContext, next: NextFunction) => {
      try {
        await next();
      } catch (error) {
        // Handle the error gracefully
        this.handleError(context, error);
      }

      // Check if an error occurred in downstream middleware
      if (context.error && !context.response) {
        this.handleError(context, context.error);
      }
    };
  }

  /**
   * Handle error and set appropriate response
   */
  private handleError(context: MiddlewareContext, error: unknown): void {
    let statusCode = 500;
    let message = 'Internal Server Error';

    if (error instanceof MiddlewareError) {
      statusCode = error.statusCode;
      message = error.message;
    } else if (error instanceof SyntaxError) {
      statusCode = 400;
      message = 'Invalid request syntax';
    } else if (error instanceof Error) {
      message = error.message;
    }

    // Log error
    console.error(`[${statusCode}] ${message}`, error);

    // Build error response
    const errorBody = {
      error: {
        status: statusCode,
        message,
        ...(this.isDevelopment && {
          details: error instanceof Error ? error.stack : String(error),
        }),
      },
    };

    // Set response
    context.statusCode = statusCode;
    context.responseHeaders.set('Content-Type', 'application/json');
    context.response = new Response(JSON.stringify(errorBody, null, 2), {
      status: statusCode,
      headers: context.responseHeaders,
    });
  }
}
