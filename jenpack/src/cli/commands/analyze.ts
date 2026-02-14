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
import { normalizePath } from "../../utils/path.js";
import {
  info,
  success,
  error as logError,
  formatSize,
} from "../../utils/log.js";
import { loadConfig } from "../../config.js";
import { createResolver } from "../../resolver/index.js";
import { createModuleGraphBuilder } from "../../core/graph.js";

interface AnalyzeOptions {
  entry?: string;
}

export async function analyze(
  entryArg: string | undefined,
  options: AnalyzeOptions = {},
): Promise<void> {
  try {
    const root = process.cwd();
    const config = await loadConfig(root);

    // Override with CLI args
    if (entryArg) {
      config.entry = entryArg;
    }

    const entryPath = resolve(root, config.entry);
    const normalizedEntry = normalizePath(entryPath);

    info(`Analyzing ${config.entry}`);

    // Initialize components
    const resolver = createResolver(root, {
      alias: config.alias,
      external: config.external,
    });

    const graphBuilder = createModuleGraphBuilder(resolver);

    try {
      // Build module graph
      const graph = await graphBuilder.build(normalizedEntry);

      // Print module tree
      console.log("\n📦 Module Graph\n");
      printModuleTree(graph.entryModule, graph, new Set(), 0);

      // Print statistics
      console.log("\n📊 Statistics\n");
      const modules = Array.from(graph.modules.values());
      const totalSize = modules.reduce(
        (sum, m) => sum + Buffer.byteLength(m.source, "utf8"),
        0,
      );

      console.log(`  Total modules: ${modules.length}`);
      console.log(`  Total size: ${formatSize(totalSize)}`);

      // Print module sizes
      console.log("\n📈 Module Sizes\n");
      modules
        .sort(
          (a, b) =>
            Buffer.byteLength(b.source, "utf8") -
            Buffer.byteLength(a.source, "utf8"),
        )
        .slice(0, 10)
        .forEach((m) => {
          const size = Buffer.byteLength(m.source, "utf8");
          const deps = m.imports.length;
          console.log(`  ${m.path}: ${formatSize(size)} (${deps} deps)`);
        });

      success("Analysis complete");
    } catch (error) {
      logError(`Analysis failed: ${(error as Error).message}`);
      process.exit(1);
    }
  } catch (error) {
    logError(`Failed to analyze: ${(error as Error).message}`);
    process.exit(1);
  }
}

function printModuleTree(
  module: any,
  graph: any,
  visited: Set<string>,
  depth: number,
): void {
  if (!module || visited.has(module.path)) {
    return;
  }
  visited.add(module.path);

  const indent = "  ".repeat(depth);
  const size = Buffer.byteLength(module.source, "utf8");
  console.log(`${indent}├─ ${module.path} (${formatSize(size)})`);

  for (const importPath of module.imports) {
    const importedModule = graph.modules.get(importPath);
    if (importedModule) {
      printModuleTree(importedModule, graph, visited, depth + 1);
    }
  }
}
