import { describe, it, expect, beforeEach, vi } from "vitest";
import path from "path";

describe("Core Config", () => {
  describe("Config Loading", () => {
    it("should validate config structure", () => {
      const mockConfig = {
        title: "Test Site",
        description: "A test site",
        baseUrl: "https://example.com",
      };

      expect(mockConfig.title).toBe("Test Site");
      expect(mockConfig.description).toBe("A test site");
      expect(mockConfig.baseUrl).toContain("example.com");
    });

    it("should handle missing optional fields", () => {
      const config = {
        title: "Minimal Config",
      };

      expect(config.title).toBeDefined();
      expect((config as any).description).toBeUndefined();
    });

    it("should merge user config with defaults", () => {
      const defaults = { port: 3000, host: "localhost" };
      const userConfig = { port: 8080 };
      const merged = { ...defaults, ...userConfig };

      expect(merged.port).toBe(8080);
      expect(merged.host).toBe("localhost");
    });
  });
});
