/*
 * This file is part of Jen.js.
 * Copyright (C) 2026 oopsio
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

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
