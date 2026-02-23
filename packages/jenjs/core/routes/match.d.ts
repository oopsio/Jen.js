import type { RouteEntry } from "./scan.js";
/**
 * Result of a successful route match operation.
 * Contains the matched route and extracted URL parameters.
 */
export type MatchResult = {
    /**
     * The route entry that matched the URL pathname.
     * Includes all route metadata: file path, URL pattern, regex, parameter names.
     */
    route: RouteEntry;
    /**
     * Extracted URL parameters as key-value pairs.
     * Keys correspond to parameter names from the route pattern.
     * Values are URL-decoded strings extracted from the pathname.
     *
     * @example
     * For route "/posts/:id" matching "/posts/42", yields { id: "42" }
     * For route "/docs/*rest" matching "/docs/api/fetch", yields { rest: "api/fetch" }
     */
    params: Record<string, string>;
};
/**
 * Matches a URL pathname against a list of routes and returns the matching route with extracted parameters.
 *
 * Algorithm:
 * 1. Iterate through routes in specificity order (most specific first)
 * 2. For each route, compile its regex pattern and test against pathname
 * 3. On first match, extract captured groups as parameters
 * 4. URL-decode parameter values to handle special characters
 * 5. Return matched route and parameters
 *
 * Route specificity:
 * - Static routes (no parameters) are tried before dynamic routes
 * - Exact matches are preferred over catch-alls
 * - This order is determined by scanRoutes() and must not be changed
 *
 * @param routes Array of RouteEntry objects from scanRoutes(), must be pre-sorted by specificity
 * @param pathname URL path to match, e.g., "/posts/42" or "/docs/api/reference"
 *
 * @returns MatchResult object with matched route and parameters, or null if no route matches
 *
 * @example
 * const routes = scanRoutes(config);
 * const match = matchRoute(routes, "/posts/42");
 * if (match) {
 *   console.log(match.route.urlPath);  // "/posts/:id"
 *   console.log(match.params.id);       // "42"
 * }
 */
export declare function matchRoute(routes: RouteEntry[], pathname: string): MatchResult | null;
