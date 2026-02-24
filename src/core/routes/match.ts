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
 * Custom error type for invalid route parameters
 */
export class InvalidRouteParamError extends Error {
  constructor(paramName: string, paramValue: string, reason: string) {
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
export function validateRouteParam(
  paramName: string,
  paramValue: string,
  isCatchAll: boolean = false,
): void {
  // Check for null bytes
  if (paramValue.includes("\0")) {
    throw new InvalidRouteParamError(paramName, paramValue, "contains null bytes");
  }

  // Check for leading forward slash (absolute path)
  if (paramValue.startsWith("/")) {
    throw new InvalidRouteParamError(paramName, paramValue, "cannot start with /");
  }

  // Check for directory traversal: ".." as a complete component or at any position
  if (paramValue.includes("..")) {
    throw new InvalidRouteParamError(paramName, paramValue, "contains .. (directory traversal)");
  }

  // Check for backslash (Windows path separator) to prevent escaping
  if (paramValue.includes("\\")) {
    throw new InvalidRouteParamError(paramName, paramValue, "contains backslash");
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
export function matchRoute(
  routes: RouteEntry[],
  pathname: string,
): MatchResult | null {
  for (const r of routes) {
    const re = new RegExp(r.pattern);
    const m = pathname.match(re);
    if (!m) continue;

    /**
     * Extract captured groups from the regex match.
     * Captured group 0 is the entire match; groups 1+ are the parameters.
     * Each parameter name from r.paramNames corresponds to its regex group by index.
     * URL-decode parameter values since they came from a URL path.
     * Then validate each parameter to prevent path traversal attacks.
     */
    const params: Record<string, string> = {};
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
