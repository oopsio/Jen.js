import { describe, it, expect } from "vitest";
import config from "../../packages/eslint-config-jen/index.js";

describe("@jenjs/eslint-config-jen", () => {
  it("should export a valid config array", () => {
    expect(Array.isArray(config)).toBe(true);
    expect(config.length).toBeGreaterThan(0);
  });

  it("should include ignore patterns", () => {
    const ignoreConfig = config.find((c) => "ignores" in c);
    expect(ignoreConfig).toBeDefined();
    expect((ignoreConfig as Record<string, unknown>)?.ignores).toContain(
      "node_modules/",
    );
  });

  it("should have JavaScript/TypeScript base config", () => {
    const baseConfig = config.find((c) => {
      const files = (c as Record<string, unknown>).files;
      return (
        Array.isArray(files) &&
        files.some((f: unknown) => String(f).includes("js"))
      );
    });
    expect(baseConfig).toBeDefined();
    expect((baseConfig as Record<string, unknown>)?.rules).toBeDefined();
  });

  it("should have TypeScript configs", () => {
    const tsConfigs = config.filter((c) => {
      const files = (c as Record<string, unknown>).files;
      return (
        Array.isArray(files) &&
        files.some((f: unknown) => String(f).includes("ts"))
      );
    });
    expect(tsConfigs.length).toBeGreaterThan(0);
  });

  it("should have test file config", () => {
    const testConfig = config.find((c) => {
      const files = (c as Record<string, unknown>).files;
      return (
        Array.isArray(files) &&
        files.some((f: unknown) => String(f).includes("test"))
      );
    });
    expect(testConfig).toBeDefined();
  });

  it("should enforce style rules", () => {
    const baseConfig = config.find((c) => {
      const files = (c as Record<string, unknown>).files;
      return (
        Array.isArray(files) &&
        files.includes("**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}")
      );
    });

    const rules = (baseConfig as Record<string, unknown>)?.rules as Record<
      string,
      unknown
    >;
    expect(rules?.semi).toBeDefined();
    expect(rules?.quotes).toBeDefined();
    expect(rules?.indent).toBeDefined();
  });

  it("should enforce TypeScript best practices", () => {
    const tsConfigs = config.filter((c) => {
      const rules = (c as Record<string, unknown>).rules;
      return typeof rules === "object" && rules !== null;
    });

    // Find config with TypeScript-specific rules
    let foundRules = false;
    tsConfigs.forEach((tsConfig) => {
      const rules = (tsConfig as Record<string, unknown>)?.rules as Record<
        string,
        unknown
      >;
      if (
        rules?.["@typescript-eslint/no-unused-vars"] ||
        rules?.["@typescript-eslint/no-explicit-any"]
      ) {
        foundRules = true;
      }
    });

    expect(foundRules).toBe(true);
  });

  it("should have complexity limits", () => {
    const baseConfig = config.find((c) => {
      const files = (c as Record<string, unknown>).files;
      return (
        Array.isArray(files) &&
        files.includes("**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}")
      );
    });

    const rules = (baseConfig as Record<string, unknown>)?.rules as Record<
      string,
      unknown
    >;
    expect(rules?.complexity).toBeDefined();
    expect(rules?.["max-lines"]).toBeDefined();
  });
});
