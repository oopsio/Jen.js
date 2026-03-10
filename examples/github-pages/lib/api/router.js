import { URL } from "url";
/**
 * API Router for matching requests to handlers
 */
export class ApiRouter {
  routes = new Map();
  /**
   * Register an API route handler
   *
   * @param path Route path (e.g., '/api/posts', '/api/posts/[id]', '/api/posts/[...slug]')
   * @param handler Request handler function
   *
   * @example
   * ```ts
   * router.register('/api/posts', handler);
   * router.register('/api/posts/[id]', handler);
   * router.register('/api/files/[...path]', handler);
   * ```
   */
  register(path, handler) {
    const pattern = this.pathToRegex(path);
    const isDynamic = path.includes("[");
    const isCatchAll = path.includes("[...");
    this.routes.set(path, { handler, pattern, isDynamic, isCatchAll });
  }
  /**
   * Match a request path to a registered route
   *
   * @param requestPath Request path
   * @returns Matched handler and extracted params, or null if no match
   */
  match(requestPath) {
    // First try exact matches (non-dynamic routes)
    for (const [path, route] of this.routes) {
      if (!route.isDynamic && path === requestPath) {
        return { handler: route.handler, params: {} };
      }
    }
    // Then try dynamic routes (sort by specificity)
    const dynamicRoutes = Array.from(this.routes.entries())
      .filter(([, route]) => route.isDynamic)
      .sort(([a], [b]) => {
        // Predefined routes before catch-all
        if (a.includes("[...")) return 1;
        if (b.includes("[...")) return -1;
        // More specific before less specific
        return a.split("/").length - b.split("/").length;
      });
    for (const [path, route] of dynamicRoutes) {
      const match = requestPath.match(route.pattern);
      if (match) {
        const params = this.extractParams(path, requestPath);
        return { handler: route.handler, params };
      }
    }
    return null;
  }
  /**
   * Convert a path pattern to a regex
   *
   * @private
   */
  pathToRegex(path) {
    // Convert /api/posts/[id] to /api/posts/([^/]+)
    // Convert /api/files/[...slug] to /api/files/(.+)
    // Convert /api/items/[[...optional]] to /api/items(/.*)?
    let pattern = path
      .replace(/\//g, "\\/")
      .replace(/\[\[\.\.\.([^\]]+)\]\]/g, "(?:\\/(.+))?") // Optional catch-all (do first)
      .replace(/\[\.\.\.([^\]]+)\]/g, "(.+)") // Required catch-all
      .replace(/\[([^\]]+)\]/g, "([^\\/]+)"); // Dynamic segment
    return new RegExp(`^${pattern}$`);
  }
  /**
   * Extract parameters from a matched route
   *
   * @private
   */
  extractParams(routePath, requestPath) {
    const params = {};
    // Extract parameter names from route
    const paramMatches = routePath.matchAll(/\[\.{0,3}(\w+)\]/g);
    const paramNames = Array.from(paramMatches, (m) => m[1]);
    // Match request path and extract values
    const pattern = this.pathToRegex(routePath);
    const match = requestPath.match(pattern);
    if (!match) return params;
    for (let i = 0; i < paramNames.length; i++) {
      const name = paramNames[i];
      const value = match[i + 1];
      if (
        routePath.includes(`[...${name}]`) ||
        routePath.includes(`[[...${name}]]`)
      ) {
        // Catch-all: convert to array
        params[name] = value ? value.split("/").filter(Boolean) : [];
      } else {
        params[name] = value;
      }
    }
    return params;
  }
}
/**
 * Parse query string into object
 *
 * @private
 */
export function parseQuery(queryString) {
  const params = {};
  if (!queryString) return params;
  const pairs = queryString.split("&");
  for (const pair of pairs) {
    const [key, value] = pair.split("=");
    const decodedKey = decodeURIComponent(key || "");
    const decodedValue = decodeURIComponent(value || "");
    if (params[decodedKey]) {
      if (Array.isArray(params[decodedKey])) {
        params[decodedKey].push(decodedValue);
      } else {
        params[decodedKey] = [params[decodedKey], decodedValue];
      }
    } else {
      params[decodedKey] = decodedValue;
    }
  }
  return params;
}
/**
 * Parse cookies from request headers
 *
 * @private
 */
export function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  const pairs = cookieHeader.split(";");
  for (const pair of pairs) {
    const [key, value] = pair.trim().split("=");
    if (key) cookies[key] = decodeURIComponent(value || "");
  }
  return cookies;
}
/**
 * Create enhanced request object
 *
 * @private
 */
export async function createApiRequest(req, params = {}) {
  const url = new URL(req.url || "", `http://${req.headers.host}`);
  const query = parseQuery(url.search.slice(1));
  const cookies = parseCookies(req.headers.cookie || "");
  let body = null;
  // Parse body if present
  if (req.method !== "GET" && req.method !== "HEAD") {
    body = await new Promise((resolve, reject) => {
      let data = "";
      req.on("data", (chunk) => {
        data += chunk.toString();
      });
      req.on("end", () => {
        try {
          const contentType = req.headers["content-type"] || "";
          if (contentType.includes("application/json")) {
            resolve(data ? JSON.parse(data) : null);
          } else if (
            contentType.includes("application/x-www-form-urlencoded")
          ) {
            resolve(parseQuery(data));
          } else {
            resolve(data || null);
          }
        } catch (err) {
          reject(err);
        }
      });
      req.on("error", reject);
    });
  }
  return {
    ...req,
    method: req.method || "GET",
    url: req.url || "/",
    query,
    body,
    params,
    cookies,
  };
}
/**
 * Create enhanced response object
 *
 * @private
 */
export function createApiResponse(res) {
  const apiRes = res;
  let statusCode = 200;
  let headersSent = false;
  apiRes.status = function (code) {
    statusCode = code;
    res.statusCode = code;
    return apiRes;
  };
  apiRes.header = function (key, value) {
    res.setHeader(key, value);
    return apiRes;
  };
  apiRes.json = function (body) {
    if (!headersSent) {
      res.setHeader("Content-Type", "application/json");
      res.statusCode = statusCode;
      headersSent = true;
    }
    res.end(JSON.stringify(body));
  };
  apiRes.send = function (body) {
    if (!headersSent) {
      if (typeof body === "object" && !(body instanceof Buffer)) {
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(body));
      } else {
        res.end(body);
      }
      headersSent = true;
    }
  };
  apiRes.redirect = function (statusOrPath, path) {
    const redirectPath =
      typeof statusOrPath === "string" ? statusOrPath : path || "/";
    const code = typeof statusOrPath === "number" ? statusOrPath : 307;
    res.statusCode = code;
    res.setHeader("Location", redirectPath);
    res.end();
    headersSent = true;
  };
  apiRes.download = function (filepath, filename) {
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename || filepath}"`,
    );
    apiRes.sendFile(filepath);
  };
  apiRes.sendFile = function (filepath) {
    // Dynamic import for sendFile functionality
    (async () => {
      try {
        const { createReadStream } = await import("fs");
        const file = createReadStream(filepath);
        file.pipe(res);
        headersSent = true;
      } catch (err) {
        console.error("Error sending file:", err);
        res.statusCode = 500;
        res.end("Error sending file");
      }
    })();
  };
  return apiRes;
}
