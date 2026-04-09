export const colors = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bold: '\x1b[1m',
};

export class ErrorFormatter {
  /**
   * Formats an error into a beautiful, symbol-only (no emoji) standard output.
   */
  static formatError(error: unknown, title: string = 'Error'): string {
    const isError = error instanceof Error;
    const msg = isError ? error.message : String(error);
    const stack = isError ? error.stack : undefined;

    let output = `\n${colors.bold}${colors.bgRed}${colors.white} [!] ${title} ${colors.reset}\n`;
    output += `${colors.bold}${colors.red}${msg}${colors.reset}\n\n`;

    // Try to get Vite frame if it exists
    const viteError = error as { frame?: string };
    if (viteError && viteError.frame) {
      output += `\n${colors.dim}Code Snippet:${colors.reset}\n`;
      output +=
        viteError.frame
          .split('\n')
          .map((line: string) => `  ${line}`)
          .join('\n') + '\n\n';
    }

    if (stack) {
      const lines = stack.split('\n');
      output += `${colors.dim}Stack Trace:${colors.reset}\n`;
      for (const line of lines) {
        if (line.includes(msg) && lines.indexOf(line) === 0) continue; // Skip the message in stack dump

        // if the line matches `at FunctionName (path:line:col)` or `at path:line:col`
        const match = line.match(
          /^\s*at\s+(?:([^\s]+)\s+\()?(.*?):(\d+):(\d+)\)?$/,
        );
        if (match) {
          const [, func, filePath, lineNum, colNum] = match;

          // Color internal modules dimly, user code cyan
          const isInternal =
            filePath.includes('node_modules') || filePath.startsWith('node:');
          const pathColor = isInternal ? colors.dim : colors.cyan;
          const funcColor = isInternal ? colors.dim : colors.magenta;

          const funcName = func ? func : '<anonymous>';

          output += `  ${colors.dim}>${colors.reset} ${funcColor}${funcName}${colors.reset} ${colors.dim}at${colors.reset} ${pathColor}${filePath}:${lineNum}:${colNum}${colors.reset}\n`;
        } else {
          output += `  ${colors.dim}${line.trim()}${colors.reset}\n`;
        }
      }
    }

    output += '\n';

    return output;
  }

  /**
   * Prints the beautifully formatted error directly to stderr.
   */
  static printError(
    error: unknown,
    title: string = 'Unhandled Server Error',
  ): void {
    console.error(ErrorFormatter.formatError(error, title));
  }
}
