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

import type { IncomingMessage, ServerResponse } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { join, normalize } from "node:path";
import { pathToFileURL } from "node:url";

const MAX_BODY_SIZE = 1024 * 1024; // 1MB
const VALID_ROUTE_PATTERN = /^[a-zA-Z0-9_\-/]+$/; // Only alphanumeric, underscore, hyphen, forward slash

function isValidRouteName(name: string): boolean {
  if (!name || name.length > 255) return false;
  if (name.includes("..") || name.includes("\\") || name.startsWith("/"))
    return false;
  return VALID_ROUTE_PATTERN.test(name);
}

export async function tryHandleApiRoute(opts: {
  req: IncomingMessage;
  res: ServerResponse;
  siteDir: string;
}) {
  const { req, res, siteDir } = opts;

  const url = new URL(
    req.url ?? "/",
    `http://${req.headers.host ?? "localhost"}`,
  );
  if (!url.pathname.startsWith("/api/")) return false;

  // /api/hello -> site/api/(hello).ts
  let name = url.pathname.slice("/api/".length) || "home";

  // Security: Validate route name to prevent path traversal
  if (!isValidRouteName(name)) {
    res.statusCode = 400;
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "Invalid API route format" }));
    return true;
  }

  const file = join(process.cwd(), siteDir, "api", `(${name}).ts`);

  // Ensure the resolved path is within the api directory (prevent directory traversal)
  const apiDir = normalize(join(process.cwd(), siteDir, "api"));
  if (!normalize(file).startsWith(apiDir)) {
    res.statusCode = 403;
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "Forbidden" }));
    return true;
  }

  if (!existsSync(file)) {
    res.statusCode = 404;
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "Not found" }));
    return true;
  }

  // Use pathToFileURL to handle Windows paths correctly
  const mod = await import(pathToFileURL(file).href + `?t=${Date.now()}`);

  const handler = mod?.default;
  if (typeof handler !== "function") {
    res.statusCode = 500;
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.end(
      JSON.stringify({ error: "API route missing default export function" }),
    );
    return true;
  }

  const body = await readBody(req);

  const ctx = {
    req,
    res,
    url,
    method: req.method ?? "GET",
    query: Object.fromEntries(url.searchParams.entries()),
    body,
  };

  const out = await handler(ctx);

  if (res.writableEnded) return true;

  if (out instanceof Response) {
    res.statusCode = out.status;
    out.headers.forEach((v, k) => res.setHeader(k, v));
    const buf = Buffer.from(await out.arrayBuffer());
    res.end(buf);
    return true;
  }

  if (typeof out === "string") {
    res.statusCode = 200;
    res.setHeader("content-type", "text/plain; charset=utf-8");
    res.end(out);
    return true;
  }

  res.statusCode = 200;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.end(JSON.stringify(out ?? null));
  return true;
}

async function readBody(req: IncomingMessage) {
  const method = (req.method ?? "GET").toUpperCase();
  if (method === "GET" || method === "HEAD") return null;

  const chunks: Buffer[] = [];
  let totalSize = 0;

  for await (const chunk of req) {
    totalSize += chunk.length;
    if (totalSize > MAX_BODY_SIZE) {
      throw new Error(
        `Request body exceeds maximum size of ${MAX_BODY_SIZE} bytes`,
      );
    }
    chunks.push(Buffer.from(chunk));
  }

  if (chunks.length === 0) return null;

  const raw = Buffer.concat(chunks).toString("utf8");
  const ct = req.headers["content-type"] ?? "";

  if (typeof ct === "string" && ct.includes("application/json")) {
    try {
      return JSON.parse(raw);
    } catch {
      return { __raw: raw };
    }
  }

  return { __raw: raw };
}
