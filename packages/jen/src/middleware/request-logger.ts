/**
 * Request Logger Middleware - Logs all incoming requests
 */
import type { MiddlewareContext, NextFunction } from './types';

export class RequestLogger {
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
   * Middleware handler for request logging
   */
  middleware() {
    return async (context: MiddlewareContext, next: NextFunction) => {
      const startTime = performance.now();

      // Log request
      this.logRequest(context);

      // Execute next
      await next();

      // Log response
      const duration = performance.now() - startTime;
      this.logResponse(context, duration);
    };
  }

  /**
   * Log incoming request
   */
  private logRequest(context: MiddlewareContext): void {
    const { method, pathname } = context;
    const ip = context.ip || 'Unknown';

    if (this.isDevelopment) {
      console.log(`[${method}] ${pathname} - ${ip}`);
    }
  }

  /**
   * Log outgoing response
   */
  private logResponse(context: MiddlewareContext, duration: number): void {
    const { method, pathname, statusCode } = context;

    const colors = {
      reset: '\x1b[0m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      red: '\x1b[31m',
      cyan: '\x1b[36m',
    };

    const statusColor =
      statusCode < 300
        ? colors.green
        : statusCode < 400
          ? colors.cyan
          : statusCode < 500
            ? colors.yellow
            : colors.red;

    const durationColor =
      duration < 100
        ? colors.green
        : duration < 500
          ? colors.yellow
          : colors.red;

    if (this.isDevelopment) {
      console.log(
        `${statusColor}${statusCode}${colors.reset} ${method} ${pathname} ${durationColor}${duration.toFixed(2)}ms${colors.reset}`,
      );
    }
  }

  /**
   * Extract IP from request
   */
  static extractIP(request: Request, headers: Headers): string | undefined {
    // Try x-forwarded-for first (proxy)
    const xForwarded = headers.get('x-forwarded-for');
    if (xForwarded) {
      return xForwarded.split(',')[0].trim();
    }

    // Try cf-connecting-ip (Cloudflare)
    const cfIP = headers.get('cf-connecting-ip');
    if (cfIP) {
      return cfIP;
    }

    // Try x-real-ip
    const xRealIP = headers.get('x-real-ip');
    if (xRealIP) {
      return xRealIP;
    }

    return undefined;
  }

  /**
   * Extract User-Agent
   */
  static extractUserAgent(headers: Headers): string | undefined {
    return headers.get('user-agent') || undefined;
  }
}
