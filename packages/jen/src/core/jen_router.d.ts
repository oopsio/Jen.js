/* tslint:disable */
/* eslint-disable */

/**
 * Route match result with parameters and file paths
 */
export class RouteMatch {
    free(): void;
    [Symbol.dispose](): void;
    constructor(found: boolean, pathname: string, params: string, file_path_tsx: string, file_path_jsx: string);
    readonly filePathJsx: string;
    readonly filePathTsx: string;
    readonly found: boolean;
    readonly params: string;
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
     * Match a pathname against registered routes
     */
    match_route(pathname: string): RouteMatch;
    /**
     * Create a new route matcher
     */
    constructor();
    /**
     * Register a route pattern
     */
    register(path: string, file_path_tsx: string, file_path_jsx: string): void;
    /**
     * Get count of registered routes
     */
    route_count(): number;
}
