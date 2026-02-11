/**
 * Jen.js Routing Performance Benchmarks
 * Measures route matching, parameter extraction, and middleware execution
 */

import { describe, bench } from 'vitest';

// Simple router implementation for benchmarking
class Router {
  private routes: Array<{ pattern: string; handler: string }> = [];

  addRoute(pattern: string, handler: string) {
    this.routes.push({ pattern, handler });
  }

  private patternToRegex(pattern: string): RegExp {
    const regexPattern = pattern
      .replace(/\//g, '\\/')
      .replace(/:(\w+)/g, '([^/]+)')
      .replace(/\[\.\.\.(\w+)\]/g, '(.*)');
    return new RegExp(`^${regexPattern}$`);
  }

  match(path: string) {
    for (const route of this.routes) {
      const regex = this.patternToRegex(route.pattern);
      if (regex.test(path)) {
        return { route, handler: route.handler };
      }
    }
    return null;
  }

  extractParams(pattern: string, path: string): Record<string, string> {
    const paramNames = (pattern.match(/:(\w+)/g) || []).map((p) =>
      p.slice(1)
    );
    const regex = this.patternToRegex(pattern);
    const matches = path.match(regex);

    const params: Record<string, string> = {};
    if (matches) {
      paramNames.forEach((name, i) => {
        params[name] = matches[i + 1];
      });
    }
    return params;
  }
}

describe('Routing Performance', () => {
  let router: Router;

  bench('Route Setup - 100 Routes', () => {
    const r = new Router();
    for (let i = 0; i < 100; i++) {
      r.addRoute(`/page-${i}`, `page${i}`);
    }
    return r;
  });

  bench('Simple Route Matching - Static', () => {
    const r = new Router();
    r.addRoute('/users', 'users');
    r.addRoute('/posts', 'posts');
    r.addRoute('/about', 'about');

    const results = ['/users', '/posts', '/about'].map((path) =>
      r.match(path)
    );
    return results.filter((r) => r !== null).length;
  });

  bench('Dynamic Route Matching - Single Param', () => {
    const r = new Router();
    r.addRoute('/users/:id', 'user');
    r.addRoute('/posts/:id', 'post');

    const results = [
      '/users/123',
      '/users/456',
      '/posts/789',
      '/posts/abc',
    ].map((path) => r.match(path));

    return results.filter((r) => r !== null).length;
  });

  bench('Dynamic Route Matching - Multiple Params', () => {
    const r = new Router();
    r.addRoute('/users/:userId/posts/:postId', 'userPost');
    r.addRoute('/orgs/:orgId/teams/:teamId/members/:memberId', 'member');

    const results = [
      '/users/1/posts/1',
      '/users/2/posts/3',
      '/orgs/org1/teams/team1/members/user1',
      '/orgs/org2/teams/team2/members/user2',
    ].map((path) => r.match(path));

    return results.filter((r) => r !== null).length;
  });

  bench('Catch-all Route Matching', () => {
    const r = new Router();
    r.addRoute('/api/[...rest]', 'api');
    r.addRoute('/files/[...path]', 'files');

    const results = [
      '/api/v1/users/list',
      '/api/v2/posts',
      '/files/docs/readme.md',
      '/files/images/photo.jpg',
    ].map((path) => r.match(path));

    return results.filter((r) => r !== null).length;
  });

  bench('Parameter Extraction - Single', () => {
    const r = new Router();
    r.addRoute('/users/:id', 'user');

    const paths = Array(100)
      .fill(null)
      .map((_, i) => `/users/${i}`);

    return paths.map((path) => r.extractParams('/users/:id', path)).length;
  });

  bench('Parameter Extraction - Multiple', () => {
    const r = new Router();
    r.addRoute('/users/:userId/posts/:postId/comments/:commentId', 'comment');

    const paths = Array(50)
      .fill(null)
      .map((_, i) => `/users/${i}/posts/${i * 2}/comments/${i * 3}`);

    return paths
      .map((path) =>
        r.extractParams(
          '/users/:userId/posts/:postId/comments/:commentId',
          path
        )
      )
      .filter((p) => Object.keys(p).length === 3).length;
  });

  bench('Route Priority - 1000 Routes', () => {
    const r = new Router();

    // Add routes in mixed order
    for (let i = 0; i < 1000; i++) {
      r.addRoute(`/route-${i}`, `handler${i}`);
    }

    // Match a route in the middle
    const result = r.match('/route-500');
    return result ? 1 : 0;
  });

  bench('Route Matching - Complex Patterns', () => {
    const r = new Router();
    r.addRoute('/blog/:year/:month/:day/:slug', 'post');
    r.addRoute('/admin/[...path]', 'admin');
    r.addRoute('/api/v:version/[...endpoint]', 'api');

    const paths = [
      '/blog/2024/02/11/hello-world',
      '/admin/users/edit/123',
      '/api/v1/users/list',
    ];

    return paths.filter((path) => r.match(path) !== null).length;
  });

  bench('Middleware Chain Execution - 10 Middleware', () => {
    const middlewares = Array(10)
      .fill(null)
      .map((_, i) => ({
        name: `middleware${i}`,
        execute: () => i + 1,
      }));

    let result = 0;
    for (const mw of middlewares) {
      result += mw.execute();
    }
    return result;
  });

  bench('Middleware Chain Execution - 50 Middleware', () => {
    const middlewares = Array(50)
      .fill(null)
      .map((_, i) => ({
        name: `middleware${i}`,
        execute: () => i + 1,
      }));

    let result = 0;
    for (const mw of middlewares) {
      result += mw.execute();
    }
    return result;
  });

  bench('Route Guard Evaluation', () => {
    const guards = [
      { name: 'auth', check: () => true },
      { name: 'admin', check: () => true },
      { name: 'permission', check: () => true },
    ];

    const isAuthorized = guards.every((guard) => guard.check());
    return isAuthorized ? 1 : 0;
  });

  bench('Nested Route Resolution - 5 Levels', () => {
    const routes = [
      '/admin',
      '/admin/users',
      '/admin/users/active',
      '/admin/users/active/by-role',
      '/admin/users/active/by-role/admin',
    ];

    let depth = 0;
    for (const route of routes) {
      depth += route.split('/').length - 1;
    }
    return depth;
  });

  bench('Query String Parsing - Simple', () => {
    const queryString = 'page=1&limit=10&sort=name';
    const params = new URLSearchParams(queryString);
    return params.size;
  });

  bench('Query String Parsing - Complex', () => {
    const queryString =
      'filters[status]=active&filters[role]=admin&sort=-created&page=1&limit=50&include=profile,permissions';
    const params = new URLSearchParams(queryString);
    return params.size;
  });

  bench('Route Caching - 10000 Lookups', () => {
    const r = new Router();
    const cache = new Map<string, string>();

    r.addRoute('/users/:id', 'user');
    r.addRoute('/posts/:id', 'post');

    const paths = Array(10000)
      .fill(null)
      .map(
        (_, i) => (i % 2 === 0 ? `/users/${i}` : `/posts/${i}`)
      );

    let hits = 0;
    for (const path of paths) {
      if (!cache.has(path)) {
        const result = r.match(path);
        if (result) cache.set(path, result.handler);
        hits += result ? 1 : 0;
      }
    }
    return hits;
  });

  bench('Link Generation - 1000 Routes', () => {
    const routes = Array(1000)
      .fill(null)
      .map((_, i) => ({ path: `/route-${i}`, name: `route${i}` }));

    return routes
      .map((route) => {
        // Simulated link generation
        const params = { id: '123', slug: 'test' };
        return `/route-${routes.indexOf(route)}`;
      })
      .filter((link) => link.startsWith('/')).length;
  });
});
