#!/usr/bin/env node

import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import esbuild from "esbuild";

const __filename = fileURLToPath(import.meta.url);
const rootDir = dirname(__filename);

async function analyze() {
  console.log("[ANALYZE] Loading bundle analyzer...");
  const analyzerPath = pathToFileURL(
    join(rootDir, "dist/src/build/bundle-analyzer.js"),
  ).href;
  const { runBundleAnalyzer } = await import(analyzerPath);

  const configPath = join(rootDir, "jen.config.ts");
  const outdir = join(rootDir, ".esbuild");

  await esbuild.build({
    entryPoints: [configPath],
    outdir,
    format: "esm",
    platform: "node",
    target: "es2022",
    bundle: false,
    logLevel: "silent",
  });

  const configFile = join(outdir, "jen.config.js");
  const configUrl = pathToFileURL(configFile).href;
  const config = (await import(configUrl)).default;

  await runBundleAnalyzer(config);
  console.log("[ANALYZE] Bundle analysis complete!");
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("analyze")) {
    await analyze();
    return;
  }

  console.log("[BUILD] Starting build...");

  const configPath = join(rootDir, "jen.config.ts");
  const outdir = join(rootDir, ".esbuild");

  await esbuild.build({
    entryPoints: [configPath],
    outdir,
    format: "esm",
    platform: "node",
    target: "es2022",
    bundle: false,
    logLevel: "silent",
  });

  const configFile = join(outdir, "jen.config.js");
  const configUrl = pathToFileURL(configFile).href;
  const config = (await import(configUrl)).default;

  const buildPath = pathToFileURL(
    join(rootDir, "dist/src/build/build.js"),
  ).href;
  const { buildSite } = await import(buildPath);

  console.log("[BUILD] Building site...");
  try {
    await buildSite({ config });
  } catch (err) {
    if (err.code === "ENOENT" && err.path?.includes(":")) {
      console.log("[BUILD] ️  Skipped dynamic routes (expected for SSG)");
    } else {
      throw err;
    }
  }
  console.log(" Build complete!");
}

main().catch((err) => {
  console.error("[BUILD]  Error:", err.message);
  process.exit(1);
});
