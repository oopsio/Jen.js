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
     * Initializes a request context from Node.js request and response objects.
     * Parses the URL, extracts query parameters, and initializes helpers.
     *
     * @param req Node.js IncomingMessage
     * @param res Node.js ServerResponse
     */
    constructor(req: any, res: any);
    /**
     * Raw Node.js IncomingMessage request object.
     * Contains method, url, headers, socket, etc.
     */
    req: any;
    /**
     * Raw Node.js ServerResponse response object.
     * Used to send response data back to the client.
     */
    res: any;
    /**
     * Parsed URL object with scheme, host, pathname, search, searchParams, etc.
     * Automatically constructed from req.url and req.headers.host.
     *
     * @example ctx.url.pathname for "/posts/42", ctx.url.searchParams for query parsing
     */
    url: URL;
    /**
     * Shared state object for middleware to store data.
     * Useful for passing values between middlewares in the chain without response headers.
     *
     * @example ctx.state.userId = 42; // Set in auth middleware, read in handler
     */
    state: {};
    /**
     * ResponseBuilder instance for fluent response building.
     * Use ctx.response.status().json() or ctx.response.header() to build responses.
     * Alternatively, use ctx.json() shortcut for quick JSON responses.
     */
    response: ResponseBuilder;
    /**
     * Parsed request body cache.
     * Set by body parser middleware if request has a body.
     * Can be null if no body parser ran or if the request has no body.
     */
    body: any;
    /**
     * Query string parameters as an object.
     * Automatically parsed from ctx.url.searchParams on construction.
     * Keys and values are always strings.
     *
     * @example For URL "/posts?sort=date&limit=10", yields { sort: "date", limit: "10" }
     */
    query: {
        [k: string]: string;
    };
    /**
     * Route parameters extracted from the URL path.
     * Set by route matching middleware based on dynamic route patterns.
     * Empty object initially; populated when a route matches.
     *
     * @example For route "/posts/:id" matching "/posts/42", yields { id: "42" }
     */
    params: {};
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
    get cookies(): {
        [k: string]: any;
    };
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
    json(data: any, status?: number): void;
}
import { ResponseBuilder } from "./response.js";
