import { buildSync } from "esbuild";
import { pathToFileURL } from "node:url";
import { join, resolve, extname } from "node:path";
import { mkdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { log } from "../shared/log.js";
import {
  vueEsbuildPlugin,
  svelteEsbuildPlugin,
} from "../compilers/esbuild-plugins.js";

/**
 * Cached import metadata for a dynamically imported module.
 * Tracks both the module object and an ETag for cache invalidation.
 */
interface ImportCache {
  /** The imported module object (exports). */
  module: any;
  /** SHA1 hash of the compiled module for change detection. */
  etag: string;
}

/** In-memory cache mapping file paths to imported modules. Enables fast repeated imports. */
const importCache = new Map<string, ImportCache>();

/**
 * Resolve the cache directory path for a compiled module.
 * Uses a flattened naming scheme to work reliably on Windows and other systems.
 * Compiled modules are cached in node_modules/.jen/import-cache and are typically .gitignored.
 *
 * @param filePath The absolute path to the original source file.
 * @returns The absolute path to the cached compiled .mjs file.
 */
function getCachePath(filePath: string): string {
  const cacheDir = join(process.cwd(), "node_modules", ".jen", "import-cache");
  if (!existsSync(cacheDir)) {
    mkdirSync(cacheDir, { recursive: true });
  }
  const flatName = filePath.replace(/[\\/:]/g, "_").replace(/^_+/, "");
  return join(cacheDir, flatName + ".mjs");
}

/**
 * Generate an ETag hash for a file to detect changes.
 * Uses SHA1 for speed and sufficient collision resistance for this use case.
 *
 * @param content The file content to hash.
 * @returns A 40-character hex string representing the hash.
 */
function generateEtag(content: string): string {
  return createHash("sha1").update(content).digest("hex");
}

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
export async function jenImport(
  specifier: string,
  opts?: {
    baseDir?: string;
    cache?: boolean;
    forceRecompile?: boolean;
  },
): Promise<any> {
  const baseDir = opts?.baseDir ?? process.cwd();
  const useCache = opts?.cache !== false;
  const forceRecompile = opts?.forceRecompile ?? false;

  try {
    // Resolve the file path relative to baseDir
    const filePath = resolve(baseDir, specifier);
    const ext = extname(filePath);

    // Check cache first if enabled and not forcing recompile
    if (useCache && !forceRecompile && importCache.has(filePath)) {
      log.info(`[jen.import] Cache hit: ${specifier}`);
      return importCache.get(filePath)!.module;
    }

    const isVue = ext === ".vue";
    const isSvelte = ext === ".svelte";
    const isTs = ext === ".ts" || ext === ".tsx";

    // Validate file type
    if (!isVue && !isSvelte && !isTs && ext !== ".js" && ext !== ".jsx") {
      throw new Error(
        `Unsupported file type: ${ext}. Supported: .vue, .svelte, .ts, .tsx, .js, .jsx`,
      );
    }

    log.info(`[jen.import] Loading: ${specifier} (${ext})`);

    const outfile = getCachePath(filePath);

    // Transpile the module using esbuild with appropriate plugins
    // Platform is set to "browser" for client-side components
    // Bundle is false to preserve imports and enable tree-shaking
    const result = buildSync({
      entryPoints: [filePath],
      outfile,
      format: "esm",
      platform: "browser",
      target: "es2022",
      bundle: false, // Don't bundle to preserve imports
      write: true,
      plugins: [vueEsbuildPlugin(), svelteEsbuildPlugin()],
      external: [
        "preact",
        "preact/hooks",
        "preact/jsx-runtime",
        "preact-render-to-string",
        "vue",
        "svelte",
      ],
      logLevel: "error",
      define: {
        "process.env.NODE_ENV": JSON.stringify("development"),
      },
    });

    // Dynamic import with cache-busting query parameter
    // Prevents Node.js from caching the old module on repeated imports
    const moduleUrl = pathToFileURL(outfile).href + "?t=" + Date.now();
    const mod = await import(moduleUrl);

    // Cache the imported module if caching is enabled
    if (useCache) {
      importCache.set(filePath, {
        module: mod,
        etag: generateEtag(outfile),
      });
    }

    log.info(`[jen.import] Successfully loaded: ${specifier}`);

    return mod;
  } catch (err: any) {
    const message = err.message || String(err);
    log.error(`[jen.import] Failed to import "${specifier}": ${message}`);
    throw new Error(`jen.import() failed for "${specifier}": ${message}`);
  }
}

/**
 * Invalidate the import cache for a specific file.
 * Forces the next import to recompile the module from source.
 * Useful during development when code changes frequently and cache may be stale.
 *
 * @param specifier File path (relative to process.cwd()) to invalidate.
 */
export function invalidateImportCache(specifier: string): void {
  const filePath = resolve(process.cwd(), specifier);
  importCache.delete(filePath);
  log.info(`[jen.import] Cache invalidated: ${specifier}`);
}

/**
 * Clear all import caches completely.
 * Forces all subsequent imports to recompile from source.
 * Should be called sparingly; typically used when restarting the development server.
 */
export function clearImportCache(): void {
  importCache.clear();
  log.info(`[jen.import] All caches cleared`);
}

/**
 * Global jen namespace providing access to jen.import() for dynamic module loading.
 * Can be used as an alternative to calling jenImport() directly.
 *
 * @example
 * import { jen } from '../import/jen-import';
 * const Component = await jen.import('./Component.vue');
 */
export const jen = {
  import: jenImport,
};
