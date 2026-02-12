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
