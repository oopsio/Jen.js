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
