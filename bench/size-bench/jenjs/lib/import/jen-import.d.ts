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
