import { createServer } from "node:http";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import esbuild from "esbuild";

const __filename = fileURLToPath(import.meta.url);
const currentDir = dirname(__filename);
const rootDir = join(currentDir, "../../../..");

const mode = process.argv[2] ?? "dev";
const isDev = mode === "dev";

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
  console.log(`[SERVER] Starting in ${isDev ? "DEV" : "PROD"} mode...`);

  const configPath = join(currentDir, "jen.config.ts");
  const outdir = join(currentDir, ".esbuild");

  await esbuild.build({
    entryPoints: [configPath],
    outdir,
    format: "esm",
    platform: "node",
    target: "es2022",
    minify: true,
    bundle: true,
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
    // Intercept response to minify
    const originalEnd = res.end;
    res.end = function (chunk, encoding, callback) {
      if (chunk) {
        const type = res.getHeader("content-type");
        if (typeof type === "string") {
          if (type.includes("text/html")) {
            try {
              chunk = Minifier.html(chunk.toString());
              res.removeHeader("content-length");
            } catch (e) {
              console.error("HTML Minification failed:", e);
            }
          } else if (type.includes("text/css")) {
            try {
              chunk = Minifier.css(chunk.toString());
              res.removeHeader("content-length");
            } catch (e) {
              console.error("CSS Minification failed:", e);
            }
          }
        }
      }
      return originalEnd.call(this, chunk, encoding, callback);
    };

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
