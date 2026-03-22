/**
 * Context Builder - Creates middleware context from Request
 */
import type { MiddlewareContext } from './types';
import { RequestLogger } from './request-logger';

export class ContextBuilder {
  /**
   * Build middleware context from Web Request
   */
  static build(request: Request): MiddlewareContext {
    const url = new URL(request.url);
    const headers = request.headers;

    const context: MiddlewareContext = {
      // Request properties
      request,
      method: request.method,
      url,
      pathname: url.pathname,
      query: url.searchParams,
      headers,

      // Response control
      statusCode: 200,
      responseHeaders: new Headers(),

      // Body parsing
      contentType: headers.get('content-type') || undefined,
      contentLength: parseInt(headers.get('content-length') || '0', 10),

      // State management
      state: {},
      locals: {},

      // Request metadata
      startTime: Date.now(),
      ip: RequestLogger.extractIP(request, headers),
      userAgent: RequestLogger.extractUserAgent(headers),
    };

    return context;
  }

  /**
   * Build response from context
   */
  static buildResponse(context: MiddlewareContext): Response {
    // If response already set, return it
    if (context.response) {
      return context.response;
    }

    // Build default response
    const body = JSON.stringify({
      status: context.statusCode,
      message: context.statusCode === 200 ? 'OK' : 'Error',
    });

    return new Response(body, {
      status: context.statusCode,
      headers: context.responseHeaders,
    });
  }
}
