/*
 * This file is part of Jen.js.
 * Copyright (C) 2026 oopsio
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { createMockConfig } from "../fixtures/index.js";

describe("Integration: Config Validation", () => {
  describe("config merging", () => {
    it("should merge with defaults", () => {
      const config = createMockConfig({
        apiPrefix: "/v1",
      });

      expect(config.dev).toBe(true);
      expect(config.apiPrefix).toBe("/v1");
      expect(config.baseUrl).toBeDefined();
    });

    it("should override defaults", () => {
      const config = createMockConfig({
        dev: false,
        ssr: false,
      });

      expect(config.dev).toBe(false);
      expect(config.ssr).toBe(false);
    });

    it("should preserve all properties", () => {
      const config = createMockConfig();

      expect(config).toHaveProperty("root");
      expect(config).toHaveProperty("src");
      expect(config).toHaveProperty("public");
      expect(config).toHaveProperty("dist");
      expect(config).toHaveProperty("baseUrl");
      expect(config).toHaveProperty("basePath");
    });
  });

  describe("config validation rules", () => {
    it("should validate required paths", () => {
      const config = createMockConfig();

      expect(config.root).toBeTruthy();
      expect(config.src).toBeTruthy();
      expect(config.public).toBeTruthy();
      expect(config.dist).toBeTruthy();
    });

    it("should validate path format", () => {
      const config = createMockConfig();

      expect(config.root.startsWith("/")).toBe(true);
      expect(config.src.startsWith("/")).toBe(true);
      expect(config.public.startsWith("/")).toBe(true);
      expect(config.dist.startsWith("/")).toBe(true);
    });

    it("should validate baseUrl format", () => {
      const config = createMockConfig();

      expect(config.baseUrl).toMatch(/^https?:\/\//);
    });

    it("should validate basePath format", () => {
      const config = createMockConfig({
        basePath: "/app/",
      });

      expect(config.basePath).toMatch(/^\//);
    });

    it("should validate apiPrefix format", () => {
      const config = createMockConfig({
        apiPrefix: "/api",
      });

      expect(config.apiPrefix).toMatch(/^\//);
    });

    it("should validate boolean flags", () => {
      const config = createMockConfig();

      expect(typeof config.dev).toBe("boolean");
      expect(typeof config.ssr).toBe("boolean");
      expect(typeof config.islands).toBe("boolean");
    });
  });

  describe("environment-specific config", () => {
    it("should have dev-specific defaults", () => {
      const devConfig = createMockConfig({
        dev: true,
      });

      expect(devConfig.dev).toBe(true);
    });

    it("should have production-specific defaults", () => {
      const prodConfig = createMockConfig({
        dev: false,
      });

      expect(prodConfig.dev).toBe(false);
    });

    it("should allow feature flags", () => {
      const config = createMockConfig({
        ssr: true,
        islands: true,
      });

      expect(config.ssr).toBe(true);
      expect(config.islands).toBe(true);
    });

    it("should allow disabling features", () => {
      const config = createMockConfig({
        ssr: false,
        islands: false,
      });

      expect(config.ssr).toBe(false);
      expect(config.islands).toBe(false);
    });
  });

  describe("config extension", () => {
    it("should support custom properties", () => {
      const config = createMockConfig({
        // Custom extensions would go here in real implementation
      } as any);

      // All defaults should still be present
      expect(config.root).toBeDefined();
      expect(config.dev).toBeDefined();
    });
  });

  describe("config serialization", () => {
    it("should be JSON serializable", () => {
      const config = createMockConfig();
      const json = JSON.stringify(config);
      const parsed = JSON.parse(json);

      expect(parsed.root).toBe(config.root);
      expect(parsed.dev).toBe(config.dev);
      expect(parsed.ssr).toBe(config.ssr);
    });
  });

  describe("config consistency", () => {
    it("should maintain path consistency", () => {
      const config = createMockConfig();

      // src should be under root
      expect(config.src.startsWith(config.root)).toBe(true);
    });

    it("should have non-conflicting paths", () => {
      const config = createMockConfig();

      const paths = [config.root, config.src, config.public, config.dist];
      const uniquePaths = new Set(paths);

      expect(uniquePaths.size).toBe(paths.length);
    });
  });

  describe("config defaults", () => {
    it("should provide sensible defaults", () => {
      const config = createMockConfig({});

      expect(config.baseUrl).toBe("http://localhost:3000");
      expect(config.basePath).toBe("/");
      expect(config.apiPrefix).toBe("/api");
      expect(config.ssr).toBe(true);
      expect(config.islands).toBe(true);
    });
  });
});
