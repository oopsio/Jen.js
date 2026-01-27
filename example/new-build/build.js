import { buildSync } from "esbuild";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..", "..");

buildSync({
  entryPoints: [join(__dirname, "build.ts")],
  outfile: join(__dirname, ".esbuild", "build.mjs"),
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",
  alias: {
    "@src": join(root, "src"),
  },
  external: ["esbuild", "preact", "preact-render-to-string", "sirv"],
});

// Import and run the built file
import { pathToFileURL } from "node:url";
await import(pathToFileURL(join(__dirname, ".esbuild", "build.mjs")).href);
