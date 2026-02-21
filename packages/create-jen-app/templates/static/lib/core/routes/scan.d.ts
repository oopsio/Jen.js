import type { FrameworkConfig } from "../config.js";
/**
 * Represents a discovered route file with all metadata needed for routing and rendering.
 * Created by scanRoutes() based on filesystem structure and file patterns.
 */
export type RouteEntry = {
    /**
     * Unique identifier for the route, derived from file path.
     * Example: "posts_id_tsx" for "posts/(id).tsx"
     */
    id: string;
    /**
     * Absolute filesystem path to the route file.
     * Examples: "/app/src/pages/(home).tsx", "/app/src/posts/($id).tsx"
     */
    filePath: string;
    /**
     * URL path that this route should respond to.
     * Dynamic segments use colon prefix for params and asterisk for catch-all.
     * Examples: "/", "/about", "/posts/:id", "/docs/*rest"
     */
    urlPath: string;
    /**
     * Regular expression pattern for URL matching.
     * Compiled from urlPath to enable fast route matching at request time.
     * Example: "^/posts/([^/]+)/?$" for route "/posts/:id"
     */
    pattern: string;
    /**
     * Array of parameter names in order they appear in the URL pattern.
     * Used to extract and name captured groups from route.pattern regex matches.
     * Examples: ["id"] for "/posts/:id", ["rest"] for "/docs/*rest"
     */
    paramNames: string[];
};
/**
 * Scans the configured siteDir for route files and returns an ordered list.
 * Files are matched against config.routes.routeFilePattern (typically /^\(([^)]+)\)/).
 * Only files with extensions in config.routes.fileExtensions are considered.
 *
 * Naming conventions:
 * - (home).tsx => route "/" (root, or within its directory)
 * - ($paramName).tsx => dynamic route "/:paramName" (requires $ prefix)
 * - (...restName).tsx => catch-all route "/*restName" (requires ... prefix)
 * - (name).tsx => literal route "/name"
 *
 * Routes are sorted by specificity: static routes first, then dynamic/catch-all.
 *
 * @param config Framework configuration with siteDir and route patterns
 * @returns Array of RouteEntry objects, sorted by specificity (most specific first)
 * @throws {Error} If a parameter name is invalid (e.g., starts with number)
 */
export declare function scanRoutes(config: FrameworkConfig): RouteEntry[];
