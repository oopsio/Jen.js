import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { analyzeComponents } from "../compiler/analyzer.js";
import { bundleForDev } from "../compiler/bundler.js";
import { startDevServer } from "../server/dev.js";

export async function devCommand(args) {
  if (args.length === 0) {
    throw new Error("Missing entry file: preactsc dev <entry.server.jsx>");
  }

  const entryFile = path.resolve(process.cwd(), args[0]);

  // Validate file exists
  if (!fs.existsSync(entryFile)) {
    throw new Error(`Entry file not found: ${entryFile}`);
  }

  // Validate it's a server component
  if (!entryFile.endsWith(".server.jsx") && !entryFile.endsWith(".server.js")) {
    throw new Error(
      `Entry file must be a .server.jsx or .server.js file: ${entryFile}`,
    );
  }

  console.log(`[PRSC] Dev server for: ${entryFile}`);

  const components = analyzeComponents(entryFile);
  console.log(`[PRSC] Found ${components.server.length} server components`);
  console.log(`[PRSC] Found ${components.client.length} client components`);

  await startDevServer(entryFile, components);
}
