/**
 * Fonts module for Jen.js
 * Provides support for local and Google Fonts with automatic injection
 * into SSR/SSG/ISR rendered pages.
 *
 * @example
 * ```typescript
 * // In jen.config.ts:
 * import type { FrameworkConfig } from "jenjs";
 *
 * export default {
 *   fonts: {
 *     local: ["site/fonts/Inter-Regular.woff2"],
 *     google: ["Roboto:400,700"],
 *     preload: true,
 *     display: "swap"
 *   },
 *   // ... rest of config
 * } satisfies FrameworkConfig;
 * ```
 *
 * The fonts are automatically injected during build and server initialization.
 * To customize injection behavior, use the low-level API:
 *
 * @example
 * ```typescript
 * // In build.js or custom script:
 * import { extractFonts } from "../fonts/loader.js";
 * import { fontServeMiddleware } from "../fonts/inject.js";
 *
 * // Get fonts without auto-injection
 * const { googleFontLinks, localFontsCSS } = extractFonts(fontsConfig, ".jen");
 *
 * // Customize before injecting
 * const customCSS = localFontsCSS.replace(/display: swap/g, "display: optional");
 *
 * // Serve fonts with custom middleware
 * const serveFonts = fontServeMiddleware("./.jen/cache/fonts");
 * ```
 */

export type { FontsConfig } from "./types.js";
export { injectFonts, fontServeMiddleware } from "./inject.js";
export {
  processFonts,
  generateGoogleFontLinks,
  extractFonts,
} from "./loader.js";
