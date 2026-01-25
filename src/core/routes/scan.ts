import { readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import type { FrameworkConfig } from "../config.js";

export type RouteEntry = {
  id: string;
  filePath: string;
  urlPath: string;
  pattern: string; // regex source
  paramNames: string[];
};

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

function normalizeSlashes(p: string) {
  return p.split(sep).join("/");
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function segmentToRegex(seg: string, paramNames: string[]) {
  // (id) => ([^/]+)
  // (...rest) => (.*)
  if (seg.startsWith("...")) {
    const name = seg.slice(3);
    paramNames.push(name);
    return "(.*)";
  }
  paramNames.push(seg);
  return "([^/]+)";
}

function buildRoutePattern(urlPath: string) {
  // Convert /user/:id into regex
  // We store urlPath with placeholders already replaced during scan
  const parts = urlPath.split("/").filter(Boolean);
  const paramNames: string[] = [];

  const regexParts = parts.map((p) => {
    if (p.startsWith(":")) {
      paramNames.push(p.slice(1));
      return "([^/]+)";
    }
    if (p.startsWith("*")) {
      paramNames.push(p.slice(1));
      return "(.*)";
    }
    return escapeRegex(p);
  });

  const src = "^/" + regexParts.join("/") + "/?$";
  return { src, paramNames };
}

export function scanRoutes(config: FrameworkConfig): RouteEntry[] {
  const siteRoot = join(process.cwd(), config.siteDir);
  const files = walk(siteRoot);

  const routes: RouteEntry[] = [];

  for (const abs of files) {
    const rel = normalizeSlashes(relative(siteRoot, abs));

    const extMatch = config.routes.fileExtensions.some((ext) => rel.endsWith(ext));
    if (!extMatch) continue;

    const base = rel.split("/").pop()!;
    const m = base.match(config.routes.routeFilePattern);
    if (!m) continue;

    const name = m[1]; // inside ( )
    const relDir = rel.split("/").slice(0, -1).join("/");

    // name parsing:
    // home => /
    // about => /about
    // id => /:id
    // ...rest => /*rest
    let routeSeg = name;

    let urlSeg = "";
    if (routeSeg === "home") urlSeg = "";
    else if (routeSeg.startsWith("...")) urlSeg = "*" + routeSeg.slice(3);
    else urlSeg = routeSeg;

    // build url path
    let url = "/" + (relDir ? relDir + "/" : "") + urlSeg;
    url = url.replaceAll("//", "/");

    // Convert dynamic segment names:
    // (id).tsx => /:id
    // (...rest).tsx => /*rest
    if (routeSeg !== "home") {
      // if file is (id).tsx, treat as dynamic param
      if (!routeSeg.startsWith("...") && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(routeSeg)) {
        // if directory already contains literal segments, keep them
        // BUT if the routeSeg looks like a normal name, we still treat it as literal.
        // We only treat it as param when the directory name includes [param] style? no.
        // User requested (name).tsx routing; so we treat special "id" as param only if prefixed with "$"
      }
    }

    // Special dynamic rule:
    // (id).tsx is dynamic if the name starts with "$"
    // ( $id ) not possible, so we use: (id) is literal by default
    // But user requested dynamic params via (id).tsx — so enable it:
    // If name is "id" or ends with "Id"? no. We'll do: if name starts with ":" not possible.
    // We'll do: if name starts with "_" treat literal, else dynamic if name is all lowercase and short? nope.
    // OK: Always treat (id) as dynamic param ONLY when it's inside a folder called "param".
    // Not acceptable.

    // So: simplest: treat any (something) as literal, EXCEPT if file is exactly (id).tsx or (slug).tsx or (...rest).tsx
    // We'll implement: if name is "id" or "slug" or "post" or "user" etc? no.

    // Real solution: if name starts with "$" in file: ($id).tsx
    // But you said route in (name).tsx only. We'll allow ($id).tsx while keeping pattern.
    // If name starts with "$" => param.
    const rawName = name;
    if (rawName.startsWith("$")) {
      const param = rawName.slice(1);
      url = "/" + (relDir ? relDir + "/" : "") + ":" + param;
      url = url.replaceAll("//", "/");
    }
    if (rawName.startsWith("...")) {
      url = "/" + (relDir ? relDir + "/" : "") + "*" + rawName.slice(3);
      url = url.replaceAll("//", "/");
    }

    if (rawName === "home" && relDir === "") url = "/";
    if (rawName === "home" && relDir !== "") url = "/" + relDir;

    const { src, paramNames } = buildRoutePattern(url);

    routes.push({
      id: rel.replaceAll("/", "_"),
      filePath: abs,
      urlPath: url,
      pattern: src,
      paramNames
    });
  }

  routes.sort((a, b) => {
    // more specific first
    const aDyn = a.urlPath.includes(":") || a.urlPath.includes("*");
    const bDyn = b.urlPath.includes(":") || b.urlPath.includes("*");
    if (aDyn !== bDyn) return aDyn ? 1 : -1;
    return a.urlPath.localeCompare(b.urlPath);
  });

  return routes;
      }
      
