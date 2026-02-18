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
 * Universal module importer for Vue, Svelte, and regular JS/TS
 *
 * @example
 * const Button = await jen.import("./components/Button.vue");
 * const Card = await jen.import("./ui/Card.svelte");
 * const Utils = await jen.import("./utils.ts");
 */
export declare function jenImport(
  specifier: string,
  opts?: {
    baseDir?: string;
    cache?: boolean;
    forceRecompile?: boolean;
  },
): Promise<any>;
/**
 * Clear import cache for a specific file
 */
export declare function invalidateImportCache(specifier: string): void;
/**
 * Clear all import caches
 */
export declare function clearImportCache(): void;
/**
 * Export as global jen.import if needed
 */
export declare const jen: {
  import: typeof jenImport;
};
