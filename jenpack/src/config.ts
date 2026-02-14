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
