/**
 * Request body parsing middleware.
 * Reads and parses the request body based on Content-Type header.
 * Supports JSON, URL-encoded form data, and plain text.
 *
 * GET and HEAD requests are passed through without parsing since they have no body.
 * Parsed body is available in ctx.body. If parsing fails, the raw string is stored
 * and an error message is attached to ctx.parseError for error handling downstream.
 *
 * @returns Middleware function.
 *
 * @example
 * kernel.use(bodyParser);
 * // ctx.body is now populated with parsed request body
 */
export async function bodyParser(ctx, next) {
  // GET and HEAD requests have no body; skip parsing
  if (ctx.req.method === "GET" || ctx.req.method === "HEAD") {
    return next();
  }
  // Collect all data chunks from the request stream
  const chunks = [];
  await new Promise((resolve, reject) => {
    ctx.req.on("data", (chunk) => chunks.push(chunk));
    ctx.req.on("end", () => {
      const data = Buffer.concat(chunks).toString();
      const contentType = ctx.req.headers["content-type"] || "";
      try {
        // Parse based on Content-Type header
        if (contentType.includes("application/json")) {
          // Parse JSON, allowing empty bodies
          if (!data || data.trim() === "") {
            ctx.body = {};
          } else {
            ctx.body = JSON.parse(data);
          }
        } else if (contentType.includes("application/x-www-form-urlencoded")) {
          // Parse URL-encoded form data as URLSearchParams
          ctx.body = new URLSearchParams(data);
        } else {
          // Store raw string for other content types
          ctx.body = data;
        }
      } catch (e) {
        // On parse error, store the error and fall back to raw string
        const error = e instanceof Error ? e.message : String(e);
        console.error("Body parser error:", error);
        ctx.parseError = error;
        ctx.body = data; // Raw string on failure
      }
      resolve();
    });
    ctx.req.on("error", reject);
  });
  await next();
}
