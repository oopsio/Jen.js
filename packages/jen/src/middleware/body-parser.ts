/**
 * High-performance Body Parser Middleware
 * Handles JSON, form-urlencoded, and raw streams
 */
import type {
  MiddlewareContext,
  NextFunction,
  BodyParserOptions,
} from './types.js';
import { MiddlewareError } from './types.js';

export class BodyParser {
  private maxSize: number;
  private encoding: string;
  private strict: boolean;

  constructor(options: BodyParserOptions = {}) {
    this.maxSize = options.maxSize || 10 * 1024 * 1024; // 10MB
    this.encoding = options.encoding || 'utf-8';
    this.strict = options.strict !== false;
  }

  /**
   * Get handler
   */
  get handler() {
    return this.middleware();
  }

  /**
   * Middleware handler for body parsing
   */
  middleware() {
    return async (context: MiddlewareContext, next: NextFunction) => {
      // Skip body parsing for GET, HEAD, DELETE
      if (['GET', 'HEAD', 'DELETE'].includes(context.method)) {
        return next();
      }

      try {
        // Extract content-type
        context.contentType = context.headers.get('content-type') || '';
        const contentLength = context.headers.get('content-length');
        context.contentLength = contentLength ? parseInt(contentLength, 10) : 0;

        // Check size limits
        if (context.contentLength > this.maxSize) {
          throw new MiddlewareError(
            `Payload too large: ${context.contentLength} > ${this.maxSize}`,
            413,
            context,
          );
        }

        // Parse based on content-type
        if (context.contentType.includes('application/json')) {
          await this.parseJSON(context);
        } else if (
          context.contentType.includes('application/x-www-form-urlencoded')
        ) {
          await this.parseFormUrlEncoded(context);
        } else if (context.contentType.includes('multipart/form-data')) {
          // For multipart, just store raw body - parse with specialized library if needed
          context.rawBody = await context.request.text();
        } else {
          // Raw body for other types
          context.rawBody = await context.request.text();
        }
      } catch (error) {
        if (error instanceof MiddlewareError) {
          throw error;
        }
        throw new MiddlewareError(
          `Body parsing error: ${String(error)}`,
          400,
          context,
        );
      }

      return next();
    };
  }

  /**
   * Parse JSON body
   */
  private async parseJSON(context: MiddlewareContext): Promise<void> {
    try {
      const text = await context.request.text();
      context.rawBody = text;

      if (!text) {
        context.body = this.strict ? {} : undefined;
        return;
      }

      context.body = JSON.parse(text);
    } catch (error) {
      throw new MiddlewareError(`Invalid JSON: ${String(error)}`, 400, context);
    }
  }

  /**
   * Parse form-urlencoded body
   */
  private async parseFormUrlEncoded(context: MiddlewareContext): Promise<void> {
    try {
      const text = await context.request.text();
      context.rawBody = text;

      if (!text) {
        context.body = {};
        return;
      }

      const params = new URLSearchParams(text);
      context.body = Object.fromEntries(params.entries());
    } catch (error) {
      throw new MiddlewareError(
        `Form parsing error: ${String(error)}`,
        400,
        context,
      );
    }
  }

  /**
   * Get raw body as text
   */
  static async getRawBody(request: Request): Promise<string> {
    return request.text();
  }

  /**
   * Get raw body as buffer
   */
  static async getRawBuffer(request: Request): Promise<ArrayBuffer> {
    return request.arrayBuffer();
  }

  /**
   * Get body stream
   */
  static getStream(request: Request): ReadableStream<Uint8Array> {
    return request.body!;
  }
}
