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
import { mkdirSync, rmSync, writeFileSync, existsSync, copyFileSync, readdirSync, statSync, } from "node:fs";
import { join } from "node:path";
import esbuild from "esbuild";
import { createScssCompiler } from "../css/compiler.js";
import { vueEsbuildPlugin, svelteEsbuildPlugin, } from "../compilers/esbuild-plugins.js";
import { scanRoutes } from "../core/routes/scan.js";
import { resolveDistPath } from "../core/paths.js";
import { log } from "../shared/log.js";
import { renderRouteToHtml } from "../runtime/render.js";
/**
 * Recursively copies a directory and all its contents.
 * Used to copy static assets from the source directory to the build output.
 * Creates the destination directory structure as needed.
 *
 * @param src The source directory path.
 * @param dst The destination directory path.
 */
function copyDir(src, dst) {
    if (!existsSync(src))
        return;
    mkdirSync(dst, { recursive: true });
    for (const name of readdirSync(src)) {
        const sp = join(src, name);
        const dp = join(dst, name);
        const st = statSync(sp);
        if (st.isDirectory())
            copyDir(sp, dp);
        else
            copyFileSync(sp, dp);
    }
}
/**
 * Builds a static site by pre-rendering all routes to HTML files.
 * This is the core static site generation (SSG) function that runs at build time.
 * It performs the following steps:
 * 1. Clears the previous build output directory
 * 2. Discovers all route files in the configured site directory
 * 3. Renders each route to a static HTML file
 * 4. Copies static assets from the source directory
 * 5. Bundles Vue and Svelte components for client-side rehydration
 * 6. Compiles SCSS to CSS for the global stylesheet
 *
 * Routes are rendered with empty req/res objects (SSG mode) to avoid middleware execution.
 * This produces pure static HTML that can be served by any web server.
 * Hydration scripts are still injected if the route has hydrate:true, allowing for
 * optional client-side interactivity in otherwise static pages.
 *
 * @param opts Configuration object.
 * @param opts.config The Jen.js framework configuration.
 * @throws Logs warnings for missing assets or component bundling failures but does not stop the build.
 */
export async function buildSite(opts) {
    const { config } = opts;
    // Clear and recreate the dist directory for a clean build.
    const dist = resolveDistPath(config);
    rmSync(dist, { recursive: true, force: true });
    mkdirSync(dist, { recursive: true });
    // Discover all routes and pre-render each to a static HTML file.
    const routes = scanRoutes(config);
    log.info(`Building SSG: ${routes.length} routes`);
    for (const r of routes) {
        // Create a synthetic URL for each route. Used as the request URL during rendering.
        const url = new URL("http://localhost" + r.urlPath);
        // Render the route to HTML. Empty req/res indicates SSG mode (no middleware execution).
        const html = await renderRouteToHtml({
            config,
            route: r,
            req: {},
            res: {},
            url,
            params: {},
            query: {},
            headers: {},
            cookies: {},
        });
        // Calculate output path. Root route goes to index.html, nested routes get their own directories.
        const outPath = r.urlPath === "/"
            ? join(dist, "index.html")
            : join(dist, r.urlPath.slice(1), "index.html");
        mkdirSync(join(outPath, ".."), { recursive: true });
        writeFileSync(outPath, html, "utf8");
        log.info(`SSG: ${r.urlPath} -> ${outPath}`);
    }
    // Copy static assets from the source assets directory to the built site.
    copyDir(join(process.cwd(), config.siteDir, "assets"), join(dist, "assets"));
    // Bundle Vue and Svelte components found in the site directory.
    // These are transpiled to JavaScript modules for client-side use in interactive pages.
    const siteSourceDir = join(process.cwd(), config.siteDir);
    const vueFiles = readdirSync(siteSourceDir, { recursive: true }).filter((f) => String(f).endsWith(".vue") || String(f).endsWith(".svelte"));
    if (vueFiles.length > 0) {
        log.info(`Found ${vueFiles.length} Vue/Svelte components, bundling...`);
        try {
            await esbuild.build({
                entryPoints: vueFiles.map((f) => join(siteSourceDir, String(f))),
                outdir: join(dist, "components"),
                format: "esm",
                target: "es2022",
                bundle: false,
                plugins: [vueEsbuildPlugin(), svelteEsbuildPlugin()],
                external: ["preact", "vue", "svelte"],
                logLevel: "info",
            });
            log.info("Vue/Svelte components bundled successfully.");
        }
        catch (err) {
            log.warn(`Failed to bundle Vue/Svelte components: ${err.message}`);
        }
    }
    // Compile the global SCSS file to CSS.
    // This stylesheet is injected into every page and contains framework-wide styles.
    // Minification is enabled for production builds.
    const scssPath = join(process.cwd(), config.css.globalScss);
    if (existsSync(scssPath)) {
        const compiler = createScssCompiler();
        const result = compiler.compile({
            inputPath: scssPath,
            minified: true,
        });
        if (result.error) {
            log.error(`SCSS Compilation Failed: ${result.error}`);
            writeFileSync(join(dist, "styles.css"), "/* SCSS Compilation Failed */");
        }
        else {
            writeFileSync(join(dist, "styles.css"), result.css);
            log.info(`Compiled global SCSS: ${config.css.globalScss}`);
        }
    }
    else {
        log.warn(`Global SCSS file not found: ${scssPath}`);
        writeFileSync(join(dist, "styles.css"), "/* No global SCSS found */");
    }
    log.info("Build complete.");
}
