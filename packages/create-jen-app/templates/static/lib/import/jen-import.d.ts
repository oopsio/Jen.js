/**
 * Universal module importer for Vue, Svelte, and regular JS/TS files.
 * Handles transpilation and caching to enable dynamic imports of framework components
 * and utility modules with automatic compilation.
 *
 * Supported file types: .vue, .svelte, .ts, .tsx, .js, .jsx.
 * Transpilation is performed using esbuild with Vue and Svelte plugins.
 * Compiled modules are cached in node_modules/.jen/import-cache for fast subsequent loads.
 *
 * @param specifier File path relative to baseDir (typically process.cwd() or a component directory).
 * @param opts Import options.
 * @param opts.baseDir Base directory for relative path resolution. Defaults to process.cwd().
 * @param opts.cache Whether to use in-memory cache. Defaults to true.
 * @param opts.forceRecompile If true, bypass cache and recompile the module.
 * @returns The imported module object (exports).
 * @throws Error if the file type is unsupported, the file cannot be read, or transpilation fails.
 *
 * @example
 * const Button = await jenImport("./components/Button.vue");
 * const Card = await jenImport("./ui/Card.svelte");
 * const Utils = await jenImport("./utils.ts", { cache: true });
 * const Fresh = await jenImport("./component.tsx", { forceRecompile: true });
 */
export declare function jenImport(specifier: string, opts?: {
    baseDir?: string;
    cache?: boolean;
    forceRecompile?: boolean;
}): Promise<any>;
/**
 * Invalidate the import cache for a specific file.
 * Forces the next import to recompile the module from source.
 * Useful during development when code changes frequently and cache may be stale.
 *
 * @param specifier File path (relative to process.cwd()) to invalidate.
 */
export declare function invalidateImportCache(specifier: string): void;
/**
 * Clear all import caches completely.
 * Forces all subsequent imports to recompile from source.
 * Should be called sparingly; typically used when restarting the development server.
 */
export declare function clearImportCache(): void;
/**
 * Global jen namespace providing access to jen.import() for dynamic module loading.
 * Can be used as an alternative to calling jenImport() directly.
 *
 * @example
 * import { jen } from '@src/import/jen-import';
 * const Component = await jen.import('./Component.vue');
 */
export declare const jen: {
    import: typeof jenImport;
};
