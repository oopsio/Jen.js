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

import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { basename, extname, join, resolve } from "node:path";
import { log } from "../shared/log.js";
import type { FontsConfig } from "./types.js";

/**
 * Processes and copies local font files to cache directory.
 * Generates @font-face CSS for each font file.
 * Supports .ttf, .woff, .woff2, .otf formats.
 *
 * @param config Fonts configuration from jen.config
 * @param cacheDir Directory to store cached fonts (usually .jen/cache/fonts)
 * @returns CSS string with @font-face declarations for all local fonts
 *
 * @hackable Override or extend this in build scripts:
 * ```typescript
 * import { processFonts } from "../fonts/loader.js";
 * const css = processFonts(config, customCacheDir);
 * // Modify CSS as needed before injecting
 * ```
 */
export function processFonts(
  config: FontsConfig | undefined,
  cacheDir: string,
): string {
  if (!config?.local || config.local.length === 0) {
    return "";
  }

  const fontCacheDir = join(cacheDir, "fonts");
  mkdirSync(fontCacheDir, { recursive: true });

  let css = "";
  const fontWeightMap: Record<string, string> = {
    thin: "100",
    hairline: "100",
    extralight: "200",
    light: "300",
    normal: "400",
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
    black: "900",
  };

  for (const fontPath of config.local) {
    const fullPath = resolve(fontPath);

    if (!existsSync(fullPath)) {
      log.warn(`Font file not found: ${fontPath}`);
      continue;
    }

    const filename = basename(fontPath);
    const ext = extname(fontPath).toLowerCase();
    const destPath = join(fontCacheDir, filename);

    // Copy font file to cache
    try {
      copyFileSync(fullPath, destPath);
      log.info(`Cached font: ${filename}`);
    } catch (err: any) {
      log.warn(`Failed to copy font ${filename}: ${err.message}`);
      continue;
    }

    // Parse font properties from filename
    // Convention: FontName-Weight-Style.ext or FontName-Weight.ext or FontName.ext
    // Examples: Roboto-Regular.woff2, Roboto-Bold-Italic.woff2, Inter-700.woff2
    const nameWithoutExt = filename.slice(0, -(ext.length));
    const parts = nameWithoutExt.split("-");

    let fontName = parts[0];
    let fontWeight = "400";
    let fontStyle = "normal";

    if (parts.length > 1) {
      const weightPart = parts[1].toLowerCase();
      const stylePart = parts[2]?.toLowerCase() ?? "";

      // Map weight names to numeric values
      if (fontWeightMap[weightPart]) {
        fontWeight = fontWeightMap[weightPart];
      } else if (/^\d+$/.test(weightPart)) {
        fontWeight = weightPart;
      }

      // Detect italic/oblique
      if (stylePart.includes("italic") || weightPart.includes("italic")) {
        fontStyle = "italic";
      } else if (stylePart.includes("oblique") || weightPart.includes("oblique")) {
        fontStyle = "oblique";
      }
    }

    // Map format to correct font type
    const formatMap: Record<string, string> = {
      ".ttf": "truetype",
      ".otf": "opentype",
      ".woff": "woff",
      ".woff2": "woff2",
    };

    const format = formatMap[ext] || "truetype";
    const display = config.display ?? "swap";

    // Generate @font-face rule
    css += `@font-face {
  font-family: "${fontName}";
  src: url("/fonts/${filename}") format("${format}");
  font-weight: ${fontWeight};
  font-style: ${fontStyle};
  font-display: ${display};
}
`;
  }

  return css;
}

/**
 * Generates HTML link tags for Google Fonts.
 * Parses font specifications like "Roboto:400,700" and constructs appropriate URLs.
 * Includes preload links if enabled in config.
 *
 * @param config Fonts configuration from jen.config
 * @returns HTML string with <link> tags for Google Fonts and optional preload links
 *
 * @hackable Override in config or extend in server.js:
 * ```typescript
 * // Custom variant handling or URL construction
 * const links = generateGoogleFontLinks(config);
 * // Modify before injection
 * ```
 */
export function generateGoogleFontLinks(config: FontsConfig | undefined): string {
  if (!config?.google || config.google.length === 0) {
    return "";
  }

  const display = config.display ?? "swap";
  const params = new URLSearchParams();

  // Normalize font specs and extract families
  const families = config.google.map((spec) => {
    const [family, weights] = spec.split(":");
    if (weights) {
      // Convert weight spec like "400,700" or "400,400i,600,700" to Google Fonts format
      // "400" -> "wght@400", "400,700" -> "wght@400;700", "400i" -> "ital,wght@0,400; 1,400"
      const variants = weights.split(",");
      let italic = false;
      let normalWeights: string[] = [];
      let italicWeights: string[] = [];

      for (const v of variants) {
        if (v.includes("i")) {
          italic = true;
          italicWeights.push(v.replace("i", ""));
        } else {
          normalWeights.push(v);
        }
      }

      let spec = `${family}`;
      if (italic) {
        spec += `:ital@1`;
        if (italicWeights.length > 0) spec += `,wght@${italicWeights.join(";")}`;
      }
      if (normalWeights.length > 0) {
        spec += `:wght@${normalWeights.join(";")}`;
      }
      return spec;
    }
    return family;
  });

  params.set("family", families.join("&family="));
  params.set("display", display);

  const googleFontsUrl = `https://fonts.googleapis.com/css2?${params.toString()}`;

  let html = `<link rel="stylesheet" href="${googleFontsUrl}">`;

  // Add preload links if enabled (for critical fonts)
  if (config.preload) {
    const preloadFonts = config.google.slice(0, 2); // Preload first 2 fonts only for performance
    for (const spec of preloadFonts) {
      const [family] = spec.split(":");
      // Preload the most common weight (400)
      html += `\n<link rel="preconnect" href="https://fonts.googleapis.com">`;
      html += `\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`;
    }
  }

  return html;
}

/**
 * Extracts font links and CSS for injection into the HTML <head>.
 * Combines local fonts (@font-face CSS) and Google Fonts (link tags).
 * Fully hackable - can be extended in server.js or build scripts.
 *
 * @param config Fonts configuration from jen.config
 * @param cacheDir Cache directory path for local fonts
 * @returns Object with googleFontLinks and localFontsCSS for head injection
 *
 * @example
 * ```typescript
 * const { googleFontLinks, localFontsCSS } = extractFonts(config, ".jen/cache");
 * // Add custom processing
 * const modifiedCSS = localFontsCSS.replace(/display: swap/g, "display: optional");
 * ```
 */
export function extractFonts(
  config: FontsConfig | undefined,
  cacheDir: string,
): {
  googleFontLinks: string;
  localFontsCSS: string;
} {
  const localFontsCSS = processFonts(config, cacheDir);
  const googleFontLinks = generateGoogleFontLinks(config);

  return {
    googleFontLinks,
    localFontsCSS,
  };
}

