/*
 * This file is part of Jen.js.
 * Copyright (C) 2026 oopsio
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */
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
