import type { IncomingMessage, ServerResponse } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

export async function tryHandleApiRoute(opts: {
  req: IncomingMessage;
  res: ServerResponse;
  siteDir: string;
}) {
  const { req, res, siteDir } = opts;

  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
  if (!url.pathname.startsWith("/api/")) return false;

  // /api/hello -> site/api/(hello).ts
  const name = url.pathname.slice("/api/".length) || "home";
  const file = join(process.cwd(), siteDir, "api", `(${name}).ts`);

  if (!existsSync(file)) {
    res.statusCode = 404;
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "API route not found", route: name }));
    return true;
  }

  const mod = await import(file);

  const handler = mod?.default;
  if (typeof handler !== "function") {
    res.statusCode = 500;
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "API route missing default export function" }));
    return true;
  }

  const body = await readBody(req);

  const ctx = {
    req,
    res,
    url,
    method: req.method ?? "GET",
    query: Object.fromEntries(url.searchParams.entries()),
    body
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
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
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
