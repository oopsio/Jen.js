import type { FrameworkConfig } from "../core/config.js";
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
export declare function buildSite(opts: {
    config: FrameworkConfig;
}): Promise<void>;
