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

import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { readdir, stat, readFile, writeFile } from "node:fs/promises";
import esbuild from "esbuild";

const __filename = fileURLToPath(import.meta.url);
const currentDir = dirname(__filename);
const rootDir = join(currentDir, "../../../..");

// Embedded Minifier Logic
const Minifier = {
  html(input) {
    return input
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/>\s+</g, "><")
      .replace(/\s+/g, " ")
      .replace(/\s*([{};:,=])\s*/g, "$1")
      .trim();
  },
  css(input) {
    return input
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\/\/.*/g, "")
      .replace(/\s*([{}:;,])\s*/g, "$1")
      .replace(/\s+/g, " ")
      .replace(/;\s*}/g, "}")
      .trim();
  },
};

async function main() {
  console.log("[BUILD] Starting build...");

  const configPath = join(currentDir, "jen.config.ts");
  const outdir = join(currentDir, ".esbuild");

  await esbuild.build({
    entryPoints: [configPath],
    outdir,
    format: "esm",
    platform: "node",
    target: "es2022",
    bundle: true,
    minify: true,
    sourcemap: true,
    loader: { ".ts": "ts" },
    logLevel: "silent",
  });

  const configFile = join(outdir, "jen.config.js");
  const config = (await import(pathToFileURL(configFile).href)).default;

  const buildPath = pathToFileURL(
    join(rootDir, "build/src/build/build.js"),
  ).href;
  const { buildSite } = await import(buildPath);

  await buildSite({ config });

  console.log("[BUILD] Minifying output...");

  async function minifyDir(dir) {
    try {
      const files = await readdir(dir);
      for (const file of files) {
        const path = join(dir, file);
        const s = await stat(path);
        if (s.isDirectory()) {
          await minifyDir(path);
        } else if (file.endsWith(".html")) {
          const content = await readFile(path, "utf-8");
          await writeFile(path, Minifier.html(content));
        } else if (file.endsWith(".css")) {
          const content = await readFile(path, "utf-8");
          await writeFile(path, Minifier.css(content));
        }
      }
    } catch (e) {
      if (e.code !== "ENOENT") console.warn("Minification warning:", e.message);
    }
  }

  await minifyDir(join(currentDir, config.distDir || "dist"));

  console.log("✅ Site built successfully!");
}

main().catch(console.error);
