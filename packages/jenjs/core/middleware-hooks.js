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
 * Type definitions note:
 * Route module types (middleware field, hydrate field) are defined in core/types.ts.
 * This module provides the middleware execution engine and context object.
 */
/**
 * Creates a middleware context object from request data.
 * Called by the renderer before executing route middleware.
 *
 * Initializes:
 * - All request data (req, res, url, params, query, headers, cookies)
 * - Empty data object for middleware to populate
 * - Helper methods (status, setHeader, redirect, json) as chainable methods
 *
 * @param opts Configuration with raw request data
 * @param opts.req Node.js IncomingMessage
 * @param opts.res Node.js ServerResponse
 * @param opts.url Parsed URL from request
 * @param opts.params Route parameters from URL path
 * @param opts.query Query string parameters
 * @param opts.headers Normalized headers object
 * @param opts.cookies Parsed cookies from Cookie header
 *
 * @returns Initialized RouteMiddlewareContext ready for middleware execution
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
 * Executes an array of route middleware sequentially for a route.
 *
 * Execution model:
 * 1. Iterates through middlewares in order
 * 2. Each middleware is awaited (even if synchronous)
 * 3. Middleware can populate ctx.data for use by loader and page
 * 4. If middleware calls ctx.redirect() or ctx.json(), error is caught and re-thrown
 * 5. Other errors are propagated immediately
 *
 * Control flow:
 * - Normal completion: all middlewares finish and function returns
 * - Early exit: middleware calls ctx.redirect() or ctx.json()
 * - Error: middleware throws or ctx.redirect()/json() throws sentinel error
 *
 * Side effects:
 * - Response headers, status, and body may be sent by middleware
 * - ctx.data may be modified by middleware
 * - Should only be called in server context (SSR); not during SSG build
 *
 * @param middlewares Array of middleware functions to execute
 * @param ctx RouteMiddlewareContext created by createRouteMiddlewareContext()
 *
 * @returns Promise that resolves if all middlewares complete normally
 * @throws Error with message "__REDIRECT__" if middleware calls ctx.redirect()
 * @throws Error with message "__JSON__" if middleware calls ctx.json()
 * @throws Error from middleware if it throws
 */
export async function executeRouteMiddleware(middlewares, ctx) {
    for (const mw of middlewares) {
        try {
            await mw(ctx);
        }
        catch (err) {
            /**
             * Sentinel errors from ctx.redirect() and ctx.json() are re-thrown
             * to signal that the response was already sent.
             * Other errors propagate normally for error handling middleware.
             */
            if (err.message === "__REDIRECT__" || err.message === "__JSON__") {
                throw err;
            }
            throw err;
        }
    }
}
