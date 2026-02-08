#!/usr/bin/env node

// Development server for blog example
// Uses the framework's app with this example's config

import { createServer } from "node:http";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import esbuild from "esbuild";

const __filename = fileURLToPath(import.meta.url);
const blogDir = dirname(__filename);
const exampleDir = dirname(blogDir);
const rootDir = dirname(exampleDir);

const mode = process.argv[2] ?? "dev";
const isDev = mode === "dev";

async function main() {
  console.log(`[SERVER] Starting in ${isDev ? "DEV" : "PROD"} mode...`);

  // Transpile config
  const configPath = join(blogDir, "jen.config.ts");
  const outdir = join(blogDir, ".esbuild");

  console.log(`[SERVER] Transpiling config...`);
  await esbuild.build({
    entryPoints: [configPath],
    outdir,
    format: "esm",
    platform: "node",
    target: "es2022",
    bundle: true, // bundle so .tsx imports are resolved
    loader: { ".ts": "ts", ".tsx": "tsx" },
    logLevel: "silent",
  });

  // Load config
  const configFile = join(outdir, "jen.config.js");
  const configUrl = pathToFileURL(configFile).href;
  const config = (await import(configUrl)).default;

  // Load framework app creator
  const appPath = pathToFileURL(join(rootDir, "build/src/server/app.js")).href;
  const appModule = await import(appPath);
  const { createApp } = appModule;

  console.log(`[SERVER] Creating app...`);
  const app = await createApp({
    config,
    mode: isDev ? "dev" : "prod",
  });

  const server = createServer(async (req, res) => {
    try {
      await app.handle(req, res);
    } catch (err) {
      res.statusCode = 500;
      res.setHeader("content-type", "text/plain; charset=utf-8");
      res.end("Internal Server Error\n\n" + (err?.stack ?? String(err)));
    }
  });

  server.listen(config.server.port, config.server.hostname, () => {
    console.log(
      `[SERVER] ✅ Running on http://${config.server.hostname}:${config.server.port} (${isDev ? "DEV" : "PROD"})`,
    );
  });

  process.on("SIGINT", () => {
    console.log("[SERVER] Shutting down...");
    server.close(() => process.exit(0));
  });
}

main().catch((err) => {
  console.error("[SERVER] ❌ Error:", err);
  process.exit(1);
});
