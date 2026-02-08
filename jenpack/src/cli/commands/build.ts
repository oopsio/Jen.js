import { resolve, join } from "path";
import { mkdirSync, writeFileSync } from "fs";
import { normalizePath } from "../../utils/path.js";
import {
  info,
  success,
  error as logError,
  time,
  formatSize,
} from "../../utils/log.js";
import { loadConfig } from "../../config.js";
import { createResolver } from "../../resolver/index.js";
import { createModuleGraphBuilder } from "../../core/graph.js";
import { createBundler } from "../../core/bundler.js";
import { BuildCache } from "../../cache/index.js";

interface BuildOptions {
  entry?: string;
  out?: string;
  minify?: boolean;
  sourcemap?: boolean;
}

export async function build(
  entryArg: string | undefined,
  options: BuildOptions = {},
): Promise<void> {
  try {
    const root = process.cwd();
    const config = await loadConfig(root);

    // Override with CLI args
    if (entryArg) {
      config.entry = entryArg;
    }
    if (options.out) {
      config.outDir = options.out;
    }
    if (options.minify !== undefined) {
      config.minify = options.minify;
    }
    if (options.sourcemap !== undefined) {
      config.sourcemap = options.sourcemap;
    }

    const entryPath = resolve(root, config.entry);
    const normalizedEntry = normalizePath(entryPath);
    const outputDir = resolve(root, config.outDir);

    info(`Building ${config.entry}`);
    info(`Output: ${config.outDir}`);
    if (config.minify) info("Minification: enabled");

    // Create output directory
    mkdirSync(outputDir, { recursive: true });

    // Initialize components
    const cache = new BuildCache(".jenpack-cache");
    const resolver = createResolver(root, {
      alias: config.alias,
      external: config.external,
    });

    const graphBuilder = createModuleGraphBuilder(resolver);
    const timer = time("Build");

    try {
      // Build module graph
      const graph = await graphBuilder.build(normalizedEntry);
      info(`Bundling ${graph.modules.size} modules`);

      // Bundle
      const bundler = createBundler(graph, config, cache);
      const result = await bundler.bundle();

      // Write output
      const chunksDir = join(outputDir, "chunks");
      mkdirSync(chunksDir, { recursive: true });

      for (const chunk of result.chunks) {
        const fileName = chunk.name.endsWith(".js")
          ? chunk.name
          : `${chunk.name}.js`;
        const filePath = join(chunksDir, fileName);
        writeFileSync(filePath, chunk.code, "utf8");

        const size = Buffer.byteLength(chunk.code, "utf8");
        success(`  ${fileName} (${formatSize(size)})`);
      }

      // Write manifest
      const manifestPath = join(outputDir, "manifest.json");
      writeFileSync(
        manifestPath,
        JSON.stringify(result.manifest, null, 2),
        "utf8",
      );

      // Write assets
      const assetsDir = join(outputDir, "assets");
      mkdirSync(assetsDir, { recursive: true });

      for (const [id, path] of result.assets) {
        info(`  Asset: ${path}`);
      }

      // Save cache
      await cache.save();

      const elapsed = timer.end();
      success(`Build complete in ${elapsed}ms`);
    } catch (error) {
      logError(`Build failed: ${(error as Error).message}`);
      if ((error as any).stack) {
        logError((error as any).stack);
      }
      process.exit(1);
    }
  } catch (error) {
    logError(`Failed to build: ${(error as Error).message}`);
    process.exit(1);
  }
}
