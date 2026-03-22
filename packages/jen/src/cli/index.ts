import { DevServerManager } from '../server/app';
import { StaticSiteGenerator } from '../build/build';
import { startProductionServer } from '../server/production';
import { ConfigLoader } from '../config/loader';
import { RuntimeConfig } from '../config/config';
import { handleInfoCommand } from './commands';

export class CliParser {
  public static async executeCommand(args: string[]): Promise<void> {
    await ConfigLoader.initialize();

    const command = args[0] || 'dev';
    const hasVerboseFlag = args.includes('--verbose') || args.includes('-v');

    switch (command) {
      case 'dev':
        await DevServerManager.start(RuntimeConfig.port);
        break;

      case 'start':
        // Production server: Use DevServerManager with security headers, devtools disabled
        await DevServerManager.start(RuntimeConfig.port);
        break;

      case 'build':
        await StaticSiteGenerator.generate();
        break;

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
