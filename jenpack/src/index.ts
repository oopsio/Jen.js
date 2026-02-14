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

export { loadConfig, defineConfig } from "./config.js";
export { createResolver } from "./resolver/index.js";
export { createModuleGraphBuilder } from "./core/graph.js";
export { createBundler } from "./core/bundler.js";
export { createDevServer } from "./server/dev-server.js";
export { createWatcher } from "./server/watcher.js";
export { BuildCache } from "./cache/index.js";

export type {
  JenpackConfig,
  ResolvedConfig,
  Module,
  ModuleGraph,
  Chunk,
  BuildResult,
  BuildManifest,
  BuildError,
  TransformOptions,
  ResolveOptions,
  DevServerOptions,
  WatcherConfig,
} from "./types.js";

export { dev } from "./cli/commands/dev.js";
export { build } from "./cli/commands/build.js";
export { analyze } from "./cli/commands/analyze.js";
export { clean } from "./cli/commands/clean.js";
