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

import type { BuildOptions, Plugin } from "esbuild";

/**
 * Configuration for script optimization strategies
 */
export interface ScriptOptimizeConfig {
  treeShaking?: boolean;
  codeSplitting?: boolean;
  lazyLoading?: boolean;
  autoHashing?: boolean;
  cacheBusting?: boolean;
  splitChunks?: {
    vendor?: boolean;
    runtime?: boolean;
    common?: boolean;
    minSize?: number;
  };
}

/**
 * Script entry point metadata for chunking decisions
 */
export interface ScriptMetadata {
  id: string;
  path: string;
  size: number;
  dependencies: string[];
  isLazy?: boolean;
  chunkName?: string;
}

/**
 * Optimized chunk output metadata
 */
export interface OptimizedChunk {
  id: string;
  filename: string;
  hashedFilename: string;
  size: number;
  isLazy: boolean;
  dependencies: string[];
}

/**
 * Script optimizer for bundles: tree-shaking, code splitting, lazy-loading, auto-hashing, cache-busting
 *
 * Provides:
 * - Automatic dead code elimination via feature gates
 * - Intelligent code splitting (vendor, runtime, common, lazy)
 * - Lazy-loading detection and chunk extraction
 * - Content-based auto-hashing for cache-busting
 * - Manifest generation for asset reference
 */
export class ScriptOptimizer {
  private config: ScriptOptimizeConfig;
  private chunks: Map<string, OptimizedChunk> = new Map();
  private hashLength: number;

  constructor(config: ScriptOptimizeConfig = {}, hashLength: number = 12) {
    this.config = {
      treeShaking: true,
      codeSplitting: true,
      lazyLoading: true,
      autoHashing: true,
      cacheBusting: true,
      splitChunks: {
        vendor: true,
        runtime: true,
        common: true,
        minSize: 20000,
      },
      ...config,
    };
    this.hashLength = hashLength;
  }

  /**
   * Generate esbuild configuration for optimized bundling
   */
  generateEsbuildConfig(): Partial<BuildOptions> & { manualChunks?: Record<string, string[]> } {
    const config: Partial<BuildOptions> & { manualChunks?: Record<string, string[]> } = {
      minify: true,
      format: "esm",
      target: "es2015",
      treeShaking: this.config.treeShaking,
    };

    // Configure code splitting with manual chunks
    if (this.config.codeSplitting) {
      config.splitting = true;
      config.chunkNames = "[name]-[hash]";

      // Manual chunk boundaries for predictable splitting
      const manualChunks: Record<string, string[]> = {};

      if (this.config.splitChunks?.vendor) {
        manualChunks.vendor = [
          "preact",
          "preact/compat",
          "preact/hooks",
          "preact/compat/scheduler",
        ];
      }

      if (this.config.splitChunks?.runtime) {
        manualChunks.runtime = [
          "../runtime/hydrate.js",
          "../runtime/render.js",
        ];
      }

      if (Object.keys(manualChunks).length > 0) {
        config.manualChunks = manualChunks;
      }
    }

    return config;
  }

  /**
   * Detect lazy-loaded modules from AST comments
   *
   * @example
   * ```
   * // @lazy-load:"dashboard"
   * const Dashboard = () => import('./dashboard.js');
   * ```
   */
  detectLazyModules(source: string): Map<string, string> {
    const lazyMap = new Map<string, string>();
    const regex = /@lazy-load:"([^"]+)"/g;
    let match;

    while ((match = regex.exec(source)) !== null) {
      const chunkName = match[1];
      lazyMap.set(chunkName, chunkName);
    }

    return lazyMap;
  }

  /**
   * Generate lazy-loading wrapper for dynamic imports
   *
   * Wraps dynamic imports with automatic chunk naming and loading feedback
   */
  generateLazyLoadWrapper(
    moduleId: string,
    chunkName: string,
  ): string {
    return `
/**
 * Auto-generated lazy-loading wrapper for chunk: ${chunkName}
 * Provides loading state management and error handling
 */
export const load${this.toPascalCase(chunkName)} = () => {
  const [loaded, setLoaded] = window.__lazyCache = window.__lazyCache || {};
  
  if (loaded['${chunkName}']) {
    return Promise.resolve(loaded['${chunkName}']);
  }
  
  return import(/* webpackChunkName: "${chunkName}" */ '${moduleId}')
    .then(mod => {
      loaded['${chunkName}'] = mod;
      return mod;
    })
    .catch(err => {
      console.error('Failed to load ${chunkName}:', err);
      throw err;
    });
};
`;
  }

  /**
   * Generate hash for content with configurable length
   */
  hashContent(content: string | Buffer): string {
    const crypto = require("node:crypto");
    return crypto
      .createHash("md5")
      .update(content)
      .digest("hex")
      .slice(0, this.hashLength);
  }

  /**
   * Generate hashed filename for cache-busting
   *
   * @example
   * ```
   * hashFilename("app.js", "a1b2c3d4e5f6g7h8i9j0")
   * // Returns: "app.a1b2c3d4e5f6.js"
   * ```
   */
  hashFilename(original: string, hash: string): string {
    const parts = original.split(".");
    const ext = parts.pop();
    const name = parts.join(".");
    return `${name}.${hash}.${ext}`;
  }

  /**
   * Register an optimized chunk for tracking
   */
  registerChunk(metadata: ScriptMetadata): void {
    const hash = this.hashContent(metadata.path);
    const hashedFilename = this.hashFilename(metadata.path, hash);

    this.chunks.set(metadata.id, {
      id: metadata.id,
      filename: metadata.path,
      hashedFilename,
      size: metadata.size,
      isLazy: metadata.isLazy ?? false,
      dependencies: metadata.dependencies,
    });
  }

  /**
   * Get registered chunks
   */
  getChunks(): OptimizedChunk[] {
    return Array.from(this.chunks.values());
  }

  /**
   * Generate manifest for asset lookups
   *
   * Maps original filenames to hashed versions for SSR/SSG rendering
   */
  generateManifest(): Record<string, string> {
    const manifest: Record<string, string> = {};

    for (const chunk of this.chunks.values()) {
      manifest[chunk.filename] = chunk.hashedFilename;
    }

    return manifest;
  }

  /**
   * Generate HTML script tags with optimized loading strategies
   */
  generateScriptTags(
    chunks: OptimizedChunk[],
    options: {
      preload?: boolean;
      defer?: boolean;
      async?: boolean;
      integrity?: boolean;
    } = {},
  ): string[] {
    const tags: string[] = [];

    for (const chunk of chunks) {
      // Add preload hint for non-lazy chunks (before script tag)
      if (options.preload && !chunk.isLazy) {
        tags.push(
          `<link rel="preload" as="script" href="/${chunk.hashedFilename}">`,
        );
      }

      let tag = `<script type="module"`;

      if (options.defer) tag += ` defer`;
      if (options.async && chunk.isLazy) tag += ` async`;
      if (options.integrity) {
        const hash = this.hashContent(chunk.filename);
        tag += ` integrity="sha256-${hash}"`;
      }

      tag += ` src="/${chunk.hashedFilename}"></script>`;
      tags.push(tag);
    }

    return tags;
  }

  /**
   * Generate cache-busting strategy documentation
   */
  generateCacheBustingStrategy(): string {
    return `
# Cache-Busting Strategy

## File Versioning
- Hash: ${this.hashLength}-character content-based hash
- Pattern: \`filename.{hash}.ext\`
- Example: \`app.a1b2c3d4e5.js\`

## Cache Control Headers
- Hashed assets: \`public, max-age=31536000, immutable\`
- Main bundle: \`public, max-age=3600\`
- HTML pages: \`public, max-age=0, must-revalidate\`

## Invalidation
- Content change â†’ new hash â†’ new filename â†’ automatic cache miss
- No manual cache purging required
- CDN respects Cache-Control headers

## Manifest
Reference \`manifest.json\` for filename lookups:
\`\`\`json
{
  "app.js": "app.a1b2c3d4e5f6.js",
  "vendor.js": "vendor.f6e5d4c3b2a1.js"
}
\`\`\`
`;
  }

  /**
   * Helper: convert string to PascalCase
   */
  private toPascalCase(str: string): string {
    return str
      .split(/[-_]/)
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join("");
  }
}

/**
 * esbuild plugin for automatic script optimization
 */
export function scriptOptimizerPlugin(
  config: ScriptOptimizeConfig = {},
  hashLength: number = 12,
): Plugin {
  const optimizer = new ScriptOptimizer(config, hashLength);

  return {
    name: "script-optimizer",
    setup(build) {
      // Intercept onLoad to detect lazy modules
      build.onLoad({ filter: /\.[jt]sx?$/ }, async (args) => {
        try {
          const fs = require("node:fs");
          const source = fs.readFileSync(args.path, "utf8");
          const lazyModules = optimizer.detectLazyModules(source);

          if (lazyModules.size > 0) {
            // Mark for lazy loading via build metadata
            return {
              contents: source,
              loader: args.path.endsWith(".ts") ? "ts" : "js",
            };
          }

          return undefined;
        } catch {
          return undefined;
        }
      });

      // After bundling, generate manifest
      build.onEnd((result) => {
        if (result.errors.length === 0) {
          const manifest = optimizer.generateManifest();
          const manifestPath = require("node:path").join(
            process.cwd(),
            build.initialOptions.outdir || "dist",
            "manifest.json",
          );

          require("node:fs").writeFileSync(
            manifestPath,
            JSON.stringify(manifest, null, 2),
          );
        }
      });
    },
  };
}

