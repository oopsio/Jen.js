import { join } from "node:path";
/**
 * Resolve an absolute path relative to the configured site directory.
 * Used throughout the framework to locate source files, assets, pages, and other site content.
 *
 * The site directory is typically where user-written code (pages, routes, components, etc.) resides.
 * This function ensures consistent path resolution across different environments and working directories.
 *
 * @param config Framework configuration object containing the siteDir path.
 * @param p Path segments to join with the site directory. Can be multiple arguments.
 * @returns Absolute file system path.
 *
 * @example
 * const config = { siteDir: 'src' };
 * resolveSitePath(config, 'pages', 'index.tsx');
 * // Returns: /absolute/path/to/project/src/pages/index.tsx
 */
export function resolveSitePath(config, ...p) {
  return join(process.cwd(), config.siteDir, ...p);
}
/**
 * Resolve an absolute path relative to the configured distribution/build output directory.
 * Used to locate compiled assets, static files, and build artifacts.
 *
 * The distribution directory contains the output of the build process: compiled HTML,
 * CSS, JavaScript bundles, and other files ready for deployment or serving.
 *
 * @param config Framework configuration object containing the distDir path.
 * @param p Path segments to join with the dist directory. Can be multiple arguments.
 * @returns Absolute file system path.
 *
 * @example
 * const config = { distDir: 'dist' };
 * resolveDistPath(config, 'styles.css');
 * // Returns: /absolute/path/to/project/dist/styles.css
 */
export function resolveDistPath(config, ...p) {
  return join(process.cwd(), config.distDir, ...p);
}
