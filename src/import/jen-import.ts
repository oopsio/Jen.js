import { buildSync } from "esbuild";
import { pathToFileURL } from "node:url";
import { join, resolve, extname } from "node:path";
import { mkdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { log } from "../shared/log.js";
import { vueEsbuildPlugin, svelteEsbuildPlugin } from "../compilers/esbuild-plugins.js";

interface ImportCache {
  module: any;
  etag: string;
}

const importCache = new Map<string, ImportCache>();

function getCachePath(filePath: string): string {
  const cacheDir = join(process.cwd(), "node_modules", ".jen", "import-cache");
  if (!existsSync(cacheDir)) {
    mkdirSync(cacheDir, { recursive: true });
  }
  const flatName = filePath.replace(/[\\/:]/g, "_").replace(/^_+/, "");
  return join(cacheDir, flatName + ".mjs");
}

function generateEtag(content: string): string {
  return createHash("sha1").update(content).digest("hex");
}

/**
 * Universal module importer for Vue, Svelte, and regular JS/TS
 * 
 * @example
 * const Button = await jen.import("./components/Button.vue");
 * const Card = await jen.import("./ui/Card.svelte");
 * const Utils = await jen.import("./utils.ts");
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
    // Resolve the file path
    const filePath = resolve(baseDir, specifier);
    const ext = extname(filePath);

    // Check cache first
    if (useCache && !forceRecompile && importCache.has(filePath)) {
      log.info(`[jen.import] Cache hit: ${specifier}`);
      return importCache.get(filePath)!.module;
    }

    const isVue = ext === ".vue";
    const isSvelte = ext === ".svelte";
    const isTs = ext === ".ts" || ext === ".tsx";

    if (!isVue && !isSvelte && !isTs && ext !== ".js" && ext !== ".jsx") {
      throw new Error(
        `Unsupported file type: ${ext}. Supported: .vue, .svelte, .ts, .tsx, .js, .jsx`,
      );
    }

    log.info(`[jen.import] Loading: ${specifier} (${ext})`);

    const outfile = getCachePath(filePath);

    // Build with appropriate plugins
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

    // Dynamic import with cache-busting
    const moduleUrl = pathToFileURL(outfile).href + "?t=" + Date.now();
    const mod = await import(moduleUrl);

    // Cache the imported module
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
 * Clear import cache for a specific file
 */
export function invalidateImportCache(specifier: string): void {
  const filePath = resolve(process.cwd(), specifier);
  importCache.delete(filePath);
  log.info(`[jen.import] Cache invalidated: ${specifier}`);
}

/**
 * Clear all import caches
 */
export function clearImportCache(): void {
  importCache.clear();
  log.info(`[jen.import] All caches cleared`);
}

/**
 * Export as global jen.import if needed
 */
export const jen = {
  import: jenImport,
};
