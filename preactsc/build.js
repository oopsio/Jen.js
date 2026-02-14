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

import fs from "fs";
import path from "path";
import { build } from "esbuild";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function buildProject() {
  const srcDir = path.join(__dirname, "src");
  const distDir = path.join(__dirname, "dist");

  // Clean dist
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true });
  }
  fs.mkdirSync(distDir, { recursive: true });

  // Build main entry
  await build({
    entryPoints: [path.join(srcDir, "index.js")],
    bundle: true,
    format: "esm",
    outfile: path.join(distDir, "index.js"),
    platform: "node",
    target: "node18",
    external: ["preact", "preact-render-to-string", "esbuild"],
  });

  // Build runtime
  fs.mkdirSync(path.join(distDir, "runtime"), { recursive: true });
  await build({
    entryPoints: [path.join(srcDir, "runtime", "client.js")],
    bundle: true,
    format: "esm",
    outfile: path.join(distDir, "runtime", "index.js"),
    platform: "node",
    target: "node18",
  });

  console.log("Build complete!");
}

buildProject().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});
