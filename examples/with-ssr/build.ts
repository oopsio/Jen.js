/**
 * Entry point for static site generation (SSG) build process.
 * This script:
 * 1. Imports the framework configuration from jen.config.js
 * 2. Scans all route files in the configured site directory
 * 3. Pre-renders each route to static HTML at build time
 * 4. Outputs final HTML files to the configured dist directory
 *
 * Used for building static-first applications with no runtime server needed.
 * Useful for SEO, performance, and deployment to CDNs.
 */

import config from "./jen.config.js";
import { buildSite } from "../../src/build/build.js";

await buildSite({ config });
