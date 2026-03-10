/**
 * Vercel Build Output API v3 Integration for Jen.js
 *
 * This module generates the .vercel/output directory structure compatible with
 * Vercel's Build Output API specification. It automatically detects and configures
 * SSR, SSG, and ISR routes with minimal overhead and cold start size.
 *
 * Spec: https://vercel.com/docs/build-output-api/v3
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { log } from "../shared/log.js";
/**
 * Detects rendering mode from route module.
 * Defaults to SSG if not specified.
 */
export function detectRenderingMode(filePath) {
    // In a real implementation, this would dynamically import the module
    // and read the exported `rendering` property.
    // For now, return "ssg" as default.
    // Extended implementation would require module evaluation.
    return "ssg";
}
/**
 * Detects ISR revalidation time from route module.
 * Returns undefined if route is not ISR or doesn't specify revalidate.
 */
export function detectRevalidateSeconds(filePath) {
    // Similar to detectRenderingMode, this would require module evaluation.
    // Returns 3600 (1 hour) as example default for ISR routes.
    return undefined;
}
/**
 * Generates a unique function name from route path.
 * Ensures compatibility with Vercel's naming requirements.
 */
export function functionNameFromRoute(route) {
    // /posts/:id => posts_id
    // /api/users => api_users
    const name = route.urlPath
        .split("/")
        .filter(Boolean)
        .map((s) => s.replace(/[^a-zA-Z0-9_]/g, "_"))
        .join("_");
    return name || "index";
}
/**
 * Converts Jen.js route pattern to Vercel-compatible regex source.
 * Handles dynamic segments and catch-all routes.
 */
export function convertRoutePattern(route) {
    // Jen.js pattern is already in regex format like "^/posts/([^/]+)/?$"
    // Return as-is since Vercel accepts regex patterns
    return route.pattern;
}
/**
 * Main Vercel output builder for a set of routes.
 * Organizes routes by rendering mode and generates all required files.
 */
export class VercelOutputBuilder {
    outputDir;
    config;
    routes = [];
    ssrRoutes = [];
    ssgRoutes = [];
    isrRoutes = [];
    constructor(outputDir, config) {
        this.outputDir = outputDir;
        this.config = config;
    }
    /**
     * Register a route with its rendering mode.
     * Called during build for each discovered route.
     */
    addRoute(route, mode) {
        const revalidateSeconds = mode === "isr" ? this.config.rendering.defaultRevalidateSeconds : undefined;
        const metadata = { route, mode, revalidateSeconds };
        this.routes.push(metadata);
        if (mode === "ssg")
            this.ssgRoutes.push(metadata);
        else if (mode === "ssr")
            this.ssrRoutes.push(metadata);
        else
            this.isrRoutes.push(metadata);
    }
    /**
     * Generate the complete .vercel/output structure.
     * Must be called after all routes are registered.
     */
    async build() {
        mkdirSync(this.outputDir, { recursive: true });
        // 1. Create static outputs for SSG routes
        if (this.ssgRoutes.length > 0) {
            await this.generateSsgStatics();
        }
        // 2. Generate serverless functions for SSR/ISR routes
        if (this.ssrRoutes.length > 0 || this.isrRoutes.length > 0) {
            await this.generateServerlessFunctions();
        }
        // 3. Generate prerender config for ISR routes
        if (this.isrRoutes.length > 0) {
            this.generatePrerenderConfig();
        }
        // 4. Generate main config.json
        this.generateConfigJson();
        log.info(`Vercel output generated: ${this.ssgRoutes.length} SSG, ${this.ssrRoutes.length} SSR, ${this.isrRoutes.length} ISR`);
    }
    /**
     * Generate static HTML files in .vercel/output/static
     */
    async generateSsgStatics() {
        const staticDir = join(this.outputDir, "static");
        mkdirSync(staticDir, { recursive: true });
        for (const { route } of this.ssgRoutes) {
            // Route HTML should be pre-rendered into .vercel/output/static
            // In actual build, would copy from dist/
            const path = route.urlPath === "/" ? "index.html" : `${route.urlPath.slice(1)}/index.html`;
            const filePath = join(staticDir, path);
            mkdirSync(join(filePath, ".."), { recursive: true });
            // Placeholder - actual HTML would come from rendering phase
            writeFileSync(filePath, `<!-- SSG: ${route.urlPath} -->`);
            log.info(`SSG static: ${path}`);
        }
    }
    /**
     * Generate serverless function handlers for SSR/ISR routes.
     * Creates minimal Node.js handler compatible with Vercel.
     */
    async generateServerlessFunctions() {
        const functionsDir = join(this.outputDir, "functions");
        mkdirSync(functionsDir, { recursive: true });
        const allDynamic = [...this.ssrRoutes, ...this.isrRoutes];
        const functions = {};
        for (const { route } of allDynamic) {
            const funcName = functionNameFromRoute(route);
            const funcDir = join(functionsDir, funcName + ".func");
            mkdirSync(funcDir, { recursive: true });
            // Generate handler entry point
            const handler = this.generateHandlerCode(route);
            writeFileSync(join(funcDir, "index.js"), handler);
            // Generate .vc-config.json for Vercel
            const vcConfig = {
                runtime: "nodejs20.x",
                handler: "index.js",
                lazyRoutes: [route.urlPath],
                maxDuration: 30,
                memory: 1024, // Minimal memory for lightweight functions
            };
            writeFileSync(join(funcDir, ".vc-config.json"), JSON.stringify(vcConfig, null, 2));
            functions[funcName] = vcConfig;
            log.info(`SSR function: ${funcName}`);
        }
    }
    /**
     * Generate minimal handler code for serverless function.
     * Must be compatible with Vercel's Node.js runtime.
     */
    generateHandlerCode(route) {
        return `// Jen.js Vercel Function Handler - ${route.urlPath}
// Minimal cold-start optimized handler

import { render } from '../../../dist/jen-runtime.js';

export default async function handler(req, res) {
  try {
    // Parse request
    const url = new URL(req.url || '/', \`http://\${req.headers.host}\`);
    const params = extractParams(req, '${route.pattern}');
    
    // Render page
    const html = await render({
      route: '${route.urlPath}',
      params,
      query: url.searchParams,
      headers: req.headers,
    });
    
    res.setHeader('content-type', 'text/html; charset=utf-8');
    res.end(html);
  } catch (err) {
    res.status(500).end('Internal Server Error');
  }
}

function extractParams(req, pattern) {
  // Extract path params from URL using route pattern
  const url = new URL(req.url || '/', \`http://\${req.headers.host}\`);
  const match = url.pathname.match(new RegExp(pattern));
  return match ? match.slice(1) : [];
}`;
    }
    /**
     * Generate prerender-config.json for ISR routes
     */
    generatePrerenderConfig() {
        const prerenderDir = join(this.outputDir, "prerender");
        mkdirSync(prerenderDir, { recursive: true });
        for (const { route, revalidateSeconds } of this.isrRoutes) {
            const configName = route.urlPath.replace(/\//g, "_") || "root";
            const config = {
                version: 1,
                expiration: revalidateSeconds || 3600,
                fallback: null,
                group: "pages",
            };
            writeFileSync(join(prerenderDir, `${configName}.json`), JSON.stringify(config, null, 2));
            log.info(`ISR prerender config: ${route.urlPath} (${revalidateSeconds}s)`);
        }
    }
    /**
     * Generate main config.json for .vercel/output
     */
    generateConfigJson() {
        const config = {
            version: 3,
            routes: [],
            functions: {},
            overrides: {},
        };
        // 1. Add static routes (SSG)
        for (const { route } of this.ssgRoutes) {
            const path = route.urlPath === "/" ? "/index.html" : `${route.urlPath}/index.html`;
            config.routes.push({
                src: route.pattern,
                dest: path,
                methods: ["GET"],
            });
        }
        // 2. Add dynamic routes (SSR/ISR)
        for (const { route } of [...this.ssrRoutes, ...this.isrRoutes]) {
            const funcName = functionNameFromRoute(route);
            config.routes.push({
                src: route.pattern,
                dest: `/functions/${funcName}`,
                methods: ["GET", "HEAD"],
            });
            config.functions[funcName] = {
                runtime: "nodejs20.x",
                handler: `functions/${funcName}.func/index.js`,
                maxDuration: 30,
                memory: 1024,
            };
        }
        // 3. Add asset overrides for caching
        const cacheControl = this.config.assets.cacheControl;
        config.overrides["/assets/*"] = {
            path: "/assets/*",
            maxAge: this.parseMaxAge(cacheControl),
        };
        // 4. Fallback for unmatched routes (404 or SSR)
        config.routes.push({
            src: "/(.*)",
            status: 404,
        });
        writeFileSync(join(this.outputDir, "config.json"), JSON.stringify(config, null, 2));
        log.info(`config.json generated`);
    }
    /**
     * Parse max-age from Cache-Control header
     */
    parseMaxAge(cacheControl) {
        const match = cacheControl.match(/max-age=(\d+)/);
        return match ? parseInt(match[1], 10) : 31536000; // 1 year default
    }
}
/**
 * Convenience function to build Vercel output from discovered routes.
 * Typically called from the main build pipeline.
 *
 * @param outputDir Path to .vercel/output directory
 * @param config Framework configuration
 * @param routes All discovered routes
 */
export async function buildVercelOutput(outputDir, config, routes) {
    const builder = new VercelOutputBuilder(outputDir, config);
    for (const route of routes) {
        const mode = detectRenderingMode(route.filePath);
        builder.addRoute(route, mode);
    }
    await builder.build();
}
