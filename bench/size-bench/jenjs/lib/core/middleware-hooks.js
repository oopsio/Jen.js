/**
 * Note: Route module types (middleware, hydrate fields) are defined in core/types.ts
 * This module just provides the middleware execution primitives.
 */
/**
 * Create middleware context from request.
 * Called by server before rendering route.
 */
export function createRouteMiddlewareContext(opts) {
  const ctx = {
    ...opts,
    data: {},
    status: function (code) {
      this.res.statusCode = code;
      return this;
    },
    setHeader: function (key, value) {
      this.res.setHeader(key, value);
      return this;
    },
    redirect: function (url, statusCode = 302) {
      this.res.statusCode = statusCode;
      this.res.setHeader("location", url);
      this.res.end();
      throw new Error("__REDIRECT__");
    },
    json: function (data, statusCode = 200) {
      this.res.statusCode = statusCode;
      this.res.setHeader("content-type", "application/json; charset=utf-8");
      this.res.end(JSON.stringify(data));
      throw new Error("__JSON__");
    },
  };
  return ctx;
}
/**
 * Execute route middlewares in sequence.
 * If any middleware calls redirect() or json(), it throws and stops execution.
 */
export async function executeRouteMiddleware(middlewares, ctx) {
  for (const mw of middlewares) {
    try {
      await mw(ctx);
    } catch (err) {
      if (err.message === "__REDIRECT__" || err.message === "__JSON__") {
        throw err;
      }
      throw err;
    }
  }
}
