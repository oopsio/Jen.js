import { dev } from './commands/dev.js';
import { build } from './commands/build.js';
import { analyze } from './commands/analyze.js';
import { clean } from './commands/clean.js';

const args = process.argv.slice(2);
const command = args[0];
const subArgs = args.slice(1);

async function main(): Promise<void> {
  if (!command || command === '--help' || command === '-h') {
    printHelp();
    return;
  }

  if (command === '--version' || command === '-v') {
    console.log('jenpack 0.1.0');
    return;
  }

  try {
    if (command === 'dev') {
      const entry = subArgs[0];
      const options = parseDevOptions(subArgs);
      await dev(entry, options);
    } else if (command === 'build') {
      const entry = subArgs.find((arg) => !arg.startsWith('--'));
      const options = parseBuildOptions(subArgs);
      await build(entry, options);
    } else if (command === 'analyze') {
      const entry = subArgs[0];
      const options = parseAnalyzeOptions(subArgs);
      await analyze(entry, options);
    } else if (command === 'clean') {
      const options = parseCleanOptions(subArgs);
      await clean(options);
    } else {
      console.error(`Unknown command: ${command}`);
      console.error('Run "jenpack --help" for usage information');
      process.exit(1);
    }
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
}

function parseDevOptions(args: string[]): { port?: number; host?: string } {
  const options: any = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--port' && args[i + 1]) {
      options.port = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--host' && args[i + 1]) {
      options.host = args[i + 1];
      i++;
    }
  }

  return options;
}

function parseBuildOptions(args: string[]): { out?: string; minify?: boolean; sourcemap?: boolean } {
  const options: any = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--out' && args[i + 1]) {
      options.out = args[i + 1];
      i++;
    } else if (args[i] === '--minify') {
      options.minify = true;
    } else if (args[i] === '--no-minify') {
      options.minify = false;
    } else if (args[i] === '--sourcemap') {
      options.sourcemap = true;
    } else if (args[i] === '--no-sourcemap') {
      options.sourcemap = false;
    }
  }

  return options;
}

function parseAnalyzeOptions(args: string[]): { entry?: string } {
  return {};
}

function parseCleanOptions(args: string[]): { all?: boolean } {
  return {
    all: args.includes('--all'),
  };
}

function printHelp(): void {
  console.log(`
jenpack - Modern bundler for Jen.js

Usage:
  jenpack <command> [options]

Commands:
  dev <entry>              Start dev server with hot reload
  build <entry>            Create production bundle
  analyze <entry>          Analyze bundle
  clean                    Remove cache and build artifacts

Options:
  --port <port>            Dev server port (default: 3000)
  --host <host>            Dev server host (default: 0.0.0.0)
  --out <dir>              Output directory for build
  --minify                 Enable minification
  --no-minify              Disable minification
  --sourcemap              Generate sourcemaps
  --no-sourcemap           Disable sourcemaps

Examples:
  jenpack dev src/index.tsx
  jenpack build src/index.tsx --out dist
  jenpack analyze src/index.tsx
  jenpack clean
`);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
