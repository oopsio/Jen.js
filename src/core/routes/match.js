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

export function matchRoute(routes, pathname) {
  for (const r of routes) {
    const re = new RegExp(r.pattern);
    const m = pathname.match(re);
    if (!m) continue;

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
