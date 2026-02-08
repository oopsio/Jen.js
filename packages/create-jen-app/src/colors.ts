// ANSI color codes for beautiful terminal output
export const colors = {
  // Main colors
  primary: (str: string) => `\x1b[38;2;99;102;241m${str}\x1b[0m`, // Indigo
  accent: (str: string) => `\x1b[38;2;139;92;246m${str}\x1b[0m`, // Violet
  success: (str: string) => `\x1b[38;2;34;197;94m${str}\x1b[0m`, // Green
  warning: (str: string) => `\x1b[38;2;251;146;60m${str}\x1b[0m`, // Orange
  error: (str: string) => `\x1b[38;2;239;68;68m${str}\x1b[0m`, // Red

  // Utility colors
  cyan: (str: string) => `\x1b[38;2;34;211;238m${str}\x1b[0m`,
  magenta: (str: string) => `\x1b[38;2;219;39;119m${str}\x1b[0m`,
  yellow: (str: string) => `\x1b[38;2;250;204;21m${str}\x1b[0m`,

  // Text styles
  bold: (str: string) => `\x1b[1m${str}\x1b[0m`,
  dim: (str: string) => `\x1b[2m${str}\x1b[0m`,
  italic: (str: string) => `\x1b[3m${str}\x1b[0m`,
  underline: (str: string) => `\x1b[4m${str}\x1b[0m`,

  // Background colors (dark theme)
  bgDark: (str: string) => `\x1b[48;2;23;23;23m${str}\x1b[0m`,
  bgPrimary: (str: string) => `\x1b[48;2;99;102;241m${str}\x1b[0m`,

  // Reset
  reset: "\x1b[0m",
};

export const symbols = {
  arrow: "→",
  check: "✓",
  cross: "✕",
  dot: "•",
  star: "★",
  sparkles: "✨",
  rocket: "🚀",
  folder: "📁",
  package: "📦",
  code: "💻",
};

export function printBanner() {
  const banner = `
${colors.accent(
  colors.bold(`
   ██╗███████╗███╗   ██╗     █████╗ ██████╗ ██████╗ 
   ██║██╔════╝████╗  ██║    ██╔══██╗██╔══██╗██╔══██╗
   ██║█████╗  ██╔██╗ ██║    ███████║██████╔╝██████╔╝
   ██║██╔══╝  ██║╚██╗██║    ██╔══██║██╔═══╝ ██╔═══╝ 
   ██║███████╗██║ ╚████║    ██║  ██║██║     ██║     
   ╚═╝╚══════╝╚═╝  ╚═══╝    ╚═╝  ╚═╝╚═╝     ╚═╝     
`),
)}

${colors.primary(colors.bold("Create a beautiful Jen.js application"))}
${colors.dim("v1.0.0")}
  `;
  console.log(banner);
}

export function printSection(title: string) {
  console.log(`\n${colors.primary(colors.bold(title))}`);
}

export function printSubsection(title: string) {
  console.log(`${colors.accent("  " + title)}`);
}

export function printSuccess(message: string) {
  console.log(`${colors.success(symbols.check)} ${message}`);
}

export function printInfo(message: string) {
  console.log(`${colors.cyan("ℹ")} ${message}`);
}

export function printStep(step: number, total: number, message: string) {
  console.log(
    `${colors.primary(`[${step}/${total}]`)} ${colors.bold(message)}`,
  );
}

export function printCode(code: string) {
  console.log(`\n${colors.dim("  " + code)}\n`);
}

export function printNext(steps: string[]) {
  console.log(`\n${colors.accent(colors.bold("Next steps:"))}`);
  steps.forEach((step, i) => {
    console.log(`  ${colors.primary(i + 1 + ".")} ${step}`);
  });
}
