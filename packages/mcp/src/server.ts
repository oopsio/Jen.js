/**
 * Jen.js MCP Server
 * Model Context Protocol implementation for Jen.js projects
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import type { JenProjectConfig } from "./types.js";
import {
  findProjectRoot,
  loadProjectConfig,
  calculateProjectStats,
} from "./utils.js";

export class JenMCPServer {
  private server: Server;
  private projectRoot: string;
  private projectConfig: JenProjectConfig | null;

  constructor() {
    this.projectRoot = findProjectRoot();
    this.projectConfig = loadProjectConfig(this.projectRoot);

    this.server = new Server(
      {
        name: "@jenjs/mcp",
        version: "1.0.0",
      },
      {
        capabilities: {
          resources: {},
          tools: {},
          prompts: {},
        },
      },
    );

    this.setupHandlers();
  }

  private setupHandlers(): void {
    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: "project://config",
            name: "Jen.js Configuration",
            mimeType: "application/json",
          },
          {
            uri: "project://stats",
            name: "Project Statistics",
            mimeType: "application/json",
          },
          {
            uri: "project://package",
            name: "Package Information",
            mimeType: "application/json",
          },
          {
            uri: "project://structure",
            name: "Project Structure",
            mimeType: "text/plain",
          },
        ],
      };
    });

    // Read resources
    this.server.setRequestHandler(
      ReadResourceRequestSchema,
      async (request) => {
        const uri = request.params.uri;

        if (uri === "project://config") {
          try {
            const configPath = join(this.projectRoot, "jen.config.ts");
            const content = readFileSync(configPath, "utf-8");
            return {
              contents: [
                {
                  uri,
                  mimeType: "text/plain",
                  text: content,
                },
              ],
            };
          } catch (error) {
            return {
              contents: [
                {
                  uri,
                  mimeType: "application/json",
                  text: JSON.stringify({
                    error: "Configuration file not found",
                  }),
                },
              ],
            };
          }
        }

        if (uri === "project://stats") {
          const stats = calculateProjectStats(this.projectRoot);
          return {
            contents: [
              {
                uri,
                mimeType: "application/json",
                text: JSON.stringify(stats, null, 2),
              },
            ],
          };
        }

        if (uri === "project://package") {
          try {
            const packagePath = join(this.projectRoot, "package.json");
            const content = readFileSync(packagePath, "utf-8");
            return {
              contents: [
                {
                  uri,
                  mimeType: "application/json",
                  text: content,
                },
              ],
            };
          } catch {
            return {
              contents: [
                {
                  uri,
                  mimeType: "application/json",
                  text: JSON.stringify({ error: "package.json not found" }),
                },
              ],
            };
          }
        }

        if (uri === "project://structure") {
          return {
            contents: [
              {
                uri,
                mimeType: "text/plain",
                text: this.getProjectStructure(),
              },
            ],
          };
        }

        return {
          contents: [
            {
              uri,
              mimeType: "text/plain",
              text: "Resource not found",
            },
          ],
        };
      },
    );

    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "build",
            description:
              "Build the Jen.js project using the configured build script",
            inputSchema: {
              type: "object" as const,
              properties: {
                target: {
                  type: "string",
                  description: "Build target (default: production)",
                },
              },
            },
          },
          {
            name: "dev",
            description: "Start the development server",
            inputSchema: {
              type: "object" as const,
              properties: {
                port: {
                  type: "number",
                  description: "Port to run dev server on",
                },
              },
            },
          },
          {
            name: "typecheck",
            description: "Run TypeScript type checking",
            inputSchema: {
              type: "object" as const,
              properties: {},
            },
          },
          {
            name: "test",
            description: "Run the test suite",
            inputSchema: {
              type: "object" as const,
              properties: {
                watch: {
                  type: "boolean",
                  description: "Run in watch mode",
                },
              },
            },
          },
          {
            name: "analyze",
            description: "Analyze project structure and dependencies",
            inputSchema: {
              type: "object" as const,
              properties: {},
            },
          },
          {
            name: "list-files",
            description: "List project files with optional filtering",
            inputSchema: {
              type: "object" as const,
              properties: {
                filter: {
                  type: "string",
                  description: "File type filter (ts, tsx, jsx, css, etc.)",
                },
                limit: {
                  type: "number",
                  description: "Limit results",
                },
              },
            },
          },
        ],
      };
    });

    // Call tools
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case "build":
          return {
            content: [
              {
                type: "text" as const,
                text: `Building project with target: ${(args as Record<string, unknown>)?.target || "production"}. Use npm run build to execute.`,
              },
            ],
          };

        case "dev":
          return {
            content: [
              {
                type: "text" as const,
                text: `Starting development server${(args as Record<string, unknown>)?.port ? ` on port ${(args as Record<string, unknown>).port}` : ""}. Use npm run dev to start.`,
              },
            ],
          };

        case "typecheck":
          return {
            content: [
              {
                type: "text" as const,
                text: "Running TypeScript type checking. Use npm run typecheck to execute.",
              },
            ],
          };

        case "test":
          return {
            content: [
              {
                type: "text" as const,
                text: `Running tests${(args as Record<string, unknown>)?.watch ? " in watch mode" : ""}. Use npm run test to execute.`,
              },
            ],
          };

        case "analyze":
          const stats = calculateProjectStats(this.projectRoot);
          return {
            content: [
              {
                type: "text" as const,
                text: `Project Analysis:\n${JSON.stringify(stats, null, 2)}`,
              },
            ],
          };

        case "list-files":
          return {
            content: [
              {
                type: "text" as const,
                text: this.getProjectStructure(),
              },
            ],
          };

        default:
          return {
            content: [
              {
                type: "text" as const,
                text: `Unknown tool: ${name}`,
              },
            ],
            isError: true,
          };
      }
    });
  }

  private getProjectStructure(): string {
    const lines: string[] = [];
    lines.push("Jen.js Project Structure");
    lines.push("======================");
    lines.push("");

    const dirs = ["src/", "tests/", "packages/", "site/", "dist/", "examples/"];

    dirs.forEach((dir) => {
      const dirPath = join(this.projectRoot, dir);
      if (existsSync(dirPath)) {
        lines.push(` ${dir}`);
      }
    });

    lines.push("");
    lines.push("Key Files:");
    const files = [
      "package.json",
      "tsconfig.json",
      "jen.config.ts",
      "eslint.config.ts",
      "vitest.config.ts",
    ];

    files.forEach((file) => {
      const filePath = join(this.projectRoot, file);
      if (existsSync(filePath)) {
        lines.push(`   ${file}`);
      }
    });

    return lines.join("\n");
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Jen.js MCP Server started successfully");
  }
}

// Main execution
const server = new JenMCPServer();
await server.start();
