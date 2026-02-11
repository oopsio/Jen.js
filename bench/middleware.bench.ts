/**
 * Jen.js Middleware Performance Benchmarks
 * Measures middleware chain execution, request/response handling
 */

import { describe, bench } from 'vitest';

interface Context {
  path: string;
  method: string;
  headers: Record<string, string>;
  body?: any;
  state: Record<string, any>;
  statusCode: number;
  responseHeaders: Record<string, string>;
}

type Middleware = (ctx: Context, next: () => Promise<void>) => Promise<void>;

class MiddlewareChain {
  private middlewares: Middleware[] = [];

  use(middleware: Middleware) {
    this.middlewares.push(middleware);
  }

  async execute(ctx: Context) {
    let index = -1;

    const dispatch = async (i: number): Promise<void> => {
      if (i <= index) return Promise.reject(new Error('next() called multiple times'));
      index = i;

      if (i < this.middlewares.length) {
        await this.middlewares[i](ctx, () => dispatch(i + 1));
      }
    };

    await dispatch(0);
  }
}

describe('Middleware Performance', () => {
  bench('Single Middleware Execution', async () => {
    const chain = new MiddlewareChain();
    chain.use(async (ctx, next) => {
      ctx.state.middleware1 = true;
      await next();
    });

    const ctx: Context = {
      path: '/test',
      method: 'GET',
      headers: {},
      state: {},
      statusCode: 200,
      responseHeaders: {},
    };

    await chain.execute(ctx);
    return ctx.state.middleware1 ? 1 : 0;
  });

  bench('Middleware Chain - 5 Middlewares', async () => {
    const chain = new MiddlewareChain();

    for (let i = 0; i < 5; i++) {
      chain.use(async (ctx, next) => {
        ctx.state[`middleware${i}`] = true;
        await next();
      });
    }

    const ctx: Context = {
      path: '/test',
      method: 'GET',
      headers: {},
      state: {},
      statusCode: 200,
      responseHeaders: {},
    };

    await chain.execute(ctx);
    return Object.keys(ctx.state).length;
  });

  bench('Middleware Chain - 20 Middlewares', async () => {
    const chain = new MiddlewareChain();

    for (let i = 0; i < 20; i++) {
      chain.use(async (ctx, next) => {
        ctx.state[`middleware${i}`] = true;
        await next();
      });
    }

    const ctx: Context = {
      path: '/test',
      method: 'GET',
      headers: {},
      state: {},
      statusCode: 200,
      responseHeaders: {},
    };

    await chain.execute(ctx);
    return Object.keys(ctx.state).length;
  });

  bench('Request Logging Middleware', async () => {
    const chain = new MiddlewareChain();

    chain.use(async (ctx, next) => {
      const start = performance.now();
      await next();
      const duration = performance.now() - start;
      ctx.responseHeaders['X-Response-Time'] = `${duration}ms`;
    });

    const ctx: Context = {
      path: '/test',
      method: 'GET',
      headers: {},
      state: {},
      statusCode: 200,
      responseHeaders: {},
    };

    await chain.execute(ctx);
    return ctx.responseHeaders['X-Response-Time'] ? 1 : 0;
  });

  bench('Authentication Middleware - Valid Token', async () => {
    const chain = new MiddlewareChain();

    chain.use(async (ctx, next) => {
      const token = ctx.headers['authorization'];
      if (token && token.startsWith('Bearer ')) {
        ctx.state.user = { id: '123', role: 'user' };
        await next();
      }
    });

    const ctx: Context = {
      path: '/api/users',
      method: 'GET',
      headers: { authorization: 'Bearer valid-token' },
      state: {},
      statusCode: 200,
      responseHeaders: {},
    };

    await chain.execute(ctx);
    return ctx.state.user ? 1 : 0;
  });

  bench('CORS Middleware - Headers Setup', async () => {
    const chain = new MiddlewareChain();

    chain.use(async (ctx, next) => {
      ctx.responseHeaders['Access-Control-Allow-Origin'] = '*';
      ctx.responseHeaders['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE';
      ctx.responseHeaders['Access-Control-Allow-Headers'] = 'Content-Type,Authorization';
      await next();
    });

    const ctx: Context = {
      path: '/api/data',
      method: 'OPTIONS',
      headers: {},
      state: {},
      statusCode: 200,
      responseHeaders: {},
    };

    await chain.execute(ctx);
    return Object.keys(ctx.responseHeaders).length;
  });

  bench('Rate Limiting Middleware - 1000 Requests', async () => {
    const chain = new MiddlewareChain();
    const rateLimits = new Map<string, number>();

    chain.use(async (ctx, next) => {
      const ip = '127.0.0.1';
      const count = rateLimits.get(ip) || 0;

      if (count < 100) {
        rateLimits.set(ip, count + 1);
        await next();
      } else {
        ctx.statusCode = 429;
      }
    });

    let successful = 0;
    for (let i = 0; i < 1000; i++) {
      const ctx: Context = {
        path: '/api/test',
        method: 'GET',
        headers: {},
        state: {},
        statusCode: 200,
        responseHeaders: {},
      };

      await chain.execute(ctx);
      if (ctx.statusCode === 200) successful++;
    }

    return successful;
  });

  bench('Compression Middleware - Response Compression', async () => {
    const chain = new MiddlewareChain();

    chain.use(async (ctx, next) => {
      const acceptEncoding = ctx.headers['accept-encoding'] || '';
      if (acceptEncoding.includes('gzip')) {
        ctx.responseHeaders['Content-Encoding'] = 'gzip';
      }
      await next();
    });

    const ctx: Context = {
      path: '/api/data',
      method: 'GET',
      headers: { 'accept-encoding': 'gzip, deflate, br' },
      state: {},
      statusCode: 200,
      responseHeaders: {},
    };

    await chain.execute(ctx);
    return ctx.responseHeaders['Content-Encoding'] ? 1 : 0;
  });

  bench('JSON Parsing Middleware - 100KB Body', async () => {
    const chain = new MiddlewareChain();

    chain.use(async (ctx, next) => {
      if (ctx.headers['content-type'] === 'application/json') {
        ctx.body = JSON.parse(ctx.body || '{}');
      }
      await next();
    });

    const largeJson = JSON.stringify({
      data: Array(1000)
        .fill(null)
        .map((_, i) => ({
          id: i,
          name: `Item ${i}`,
          value: Math.random(),
        })),
    });

    const ctx: Context = {
      path: '/api/items',
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: largeJson,
      state: {},
      statusCode: 200,
      responseHeaders: {},
    };

    await chain.execute(ctx);
    return ctx.body ? 1 : 0;
  });

  bench('Error Handling Middleware', async () => {
    const chain = new MiddlewareChain();

    chain.use(async (ctx, next) => {
      try {
        await next();
      } catch (error) {
        ctx.statusCode = 500;
        ctx.state.error = (error as Error).message;
      }
    });

    const ctx: Context = {
      path: '/api/error',
      method: 'GET',
      headers: {},
      state: {},
      statusCode: 200,
      responseHeaders: {},
    };

    await chain.execute(ctx);
    return ctx.statusCode;
  });

  bench('Security Headers Middleware', async () => {
    const chain = new MiddlewareChain();

    chain.use(async (ctx, next) => {
      ctx.responseHeaders['X-Content-Type-Options'] = 'nosniff';
      ctx.responseHeaders['X-Frame-Options'] = 'DENY';
      ctx.responseHeaders['X-XSS-Protection'] = '1; mode=block';
      ctx.responseHeaders['Strict-Transport-Security'] =
        'max-age=31536000; includeSubDomains';
      ctx.responseHeaders['Content-Security-Policy'] =
        "default-src 'self'";
      await next();
    });

    const ctx: Context = {
      path: '/app',
      method: 'GET',
      headers: {},
      state: {},
      statusCode: 200,
      responseHeaders: {},
    };

    await chain.execute(ctx);
    return Object.keys(ctx.responseHeaders).length;
  });

  bench('Session Middleware - 500 Concurrent Sessions', async () => {
    const chain = new MiddlewareChain();
    const sessions = new Map<string, any>();

    // Pre-populate sessions
    for (let i = 0; i < 500; i++) {
      sessions.set(`session-${i}`, { userId: i, data: {} });
    }

    chain.use(async (ctx, next) => {
      const sessionId = ctx.headers['x-session-id'];
      if (sessionId && sessions.has(sessionId)) {
        ctx.state.session = sessions.get(sessionId);
      }
      await next();
    });

    const ctx: Context = {
      path: '/api/profile',
      method: 'GET',
      headers: { 'x-session-id': 'session-250' },
      state: {},
      statusCode: 200,
      responseHeaders: {},
    };

    await chain.execute(ctx);
    return ctx.state.session ? 1 : 0;
  });

  bench('Caching Middleware - Cache Hit', async () => {
    const chain = new MiddlewareChain();
    const cache = new Map<string, string>();
    cache.set('/api/data', 'cached-response');

    chain.use(async (ctx, next) => {
      if (cache.has(ctx.path)) {
        ctx.body = cache.get(ctx.path);
        ctx.responseHeaders['X-Cache'] = 'HIT';
      } else {
        await next();
        cache.set(ctx.path, ctx.body);
      }
    });

    const ctx: Context = {
      path: '/api/data',
      method: 'GET',
      headers: {},
      body: 'response',
      state: {},
      statusCode: 200,
      responseHeaders: {},
    };

    await chain.execute(ctx);
    return ctx.responseHeaders['X-Cache'] === 'HIT' ? 1 : 0;
  });

  bench('Request Validation Middleware', async () => {
    const chain = new MiddlewareChain();

    chain.use(async (ctx, next) => {
      const required = ['path', 'method'];
      const valid = required.every((field) => field in ctx);

      if (valid) {
        await next();
      } else {
        ctx.statusCode = 400;
      }
    });

    const ctx: Context = {
      path: '/api/test',
      method: 'POST',
      headers: {},
      state: {},
      statusCode: 200,
      responseHeaders: {},
    };

    await chain.execute(ctx);
    return ctx.statusCode;
  });

  bench('Request Cloning - 100 Middleware Access', async () => {
    const originalCtx: Context = {
      path: '/api/test',
      method: 'GET',
      headers: { 'x-custom': 'value' },
      state: {},
      statusCode: 200,
      responseHeaders: {},
    };

    let lastCtx = originalCtx;
    for (let i = 0; i < 100; i++) {
      lastCtx = { ...lastCtx, state: { ...lastCtx.state } };
    }

    return lastCtx.headers['x-custom'] ? 1 : 0;
  });
});
