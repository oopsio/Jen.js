import { resolve } from "path";
import { normalizePath } from "../../utils/path.js";
import { info, success, error as logError, time } from "../../utils/log.js";
import { loadConfig } from "../../config.js";
import { createResolver } from "../../resolver/index.js";
import { createModuleGraphBuilder } from "../../core/graph.js";
import { createBundler } from "../../core/bundler.js";
import { createDevServer } from "../../server/dev-server.js";
import { createWatcher } from "../../server/watcher.js";
import { BuildCache } from "../../cache/index.js";

interface DevOptions {
  entry?: string;
  port?: number;
  host?: string;
}

export async function dev(
  entryArg: string | undefined,
  options: DevOptions = {},
): Promise<void> {
  try {
    const root = process.cwd();
    const config = await loadConfig(root);

    // Override with CLI args
    if (entryArg) {
      config.entry = entryArg;
    }
    if (options.port) {
      // Store port for server
    }
    if (options.host) {
      // Store host for server
    }

    const entryPath = resolve(root, config.entry);
    const normalizedEntry = normalizePath(entryPath);

    info(`Starting dev server for ${config.entry}`);

    // Initialize components
    const cache = new BuildCache(".jenpack-cache");
    const resolver = createResolver(root, {
      alias: config.alias,
      external: config.external,
    });

    const graphBuilder = createModuleGraphBuilder(resolver);
    const devServer = createDevServer({
      port: options.port || 3000,
      host: options.host || "0.0.0.0",
      config,
    });

    const watcher = createWatcher({
      root,
      ignoreInitial: true,
    });

    // Initial build
    const timer = time("Initial build");
    try {
      const graph = await graphBuilder.build(normalizedEntry);
      const bundler = createBundler(graph, config, cache);
      const result = await bundler.bundle();

      if (result.chunks.length > 0) {
        devServer.setBundleCode(result.chunks[0].code);
        devServer.setModuleGraph(graph);
      }

      const elapsed = timer.end();
      success(`Initial build complete in ${elapsed}ms`);
    } catch (error) {
      logError(`Build failed: ${(error as Error).message}`);
    }

    // Start dev server
    await devServer.listen();

    // Start file watcher
    let rebuildTimer: any = null;
    let pendingRebuild = false;

    watcher.onChange((path, type) => {
      if (type === "change" || type === "add" || type === "unlink") {
        if (rebuildTimer) {
          pendingRebuild = true;
          return;
        }

        info(`File changed: ${path}`);
        pendingRebuild = false;

        // Debounce rebuilds
        rebuildTimer = setTimeout(async () => {
          rebuildTimer = null;

          const rebuildTimer2 = time("Rebuild");
          try {
            // Clear resolver cache for changed files
            resolver.clearCache();

            const graph = await graphBuilder.build(normalizedEntry);
            const bundler = createBundler(graph, config, cache);
            const result = await bundler.bundle();

            if (result.chunks.length > 0) {
              devServer.setBundleCode(result.chunks[0].code);
              devServer.setModuleGraph(graph);
            }

            const elapsed = rebuildTimer2.end();
            success(`Rebuild complete in ${elapsed}ms`);

            if (pendingRebuild) {
              pendingRebuild = false;
              watcher.onChange((p) => {
                if (p === path) {
                  // Trigger another rebuild
                }
              });
            }
          } catch (error) {
            logError(`Rebuild failed: ${(error as Error).message}`);
          }
        }, 300);
      }
    });

    await watcher.watch();

    // Handle graceful shutdown
    process.on("SIGINT", async () => {
      info("Shutting down...");
      await watcher.close();
      await devServer.close();
      await cache.save();
      process.exit(0);
    });
  } catch (error) {
    logError(`Failed to start dev server: ${(error as Error).message}`);
    process.exit(1);
  }
}
