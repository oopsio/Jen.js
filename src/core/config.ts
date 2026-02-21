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

/**
 * Rendering mode for routes in the application.
 *
 * - "ssr": Server-side rendering - renders on each request, optimal for dynamic content
 * - "ssg": Static site generation - pre-renders routes at build time, fastest for static content
 * - "isr": Incremental static regeneration - revalidates static pages on demand
 * - "ppr": Partial pre-rendering - mixes static and dynamic content
 */
import type { FeatureConfig } from "./features.js";

export type RenderMode = "ssr" | "ssg" | "isr" | "ppr";

/**
 * Complete configuration schema for the Jen.js framework.
 * This type defines all available configuration options for a Jen.js application.
 * Applications must provide a jen.config.js or jen.config.ts file exporting a FrameworkConfig object.
 *
 * @example
 * ```typescript
 * import type { FrameworkConfig } from "jenjs";
 * export default {
 *   siteDir: "src",
 *   distDir: "dist",
 *   features: {
 *     api: true,
 *     middleware: true,
 *     cache: true,
 *   },
 *   routes: {
 *     fileExtensions: [".tsx", ".ts", ".jsx", ".js"],
 *     routeFilePattern: /^\(([^)]+)\)/,
 *     enableIndexFallback: true
 *   },
 *   // ... rest of config
 * } as FrameworkConfig;
 * ```
 */
export type FrameworkConfig = {
  /**
   * Feature configuration for the framework.
   * Each feature can be enabled/disabled independently.
   * Disabled features are tree-shaken from the build for zero overhead.
   *
   * @example
   * ```typescript
   * features: {
   *   api: true,              // Enable API routes
   *   middleware: true,       // Enable middleware pipeline
   *   markdown: false,        // Disable markdown compilation
   *   cache: true,           // Enable response caching
   *   streaming: true,       // Enable streaming SSR
   * }
   * ```
   */
  features?: FeatureConfig;

  /**
   * Root directory where route files, components, and assets are located.
   * Relative to project root (CWD). Example: "src", "site", "pages".
   */
  siteDir: string;

  /**
   * Output directory for build artifacts (compiled HTML, CSS, JavaScript).
   * Relative to project root. Created automatically if it doesn't exist.
   */
  distDir: string;

  /**
   * Route discovery and file pattern configuration.
   */
  routes: {
    /**
     * File extensions to treat as route files.
     * Examples: [".tsx", ".ts", ".jsx", ".js"]
     */
    fileExtensions: string[];

    /**
     * RegExp pattern to match route file names and extract route segment.
     * Example: /^\(([^)]+)\)/ matches "(home).tsx" and captures "home"
     */
    routeFilePattern: RegExp;

    /**
     * Whether to serve /dir/index.html when accessing /dir/
     */
    enableIndexFallback: boolean;
  };

  /**
   * Default rendering behavior for all routes.
   */
  rendering: {
    /**
     * Default render mode if not specified in route module exports.
     */
    defaultMode: RenderMode;

    /**
     * Default revalidation interval in seconds for ISR mode.
     * Used if route doesn't specify custom revalidateSeconds.
     */
    defaultRevalidateSeconds: number;
  };

  /**
   * HTML content to inject into every rendered page.
   */
  inject: {
    /**
     * Array of HTML strings to inject into <head>.
     * Examples: meta tags, link tags, analytics scripts
     */
    head: string[];

    /**
     * Array of HTML strings to inject before closing </body>.
     * Examples: analytics, logging scripts
     */
    bodyEnd: string[];
  };

  /**
   * CSS and SCSS compilation configuration.
   */
  css: {
    /**
     * Path to global SCSS file to compile to styles.css.
     * Relative to siteDir. Example: "styles/global.scss"
     */
    globalScss: string;

    /**
     * Maximum file size in bytes for critical CSS extraction.
     * CSS larger than this may not be inlined in <head>.
     */
    criticalBudget?: number;

    /**
     * Whether to extract and inline critical CSS for above-the-fold content.
     */
    extractCritical?: boolean;
  };

  /**
   * Static asset serving configuration.
   */
  assets: {
    /**
     * Directory containing public assets that should be copied to dist as-is.
     * Relative to siteDir. Example: "public", "static"
     */
    publicDir: string;

    /**
     * HTTP Cache-Control header value for assets.
     * Example: "public, max-age=31536000" for long-term caching
     */
    cacheControl: string;

    /**
     * Length of hash suffix for versioned asset filenames.
     * Used for cache-busting. Example: 8 produces "app.a1b2c3d4.js"
     */
    hashLength?: number;
  };

  /**
   * HTTP server configuration.
   */
  server: {
    /**
     * Port number for the development server.
     * Example: 3000, 8080
     */
    port: number;

    /**
     * Hostname to bind the development server to.
     * Example: "localhost", "0.0.0.0", "127.0.0.1"
     */
    hostname: string;
  };

  /**
   * Optional build-time optimizations.
   */
  build?: {
    /**
     * Whether to minify HTML output in production builds.
     */
    minifyHtml?: boolean;

    /**
     * Whether to minify CSS output in production builds.
     */
    minifyCss?: boolean;

    /**
     * Whether to minify JavaScript output in production builds.
     */
    minifyJs?: boolean;

    /**
     * Whether to hash asset filenames for cache-busting.
     * Example: "app.abc123.js" instead of "app.js"
     */
    hashAssets?: boolean;

    /**
     * Whether to generate an asset manifest JSON file for reverse lookups.
     */
    generateManifest?: boolean;

    /**
     * Whether to generate a sitemap.xml for SEO.
     */
    generateSitemap?: boolean;

    /**
     * Directory for storing build cache to enable incremental builds.
     */
    cacheDir?: string;

    /**
     * Whether to perform incremental builds (only rebuild changed files).
     */
    incrementalBuild?: boolean;

    /**
     * Whether to generate source maps for debugging in production.
     */
    sourceMap?: boolean;
  };

  /**
   * Optional development server settings.
   */
  dev?: {
    /**
     * Whether to enable server-side rendering in development mode.
     */
    enableSSR?: boolean;

    /**
     * Whether to enable live reload on file changes.
     */
    liveReload?: boolean;

    /**
     * Custom port for development server (overrides server.port).
     */
    port?: number;
  };

  /**
   * Optional SEO and search engine optimization settings.
   */
  seo?: {
    /**
     * Whether to automatically generate robots.txt.
     */
    generateRobotsTxt?: boolean;

    /**
     * Whether to automatically generate sitemap.xml.
     */
    generateSitemap?: boolean;

    /**
     * Base URL for sitemap entries.
     * Example: "https://example.com"
     */
    sitemapBaseUrl?: string;
  };
};
