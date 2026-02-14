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

// Build script for blog example

import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Paths
const exampleDir = dirname(__dirname); // example/
const rootDir = dirname(exampleDir); // root (Jen.js)

// Load local config
const configPath = pathToFileURL(join(__dirname, "jen.config.js")).href;
const config = (await import(configPath)).default;

// Load framework build function from root
const buildPath = pathToFileURL(join(rootDir, "src/build/build.js")).href;
const { buildSite } = await import(buildPath);

await buildSite({
  config,
});
