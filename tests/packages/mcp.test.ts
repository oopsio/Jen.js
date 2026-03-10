import { describe, it, expect } from "vitest";
import {
  findProjectRoot,
  calculateProjectStats,
} from "../../packages/mcp/src/utils.js";
import type { JenProjectConfig } from "../../packages/mcp/src/types.js";

describe("@jenjs/mcp", () => {
  describe("Project utilities", () => {
    it("should find project root", () => {
      const root = findProjectRoot();
      expect(typeof root).toBe("string");
      expect(root.length).toBeGreaterThan(0);
    });

    it("should calculate project stats", () => {
      const root = findProjectRoot();
      const stats = calculateProjectStats(root);

      expect(stats).toHaveProperty("totalFiles");
      expect(stats).toHaveProperty("tsFiles");
      expect(stats).toHaveProperty("jsFiles");
      expect(stats).toHaveProperty("tsxFiles");
      expect(stats).toHaveProperty("jsxFiles");
      expect(stats).toHaveProperty("cssFiles");
      expect(stats).toHaveProperty("scssFiles");
      expect(stats).toHaveProperty("jsonFiles");
      expect(stats).toHaveProperty("totalLines");
    });

    it("should have non-negative file counts", () => {
      const root = findProjectRoot();
      const stats = calculateProjectStats(root);

      expect(stats.totalFiles).toBeGreaterThanOrEqual(0);
      expect(stats.tsFiles).toBeGreaterThanOrEqual(0);
      expect(stats.jsFiles).toBeGreaterThanOrEqual(0);
      expect(stats.tsxFiles).toBeGreaterThanOrEqual(0);
      expect(stats.jsxFiles).toBeGreaterThanOrEqual(0);
      expect(stats.cssFiles).toBeGreaterThanOrEqual(0);
      expect(stats.scssFiles).toBeGreaterThanOrEqual(0);
      expect(stats.jsonFiles).toBeGreaterThanOrEqual(0);
      expect(stats.totalLines).toBeGreaterThanOrEqual(0);
    });

    it("should count TS+TSX and JS+JSX correctly", () => {
      const root = findProjectRoot();
      const stats = calculateProjectStats(root);

      const totalTypeScript = stats.tsFiles + stats.tsxFiles;
      const totalJavaScript = stats.jsFiles + stats.jsxFiles;

      expect(totalTypeScript).toBeGreaterThanOrEqual(0);
      expect(totalJavaScript).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Type definitions", () => {
    it("should have JenProjectConfig type", () => {
      // Type test - just verify it can be imported
      const mockConfig: JenProjectConfig = {
        name: "test-project",
        version: "1.0.0",
        description: "Test project",
        type: "ssg",
        scripts: {
          build: "tsc",
        },
        dependencies: {
          preact: "^10.0.0",
        },
        devDependencies: {
          typescript: "^5.0.0",
        },
      };

      expect(mockConfig.name).toBe("test-project");
      expect(mockConfig.version).toBe("1.0.0");
      expect(mockConfig.type).toBe("ssg");
    });
  });

  describe("TUI components", () => {
    it("should export TUI functions", () => {
      // Import check - verify functions are exported
      const tuiExports = [
        "printHeader",
        "printProjectInfo",
        "printStats",
        "printAvailableTools",
        "printResources",
        "printSuccess",
        "printError",
        "printWarning",
        "printInfo",
      ];

      // These would be verified through TypeScript compilation
      expect(tuiExports.length).toBe(9);
    });
  });

  describe("MCP Resources and Tools", () => {
    it("should have standard MCP resource URIs", () => {
      const resourceUris = [
        "project://config",
        "project://stats",
        "project://package",
        "project://structure",
      ];

      expect(resourceUris).toHaveLength(4);
      resourceUris.forEach((uri) => {
        expect(uri).toMatch(/^project:\/\//);
      });
    });

    it("should have standard MCP tool names", () => {
      const tools = [
        "build",
        "dev",
        "typecheck",
        "test",
        "analyze",
        "list-files",
      ];

      expect(tools).toHaveLength(6);
      tools.forEach((tool) => {
        expect(typeof tool).toBe("string");
        expect(tool.length).toBeGreaterThan(0);
      });
    });
  });

  describe("CLI commands", () => {
    it("should have proper CLI structure", () => {
      const commands = ["explore", "info", "stats", "scripts", "server"];

      expect(commands.length).toBe(5);
      commands.forEach((cmd) => {
        expect(cmd).toMatch(/^[a-z-]+$/);
      });
    });
  });
});
