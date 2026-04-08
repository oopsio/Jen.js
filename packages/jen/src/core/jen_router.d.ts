/* tslint:disable */
/* eslint-disable */

/**
 * Route match result with parameters and file paths
 */
export class RouteMatch {
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Creates a new RouteMatch instance.
     *
     * # Arguments
     *
     * * `found` - Whether the route was matched successfully
     * * `pathname` - The matched pathname
     * * `params` - A JSON-encoded string of route parameters
     * * `file_path_tsx` - The path to the resolved `.tsx` file
     * * `file_path_jsx` - The path to the resolved `.jsx` file
     */
    constructor(found: boolean, pathname: string, params: string, file_path_tsx: string, file_path_jsx: string);
    /**
     * Gets the resolved `.jsx` file path, if any.
     */
    readonly filePathJsx: string;
    /**
     * Gets the resolved `.tsx` file path, if any.
     */
    readonly filePathTsx: string;
    /**
     * Returns true if the route was successfully matched.
     */
    readonly found: boolean;
    /**
     * Gets the JSON string containing route parameters.
     */
    readonly params: string;
    /**
     * Gets the normalized pathname that was matched.
     */
    readonly pathname: string;
}

/**
 * High-performance route matcher for dynamic and static routes
 */
export class RouteMatcher {
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Clear all routes
     */
    clear(): void;
    /**
     * Match a pathname against registered routes.
     *
     * First looks for exact static matches (O(1)), then falls back
     * to evaluating dynamic routes.
     *
     * # Arguments
     *
     * * `pathname` - The incoming URL pathname to match
     */
    match_route(pathname: string): RouteMatch;
    /**
     * Create a new route matcher
     */
    constructor();
    /**
     * Register a route pattern.
     *
     * # Arguments
     *
     * * `path` - The route pattern (can contain dynamic segments like `:id`)
     * * `file_path_tsx` - The associated `.tsx` file path
     * * `file_path_jsx` - The associated `.jsx` file path
     */
    register(path: string, file_path_tsx: string, file_path_jsx: string): void;
    /**
     * Get count of registered routes
     */
    route_count(): number;
    /**
     * Set an optional base path to strip from incoming requests
     */
    set_base_path(base_path: string): void;
}
