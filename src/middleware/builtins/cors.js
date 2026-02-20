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
 * Cross-Origin Resource Sharing (CORS) middleware.
 * Validates incoming requests against an origin whitelist and sets appropriate CORS headers.
 * Handles preflight OPTIONS requests by responding with allowed methods and headers.
 *
 * By default, credentials are disabled for security (set explicitly if needed).
 * Origin validation supports arrays, functions, wildcards, and single origins.
 *
 * @param options CORS configuration options.
 * @param options.origin Origin whitelist: array of strings, function(origin => bool), "*", or specific origin string.
 * @param options.methods Array of allowed HTTP methods (default: GET, HEAD, PUT, PATCH, POST, DELETE).
 * @param options.allowedHeaders Array of allowed request headers (default: Content-Type, Authorization).
 * @param options.credentials Whether to allow credentials (default: false).
 * @param options.maxAge How long (seconds) browsers can cache preflight response (default: 86400 = 1 day).
 * @returns Middleware function.
 *
 * @example
 * kernel.use(cors({
 *   origin: ['http://localhost:3000'],
 *   credentials: true
 * }));
 */
export function cors(options = {}) {
  const defaults = {
    origin: ["http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false, // Credentials disabled by default for security.
    maxAge: 86400,
  };
  const opts = { ...defaults, ...options };
  return async (ctx, next) => {
    const origin = ctx.req.headers.origin;

    // Validate the request origin against the configured whitelist.
    let allowOrigin = false;
    if (Array.isArray(opts.origin)) {
      allowOrigin = origin && opts.origin.includes(origin);
    } else if (typeof opts.origin === "function") {
      allowOrigin = origin && opts.origin(origin);
    } else if (opts.origin === "*") {
      // Wildcard origin is risky with credentials. Warn if misconfigured.
      if (opts.credentials) {
        console.warn(
          'SECURITY WARNING: CORS origin "*" with credentials=true is insecure. Origin set to empty.',
        );
        allowOrigin = false;
      } else {
        allowOrigin = true;
      }
    } else if (opts.origin === origin) {
      allowOrigin = true;
    }

    if (allowOrigin && origin) {
      ctx.response.header("Access-Control-Allow-Origin", origin);
    }

    if (opts.credentials) {
      ctx.response.header("Access-Control-Allow-Credentials", "true");
    }
    if (ctx.req.method === "OPTIONS") {
      // Respond to preflight OPTIONS request with allowed methods and headers.
      ctx.response.header(
        "Access-Control-Allow-Methods",
        opts.methods.join(","),
      );
      ctx.response.header(
        "Access-Control-Allow-Headers",
        opts.allowedHeaders.join(","),
      );
      if (opts.maxAge) {
        ctx.response.header("Access-Control-Max-Age", opts.maxAge);
      }
      ctx.response.status(204).send();
      return;
    }
    await next();
  };
}
