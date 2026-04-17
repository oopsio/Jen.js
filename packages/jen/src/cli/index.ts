import { DevServerManager } from '../server/app.js';
import { StaticSiteGenerator } from '../build/build.js';
import { ProductionServerManager } from '../server/production.js';
import { ConfigLoader } from '../config/loader.js';
import { RuntimeConfig } from '../config/config.js';
import { handleInfoCommand } from './commands/index.js';

/**
 * Main Command Line Interface Parser and Executor.
 * Responsible for correctly routing the user's `jen` terminal commands.
 */
export class CliParser {
  /**
   * Evaluates passed arguments to invoke the proper framework action (dev, build, start, info).
   *
   * @param args The sliced array of CLI arguments (e.g. `process.argv.slice(2)`)
   */
  public static async executeCommand(args: string[]): Promise<void> {
    await ConfigLoader.initialize();

    const command = args[0] || 'dev';
    const hasVerboseFlag = args.includes('--verbose') || args.includes('-v');

    switch (command) {
      case 'dev':
        await DevServerManager.start(RuntimeConfig.port);
        break;

      case 'start':
        // Production server: Build then serve with NIST/OWASP hardening
        console.log('\x1b[36m→ Building project for production...\x1b[0m');
        await StaticSiteGenerator.generate();
        console.log('\x1b[32m[+] Build complete\x1b[0m');
        console.log('\x1b[36m→ Starting production server...\x1b[0m');
        await ProductionServerManager.start(RuntimeConfig.port);
        break;

      case 'build': {
        const adapterIndex = args.indexOf('--adapter');
        let adapter: string | undefined = undefined;
        if (adapterIndex !== -1 && args[adapterIndex + 1]) {
          adapter = args[adapterIndex + 1];
        }

        const adapterPrefixMatch = args.find((a) => a.startsWith('--adapter='));
        if (adapterPrefixMatch) {
          adapter = adapterPrefixMatch.split('=')[1];
        }

        await StaticSiteGenerator.generate({ adapter });
        break;
      }

      case 'info':
        await handleInfoCommand(hasVerboseFlag);
        break;

      case 'help':
      case '--help':
      case '-h':
        this.printHelp();
        break;

      default:
        console.log(`Unknown command: ${command}`);
        this.printHelp();
        break;
    }
  }

  /**
   * Prints the standard CLI help menu and usage examples to the console.
   */
  private static printHelp(): void {
    console.log(`
Jen.js - High-performance web framework

Usage: jen <command> [options]

Commands:
  dev              Start development server (with hot reload)
  start            Start production server (NIST/OWASP hardened)
  build            Build static site
  info             Show system and framework diagnostics
  help             Show this help message

Options:
  --verbose, -v    Verbose output (for info command)
  --help, -h       Show help message

Examples:
  jen dev
  jen start
  jen build
  jen info
  jen info --verbose
`);
  }
}
