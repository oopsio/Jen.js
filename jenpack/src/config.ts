import { resolve } from "path";
import { existsSync } from "fs";
import type { JenpackConfig, ResolvedConfig } from "./types.js";

const DEFAULT_CONFIG: JenpackConfig = {
  entry: "src/index.ts",
  outDir: "dist",
  publicDir: "public",
  jsxImportSource: "preact",
  minify: true,
  sourcemap: true,
  define: {},
  alias: {},
  external: [],
};

export async function loadConfig(
  root: string = process.cwd(),
): Promise<ResolvedConfig> {
  const configPath = resolve(root, "jenpack.config.ts");

  let userConfig: JenpackConfig = {};

  if (existsSync(configPath)) {
    try {
      // Dynamic import with require fallback for CommonJS
      const module = await import(configPath);
      userConfig = module.default || module;
    } catch (error) {
      // If import fails, try reading as CommonJS (for backward compatibility)
      try {
        const content = require(configPath);
        userConfig = content.default || content;
      } catch {
        // If both fail, use default config
      }
    }
  }

  const config: ResolvedConfig = {
    ...DEFAULT_CONFIG,
    ...userConfig,
    root,
  };

  // Resolve paths relative to root
  if (!resolve(config.entry).startsWith(root)) {
    config.entry = resolve(root, config.entry);
  }
  if (!resolve(config.outDir).startsWith(root)) {
    config.outDir = resolve(root, config.outDir);
  }
  if (!resolve(config.publicDir).startsWith(root)) {
    config.publicDir = resolve(root, config.publicDir);
  }

  return config;
}

export function defineConfig(config: JenpackConfig): JenpackConfig {
  return config;
}
