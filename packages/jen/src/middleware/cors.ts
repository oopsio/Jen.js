/**
 * CORS Middleware - Flexible cross-origin resource sharing
 */
import type { MiddlewareContext, NextFunction, CORSOptions } from './types.js';

export class CORS {
  private options: Required<CORSOptions>;

  constructor(options: CORSOptions = {}) {
    this.options = {
      origin: options.origin || '*',
      methods: options.methods || [
        'GET',
        'HEAD',
        'PUT',
        'PATCH',
        'POST',
        'DELETE',
      ],
      allowedHeaders: options.allowedHeaders || [
        'Content-Type',
        'Authorization',
      ],
      exposedHeaders: options.exposedHeaders || [],
      credentials: options.credentials || false,
      maxAge: options.maxAge || 86400, // 24 hours
    };
  }

  /**
   * Get handler
   */
  get handler() {
    return this.middleware();
  }

  /**
   * Middleware handler for CORS
   */
  middleware() {
    return async (context: MiddlewareContext, next: NextFunction) => {
      const origin = context.headers.get('origin') || '';

      // Check if origin is allowed
      if (!this.isOriginAllowed(origin)) {
        return next();
      }

      // Set CORS headers
      this.setCORSHeaders(context, origin);

      // Handle preflight requests
      if (context.method === 'OPTIONS') {
        context.statusCode = 204;
        context.response = new Response(null, {
          status: 204,
          headers: context.responseHeaders,
        });
        return;
      }

      return next();
    };
  }

  /**
   * Check if origin is allowed
   */
  private isOriginAllowed(origin: string): boolean {
    const { origin: allowedOrigin } = this.options;

    if (allowedOrigin === '*') {
      return true;
    }

    if (typeof allowedOrigin === 'string') {
      return origin === allowedOrigin;
    }

    if (Array.isArray(allowedOrigin)) {
      return allowedOrigin.includes(origin);
    }

    if (typeof allowedOrigin === 'function') {
      return allowedOrigin(origin);
    }

    return false;
  }

  /**
   * Set CORS response headers
   */
  private setCORSHeaders(context: MiddlewareContext, origin: string): void {
    const headers = context.responseHeaders;

    // Allow origin
    if (this.options.origin === '*') {
      headers.set('Access-Control-Allow-Origin', '*');
    } else {
      headers.set('Access-Control-Allow-Origin', origin);
    }

    // Allow methods
    headers.set(
      'Access-Control-Allow-Methods',
      this.options.methods.join(', '),
    );

    // Allow headers
    headers.set(
      'Access-Control-Allow-Headers',
      this.options.allowedHeaders.join(', '),
    );

    // Expose headers
    if (this.options.exposedHeaders.length > 0) {
      headers.set(
        'Access-Control-Expose-Headers',
        this.options.exposedHeaders.join(', '),
      );
    }

    // Credentials
    if (this.options.credentials) {
      headers.set('Access-Control-Allow-Credentials', 'true');
    }

    // Max age
    headers.set('Access-Control-Max-Age', String(this.options.maxAge));
  }
}
