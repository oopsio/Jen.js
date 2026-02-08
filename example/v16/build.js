import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import and run root build.js
const rootBuildJS = join(__dirname, "../../build.js");
await import(pathToFileURL(rootBuildJS).href);
