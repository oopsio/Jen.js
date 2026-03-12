import { readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
/**
 * Recursively walks a directory and returns all file paths.
 * Used to discover all action files in the actions directory.
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
        // Directory doesn't exist yet
    }
    return out;
}
/**
 * Normalizes filesystem path separators to forward slashes.
 */
function normalizeSlashes(p) {
    return p.split(sep).join("/");
}
/**
 * Converts kebab-case to camelCase.
 */
function kebabToCamel(str) {
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}
/**
 * Converts a file path to an action name.
 * - actions/post-comment.ts => postComment
 * - actions/blog/publish.ts => blog.publish
 * - actions/deeply/nested/action.ts => deeply.nested.action
 */
function filePathToActionName(filePath) {
    // Remove extension
    const withoutExt = filePath.replace(/\.(ts|js|tsx|jsx)$/, "");
    // Split by directory separator
    const parts = withoutExt.split("/");
    // Convert each part from kebab-case to camelCase, except keep first as-is for namespace
    return parts
        .map((part, idx) => {
        // First part can be namespace (keep as-is)
        // Subsequent parts are action names (convert to camelCase)
        return idx === 0 ? part : kebabToCamel(part);
    })
        .join(".");
}
/**
 * Scans the actions directory for server action files.
 * Server action files are TypeScript/JavaScript files in the site/actions directory.
 * Each file should export a default function that is the action handler.
 *
 * Naming conventions:
 * - actions/submit-form.ts => action path /submit-form, name "submitForm"
 * - actions/blog/publish.ts => action path /blog/publish, name "blog.publish"
 * - actions/user/[id]/delete.ts => action path /user/:id/delete, name "user.delete"
 *
 * @param config Framework configuration with siteDir
 * @returns Array of ServerActionEntry objects for all discovered actions
 */
export function scanServerActions(config) {
    const actionsDir = join(process.cwd(), config.siteDir, "actions");
    const files = walk(actionsDir);
    const actions = [];
    for (const abs of files) {
        // Skip if not a valid action file
        const ext = abs.split(".").pop()?.toLowerCase();
        if (!ext || !["ts", "js", "tsx", "jsx"].includes(ext)) {
            continue;
        }
        // Get relative path from actions directory
        const rel = normalizeSlashes(relative(actionsDir, abs));
        // Remove extension
        const withoutExt = rel.replace(/\.(ts|js|tsx|jsx)$/, "");
        // Convert file path to action path
        // Handle dynamic segments: [id] => :id
        const actionPath = "/" +
            withoutExt
                .split("/")
                .map((part) => part.startsWith("[") && part.endsWith("]")
                ? ":" + part.slice(1, -1)
                : part)
                .join("/");
        // Generate action name
        const actionName = filePathToActionName(withoutExt);
        actions.push({
            id: withoutExt.replaceAll("/", "_").replaceAll("-", "_"),
            filePath: abs,
            actionPath,
            name: actionName,
        });
    }
    // Sort by path specificity (static first, then dynamic)
    actions.sort((a, b) => {
        const aDyn = a.actionPath.includes(":");
        const bDyn = b.actionPath.includes(":");
        if (aDyn !== bDyn)
            return aDyn ? 1 : -1;
        return a.actionPath.localeCompare(b.actionPath);
    });
    return actions;
}
/**
 * Matches an action path against discovered server actions.
 * Handles static and dynamic route matching.
 *
 * @param actions Array of discovered server actions
 * @param requestPath The incoming request path
 * @returns Matched action entry with params if found, null otherwise
 */
export function matchServerAction(actions, requestPath) {
    // Normalize path
    const path = requestPath.startsWith("/") ? requestPath : "/" + requestPath;
    for (const action of actions) {
        // Try exact match first
        if (action.actionPath === path) {
            return { action, params: {} };
        }
        // Try dynamic match
        const actionParts = action.actionPath.split("/").filter(Boolean);
        const pathParts = path.split("/").filter(Boolean);
        if (actionParts.length !== pathParts.length) {
            continue;
        }
        const params = {};
        let matches = true;
        for (let i = 0; i < actionParts.length; i++) {
            const actionPart = actionParts[i];
            const pathPart = pathParts[i];
            if (actionPart.startsWith(":")) {
                // Dynamic segment
                const paramName = actionPart.slice(1);
                params[paramName] = pathPart;
            }
            else if (actionPart !== pathPart) {
                // Static segment doesn't match
                matches = false;
                break;
            }
        }
        if (matches) {
            return { action, params };
        }
    }
    return null;
}
