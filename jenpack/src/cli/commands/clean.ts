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
