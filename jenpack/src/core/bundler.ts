import { mkdirSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import type {
  Module,
  ModuleGraph,
  Chunk,
  BuildResult,
  BuildManifest,
  ModuleManifestEntry,
} from "../types.js";
import { transformFileSync } from "../swc/transform.js";
import { computeHash } from "../utils/hash.js";
import {
  normalizePath,
  isJsonFile,
  isCssFile,
  isAssetFile,
} from "../utils/path.js";
import { formatSize, info, success } from "../utils/log.js";
import { computeFileHash, BuildCache } from "../cache/index.js";

export class Bundler {
  private moduleGraph: ModuleGraph;
  private cache: BuildCache;
  private config: any;

  constructor(moduleGraph: ModuleGraph, config: any, cache: BuildCache) {
    this.moduleGraph = moduleGraph;
    this.cache = cache;
    this.config = config;
  }

  async bundle(): Promise<BuildResult> {
    const startTime = Date.now();
    const chunks: Chunk[] = [];
    const assets = new Map<string, string>();
    const errors: any[] = [];

    const modules = this.moduleGraph.modules;

    // Separate modules by type
    const jsModules: Module[] = [];
    const cssModules: Module[] = [];
    const assetModules: Module[] = [];

    for (const module of modules.values()) {
      if (module.type === "asset" || isAssetFile(module.path)) {
        assetModules.push(module);
      } else if (module.type === "css" || isCssFile(module.path)) {
        cssModules.push(module);
      } else {
        jsModules.push(module);
      }
    }

    // Bundle JS modules into chunks
    if (jsModules.length > 0) {
      const jsChunk = this.bundleJSModules(jsModules);
      chunks.push(jsChunk);
    }

    // Bundle CSS modules
    if (cssModules.length > 0) {
      const cssChunk = this.bundleCSSModules(cssModules);
      chunks.push(cssChunk);
    }

    // Process assets
    for (const module of assetModules) {
      assets.set(module.path, module.path);
    }

    const manifest = this.generateManifest(chunks, assets, modules);

    return {
      chunks,
      assets,
      manifest,
      errors,
      duration: Date.now() - startTime,
    };
  }

  private bundleJSModules(modules: Module[]): Chunk {
    const code = this.generateBundleCode(modules);
    const hash = computeHash(code);
    const name = `bundle.${hash}`;

    return {
      id: name,
      name,
      modules,
      imports: [],
      code,
      hash,
    };
  }

  private bundleCSSModules(modules: Module[]): Chunk {
    let css = "";

    for (const module of modules) {
      css += module.source + "\n";
    }

    const code = css;
    const hash = computeHash(code);
    const name = `styles.${hash}`;

    return {
      id: name,
      name,
      modules,
      imports: [],
      code,
      hash,
    };
  }

  private generateBundleCode(modules: Module[]): string {
    const moduleMap: Record<string, string> = {};
    const importMap: Record<string, string[]> = {};

    // Transform all modules
    for (const module of modules) {
      try {
        const fileHash = computeFileHash(module.path, module.source);
        let code = module.source;

        // Check cache
        const cached = this.cache.get(module.path, fileHash);
        if (cached) {
          code = cached.code;
        } else {
          // Transform module
          const result = transformFileSync(module.source, {
            filename: module.path,
            isModule: true,
            jsxImportSource: this.config.jsxImportSource || "preact",
            minify: this.config.minify || false,
            sourcemap: this.config.sourcemap || false,
          });
          code = result.code;
          module.transformed = code;

          // Cache result
          this.cache.set(module.path, {
            hash: fileHash,
            code,
            map: result.map,
            timestamp: Date.now(),
          });
        }

        // Rewrite imports
        for (const [specifier, resolved] of module.dependencies) {
          const rewriteFrom = new RegExp(
            `from\\s+["']${specifier.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`,
            "g",
          );
          code = code.replace(rewriteFrom, `from "${resolved}"`);

          const importFrom = new RegExp(
            `import\\s+["']${specifier.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`,
            "g",
          );
          code = code.replace(importFrom, `import "${resolved}"`);
        }

        moduleMap[module.path] = code;
        importMap[module.path] = module.imports;
      } catch (error) {
        moduleMap[module.path] = `export {};`;
      }
    }

    // Generate bundle
    let bundle = "";

    // Add module registry
    bundle += `const __modules = {};\n`;
    bundle += `const __cache = {};\n\n`;

    // Add module definitions
    for (const [path, code] of Object.entries(moduleMap)) {
      bundle += `__modules[${JSON.stringify(path)}] = function(module, exports, require) {\n`;
      bundle += code;
      bundle += `\n};\n\n`;
    }

    // Add require function
    bundle += `function __require(id) {\n`;
    bundle += `  if (__cache[id]) return __cache[id].exports;\n`;
    bundle += `  const module = { exports: {} };\n`;
    bundle += `  const fn = __modules[id];\n`;
    bundle += `  if (!fn) throw new Error('Module not found: ' + id);\n`;
    bundle += `  fn(module, module.exports, __require);\n`;
    bundle += `  __cache[id] = module;\n`;
    bundle += `  return module.exports;\n`;
    bundle += `}\n\n`;

    // Export entry
    const entry = this.moduleGraph.entryModule;
    if (entry) {
      bundle += `export default __require(${JSON.stringify(entry.path)});\n`;
    }

    return bundle;
  }

  private generateManifest(
    chunks: Chunk[],
    assets: Map<string, string>,
    modules: Map<string, Module>,
  ): BuildManifest {
    const manifest: BuildManifest = {
      version: "1.0.0",
      timestamp: Date.now(),
      chunks: {},
      assets: {},
      modules: {},
    };

    for (const chunk of chunks) {
      const size = Buffer.byteLength(chunk.code, "utf8");
      manifest.chunks[chunk.id] = {
        file: `${chunk.name}.js`,
        name: chunk.name,
        modules: chunk.modules.map((m) => m.path),
        imports: chunk.imports,
        hash: chunk.hash,
        size,
      };
    }

    for (const [id, path] of assets) {
      manifest.assets[id] = path;
    }

    for (const [id, module] of modules) {
      const entry: ModuleManifestEntry = {
        id: module.id,
        path: module.path,
        chunk: chunks.find((c) => c.modules.includes(module))?.id || "unknown",
        dependencies: Array.from(module.dependencies.keys()),
        size: Buffer.byteLength(module.source, "utf8"),
        hash: module.hash,
      };
      manifest.modules[id] = entry;
    }

    return manifest;
  }

  async write(outputDir: string): Promise<void> {
    // This will be implemented in the build command
    mkdirSync(outputDir, { recursive: true });
  }
}

export function createBundler(
  moduleGraph: ModuleGraph,
  config: any,
  cache: BuildCache,
): Bundler {
  return new Bundler(moduleGraph, config, cache);
}
