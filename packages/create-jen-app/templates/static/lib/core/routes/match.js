/**
 * Custom error type for invalid route parameters
 */
export class InvalidRouteParamError extends Error {
  constructor(paramName, paramValue, reason) {
    super(`Invalid route parameter "${paramName}": ${reason}`);
    this.name = "InvalidRouteParamError";
  }
}
/**
 * Validates a route parameter to prevent path traversal and injection attacks.
 *
 * Security checks:
 * - Rejects ".." (directory traversal)
 * - Rejects leading "/" (absolute paths)
 * - Rejects null bytes (\0)
 * - Rejects unicode encoding tricks (e.g., %2e%2e are decoded by decodeURIComponent first)
 * - For catch-all routes (*rest), allows "/" and other separators but still rejects traversal
 * - For regular params, only allows alphanumeric, underscore, hyphen, dot
 *
 * @param paramName Parameter name (e.g., "id", "rest")
 * @param paramValue The decoded parameter value
 * @param isCatchAll Whether this is a catch-all route parameter (allows more characters)
 * @throws InvalidRouteParamError if validation fails
 */
export function validateRouteParam(paramName, paramValue, isCatchAll = false) {
  // Check for null bytes
  if (paramValue.includes("\0")) {
    throw new InvalidRouteParamError(
      paramName,
      paramValue,
      "contains null bytes",
    );
  }
  // Check for leading forward slash (absolute path)
  if (paramValue.startsWith("/")) {
    throw new InvalidRouteParamError(
      paramName,
      paramValue,
      "cannot start with /",
    );
  }
  // Check for directory traversal: ".." as a complete component or at any position
  if (paramValue.includes("..")) {
    throw new InvalidRouteParamError(
      paramName,
      paramValue,
      "contains .. (directory traversal)",
    );
  }
  // Check for backslash (Windows path separator) to prevent escaping
  if (paramValue.includes("\\")) {
    throw new InvalidRouteParamError(
      paramName,
      paramValue,
      "contains backslash",
    );
  }
  // For catch-all parameters, allow more flexible paths with /, but still reject dangerous patterns
  if (isCatchAll) {
    // Additional check: if someone passes %2e%2e or other encoded traversal, it's already decoded
    // by decodeURIComponent, so the ".." check above will catch it. Just verify no empty path components
    // that could indicate traversal (though ".." is already blocked above)
    return;
  }
  // For regular route parameters, only allow safe characters
  // Allow: alphanumeric, underscore, hyphen, dot
  if (!/^[a-zA-Z0-9_.-]+$/.test(paramValue)) {
    throw new InvalidRouteParamError(
      paramName,
      paramValue,
      "contains invalid characters (only alphanumeric, underscore, hyphen, dot allowed)",
    );
  }
}
/**
 * Matches a URL pathname against a list of routes and returns the matching route with extracted parameters.
 *
 * Algorithm:
 * 1. Iterate through routes in specificity order (most specific first)
 * 2. For each route, compile its regex pattern and test against pathname
 * 3. On first match, extract captured groups as parameters
 * 4. URL-decode parameter values to handle special characters
 * 5. Validate all parameters to prevent path traversal attacks
 * 6. Return matched route and parameters
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
 * @throws InvalidRouteParamError if any parameter contains invalid/dangerous content
 *
 * @example
 * const routes = scanRoutes(config);
 * const match = matchRoute(routes, "/posts/42");
 * if (match) {
 *   console.log(match.route.urlPath);  // "/posts/:id"
 *   console.log(match.params.id);       // "42"
 * }
 */
export function matchRoute(routes, pathname) {
  for (const r of routes) {
    const re = new RegExp(r.pattern);
    const m = pathname.match(re);
    if (!m) {
      console.error(
        `[Route Match] Pattern "${r.pattern}" did not match "${pathname}"`,
      );
      continue;
    }
    /**
     * Extract captured groups from the regex match.
     * Captured group 0 is the entire match; groups 1+ are the parameters.
     * Each parameter name from r.paramNames corresponds to its regex group by index.
     * URL-decode parameter values since they came from a URL path.
     * Then validate each parameter to prevent path traversal attacks.
     */
    const params = {};
    for (let i = 0; i < r.paramNames.length; i++) {
      const paramName = r.paramNames[i];
      const paramValue = decodeURIComponent(m[i + 1] ?? "");
      // Determine if this is a catch-all parameter (typically named "rest" or ends with "*")
      const isCatchAll = paramName === "rest" || r.pattern.includes("*");
      // Validate the parameter to prevent path traversal and injection attacks
      validateRouteParam(paramName, paramValue, isCatchAll);
      params[paramName] = paramValue;
    }
    return { route: r, params };
  }
  return null;
}
