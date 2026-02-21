import { IncomingMessage, ServerResponse } from 'http';
import { URL } from 'url';

/**
 * API request object extending Node's IncomingMessage
 *
 * @example
 * ```ts
 * export default async function handler(req: ApiRequest, res: ApiResponse) {
 *   console.log(req.method, req.url, req.query, req.body);
 * }
 * ```
 */
export interface ApiRequest extends IncomingMessage {
  /** HTTP method (GET, POST, PUT, DELETE, etc.) */
  method: string;
  /** Parsed query parameters from URL */
  query: Record<string, string | string[]>;
  /** Parsed request body (JSON, form-data, etc.) */
  body: any;
  /** Path parameters from dynamic routes (e.g., {id} from /api/post/[id]) */
  params: Record<string, string | string[]>;
  /** Raw request URL */
  url: string;
  /** Request cookies */
  cookies: Record<string, string>;
}

/**
 * API response object extending Node's ServerResponse
 *
 * @example
 * ```ts
 * export default function handler(req: ApiRequest, res: ApiResponse) {
 *   res.status(200).json({ message: 'Hello' });
 * }
 * ```
 */
export interface ApiResponse extends ServerResponse {
  /**
   * Set HTTP status code
   * @param code HTTP status code (200, 404, 500, etc.)
   */
  status: (code: number) => ApiResponse;

  /**
   * Send JSON response
   * @param body Object to serialize as JSON
   */
  json: <T = any>(body: T) => void;

  /**
   * Send HTTP response (string, object, or Buffer)
   * @param body Response body
   */
  send: (body: string | object | Buffer) => void;

  /**
   * Redirect to path or URL
   * @param statusOrPath HTTP status code (optional) or path
   * @param path Path or URL to redirect to
   */
  redirect: (statusOrPath: number | string, path?: string) => void;

  /**
   * Set response header
   * @param key Header name
   * @param value Header value
   */
  header: (key: string, value: string | number) => ApiResponse;

  /**
   * Send file download
   * @param filepath Path to file
   * @param filename Optional filename for download
   */
  download: (filepath: string, filename?: string) => void;

  /**
   * Send file as response
   * @param filepath Path to file
   */
  sendFile: (filepath: string) => void;
}

/**
 * API handler function type
 *
 * @example
 * ```ts
 * export default function handler(req: ApiRequest, res: ApiResponse) {
 *   res.json({ data: 'example' });
 * }
 * ```
 */
export type ApiHandler = (req: ApiRequest, res: ApiResponse) => Promise<void> | void;

/**
 * API route configuration
 */
export interface ApiConfig {
  /** Maximum request body size (default: '1mb') */
  bodyParser?: {
    sizeLimit?: string;
  };
  /** Maximum execution time in seconds (default: 30) */
  maxDuration?: number;
  /** Whether this route uses external resolver (default: false) */
  externalResolver?: boolean;
  /** Maximum response size before warning (default: '4mb') */
  responseLimit?: string | number | boolean;
}

/**
 * Route match result with path parameters
 */
export interface RouteMatch {
  handler: ApiHandler;
  params: Record<string, string | string[]>;
}

/**
 * API Router for matching requests to handlers
 */
export class ApiRouter {
  private routes: Map<
    string,
    { handler: ApiHandler; pattern: RegExp; isDynamic: boolean; isCatchAll: boolean }
  > = new Map();

  /**
   * Register an API route handler
   *
   * @param path Route path (e.g., '/api/posts', '/api/posts/[id]', '/api/posts/[...slug]')
   * @param handler Request handler function
   *
   * @example
   * ```ts
   * router.register('/api/posts', handler);
   * router.register('/api/posts/[id]', handler);
   * router.register('/api/files/[...path]', handler);
   * ```
   */
  register(path: string, handler: ApiHandler): void {
    const pattern = this.pathToRegex(path);
    const isDynamic = path.includes('[');
    const isCatchAll = path.includes('[...');

    this.routes.set(path, { handler, pattern, isDynamic, isCatchAll });
  }

  /**
   * Match a request path to a registered route
   *
   * @param requestPath Request path
   * @returns Matched handler and extracted params, or null if no match
   */
  match(requestPath: string): RouteMatch | null {
    // First try exact matches (non-dynamic routes)
    for (const [path, route] of this.routes) {
      if (!route.isDynamic && path === requestPath) {
        return { handler: route.handler, params: {} };
      }
    }

    // Then try dynamic routes (sort by specificity)
    const dynamicRoutes = Array.from(this.routes.entries())
      .filter(([, route]) => route.isDynamic)
      .sort(([a], [b]) => {
        // Predefined routes before catch-all
        if (a.includes('[...')) return 1;
        if (b.includes('[...')) return -1;
        // More specific before less specific
        return a.split('/').length - b.split('/').length;
      });

    for (const [path, route] of dynamicRoutes) {
      const match = requestPath.match(route.pattern);
      if (match) {
        const params = this.extractParams(path, requestPath);
        return { handler: route.handler, params };
      }
    }

    return null;
  }

  /**
   * Convert a path pattern to a regex
   *
   * @private
   */
  private pathToRegex(path: string): RegExp {
    // Convert /api/posts/[id] to /api/posts/([^/]+)
    // Convert /api/files/[...slug] to /api/files/(.+)
    // Convert /api/items/[[...optional]] to /api/items(/.*)?

    let pattern = path
      .replace(/\//g, '\\/')
      .replace(/\[\[\.\.\.([^\]]+)\]\]/g, '(?:\\/(.+))?') // Optional catch-all (do first)
      .replace(/\[\.\.\.([^\]]+)\]/g, '(.+)') // Required catch-all
      .replace(/\[([^\]]+)\]/g, '([^\\/]+)'); // Dynamic segment

    return new RegExp(`^${pattern}$`);
  }

  /**
   * Extract parameters from a matched route
   *
   * @private
   */
  private extractParams(
    routePath: string,
    requestPath: string,
  ): Record<string, string | string[]> {
    const params: Record<string, string | string[]> = {};

    // Extract parameter names from route
    const paramMatches = routePath.matchAll(/\[\.{0,3}(\w+)\]/g);
    const paramNames = Array.from(paramMatches, (m) => m[1]);

    // Match request path and extract values
    const pattern = this.pathToRegex(routePath);
    const match = requestPath.match(pattern);

    if (!match) return params;

    for (let i = 0; i < paramNames.length; i++) {
      const name = paramNames[i];
      const value = match[i + 1];

      if (routePath.includes(`[...${name}]`) || routePath.includes(`[[...${name}]]`)) {
        // Catch-all: convert to array
        params[name] = value ? value.split('/').filter(Boolean) : [];
      } else {
        params[name] = value;
      }
    }

    return params;
  }
}

/**
 * Parse query string into object
 *
 * @private
 */
export function parseQuery(queryString: string): Record<string, string | string[]> {
  const params: Record<string, string | string[]> = {};

  if (!queryString) return params;

  const pairs = queryString.split('&');
  for (const pair of pairs) {
    const [key, value] = pair.split('=');
    const decodedKey = decodeURIComponent(key || '');
    const decodedValue = decodeURIComponent(value || '');

    if (params[decodedKey]) {
      if (Array.isArray(params[decodedKey])) {
        (params[decodedKey] as string[]).push(decodedValue);
      } else {
        params[decodedKey] = [params[decodedKey] as string, decodedValue];
      }
    } else {
      params[decodedKey] = decodedValue;
    }
  }

  return params;
}

/**
 * Parse cookies from request headers
 *
 * @private
 */
export function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};

  if (!cookieHeader) return cookies;

  const pairs = cookieHeader.split(';');
  for (const pair of pairs) {
    const [key, value] = pair.trim().split('=');
    if (key) cookies[key] = decodeURIComponent(value || '');
  }

  return cookies;
}

/**
 * Create enhanced request object
 *
 * @private
 */
export async function createApiRequest(
  req: IncomingMessage,
  params: Record<string, string | string[]> = {},
): Promise<ApiRequest> {
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  const query = parseQuery(url.search.slice(1));
  const cookies = parseCookies(req.headers.cookie || '');

  let body: any = null;

  // Parse body if present
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    body = await new Promise((resolve, reject) => {
      let data = '';

      req.on('data', (chunk) => {
        data += chunk.toString();
      });

      req.on('end', () => {
        try {
          const contentType = req.headers['content-type'] || '';
          if (contentType.includes('application/json')) {
            resolve(data ? JSON.parse(data) : null);
          } else if (contentType.includes('application/x-www-form-urlencoded')) {
            resolve(parseQuery(data));
          } else {
            resolve(data || null);
          }
        } catch (err) {
          reject(err);
        }
      });

      req.on('error', reject);
    });
  }

  return {
    ...req,
    method: req.method || 'GET',
    url: req.url || '/',
    query,
    body,
    params,
    cookies,
  } as ApiRequest;
}

/**
 * Create enhanced response object
 *
 * @private
 */
export function createApiResponse(res: ServerResponse): ApiResponse {
  const apiRes = res as ApiResponse;
  let statusCode = 200;
  let headersSent = false;

  apiRes.status = function (code: number) {
    statusCode = code;
    res.statusCode = code;
    return apiRes;
  };

  apiRes.header = function (key: string, value: string | number) {
    res.setHeader(key, value);
    return apiRes;
  };

  apiRes.json = function <T = any>(body: T) {
    if (!headersSent) {
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = statusCode;
      headersSent = true;
    }
    res.end(JSON.stringify(body));
  };

  apiRes.send = function (body: string | object | Buffer) {
    if (!headersSent) {
      if (typeof body === 'object' && !(body instanceof Buffer)) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(body));
      } else {
        res.end(body);
      }
      headersSent = true;
    }
  };

  apiRes.redirect = function (statusOrPath: number | string, path?: string) {
    const redirectPath = typeof statusOrPath === 'string' ? statusOrPath : path || '/';
    const code = typeof statusOrPath === 'number' ? statusOrPath : 307;

    res.statusCode = code;
    res.setHeader('Location', redirectPath);
    res.end();
    headersSent = true;
  };

  apiRes.download = function (filepath: string, filename?: string) {
    res.setHeader('Content-Disposition', `attachment; filename="${filename || filepath}"`);
    apiRes.sendFile(filepath);
  };

  apiRes.sendFile = function (filepath: string) {
    // Dynamic import for sendFile functionality
    (async () => {
      try {
        const { createReadStream } = await import('fs');
        const file = createReadStream(filepath);
        file.pipe(res);
        headersSent = true;
      } catch (err) {
        console.error('Error sending file:', err);
        res.statusCode = 500;
        res.end('Error sending file');
      }
    })();
  };

  return apiRes;
}
