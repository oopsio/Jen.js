/**
 * Type definitions for Jen.js MCP Server
 */

export interface JenProjectConfig {
  name: string;
  version: string;
  description?: string;
  type?: "static" | "ssr" | "ssg" | "hybrid";
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export interface ProjectStats {
  totalFiles: number;
  tsFiles: number;
  jsFiles: number;
  tsxFiles: number;
  jsxFiles: number;
  cssFiles: number;
  scssFiles: number;
  jsonFiles: number;
  totalLines: number;
  buildSize?: number;
}

export interface BuildCommand {
  name: string;
  command: string;
  description: string;
}

export interface MCPResourcePath {
  type: "file" | "directory" | "config" | "stats";
  path: string;
  mimeType?: string;
}

export interface MCPToolResult {
  success: boolean;
  output?: string;
  error?: string;
  data?: unknown;
}
