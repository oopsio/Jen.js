import { readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import type { FrameworkConfig } from "../config.js";

export type RouteEntry = {
  id: string;
  filePath: string;
  urlPath: string;
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

    const name = m[1]; // (home) => home
    const relDir = rel.split("/").slice(0, -1).join("/");

    let url = "/" + (relDir ? relDir + "/" : "") + name;

    // (home) at root => "/"
    if (name === "home" && relDir === "") url = "/";

    // normalize /blog/home => /blog
    if (name === "home" && relDir !== "") url = "/" + relDir;

    url = url.replaceAll("//", "/");

    routes.push({
      id: rel.replaceAll("/", "_"),
      filePath: abs,
      urlPath: url
    });
  }

  // stable sort
  routes.sort((a, b) => a.urlPath.localeCompare(b.urlPath));
  return routes;
}
  
