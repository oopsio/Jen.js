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
 * import { extractFonts } from "@src/fonts/loader.js";
 * import { fontServeMiddleware } from "@src/fonts/inject.js";
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
export { processFonts, generateGoogleFontLinks, extractFonts } from "./loader.js";
