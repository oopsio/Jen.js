import { dirname, join, extname, basename } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import fs from "node:fs/promises";
import { readdirSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import esbuild from "esbuild";
import { minify } from "html-minifier-terser";

const __filename = fileURLToPath(import.meta.url);
const currentDir = dirname(__filename);
const rootDir = join(currentDir, "../..");

// Hash file content (MD5, first 10 chars)
function hashFile(content) {
  return createHash("md5").update(content).digest("hex").slice(0, 10);
}

// Recursively find all files (with optional filter)
function getAllFiles(dir, extensions = null) {
  let files = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory())
      files = files.concat(getAllFiles(fullPath, extensions));
    else if (stat.isFile()) {
      if (!extensions || extensions.some((ext) => fullPath.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }
  return files;
}

// Rename file with hash
async function renameWithHash(filePath, content) {
  const hash = hashFile(content);
  const ext = extname(filePath);
  const name = basename(filePath, ext);
  const dir = dirname(filePath);
  const newPath = join(dir, `${name}.${hash}${ext}`);

  if (newPath !== filePath) {
    await fs.rename(filePath, newPath);
    return { oldPath: filePath, newPath, hash };
  }
  return { oldPath: filePath, newPath: filePath, hash };
}

// Remove framework scripts + minify
async function minifyHTMLFile(filePath) {
  let html = await fs.readFile(filePath, "utf-8");

  // Remove __FRAMEWORK_DATA__ JSON script if present
  html = html.replace(
    /<script id="__FRAMEWORK_DATA__" type="application\/json">[\s\S]*?<\/script>/g,
    "",
  );

  // Remove any <script type="module"> that contains hydrateClient and initializeIslands
  html = html.replace(
    /<script\s+type=["']module["'][^>]*>[\s\S]*?hydrateClient\([\s\S]*?\)[\s\S]*?initializeIslands\(\)[\s\S]*?<\/script>/g,
    "",
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

  const buildPath = pathToFileURL(
    join(rootDir, "dist/src/build/build.js"),
  ).href;
  const { buildSite } = await import(buildPath);

  // Build the site (framework now handles polyfills + preact bundling)
  await buildSite({ config });

  const distDir = join(process.cwd(), config.distDir || "dist");
  const manifest = {};
  const fileMap = {}; // Maps old paths to new hashed paths

  // Step 1: Hash CSS and JS files first
  const cssFiles = getAllFiles(distDir, [".css"]);
  for (const filePath of cssFiles) {
    const content = await fs.readFile(filePath, "utf-8");
    const renamed = await renameWithHash(filePath, content);
    manifest[renamed.oldPath] = {
      hash: renamed.hash,
      newPath: renamed.newPath,
    };
    const relPath = renamed.oldPath.replace(distDir, "").replace(/\\/g, "/");
    const newRelPath = renamed.newPath.replace(distDir, "").replace(/\\/g, "/");
    fileMap[relPath] = newRelPath;
    console.log(`✅ Hashed CSS: ${renamed.newPath}`);
  }

  const jsFiles = getAllFiles(distDir, [".js"]);
  for (const filePath of jsFiles) {
    const content = await fs.readFile(filePath, "utf-8");
    const renamed = await renameWithHash(filePath, content);
    manifest[renamed.oldPath] = {
      hash: renamed.hash,
      newPath: renamed.newPath,
    };
    const relPath = renamed.oldPath.replace(distDir, "").replace(/\\/g, "/");
    const newRelPath = renamed.newPath.replace(distDir, "").replace(/\\/g, "/");
    fileMap[relPath] = newRelPath;
    console.log(`✅ Hashed JS: ${renamed.newPath}`);
  }

  // Step 2: Minify & update HTML with hashed file references
  const htmlFiles = getAllFiles(distDir, [".html"]);
  for (const filePath of htmlFiles) {
    await minifyHTMLFile(filePath);
    let content = await fs.readFile(filePath, "utf-8");

    // Replace old file paths with hashed paths
    for (const [oldPath, newPath] of Object.entries(fileMap)) {
      content = content.replaceAll(`href="${oldPath}"`, `href="${newPath}"`);
      content = content.replaceAll(`src="${oldPath}"`, `src="${newPath}"`);
    }

    await fs.writeFile(filePath, content, "utf-8");
    const renamed = await renameWithHash(filePath, content);
    manifest[renamed.oldPath] = {
      hash: renamed.hash,
      newPath: renamed.newPath,
    };
    console.log(`✅ Minified & hashed: ${renamed.newPath}`);
  }

  // Write manifest
  const manifestPath = join(distDir, "asset-manifest.json");
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
  console.log(`✅ Asset manifest written: ${manifestPath}`);

  console.log(
    "✅ Site built, scripts removed, HTML minified, and assets hashed successfully!",
  );
}

main().catch(console.error);
