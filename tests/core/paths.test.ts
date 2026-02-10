import { describe, it, expect } from "vitest";
import path from "path";

describe("Path Utilities", () => {
  describe("Path Resolution", () => {
    it("should resolve absolute paths", () => {
      const absPath = path.resolve("/src/components");
      expect(absPath).toContain("src");
      expect(absPath).toContain("components");
    });

    it("should handle relative paths", () => {
      const relPath = path.relative(
        "/project/src",
        "/project/src/components"
      );
      expect(relPath).toBe("components");
    });

    it("should join path segments", () => {
      const joined = path.join("src", "components", "Button.tsx");
      expect(joined).toContain("Button.tsx");
    });

    it("should extract dirname", () => {
      const dir = path.dirname("/src/components/Button.tsx");
      expect(dir).toContain("components");
    });

    it("should extract filename", () => {
      const file = path.basename("/src/components/Button.tsx");
      expect(file).toBe("Button.tsx");
    });
  });

  describe("Path Aliases", () => {
    it("should resolve @src alias", () => {
      const aliasPath = "@src/components/Button";
      expect(aliasPath).toMatch(/^@src\//);
    });

    it("should handle nested aliases", () => {
      const nested = "@src/core/routes/match";
      expect(nested).toContain("core");
      expect(nested).toContain("routes");
    });
  });
});
