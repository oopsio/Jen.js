import type { IncomingMessage, ServerResponse } from "node:http";
import type {
  ServerActionContext,
  ServerActionHandler,
  ServerActionModule,
  ValidationResult,
  ValidationSchema,
  StreamWriter,
} from "./types.js";
import { log } from "../shared/log.js";

/**
 * Creates a ServerActionContext from request/response objects.
 * Handles body parsing, header extraction, and cookie parsing.
 */
export async function createServerActionContext(opts: {
  req: IncomingMessage;
  res: ServerResponse;
  url: URL;
  params?: Record<string, string>;
  headers: Record<string, string>;
  cookies: Record<string, string>;
}): Promise<ServerActionContext> {
  const { req, res, url, params = {}, headers, cookies } = opts;

  // Parse request body based on content type
  const body = await parseRequestBody(req);

  // Extract method
  const method = (req.method ?? "GET").toUpperCase();

  // Extract query parameters
  const query: Record<string, string> = {};
  for (const [k, v] of url.searchParams.entries()) {
    query[k] = v;
  }

  return {
    req,
    res,
    url,
    method,
    body,
    query,
    params,
    headers,
    cookies,
    data: {},

    validate(input: any, schema: ValidationSchema): ValidationResult {
      const errors: Record<string, string> = {};
      let success = true;

      for (const [fieldName, rules] of Object.entries(schema)) {
        const value = input[fieldName];
        for (const rule of rules) {
          const error = rule.validate(value);
          if (error) {
            errors[fieldName] = error;
            success = false;
            break; // Stop at first error for this field
          }
        }
      }

      return { success, errors };
    },

    stream(): StreamWriter {
      // Set headers for streaming response
      if (!res.headersSent) {
        res.statusCode = 200;
        res.setHeader("content-type", "application/x-ndjson; charset=utf-8");
        res.setHeader("transfer-encoding", "chunked");
      }

      return {
        write(data: any) {
          const line = typeof data === "string" ? data : JSON.stringify(data);
          res.write(line + "\n");
        },

        writeJSON(data: Record<string, any>) {
          res.write(JSON.stringify(data) + "\n");
        },

        close() {
          if (!res.writableEnded) {
            res.end();
          }
        },
      };
    },
  };
}

/**
 * Parse request body from IncomingMessage.
 * Handles JSON and form data content types.
 */
async function parseRequestBody(req: IncomingMessage): Promise<any> {
  const method = (req.method ?? "GET").toUpperCase();

  // Methods without bodies per HTTP spec
  if (method === "GET" || method === "HEAD") {
    return null;
  }

  // Read all body chunks
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.from(chunk));
  }

  if (chunks.length === 0) {
    return null;
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  const contentType = (req.headers["content-type"] ?? "").toString();

  // Parse JSON
  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(raw);
    } catch (err) {
      log.warn(`Failed to parse JSON body: ${err}`);
      return { __raw: raw };
    }
  }

  // Parse form data
  if (contentType.includes("application/x-www-form-urlencoded")) {
    const data: Record<string, any> = {};
    const params = new URLSearchParams(raw);
    for (const [k, v] of params.entries()) {
      data[k] = v;
    }
    return data;
  }

  // Parse multipart form data (basic support)
  if (contentType.includes("multipart/form-data")) {
    // For now, return raw. Full multipart parsing requires a library
    return { __raw: raw };
  }

  // Default: return as raw
  return { __raw: raw };
}

/**
 * Execute a server action handler with the given context.
 * Handles validation, error handling, and response serialization.
 */
export async function executeServerAction(opts: {
  handler: ServerActionHandler;
  ctx: ServerActionContext;
  validation?: ValidationSchema;
}): Promise<void> {
  const { handler, ctx, validation } = opts;

  try {
    // Run validation if schema provided
    if (validation) {
      const validationResult = ctx.validate(ctx.body, validation);
      if (!validationResult.success) {
        ctx.res.statusCode = 400;
        ctx.res.setHeader("content-type", "application/json; charset=utf-8");
        ctx.res.end(
          JSON.stringify({
            success: false,
            errors: validationResult.errors,
            message: "Validation failed",
          }),
        );
        return;
      }
    }

    // Execute the handler
    const result = await handler(ctx);

    // If response already sent (streaming), don't double-send
    if (ctx.res.writableEnded) {
      return;
    }

    // Handle Response object
    if (result instanceof Response) {
      ctx.res.statusCode = result.status;
      result.headers.forEach((v, k) => ctx.res.setHeader(k, v));
      const buf = Buffer.from(await result.arrayBuffer());
      ctx.res.end(buf);
      return;
    }

    // Serialize as JSON
    ctx.res.statusCode = 200;
    ctx.res.setHeader("content-type", "application/json; charset=utf-8");

    if (result === null || result === undefined) {
      ctx.res.end(JSON.stringify({ success: true, data: null }));
    } else if (typeof result === "string") {
      ctx.res.end(JSON.stringify({ success: true, data: result }));
    } else {
      ctx.res.end(JSON.stringify({ success: true, ...result }));
    }
  } catch (err: any) {
    // Error response
    log.error(`Server action error: ${err.message}`);

    if (!ctx.res.headersSent) {
      ctx.res.statusCode = 500;
      ctx.res.setHeader("content-type", "application/json; charset=utf-8");
    }

    if (!ctx.res.writableEnded) {
      ctx.res.end(
        JSON.stringify({
          success: false,
          message: "Internal server error",
          ...(process.env.NODE_ENV === "development" && {
            error: err.message,
          }),
        }),
      );
    }
  }
}
