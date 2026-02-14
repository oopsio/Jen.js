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

#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkgPath = resolve(__dirname, '../package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));

const args = process.argv.slice(2);
const command = args[0] || 'dev';

async function main() {
  try {
    if (command === 'dev') {
      const { devServer } = await import('../src/cli/dev.ts');
      await devServer(process.cwd(), args.slice(1));
    } else if (command === 'build') {
      const { buildSite } = await import('../src/cli/build.ts');
      await buildSite(process.cwd(), args.slice(1));
    } else if (command === 'serve') {
      const { serveSite } = await import('../src/cli/serve.ts');
      await serveSite(process.cwd(), args.slice(1));
    } else if (command === '--version' || command === '-v') {
      console.log(`JenPress v${pkg.version}`);
    } else if (command === '--help' || command === '-h') {
      console.log(`
JenPress v${pkg.version} - Markdown-first documentation SSG

Usage:
  jenpress <command> [options]

Commands:
  dev                Start development server with HMR
  build              Build static site to dist/
  serve              Serve dist/ folder

Options:
  --help, -h         Show this help message
  --version, -v      Show version number
      `);
    } else {
      console.error(`Unknown command: ${command}`);
      process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
