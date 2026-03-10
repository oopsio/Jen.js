#!/usr/bin/env node

/**
 * Jen.js MCP CLI - Beautiful TUI for project exploration
 */

import { Command } from "commander";
import prompts from "prompts";
import pc from "picocolors";
import {
  printHeader,
  printProjectInfo,
  printStats,
  printAvailableTools,
  printResources,
  printFooter,
  printSuccess,
  printInfo,
  printSection,
} from "./tui.js";
import {
  findProjectRoot,
  loadProjectConfig,
  calculateProjectStats,
} from "./utils.js";

const program = new Command();

program
  .name("jenjs-mcp")
  .description("Jen.js MCP Server - Project Explorer & Manager")
  .version("1.0.0");

program
  .command("explore")
  .description("Interactive project explorer")
  .action(async () => {
    const projectRoot = findProjectRoot();
    const config = loadProjectConfig(projectRoot);

    if (!config) {
      console.error(
        pc.red("✗ Could not find Jen.js project configuration"),
      );
      process.exit(1);
    }

    printHeader();
    printProjectInfo(config.name, config.version, config.description);

    const stats = calculateProjectStats(projectRoot);
    printStats(stats);

    printAvailableTools();
    printResources();
    printFooter();

    const response = await prompts({
      type: "select",
      name: "action",
      message: "What would you like to do?",
      choices: [
        { title: "View project configuration", value: "config" },
        { title: "View project structure", value: "structure" },
        { title: "View dependencies", value: "deps" },
        { title: "Run build script", value: "build" },
        { title: "Start dev server", value: "dev" },
        { title: "Exit", value: "exit" },
      ],
    });

    switch (response.action) {
      case "config":
        printSection("Project Configuration");
        console.log(JSON.stringify(config, null, 2));
        break;
      case "structure":
        printSection("Project Structure");
        printInfo("Available scripts:");
        Object.entries(config.scripts || {}).forEach(([name, script]) => {
          console.log(`  ${name.padEnd(15)} ${pc.dim(script)}`);
        });
        break;
      case "deps":
        printSection("Dependencies");
        console.log(`  ${pc.cyan("dependencies")}     ${Object.keys(config.dependencies || {}).length}`);
        console.log(
          `  ${pc.cyan("dev dependencies")} ${Object.keys(config.devDependencies || {}).length}`,
        );
        break;
      case "build":
        printSuccess("To build: npm run build");
        break;
      case "dev":
        printSuccess("To start dev server: npm run dev");
        break;
      case "exit":
        printSuccess("Goodbye!");
        break;
    }

    console.log();
  });

program
  .command("info")
  .description("Show project information")
  .action(() => {
    const projectRoot = findProjectRoot();
    const config = loadProjectConfig(projectRoot);
    const stats = calculateProjectStats(projectRoot);

    printHeader();
    if (config) {
      printProjectInfo(config.name, config.version, config.description);
    }
    printStats(stats);
    printFooter();
  });

program
  .command("server")
  .description("Start MCP server")
  .action(async () => {
    printSuccess("Starting Jen.js MCP Server...");
    // Import and run the server
    const { JenMCPServer } = await import("./server.js");
    // The server would be instantiated and started here
  });

program
  .command("stats")
  .description("Show detailed project statistics")
  .action(() => {
    const projectRoot = findProjectRoot();
    const stats = calculateProjectStats(projectRoot);

    printHeader();
    printSection("Detailed Statistics");
    console.log(JSON.stringify(stats, null, 2));
    printFooter();
  });

program
  .command("scripts")
  .description("List available npm scripts")
  .action(() => {
    const projectRoot = findProjectRoot();
    const config = loadProjectConfig(projectRoot);

    if (!config || !config.scripts) {
      console.error(pc.red("✗ No scripts found in package.json"));
      process.exit(1);
    }

    printHeader();
    printSection("Available Scripts");

    Object.entries(config.scripts).forEach(([name, script]) => {
      console.log(`  ${pc.cyan(name.padEnd(20))} ${pc.dim(script)}`);
    });

    printFooter();
  });

program.parse(process.argv);

if (process.argv.length === 2) {
  program.help();
}
