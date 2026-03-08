import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import and run root build.ts
const rootBuildTS = join(__dirname, "../../build.ts");
await import(pathToFileURL(rootBuildTS).href);
