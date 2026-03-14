/**
 * CommandStrategy defines the interface for command execution strategies
 */
export interface CommandStrategy {
  nodeArgs(): string[];
}

/**
 * DevCommand implements CommandStrategy for development server
 */
export class DevCommand implements CommandStrategy {
  nodeArgs(): string[] {
    return ["server.js", "dev"];
  }
}

/**
 * StartCommand implements CommandStrategy for production server
 */
export class StartCommand implements CommandStrategy {
  nodeArgs(): string[] {
    return ["server.js"];
  }
}

/**
 * BuildCommand implements CommandStrategy for static site build
 */
export class BuildCommand implements CommandStrategy {
  nodeArgs(): string[] {
    return ["build.js"];
  }
}

/**
 * AnalyzeCommand implements CommandStrategy for bundle analysis
 */
export class AnalyzeCommand implements CommandStrategy {
  nodeArgs(): string[] {
    return ["build.js", "analyze"];
  }
}

/**
 * Command metadata for help display
 */
export interface CommandMeta {
  name: string;
  desc: string;
}

/**
 * CommandFactory creates command instances from string identifiers
 */
export class CommandFactory {
  /**
   * Creates a command strategy from a command name
   * Supported commands: dev, start, build, analyze
   */
  createCommand(cmd: string): CommandStrategy {
    switch (cmd) {
      case "dev":
        return new DevCommand();
      case "start":
        return new StartCommand();
      case "build":
        return new BuildCommand();
      case "analyze":
        return new AnalyzeCommand();
      default:
        throw new Error(`Unknown command: ${cmd}`);
    }
  }

  /**
   * Returns list of all available commands with descriptions
   */
  allCommands(): CommandMeta[] {
    return [
      { name: "dev", desc: "Run development server" },
      { name: "start", desc: "Start production server" },
      { name: "build", desc: "Build static site" },
      { name: "analyze", desc: "Analyze bundle and generate report" },
    ];
  }
}
