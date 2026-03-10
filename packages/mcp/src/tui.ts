/**
 * Beautiful TUI components for Jen.js MCP
 */

import pc from "picocolors";
import { table } from "table";
import type { ProjectStats } from "./types.js";

export function printHeader(): void {
  console.clear();
  console.log(pc.bold(pc.cyan("╔════════════════════════════════════════╗")));
  console.log(
    pc.bold(
      pc.cyan("║") +
        pc.bold(pc.white("   Jen.js MCP Server - Project Explorer")) +
        pc.cyan("                ║"),
    ),
  );
  console.log(pc.bold(pc.cyan("╚════════════════════════════════════════╝")));
  console.log();
}

export function printProjectInfo(
  name: string,
  version: string,
  description?: string,
): void {
  console.log(pc.bold(pc.green("PROJECT INFORMATION")));
  console.log(pc.gray("─".repeat(40)));
  console.log(`  ${pc.cyan("name")}        ${pc.white(name)}`);
  console.log(`  ${pc.cyan("version")}     ${pc.yellow(version)}`);
  if (description) {
    console.log(`  ${pc.cyan("description")} ${pc.white(description)}`);
  }
  console.log();
}

export function printStats(stats: ProjectStats): void {
  console.log(pc.bold(pc.blue("PROJECT STATISTICS")));
  console.log(pc.gray("─".repeat(40)));

  const statTable = table(
    [
      [pc.cyan("metric"), pc.cyan("count")],
      [pc.gray("total files"), pc.white(String(stats.totalFiles))],
      [pc.gray("typescript"), pc.yellow(String(stats.tsFiles))],
      [pc.gray("javascript"), pc.yellow(String(stats.jsFiles))],
      [pc.gray("tsx"), pc.magenta(String(stats.tsxFiles))],
      [pc.gray("jsx"), pc.magenta(String(stats.jsxFiles))],
      [pc.gray("css"), pc.green(String(stats.cssFiles))],
      [pc.gray("scss"), pc.green(String(stats.scssFiles))],
      [pc.gray("json"), pc.gray(String(stats.jsonFiles))],
    ],
    {
      drawHorizontalLine: (index: number) => index === 1,
      columnDefault: { alignment: "left" },
    },
  );

  console.log(
    statTable
      .split("\n")
      .map((line) => `  ${line}`)
      .join("\n"),
  );
  console.log();
}

export function printAvailableTools(): void {
  console.log(pc.bold(pc.magenta("AVAILABLE TOOLS")));
  console.log(pc.gray("─".repeat(40)));

  const tools = [
    {
      name: "build",
      description: "Build the project",
    },
    {
      name: "dev",
      description: "Start development server",
    },
    {
      name: "typecheck",
      description: "Run TypeScript type checking",
    },
    {
      name: "test",
      description: "Run test suite",
    },
    {
      name: "analyze",
      description: "Analyze project structure",
    },
    {
      name: "list-files",
      description: "List project files with filters",
    },
  ];

  tools.forEach((tool) => {
    console.log(
      `  ${pc.cyan(tool.name.padEnd(15))} ${pc.dim(tool.description)}`,
    );
  });
  console.log();
}

export function printResources(): void {
  console.log(pc.bold(pc.yellow("AVAILABLE RESOURCES")));
  console.log(pc.gray("─".repeat(40)));

  const resources = [
    {
      name: "project/config",
      description: "Jen.js configuration",
    },
    {
      name: "project/stats",
      description: "Project statistics",
    },
    {
      name: "project/files",
      description: "Project file structure",
    },
    {
      name: "project/dependencies",
      description: "Project dependencies",
    },
    {
      name: "project/scripts",
      description: "Available npm scripts",
    },
  ];

  resources.forEach((resource) => {
    console.log(
      `  ${pc.cyan(resource.name.padEnd(20))} ${pc.dim(resource.description)}`,
    );
  });
  console.log();
}

export function printSuccess(message: string): void {
  console.log(`${pc.green(">")} ${pc.white(message)}`);
}

export function printError(message: string): void {
  console.log(`${pc.red("!")} ${pc.white(message)}`);
}

export function printWarning(message: string): void {
  console.log(`${pc.yellow("~")} ${pc.white(message)}`);
}

export function printInfo(message: string): void {
  console.log(`${pc.cyan(".")} ${pc.white(message)}`);
}

export function printSection(title: string): void {
  console.log();
  console.log(pc.bold(pc.cyan(title)));
  console.log(pc.gray("─".repeat(40)));
}

export function printTable(
  data: string[][],
  options?: { headers?: string[] },
): void {
  const rows = options?.headers ? [options.headers, ...data] : data;

  const tableOutput = table(rows, {
    drawHorizontalLine: (index: number) => index === 1,
    columnDefault: { alignment: "left", paddingLeft: 1, paddingRight: 1 },
  });

  console.log(
    tableOutput
      .split("\n")
      .map((line) => `  ${line}`)
      .join("\n"),
  );
}

export function printFooter(): void {
  console.log();
  console.log(pc.gray("─".repeat(40)));
  console.log(pc.dim(`docs: ${pc.cyan("https://github.com/oopsio/jen.js")}`));
}
