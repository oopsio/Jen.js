import { writeFileSync, chmodSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const binPath = join(__dirname, "../bin/jenpack.js");

const content = `#!/usr/bin/env node

import('../dist/cli/index.js').catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
`;

writeFileSync(binPath, content);
chmodSync(binPath, 0o755);
console.log("Created bin/jenpack.js");
