// Build script for blog example

import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Paths
const exampleDir = dirname(__dirname); // example/
const rootDir = dirname(exampleDir); // root (Jen.js)

// Load local config
const configPath = pathToFileURL(join(__dirname, "jen.config.js")).href;
const config = (await import(configPath)).default;

// Load framework build function from root
const buildPath = pathToFileURL(join(rootDir, "src/build/build.js")).href;
const { buildSite } = await import(buildPath);

await buildSite({
  config,
});
