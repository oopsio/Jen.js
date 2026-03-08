/**
 * Test fixtures setup/teardown utilities
 * Provides mock configurations, contexts, and helper functions for testing
 */

export interface MockConfig {
  dev: boolean;
  root: string;
  src: string;
  public: string;
  dist: string;
  baseUrl?: string;
  basePath?: string;
  apiPrefix?: string;
  ssr?: boolean;
  islands?: boolean;
}

export interface MockRequest {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS";
  path: string;
  headers: Record<string, string>;
  query?: Record<string, string>;
  body?: any;
  cookies?: Record<string, string>;
  ip?: string;
  userAgent?: string;
}

export interface MockResponse {
  status: number;
  headers: Record<string, string>;
  body: any;
  cookies?: Record<string, string>;
}

export interface MockContext {
  config: MockConfig;
  request: MockRequest;
  response: MockResponse;
  user?: any;
  locals?: Record<string, any>;
}

/**
 * Create a minimal config fixture
 */
export function createMockConfig(overrides?: Partial<MockConfig>): MockConfig {
  return {
    dev: true,
    root: "/workspace",
    src: "/workspace/src",
    public: "/workspace/public",
    dist: "/workspace/dist",
    baseUrl: "http://localhost:3000",
    basePath: "/",
    apiPrefix: "/api",
    ssr: true,
    islands: true,
    ...overrides,
  };
}

/**
 * Create a mock HTTP request
 */
export function createMockRequest(
  overrides?: Partial<MockRequest>,
): MockRequest {
  return {
    method: "GET",
    path: "/",
    headers: {
      "content-type": "application/json",
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
    ip: "127.0.0.1",
    cookies: {},
    ...overrides,
  };
}

/**
 * Create a mock HTTP response
 */
export function createMockResponse(
  overrides?: Partial<MockResponse>,
): MockResponse {
  return {
    status: 200,
    headers: {
      "content-type": "application/json",
    },
    body: {},
    cookies: {},
    ...overrides,
  };
}

/**
 * Create a complete mock context
 */
export function createMockContext(overrides?: {
  config?: Partial<MockConfig>;
  request?: Partial<MockRequest>;
  response?: Partial<MockResponse>;
  user?: any;
  locals?: Record<string, any>;
}): MockContext {
  return {
    config: createMockConfig(overrides?.config),
    request: createMockRequest(overrides?.request),
    response: createMockResponse(overrides?.response),
    user: overrides?.user,
    locals: overrides?.locals || {},
  };
}

/**
 * Mock middleware factory for testing composition
 */
export function createMockMiddleware(
  name: string,
  fn?: (ctx: MockContext) => void | Promise<void>,
) {
  return async (ctx: MockContext) => {
    if (fn) {
      await fn(ctx);
    }
    // Track middleware execution
    ctx.locals = ctx.locals || {};
    (ctx.locals as any).middlewares = (ctx.locals as any).middlewares || [];
    (ctx.locals as any).middlewares.push(name);
  };
}

/**
 * Mock route entry for testing route matching
 */
export interface MockRoute {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS";
  path: string;
  handler: (req: MockRequest, res: MockResponse) => void | Promise<void>;
  middleware?: Array<(ctx: MockContext) => void | Promise<void>>;
}

/**
 * Mock router for testing route matching and composition
 */
export class MockRouter {
  private routes: MockRoute[] = [];

  add(route: MockRoute) {
    this.routes.push(route);
  }

  async match(method: string, path: string, ctx: MockContext) {
    const route = this.routes.find(
      (r) => r.method === method && this.matchPath(r.path, path),
    );
    if (!route) return null;

    // Execute middleware
    if (route.middleware) {
      for (const mw of route.middleware) {
        await mw(ctx);
      }
    }

    // Execute handler
    await route.handler(ctx.request, ctx.response);
    return ctx.response;
  }

  private matchPath(pattern: string, pathname: string): boolean {
    const regex = new RegExp(`^${pattern.replace(/:[^/]+/g, "[^/]+")}$`);
    return regex.test(pathname);
  }
}

/**
 * Fixture setup for database tests
 */
export interface MockDatabase {
  tables: Map<string, any[]>;
  insert(table: string, data: any): any;
  query(table: string, where?: any): any[];
  update(table: string, data: any, where?: any): number;
  delete(table: string, where?: any): number;
  clear(): void;
}

export function createMockDatabase(): MockDatabase {
  const tables = new Map<string, any[]>();

  return {
    tables,
    insert(table: string, data: any) {
      if (!tables.has(table)) {
        tables.set(table, []);
      }
      const id = Date.now();
      const record = { id, ...data, createdAt: new Date() };
      tables.get(table)!.push(record);
      return record;
    },
    query(table: string, where?: any) {
      const rows = tables.get(table) || [];
      if (!where) return rows;
      return rows.filter((row) =>
        Object.entries(where).every(([key, value]) => row[key] === value),
      );
    },
    update(table: string, data: any, where?: any) {
      const rows = tables.get(table) || [];
      const filtered = where
        ? rows.filter((row) =>
            Object.entries(where).every(([key, value]) => row[key] === value),
          )
        : rows;
      filtered.forEach((row) => Object.assign(row, data));
      return filtered.length;
    },
    delete(table: string, where?: any) {
      const rows = tables.get(table) || [];
      const filtered = where
        ? rows.filter((row) =>
            Object.entries(where).every(([key, value]) => row[key] === value),
          )
        : [];
      const count = filtered.length;
      const remaining = rows.filter((row) => !filtered.includes(row));
      tables.set(table, remaining);
      return count;
    },
    clear() {
      tables.clear();
    },
  };
}

/**
 * Fixture for testing authentication
 */
export interface MockUser {
  id: string;
  name: string;
  email: string;
  roles: string[];
  permissions?: string[];
  verified?: boolean;
}

export function createMockUser(overrides?: Partial<MockUser>): MockUser {
  return {
    id: "user-123",
    name: "Test User",
    email: "test@example.com",
    roles: ["user"],
    permissions: ["read"],
    verified: true,
    ...overrides,
  };
}

/**
 * Mock JWT tokens
 */
export function createMockToken(user: MockUser, expiresIn = 3600): string {
  // Simple mock - real implementation would use JWT library
  const header = Buffer.from(JSON.stringify({ alg: "HS256" })).toString(
    "base64",
  );
  const payload = Buffer.from(
    JSON.stringify({
      sub: user.id,
      name: user.name,
      email: user.email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + expiresIn,
    }),
  ).toString("base64");
  const signature = "mock_signature";
  return `${header}.${payload}.${signature}`;
}

/**
 * Performance measurement helper
 */
export class PerformanceTracker {
  private marks = new Map<string, number>();
  private measures = new Map<string, number[]>();

  mark(name: string): void {
    this.marks.set(name, performance.now());
  }

  measure(name: string, from: string, to: string): number {
    const startTime = this.marks.get(from);
    const endTime = this.marks.get(to);

    if (startTime === undefined || endTime === undefined) {
      throw new Error(`Mark not found: ${!startTime ? from : to}`);
    }

    const duration = endTime - startTime;
    if (!this.measures.has(name)) {
      this.measures.set(name, []);
    }
    this.measures.get(name)!.push(duration);
    return duration;
  }

  getMetrics(name: string) {
    const times = this.measures.get(name) || [];
    if (times.length === 0) return null;

    const sum = times.reduce((a, b) => a + b, 0);
    return {
      count: times.length,
      min: Math.min(...times),
      max: Math.max(...times),
      avg: sum / times.length,
      total: sum,
    };
  }

  clear(): void {
    this.marks.clear();
    this.measures.clear();
  }
}

export default {
  createMockConfig,
  createMockRequest,
  createMockResponse,
  createMockContext,
  createMockMiddleware,
  MockRouter,
  createMockDatabase,
  createMockUser,
  createMockToken,
  PerformanceTracker,
};
