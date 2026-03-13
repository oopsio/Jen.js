import { readdirSync, statSync } from "node:fs";
import { join, relative, sep, dirname } from "node:path";
/**
 * Recursively walks a directory and returns all file paths.
 * Used to discover all layout files in the siteDir.
 *
 * @param dir Directory path to walk
 * @returns Flat array of all file paths found
 */
function walk(dir) {
    const out = [];
    try {
        for (const name of readdirSync(dir)) {
            const p = join(dir, name);
            const st = statSync(p);
            if (st.isDirectory())
                out.push(...walk(p));
            else
                out.push(p);
        }
    }
    catch {
        // Ignore errors reading directories
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
 * Scans the configured siteDir for layout files and returns an ordered list.
 * Layout files must be named (layout).tsx, (layout).ts, (layout).jsx, or (layout).js
 * and are discovered at any directory level within siteDir.
 *
 * Layouts are automatically discovered and organized by their directory depth,
 * allowing for automatic hierarchy building based on file structure.
 *
 * @param config Framework configuration with siteDir and route patterns
 * @returns Array of LayoutEntry objects, sorted by depth (root layout first)
 */
export function scanLayouts(config) {
    const siteRoot = join(process.cwd(), config.siteDir);
    const files = walk(siteRoot);
    const layouts = [];
    for (const abs of files) {
        const rel = normalizeSlashes(relative(siteRoot, abs));
        // Check if this is a layout file with correct extension
        const extMatch = config.routes.fileExtensions.some((ext) => rel.endsWith(`(layout)${ext}`));
        if (!extMatch)
            continue;
        // Get the directory containing this layout file
        const dirPath = normalizeSlashes(dirname(rel));
        const depth = dirPath === "." ? 0 : dirPath.split("/").length;
        layouts.push({
            id: `layout_${rel.replaceAll("/", "_").replace(/\.\w+$/, "")}`,
            filePath: abs,
            depth,
            dirPath: dirPath === "." ? "" : dirPath,
        });
    }
    // Sort by depth (root/shallowest first)
    layouts.sort((a, b) => a.depth - b.depth);
    return layouts;
}
/**
 * Builds the layout hierarchy for a given route path.
 * Finds all parent layouts that should apply to this route by tracing
 * the directory structure from root down to the route's directory.
 *
 * Example: For route "pages/blog/post/(post).tsx", returns layouts at:
 * - (layout).tsx (root)
 * - pages/(layout).tsx (if exists)
 * - pages/blog/(layout).tsx (if exists)
 *
 * @param layoutEntries All discovered layout entries (from scanLayouts)
 * @param routePath The filesystem path of the route file
 * @returns Array of LayoutEntry objects in order (root to leaf)
 */
export function buildLayoutHierarchy(layoutEntries, routePath, siteDir) {
    // Get the directory containing the route
    const routeDir = dirname(routePath);
    // Normalize path relative to siteDir
    const siteRoot = join(process.cwd(), siteDir);
    const relRouteDir = normalizeSlashes(relative(siteRoot, routeDir));
    // Split the route directory into segments
    const segments = relRouteDir === "." ? [] : relRouteDir.split("/");
    // Find applicable layouts by checking each level of the hierarchy
    const applicable = [];
    // Check root layout first
    const rootLayout = layoutEntries.find((l) => l.depth === 0 && l.dirPath === "");
    if (rootLayout) {
        applicable.push(rootLayout);
    }
    // Check layouts at each level
    for (let i = 1; i <= segments.length; i++) {
        const dirPath = segments.slice(0, i).join("/");
        const layout = layoutEntries.find((l) => l.dirPath === dirPath && l.depth === i);
        if (layout) {
            applicable.push(layout);
        }
    }
    return applicable;
}
