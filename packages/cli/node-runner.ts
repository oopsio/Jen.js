import { execSync } from "child_process";

/**
 * CommandStrategy defines the interface for command execution strategies
 */
export interface CommandStrategy {
  nodeArgs(): string[];
}

/**
 * Checks if Node.js is available in the system PATH
 * @throws Error if Node.js is not available or version check fails
 * @returns The Node.js version string
 */
export function checkNodeAvailable(): string {
  try {
    const output = execSync("node --version", {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    return output.trim();
  } catch {
    throw new Error(
      "Node.js is not available in your system PATH.\n\n" +
        "Please ensure Node.js is installed and available in your PATH.\n" +
        "Download from: https://nodejs.org/\n\n" +
        "On macOS: brew install node\n" +
        "On Ubuntu: sudo apt-get install nodejs\n" +
        "On Windows: Download from https://nodejs.org/ or use: choco install nodejs"
    );
  }
}

/**
 * NodeRunner executes Node.js commands with validation and process management
 */
export class NodeRunner {
  /**
   * Builds a command array from a CommandStrategy
   */
  buildCommand(strategy: CommandStrategy): string[] {
    const args = strategy.nodeArgs();
    return ["node", ...args];
  }

  /**
   * Validates command arguments for safety
   * @throws Error if command contains suspicious characters or patterns
   */
  validateCommand(cmd: string): void {
    // Check for shell injection attempts
    const dangerousPatterns = [";", "|", "&", "$", "`", "(", ")", "<", ">"];
    for (const pattern of dangerousPatterns) {
      if (cmd.includes(pattern)) {
        throw new Error(
          `Invalid command: contains forbidden character '${pattern}'`
        );
      }
    }

    // Ensure command is a known file
    if (!cmd.endsWith(".js")) {
      throw new Error("Command must be a .js file");
    }
  }

  /**
   * Gets the working directory for Node execution
   */
  getWorkingDirectory(): string {
    return process.cwd();
  }
}
