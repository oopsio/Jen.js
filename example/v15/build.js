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
import fs from "node:fs/promises";
import { readdirSync, statSync } from "node:fs";
import esbuild from "esbuild";
import { minify } from "html-minifier-terser";

const __filename = fileURLToPath(import.meta.url);
const currentDir = dirname(__filename);
const rootDir = join(currentDir, "../..");

// Recursively find all HTML files
function getAllHtmlFiles(dir) {
  let files = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) files = files.concat(getAllHtmlFiles(fullPath));
    else if (stat.isFile() && fullPath.endsWith(".html")) files.push(fullPath);
  }
  return files;
}

// Remove framework scripts + minify
async function minifyHTMLFile(filePath) {
  let html = await fs.readFile(filePath, "utf-8");

  // Remove __FRAMEWORK_DATA__ JSON script if present
  html = html.replace(
    /<script id="__FRAMEWORK_DATA__" type="application\/json">[\s\S]*?<\/script>/g,
    ""
  );

  // Remove any <script type="module"> that contains hydrateClient and initializeIslands
  html = html.replace(
    /<script\s+type=["']module["'][^>]*>[\s\S]*?hydrateClient\([\s\S]*?\)[\s\S]*?initializeIslands\(\)[\s\S]*?<\/script>/g,
    ""
  );

  // Minify remaining HTML
  const minified = await minify(html, {
    collapseWhitespace: true,
    removeComments: true,
    removeRedundantAttributes: true,
    removeEmptyAttributes: true,
    removeOptionalTags: true,
    minifyCSS: true,
    minifyJS: true,
  });

  await fs.writeFile(filePath, minified, "utf-8");
}

async function main() {
  console.log("[BUILD] Starting build...");

  const configPath = join(currentDir, "jen.config.ts");
  const outdir = join(currentDir, ".esbuild");

  // Build the config first
  await esbuild.build({
    entryPoints: [configPath],
    outdir,
    format: "esm",
    platform: "node",
    target: "es2022",
    bundle: true,
    loader: { ".ts": "ts" },
    logLevel: "silent",
  });

  const configFile = join(outdir, "jen.config.js");
  const config = (await import(pathToFileURL(configFile).href)).default;

  const buildPath = pathToFileURL(join(rootDir, "build/src/build/build.js")).href;
  const { buildSite } = await import(buildPath);

  // Build the site
  await buildSite({ config });

  // Minify & clean all HTML files in dist
  const distDir = join(process.cwd(), config.distDir || "dist");
  const htmlFiles = getAllHtmlFiles(distDir);
  for (const filePath of htmlFiles) {
    await minifyHTMLFile(filePath);
    console.log(`✅ Minified & cleaned: ${filePath}`);
  }

  console.log("✅ Site built, scripts removed, and HTML minified successfully!");
}

main().catch(console.error);