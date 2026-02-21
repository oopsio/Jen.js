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
export function bodyParser(ctx: any, next: any): Promise<any>;
