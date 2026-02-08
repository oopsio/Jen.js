import path from "path";
import fs from "fs";
import { analyzeComponents } from "../compiler/analyzer.js";
import { bundleForProduction } from "../compiler/bundler.js";

export async function buildCommand(args) {
  let entryFile = null;
  let outDir = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--out") {
      outDir = args[i + 1];
      i++;
    } else if (!entryFile) {
      entryFile = args[i];
    }
  }

  if (!entryFile) {
    throw new Error(
      "Missing entry file: preactsc build <entry.server.jsx> --out <dir>",
    );
  }
  if (!outDir) {
    throw new Error(
      "Missing output directory: preactsc build <entry> --out <dir>",
    );
  }

  entryFile = path.resolve(process.cwd(), entryFile);
  outDir = path.resolve(process.cwd(), outDir);

  // Validate entry file exists
  if (!fs.existsSync(entryFile)) {
    throw new Error(`Entry file not found: ${entryFile}`);
  }

  // Validate it's a server component
  if (!entryFile.endsWith(".server.jsx") && !entryFile.endsWith(".server.js")) {
    throw new Error(`Entry file must be a .server.jsx or .server.js file`);
  }

  // Validate output directory is writable
  try {
    fs.mkdirSync(outDir, { recursive: true, mode: 0o755 });
  } catch (err) {
    throw new Error(`Cannot create output directory: ${err.message}`);
  }

  console.log(`[PRSC] Building: ${entryFile}`);
  console.log(`[PRSC] Output: ${outDir}`);

  const components = analyzeComponents(entryFile);
  console.log(`[PRSC] Found ${components.server.length} server components`);
  console.log(`[PRSC] Found ${components.client.length} client components`);

  const bundles = await bundleForProduction(entryFile, components, outDir);

  console.log(`[PRSC] Build complete!`);
  console.log(`[PRSC] Server: ${path.join(outDir, "server.js")}`);
  console.log(`[PRSC] Client: ${path.join(outDir, "client.js")}`);
  console.log(`[PRSC] Manifest: ${path.join(outDir, "manifest.json")}`);
}
