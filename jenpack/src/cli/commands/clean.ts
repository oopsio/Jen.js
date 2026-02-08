import { rmSync, existsSync } from "fs";
import { resolve } from "path";
import { success, error as logError } from "../../utils/log.js";
import { loadConfig } from "../../config.js";

interface CleanOptions {
  all?: boolean;
}

export async function clean(options: CleanOptions = {}): Promise<void> {
  try {
    const root = process.cwd();
    const config = await loadConfig(root);

    // Remove cache
    const cacheDir = resolve(root, ".jenpack-cache");
    if (existsSync(cacheDir)) {
      rmSync(cacheDir, { recursive: true, force: true });
      success("Cleaned cache");
    }

    // Remove output
    if (options.all) {
      const outDir = resolve(root, config.outDir);
      if (existsSync(outDir)) {
        rmSync(outDir, { recursive: true, force: true });
        success(`Cleaned ${config.outDir}`);
      }
    }

    success("Clean complete");
  } catch (error) {
    logError(`Failed to clean: ${(error as Error).message}`);
    process.exit(1);
  }
}
