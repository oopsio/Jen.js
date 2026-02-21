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
 * Fonts configuration for Jen.js framework.
 * Supports both local font files and Google Fonts with optional preloading.
 *
 * @example
 * ```typescript
 * fonts: {
 *   local: [
 *     "site/fonts/Roboto-Regular.ttf",
 *     "site/fonts/Roboto-Bold.ttf"
 *   ],
 *   google: ["Roboto:400,700", "Open Sans:400,600"],
 *   preload: true,
 *   display: "swap"  // font-display CSS value
 * }
 * ```
 */
export type FontsConfig = {
  /**
   * Array of local font file paths relative to project root.
   * Files are copied to cache directory during build.
   * Supported formats: .ttf, .woff, .woff2, .otf
   *
   * @example ["site/fonts/Roboto-Regular.woff2", "site/fonts/Roboto-Bold.woff2"]
   */
  local?: string[];

  /**
   * Array of Google Font specifications with weight/style variants.
   * Format: "FontName:weights,variants"
   *
   * @example
   * ["Roboto:400,700", "Open Sans:400,400i,600,700"]
   */
  google?: string[];

  /**
   * Whether to add <link rel="preload"> for fonts.
   * Improves font loading performance for critical fonts.
   * @default false
   */
  preload?: boolean;

  /**
   * CSS font-display value for web fonts (local and Google).
   * Options: "auto" | "block" | "swap" | "fallback" | "optional"
   * @default "swap"
   */
  display?: "auto" | "block" | "swap" | "fallback" | "optional";
};
