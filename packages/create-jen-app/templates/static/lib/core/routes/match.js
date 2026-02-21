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
export function matchRoute(routes, pathname) {
  for (const r of routes) {
    const re = new RegExp(r.pattern);
    const m = pathname.match(re);
    if (!m) continue;
    /**
     * Extract captured groups from the regex match.
     * Captured group 0 is the entire match; groups 1+ are the parameters.
     * Each parameter name from r.paramNames corresponds to its regex group by index.
     * URL-decode parameter values since they came from a URL path.
     */
    const params = {};
    for (let i = 0; i < r.paramNames.length; i++) {
      params[r.paramNames[i]] = decodeURIComponent(m[i + 1] ?? "");
    }
    return { route: r, params };
  }
  return null;
}
