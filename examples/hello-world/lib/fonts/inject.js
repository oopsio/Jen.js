import { extractFonts } from "./loader.js";
/**
 * Injects font-related HTML and CSS into the framework config.
 * This is called automatically during build and server initialization.
 * Modifies config.inject.head to include font links and CSS.
 *
 * Fully hackable: Call this function in custom build scripts to control
 * exactly how fonts are injected, or skip it entirely for manual control.
 *
 * @param config Jen.js framework config (modified in place)
 * @param cacheDir Cache directory for fonts (default: config.build?.cacheDir or ".jen")
 *
 * @example
 * ```typescript
 * // In build.js or server.js, customize font injection:
 * import { injectFonts } from "../fonts/inject.js";
 * import type { FrameworkConfig } from "../core/config.js";
 *
 * export async function setupFonts(config: FrameworkConfig) {
 *   // Inject fonts with custom cache location
 *   injectFonts(config, "./my-custom-cache");
 *
 *   // Further customize injected content
 *   config.inject.head = config.inject.head.map(tag => {
 *     if (tag.includes("fonts.googleapis.com")) {
 *       // Add crossorigin to Google Fonts link
 *       return tag.replace("<link", '<link crossorigin');
 *     }
 *     return tag;
 *   });
 *
 *   return config;
 * }
 * ```
 */
export function injectFonts(config, cacheDir) {
    const fontsCacheDir = cacheDir ?? config.build?.cacheDir ?? ".jen";
    const fonts = config.fonts;
    if (!fonts) {
        return; // No fonts configured
    }
    const { googleFontLinks, localFontsCSS } = extractFonts(fonts, fontsCacheDir);
    // Initialize inject.head if not already present
    if (!config.inject) {
        config.inject = { head: [], bodyEnd: [] };
    }
    if (!config.inject.head) {
        config.inject.head = [];
    }
    // Add Google Fonts link (if any)
    if (googleFontLinks) {
        config.inject.head.push(googleFontLinks);
    }
    // Add local fonts CSS as <style> tag (if any)
    if (localFontsCSS) {
        const styleTag = `<style>${localFontsCSS}</style>`;
        config.inject.head.push(styleTag);
    }
}
/**
 * Middleware for serving local fonts with proper cache headers.
 * Used in development and production servers to serve fonts with appropriate
 * HTTP headers for long-term caching.
 *
 * @param cacheDir Cache directory where fonts are stored
 * @returns Middleware function compatible with Node.js http.Server
 *
 * @example
 * ```typescript
 * import { fontServeMiddleware } from "../fonts/inject.js";
 * import { createServer } from "node:http";
 *
 * const server = createServer();
 * const fontsMiddleware = fontServeMiddleware("./.jen/cache/fonts");
 *
 * server.on("request", async (req, res) => {
 *   if (req.url?.startsWith("/fonts/")) {
 *     await fontsMiddleware(req, res);
 *     return;
 *   }
 *   // Handle other routes
 * });
 * ```
 */
export function fontServeMiddleware(cacheDir) {
    return async (req, res) => {
        if (!req.url?.startsWith("/fonts/")) {
            return false;
        }
        const { readFileSync, existsSync } = await import("node:fs");
        const { basename, join } = await import("node:path");
        const fontPath = basename(req.url);
        // Security: Prevent directory traversal attacks
        if (fontPath.includes("..") || fontPath.includes("/")) {
            res.statusCode = 400;
            res.end("Invalid font path");
            return true;
        }
        const fullPath = join(cacheDir, fontPath);
        if (!existsSync(fullPath)) {
            return false; // Not a font file, let other middleware handle it
        }
        try {
            const content = readFileSync(fullPath);
            const ext = fontPath.split(".").pop()?.toLowerCase();
            const mimeTypes = {
                ttf: "font/ttf",
                otf: "font/otf",
                woff: "font/woff",
                woff2: "font/woff2",
            };
            const mimeType = mimeTypes[ext || ""] || "application/octet-stream";
            res.statusCode = 200;
            res.setHeader("content-type", mimeType);
            res.setHeader("cache-control", "public, max-age=31536000, immutable");
            res.setHeader("access-control-allow-origin", "*");
            res.end(content);
            return true;
        }
        catch (err) {
            res.statusCode = 500;
            res.end("Font serving error");
            return true;
        }
    };
}
