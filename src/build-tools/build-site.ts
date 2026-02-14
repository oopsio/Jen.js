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

// Site build utilities
// Migrated from Python src/python/build.py

import {
  copyFileSync,
  rmSync,
  mkdirSync,
  readdirSync,
  statSync,
} from "node:fs";
import { join } from "node:path";
import { log } from "../shared/log.js";

export interface BuildOptions {
  minify?: boolean;
  sourcemap?: boolean;
  optimize?: boolean;
}

function copyDir(src: string, dst: string) {
  if (!readdirSync(src, { withFileTypes: true }).length) return;
  mkdirSync(dst, { recursive: true });

  for (const file of readdirSync(src, { withFileTypes: true })) {
    const srcPath = join(src, file.name);
    const dstPath = join(dst, file.name);

    if (file.isDirectory()) {
      copyDir(srcPath, dstPath);
    } else {
      copyFileSync(srcPath, dstPath);
    }
  }
}

export async function buildSite(opts: BuildOptions = {}) {
  log.info("Building site...");

  const srcDir = "site";
  const distDir = "dist";

  // Clean dist
  try {
    rmSync(distDir, { recursive: true, force: true });
  } catch {}

  // Copy assets
  copyDir(srcDir, distDir);
  log.info(`Copied ${srcDir} → ${distDir}`);

  // Minify if requested
  if (opts.minify) {
    log.info("Minifying assets...");
    // Placeholder: integrate image/font minifiers
  }

  log.info("Build complete.");
}
