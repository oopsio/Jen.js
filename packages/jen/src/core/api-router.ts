import path from 'node:path';
import fs from 'node:fs';

/**
 * HTTP method type
 */
export type HTTPMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'PATCH'
  | 'HEAD'
  | 'OPTIONS';

/**
 * API request object (Fetch API compatible)
 */
export interface APIRequest extends Omit<Request, 'body'> {
  query?: Record<string, string | string[]>;
  body?: unknown;
}

/**
 * API response builder
 */
export class APIResponse {
  private status: number = 200;
  private headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  private body: unknown = null;

  constructor() {}

  setStatus(status: number): this {
    this.status = status;
    return this;
  }

  setHeader(key: string, value: string): this {
    this.headers[key] = value;
    return this;
  }

  json(data: unknown): Response {
    this.body = JSON.stringify(data);
    return new Response(this.body as BodyInit, {
      status: this.status,
      headers: this.headers,
    });
  }

  text(data: string): Response {
    this.body = data;
    this.headers['Content-Type'] = 'text/plain';
    return new Response(this.body as BodyInit, {
      status: this.status,
      headers: this.headers,
    });
  }

  html(data: string): Response {
    this.body = data;
    this.headers['Content-Type'] = 'text/html';
    return new Response(this.body as BodyInit, {
      status: this.status,
      headers: this.headers,
    });
  }

  empty(): Response {
    return new Response(null, {
      status: this.status,
      headers: this.headers,
    });
  }
}

/**
 * API handler type
 */
export type APIHandler = (
  req: APIRequest,
  res: APIResponse,
) => Response | Promise<Response>;

/**
 * API route handler map
 */
export type APIRouteHandlers = Partial<Record<HTTPMethod, APIHandler>>;

/**
 * API route definition
 */
export interface APIRoute {
  pathname: string;
  filePath: string;
  handlers: APIRouteHandlers;
}

/**
 * Scanner for API routes in pages/api directory
 */
export class APIRouteScanner {
  /**
   * Scan for all API routes in pages/api/*
   */
  public static scanAPIRoutes(): APIRoute[] {
    const apiRoutes: APIRoute[] = [];
    const apiDir = path.resolve(process.cwd(), 'pages/api');

    if (!fs.existsSync(apiDir)) {
      return apiRoutes;
    }

    const scan = (dir: string, relativePath: string = ''): void => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relPath = relativePath
          ? `${relativePath}/${entry.name}`
          : entry.name;

        if (entry.isDirectory()) {
          scan(fullPath, relPath);
        } else if (
          entry.isFile() &&
          (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))
        ) {
          // Convert file path to URL pathname
          // pages/api/users.ts -> /api/users
          // removed baseName
          const urlPath = `/api/${relPath.replace(/\.(ts|tsx)$/, '').replace(/\\/g, '/')}`;

          apiRoutes.push({
            pathname: urlPath,
            filePath: fullPath,
            handlers: {},
          });
        }
      }
    };

    scan(apiDir);
    return apiRoutes;
  }
}

/**
 * API Router manager
 */
export class APIRouter {
  private static routes = new Map<string, APIRouteHandlers>();

  /**
   * Register an API route with handlers
   */
  public static registerRoute(
    pathname: string,
    handlers: APIRouteHandlers,
  ): void {
    this.routes.set(pathname, handlers);
  }

  /**
   * Find a route by pathname and method
   */
  public static findRoute(
    pathname: string,
    method: HTTPMethod,
  ): APIHandler | null {
    const handlers = this.routes.get(pathname);
    if (!handlers) return null;

    const handler = handlers[method as keyof typeof handlers];
    return handler || null;
  }

  /**
   * Check if a pathname is an API route
   */
  public static isAPIRoute(pathname: string): boolean {
    return pathname.startsWith('/api/');
  }

  /**
   * Get all registered routes
   */
  public static getRoutes(): Map<string, APIRouteHandlers> {
    return this.routes;
  }

  /**
   * Clear all routes (for testing)
   */
  public static clear(): void {
    this.routes.clear();
  }
}
