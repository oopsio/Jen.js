import { scanRoutes } from "./scan.js";
/**
 * Handles redirects configured at the application level
 *
 * @param pathname URL path to check
 * @param redirects Array of redirect configurations
 * @returns Redirect target or null
 *
 * @example
 * const redirect = getRedirect("/old-page", [
 *   { from: "/old-page", to: "/new-page", status: 301 }
 * ]);
 * // Returns: { to: "/new-page", status: 301 }
 */
export function getRedirect(pathname, redirects) {
    for (const r of redirects) {
        // Exact match
        if (r.from === pathname) {
            return { to: r.to, status: r.status ?? 301 };
        }
        // Prefix match (for pattern-based redirects)
        if (r.from.endsWith("*")) {
            const prefix = r.from.slice(0, -1);
            if (pathname.startsWith(prefix)) {
                // Preserve the remaining path
                const remaining = pathname.slice(prefix.length);
                const target = r.to.endsWith("*")
                    ? r.to.slice(0, -1) + remaining
                    : r.to;
                return { to: target, status: r.status ?? 301 };
            }
        }
    }
    return null;
}
/**
 * Send a redirect response
 *
 * @param res ServerResponse object
 * @param location Target URL
 * @param status HTTP status code (default 301)
 */
export function sendRedirect(res, location, status = 301) {
    res.statusCode = status;
    res.setHeader("Location", location);
    res.setHeader("content-type", "text/plain; charset=utf-8");
    res.end(`Redirecting to ${location}`);
}
/**
 * Send a 404 response with optional custom handler
 *
 * @param res ServerResponse object
 * @param config 404 handler configuration
 * @param pathname The path that was not found
 */
export function send404(res, config, pathname) {
    res.statusCode = 404;
    // Prefer JSON response if available
    if (config.json) {
        res.setHeader("content-type", "application/json; charset=utf-8");
        res.end(JSON.stringify(config.json));
        return;
    }
    // Fallback to HTML
    if (config.html) {
        res.setHeader("content-type", "text/html; charset=utf-8");
        res.end(config.html);
        return;
    }
    // Default 404 response
    res.setHeader("content-type", "text/plain; charset=utf-8");
    res.end(`404 Not Found: ${pathname}`);
}
/**
 * Find a custom 404 handler for a given pathname
 * Searches the route tree for a matching 404 handler route
 *
 * @param config Framework configuration
 * @param pathname URL path that was not found
 * @returns NotFoundConfig with appropriate handler or null
 *
 * @example
 * // With routes:
 * // - (home).tsx
 * // - /docs/(...rest).tsx (handles docs with custom 404)
 * // - /api/(...rest).tsx (handles api with custom 404)
 *
 * // getNotFoundHandler(config, "/api/unknown") returns handler for /api/(...rest)
 */
export function getNotFoundHandler(config, pathname) {
    const routes = scanRoutes(config);
    // Find catch-all routes that match this pathname
    let bestMatch = null;
    let bestMatchLength = 0;
    for (const route of routes) {
        // Check if this is a catch-all route
        if (!route.urlPath.includes("*"))
            continue;
        // Extract the prefix before the catch-all
        const prefix = route.urlPath.split("*")[0];
        if (!prefix)
            continue; // Skip root catch-all for now
        // Check if pathname matches this prefix
        if (pathname.startsWith(prefix)) {
            if (prefix.length > bestMatchLength) {
                bestMatch = route;
                bestMatchLength = prefix.length;
            }
        }
    }
    if (bestMatch) {
        return { handler: bestMatch };
    }
    return null;
}
/**
 * Create a default 404 HTML page
 *
 * @param pathname Path that was not found
 * @returns HTML string
 */
export function createDefault404Html(pathname) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>404 Not Found</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .container {
      text-align: center;
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    h1 {
      font-size: 3rem;
      margin: 0;
      color: #333;
    }
    p {
      margin: 1rem 0 0 0;
      color: #666;
    }
    .path {
      font-family: monospace;
      background: #f5f5f5;
      padding: 0.5rem 1rem;
      margin: 1rem 0;
      border-radius: 4px;
      color: #333;
    }
    a {
      color: #667eea;
      text-decoration: none;
      margin-top: 1rem;
      display: inline-block;
    }
    a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>404</h1>
    <p>Page Not Found</p>
    <div class="path">${pathname}</div>
    <a href="/">Go Home</a>
  </div>
</body>
</html>`;
}
