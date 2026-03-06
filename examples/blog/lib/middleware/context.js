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
import { ResponseBuilder } from "./response.js";
/**
 * Request context object passed through the middleware chain.
 * Wraps Node.js req/res objects and provides helper methods and parsed request data.
 * Each middleware receives this context and can read/modify its properties.
 *
 * The context enables:
 * - Access to parsed URL, query params, route params, cookies, headers
 * - Convenient response building methods (json(), headers())
 * - State storage for passing data between middlewares
 * - Request body parsing and caching
 */
export class Context {
  /**
   * Raw Node.js IncomingMessage request object.
   * Contains method, url, headers, socket, etc.
   */
  req;
  /**
   * Raw Node.js ServerResponse response object.
   * Used to send response data back to the client.
   */
  res;
  /**
   * Parsed URL object with scheme, host, pathname, search, searchParams, etc.
   * Automatically constructed from req.url and req.headers.host.
   *
   * @example ctx.url.pathname for "/posts/42", ctx.url.searchParams for query parsing
   */
  url;
  /**
   * Shared state object for middleware to store data.
   * Useful for passing values between middlewares in the chain without response headers.
   *
   * @example ctx.state.userId = 42; // Set in auth middleware, read in handler
   */
  state;
  /**
   * ResponseBuilder instance for fluent response building.
   * Use ctx.response.status().json() or ctx.response.header() to build responses.
   * Alternatively, use ctx.json() shortcut for quick JSON responses.
   */
  response;
  /**
   * Parsed request body cache.
   * Set by body parser middleware if request has a body.
   * Can be null if no body parser ran or if the request has no body.
   */
  body;
  /**
   * Query string parameters as an object.
   * Automatically parsed from ctx.url.searchParams on construction.
   * Keys and values are always strings.
   *
   * @example For URL "/posts?sort=date&limit=10", yields { sort: "date", limit: "10" }
   */
  query;
  /**
   * Route parameters extracted from the URL path.
   * Set by route matching middleware based on dynamic route patterns.
   * Empty object initially; populated when a route matches.
   *
   * @example For route "/posts/:id" matching "/posts/42", yields { id: "42" }
   */
  params;
  /**
   * Initializes a request context from Node.js request and response objects.
   * Parses the URL, extracts query parameters, and initializes helpers.
   *
   * @param req Node.js IncomingMessage
   * @param res Node.js ServerResponse
   */
  constructor(req, res) {
    this.req = req;
    this.res = res;
    this.url = new URL(
      req.url ?? "/",
      `http://${req.headers.host || "localhost"}`,
    );
    this.state = {};
    this.response = new ResponseBuilder(res);
    this.body = null;
    this.query = Object.fromEntries(this.url.searchParams);
    this.params = {};
  }
  /**
   * Getter that parses and caches cookies from the request.
   * Parses the Cookie header into an object of name-value pairs.
   * Values are automatically decoded using decodeURIComponent.
   * Memoization is implicit; called fresh each time.
   *
   * @returns Object with cookie names as keys and values as cookie values
   *
   * @example
   * const sessionId = ctx.cookies.sessionId;  // Get a cookie value
   * // For header "sessionId=abc123; theme=dark" yields { sessionId: "abc123", theme: "dark" }
   */
  get cookies() {
    const header = this.req.headers.cookie;
    if (!header) return {};
    return Object.fromEntries(
      header.split(";").map((c) => {
        const [key, ...v] = c.trim().split("=");
        return [key, decodeURIComponent(v.join("="))];
      }),
    );
  }
  /**
   * Convenience method to send a JSON response.
   * Combines ctx.response.status().json().send() into a single call.
   *
   * @param data Object to serialize as JSON and send
   * @param status HTTP status code; defaults to 200 (OK)
   *
   * @returns Result of response.send() (undefined if response is sent)
   *
   * @example
   * ctx.json({ success: true }, 201);
   * ctx.json({ error: "Not found" }, 404);
   */
  json(data, status = 200) {
    return this.response.status(status).json(data).send();
  }
}
