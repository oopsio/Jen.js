import path from "path";
import { fileURLToPath } from "url";
import { devCommand } from "./dev.js";
import { buildCommand } from "./build.js";
import { startCommand } from "./start.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function main(argv) {
  const [command, ...args] = argv;

  if (!command) {
    printHelp();
    process.exit(0);
  }

  switch (command) {
    case "dev":
      await devCommand(args);
      break;
    case "build":
      await buildCommand(args);
      break;
    case "start":
      await startCommand(args);
      break;
    case "--help":
    case "-h":
      printHelp();
      process.exit(0);
      break;
    default:
      console.error(`Unknown command: ${command}`);
      printHelp();
      process.exit(1);
  }
}

function printHelp() {
  console.log(`
Preact Server Components CLI

Usage:
  preactsc dev <entry.server.jsx>        Start dev server
  preactsc build <entry> --out <dir>     Build for production
  preactsc start <outdir>                Run production build

Options:
  --help, -h                             Show this help
`);
}
