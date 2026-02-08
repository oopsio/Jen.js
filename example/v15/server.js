import { createServer } from "node:http";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import esbuild from "esbuild";

const __filename = fileURLToPath(import.meta.url);
const currentDir = dirname(__filename);
const rootDir = join(currentDir, "../..");

const mode = process.argv[2] ?? "dev";
const isDev = mode === "dev";

async function main() {
  console.log(`[SERVER] Starting in ${isDev ? "DEV" : "PROD"} mode...`);

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
    loader: { ".ts": "ts" },
    logLevel: "silent",
  });

  const configFile = join(outdir, "jen.config.js");
  const config = (await import(pathToFileURL(configFile).href)).default;

  const appPath = pathToFileURL(join(rootDir, "build/src/server/app.js")).href;
  const { createApp } = await import(appPath);

  // Load banner
  const bannerPath = pathToFileURL(
    join(rootDir, "build/src/cli/banner.js"),
  ).href;
  const { printBanner } = await import(bannerPath);

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
    printBanner(config.server.port, isDev ? "development" : "production");
  });
}

main().catch(console.error);
