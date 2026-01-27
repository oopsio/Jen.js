import { buildSync } from "esbuild";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..", "..");

buildSync({
  entryPoints: [join(__dirname, "server.ts")],
  outfile: join(__dirname, ".esbuild", "server.js"),
  bundle: true,
  platform: "node",
  target: "node20",
  alias: {
    "@src": join(root, "src"),
  },
  external: ["esbuild", "preact", "preact-render-to-string", "sirv"],
});

// Import and run the built file
await import(join(__dirname, ".esbuild", "server.js"));
