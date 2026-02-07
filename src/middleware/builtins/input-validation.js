/**
 * Input validation middleware
 * Validates and sanitizes incoming request data
 */

const MAX_JSON_SIZE = 10 * 1024; // 10KB default for validation
const DANGEROUS_PATTERNS = [
  /<script/gi,
  /javascript:/gi,
  /on\w+=/gi, // Event handlers
];

export function inputValidation(options = {}) {
  const opts = {
    maxJsonSize: MAX_JSON_SIZE,
    ...options,
  };

  return async (ctx, next) => {
    // Validate request headers
    const contentType = ctx.req.headers["content-type"] ?? "";
    
    // Only allow safe content types
    const allowedTypes = [
      "application/json",
      "application/x-www-form-urlencoded",
      "multipart/form-data",
      "text/plain",
    ];
    
    if (
      contentType &&
      !allowedTypes.some((t) => contentType.includes(t))
    ) {
      ctx.response.status(415).json({
        error: "Unsupported Media Type",
      });
      return;
    }

    // Validate Content-Length if present
    const contentLength = parseInt(ctx.req.headers["content-length"] ?? "0", 10);
    if (contentLength > opts.maxJsonSize) {
      ctx.response.status(413).json({
        error: "Payload too large",
      });
      return;
    }

    // Validate request method
    const validMethods = ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"];
    if (!validMethods.includes(ctx.req.method ?? "GET")) {
      ctx.response.status(405).json({
        error: "Method not allowed",
      });
      return;
    }

    // Validate URL
    if (!ctx.url.pathname || ctx.url.pathname.length > 2048) {
      ctx.response.status(414).json({
        error: "URI too long",
      });
      return;
    }

    await next();
  };
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: any): any {
  if (typeof input === "string") {
    // Remove dangerous patterns
    let cleaned = input;
    for (const pattern of DANGEROUS_PATTERNS) {
      cleaned = cleaned.replace(pattern, "");
    }
    return cleaned;
  }

  if (Array.isArray(input)) {
    return input.map((item) => sanitizeInput(item));
  }

  if (typeof input === "object" && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      // Validate key is safe
      if (!/^[a-zA-Z0-9_-]+$/.test(key)) {
        continue; // Skip invalid keys
      }
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }

  return input;
}
