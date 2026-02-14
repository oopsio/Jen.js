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

export async function bodyParser(ctx, next) {
  if (ctx.req.method === "GET" || ctx.req.method === "HEAD") {
    return next();
  }
  const chunks = [];
  await new Promise((resolve, reject) => {
    ctx.req.on("data", (chunk) => chunks.push(chunk));
    ctx.req.on("end", () => {
      const data = Buffer.concat(chunks).toString();
      const contentType = ctx.req.headers["content-type"] || "";
      try {
        if (contentType.includes("application/json")) {
          if (!data || data.trim() === "") {
            ctx.body = {};
          } else {
            ctx.body = JSON.parse(data);
          }
        } else if (contentType.includes("application/x-www-form-urlencoded")) {
          ctx.body = new URLSearchParams(data);
        } else {
          ctx.body = data;
        }
      } catch (e) {
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
