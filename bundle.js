import esbuild from "esbuild";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { readdirSync, statSync } from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function walkDir(dir, ext = ".ts") {
  const files = [];
  const entries = readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkDir(fullPath, ext));
    } else if (entry.name.endsWith(ext)) {
      files.push(fullPath);
    }
  }

  return files;
}

async function bundleFramework() {
  console.log("[BUNDLE] Starting framework bundle...");

  // Get all TypeScript files from src/
  const srcFiles = walkDir(join(__dirname, "src"), ".ts").concat(
    walkDir(join(__dirname, "src"), ".tsx"),
  );

  // Add root TypeScript files
  const rootFiles = [
    join(__dirname, "build.ts"),
    join(__dirname, "server.ts"),
    join(__dirname, "jen.config.ts"),
  ];

  const allEntryPoints = [...srcFiles, ...rootFiles];

  console.log(`[BUNDLE] Found ${allEntryPoints.length} TypeScript files`);
  console.log(`[BUNDLE] Transpiling to build/src with folder structure...`);

  try {
    const result = await esbuild.build({
      entryPoints: allEntryPoints,
      outdir: join(__dirname, "build"),
      outbase: __dirname,
      format: "esm",
      platform: "node",
      target: "es2022",
      bundle: false,
      logLevel: "info",
    });

    console.log("[BUNDLE] ✅ Framework bundled successfully");
    console.log(`[BUNDLE] Output: build/`);
    console.log("[BUNDLE] Structure:");
    console.log("  build/src/          - All framework modules (6+ depth)");
    console.log("  build/build.js      - Build entry point");
    console.log("  build/server.js     - Server entry point");
    console.log("  build/jen.config.js - Framework config");

    return result;
  } catch (err) {
    console.error("[BUNDLE] ❌ Bundle failed:", err);
    process.exit(1);
  }
}

// Run bundler
await bundleFramework();
