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
/**
 * Recursively walks a directory and returns all file paths.
 * Used to discover all potential route files in the siteDir.
 *
 * @param dir Directory path to walk
 * @returns Flat array of all file paths found, relative or absolute as provided
 */
function walk(dir) {
    const out = [];
    for (const name of readdirSync(dir)) {
        const p = join(dir, name);
        const st = statSync(p);
        if (st.isDirectory())
            out.push(...walk(p));
        else
            out.push(p);
    }
    return out;
}
/**
 * Normalizes filesystem path separators to forward slashes.
 * Ensures consistent path format across Windows and Unix systems.
 *
 * @param p Path with possibly mixed separators
 * @returns Path with forward slashes only
 */
function normalizeSlashes(p) {
    return p.split(sep).join("/");
}
/**
 * Escapes special regex characters in a string.
 * Prevents literal characters from being interpreted as regex syntax.
 *
 * @param s String to escape
 * @returns Escaped string safe for regex
 */
function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
/**
 * Converts a URL path segment to a regex pattern.
 * Handles dynamic parameters (:id) and catch-alls (*rest).
 * Side effect: appends parameter names to provided array.
 *
 * @param seg URL segment like "id", ":id", or "*rest"
 * @param paramNames Array to accumulate discovered parameter names
 * @returns Regex pattern for this segment
 */
function segmentToRegex(seg, paramNames) {
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
/**
 * Converts a URL path string into a compiled regex pattern and parameter list.
 * Handles static segments, dynamic parameters (:param), and catch-all routes (*rest).
 *
 * @param urlPath URL path like "/posts/:id" or "/docs/*rest"
 * @returns Object with regex source string and ordered parameter names
 *
 * @example
 * buildRoutePattern("/posts/:id") => {
 *   src: "^/posts/([^/]+)/?$",
 *   paramNames: ["id"]
 * }
 */
function buildRoutePattern(urlPath) {
    // Convert /user/:id into regex
    // We store urlPath with placeholders already replaced during scan
    const parts = urlPath.split("/").filter(Boolean);
    const paramNames = [];
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
/**
 * Scans the configured siteDir for route files and returns an ordered list.
 * Files are matched against config.routes.routeFilePattern (typically /^\(([^)]+)\)/).
 * Only files with extensions in config.routes.fileExtensions are considered.
 *
 * Naming conventions:
 * - (home).tsx => route "/" (root, or within its directory)
 * - ($paramName).tsx => dynamic route "/:paramName" (requires $ prefix)
 * - (...restName).tsx => catch-all route "/*restName" (requires ... prefix)
 * - (name).tsx => literal route "/name"
 *
 * Routes are sorted by specificity: static routes first, then dynamic/catch-all.
 *
 * @param config Framework configuration with siteDir and route patterns
 * @returns Array of RouteEntry objects, sorted by specificity (most specific first)
 * @throws {Error} If a parameter name is invalid (e.g., starts with number)
 */
export function scanRoutes(config) {
    const siteRoot = join(process.cwd(), config.siteDir);
    const files = walk(siteRoot);
    const routes = [];
    for (const abs of files) {
        const rel = normalizeSlashes(relative(siteRoot, abs));
        const extMatch = config.routes.fileExtensions.some((ext) => rel.endsWith(ext));
        if (!extMatch)
            continue;
        const base = rel.split("/").pop();
        const m = base.match(config.routes.routeFilePattern);
        if (!m)
            continue;
        const name = m[1]; // inside ( )
        const relDir = rel.split("/").slice(0, -1).join("/");
        // name parsing:
        // home => /
        // about => /about
        // id => /:id
        // ...rest => /*rest
        let routeSeg = name;
        let urlSeg = "";
        if (routeSeg === "home")
            urlSeg = "";
        else if (routeSeg.startsWith("..."))
            urlSeg = "*" + routeSeg.slice(3);
        else
            urlSeg = routeSeg;
        // build url path
        let url = "/" + (relDir ? relDir + "/" : "") + urlSeg;
        url = url.replaceAll("//", "/");
        /**
         * Dynamic route segment detection based on filename within parentheses.
         * Routes are determined by the filename prefix conventions:
         * - (home).tsx => / (root) or /{dir}/ (in subdirectory)
         * - ($paramName).tsx => /:paramName (dynamic param, requires $ prefix)
         * - (...restName).tsx => /*restName (catch-all, requires ... prefix)
         * - Any other (name).tsx => /name (literal segment)
         */
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
        }
        else if (rawName.startsWith("...")) {
            // (...restName) syntax for catch-all routes
            const restName = rawName.slice(3);
            if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(restName)) {
                throw new Error(`Invalid rest parameter name: ${restName} in route file ${rel}`);
            }
            url = "/" + (relDir ? relDir + "/" : "") + "*" + restName;
            url = url.replaceAll("//", "/");
        }
        else if (rawName === "home") {
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
    // Sort by specificity: exact matches and static routes first, dynamic routes last
    routes.sort((a, b) => {
        // more specific first
        const aDyn = a.urlPath.includes(":") || a.urlPath.includes("*");
        const bDyn = b.urlPath.includes(":") || b.urlPath.includes("*");
        if (aDyn !== bDyn)
            return aDyn ? 1 : -1;
        return a.urlPath.localeCompare(b.urlPath);
    });
    return routes;
}
