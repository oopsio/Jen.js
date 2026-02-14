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

    const extMatch = config.routes.fileExtensions.some((ext) =>
      rel.endsWith(ext),
    );
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

    // Dynamic route segment detection:
    // Routes are determined by the filename within parentheses
    // - (home).tsx => / (root) or /{dir}/ (in subdirectory)
    // - ($paramName).tsx => /:paramName (dynamic param, requires $ prefix)
    // - (...restName).tsx => /*restName (catch-all, requires ... prefix)
    // - Any other (name).tsx => /name (literal segment)

    const rawName = name;

    // Handle special prefixes for dynamic routing
    if (rawName.startsWith("$") && !rawName.startsWith("...")) {
      // ($paramName) syntax for dynamic parameters
      const param = rawName.slice(1);
      if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(param)) {
        throw new Error(`Invalid parameter name: ${param} in route file ${rel}`);
      }
      url = "/" + (relDir ? relDir + "/" : "") + ":" + param;
      url = url.replaceAll("//", "/");
    } else if (rawName.startsWith("...")) {
      // (...restName) syntax for catch-all routes
      const restName = rawName.slice(3);
      if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(restName)) {
        throw new Error(`Invalid rest parameter name: ${restName} in route file ${rel}`);
      }
      url = "/" + (relDir ? relDir + "/" : "") + "*" + restName;
      url = url.replaceAll("//", "/");
    } else if (rawName === "home") {
      // (home) is special - becomes root of its directory
      url = relDir === "" ? "/" : "/" + relDir;
    }
    // else: (anything else) treated as literal segment

    const { src, paramNames } = buildRoutePattern(url);

    routes.push({
      id: rel.replaceAll("/", "_"),
      filePath: abs,
      urlPath: url,
      pattern: src,
      paramNames,
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
