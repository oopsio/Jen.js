import { glob } from "./src/vendor/glob/glob.js";
import fs from "node:fs/promises";

const files = await glob("src/**/*.{js,ts,jsx,tsx,mjs,cjs}");

const map = new Map();

for (const file of files) {
  const code = await fs.readFile(file, "utf8");

  const importRegex =
    /(?:import\s+.*?from\s+["'](.*?)["']|import\(["'](.*?)["']\)|require\(["'](.*?)["']\))/g;

  let match;
  while ((match = importRegex.exec(code))) {
    const dep = match[1] || match[2] || match[3];
    if (!dep) continue;

    if (!map.has(dep)) {
      map.set(dep, new Set());
    }

    map.get(dep).add(file);
  }
}

for (const [dep, usedBy] of map.entries()) {
  console.log(dep, `(${usedBy.size} files)`);
  for (const file of usedBy) {
    console.log("  └─", file);
  }
  console.log();
}