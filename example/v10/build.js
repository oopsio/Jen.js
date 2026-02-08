#!/usr/bin/env node

// Build script for blog example
// Builds from example/blog directory, outputs to example/blog/dist/

import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import esbuild from "esbuild";

const __filename = fileURLToPath(import.meta.url);
const blogDir = dirname(__filename);
const exampleDir = dirname(blogDir);
const rootDir = dirname(exampleDir);

async function main() {
  console.log("[BUILD] Starting build...");

  // Transpile config
  const configPath = join(blogDir, "jen.config.ts");
  const outdir = join(blogDir, ".esbuild");

  console.log("[BUILD] Transpiling config...");
  await esbuild.build({
    entryPoints: [configPath],
    outdir,
    format: "esm",
    platform: "node",
    target: "es2022",
    bundle: false,
    logLevel: "silent",
  });

  // Load config
  const configFile = join(outdir, "jen.config.js");
  const configUrl = pathToFileURL(configFile).href;
  const config = (await import(configUrl)).default;

  // Load framework build function
  const buildPath = pathToFileURL(
    join(rootDir, "build/src/build/build.js"),
  ).href;
  const { buildSite } = await import(buildPath);

  console.log("[BUILD] Building site...");
  try {
    await buildSite({
      config,
    });
  } catch (err) {
    // Ignore dynamic route errors (expected for SSG)
    if (err.code === "ENOENT" && err.path?.includes(":")) {
      console.log("[BUILD] ⚠️  Skipped dynamic routes (expected for SSG)");
    } else {
      throw err;
    }
  }

  console.log("✅ Blog built successfully!");
}

main().catch((err) => {
  console.error("[BUILD] ❌ Error:", err.message);
  process.exit(1);
});
