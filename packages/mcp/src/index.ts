/**
 * @jenjs/mcp - Jen.js MCP Server
 * Model Context Protocol implementation for Jen.js projects
 */

export { JenMCPServer } from "./server.js";
export {
  findProjectRoot,
  loadProjectConfig,
  calculateProjectStats,
} from "./utils.js";
export {
  printHeader,
  printProjectInfo,
  printStats,
  printAvailableTools,
  printResources,
  printSuccess,
  printError,
  printWarning,
  printInfo,
} from "./tui.js";
export type {
  JenProjectConfig,
  ProjectStats,
  MCPResourcePath,
} from "./types.js";
