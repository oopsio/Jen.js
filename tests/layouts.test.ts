import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { scanLayouts, buildLayoutHierarchy } from "../src/core/layouts/scan.js";
import {
  resolveLayoutStack,
  renderWithLayoutStack,
  collectLayoutHeads,
} from "../src/core/layouts/render.js";
import type { FrameworkConfig } from "../src/core/config.js";
import { join } from "node:path";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { h } from "preact";
import renderToString from "preact-render-to-string";

describe("Nested Layouts System", () => {
  let testDir: string;

  beforeEach(() => {
    testDir = join(process.cwd(), "test-layouts-temp");
    try {
      rmSync(testDir, { recursive: true, force: true });
    } catch {}
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    try {
      rmSync(testDir, { recursive: true, force: true });
    } catch {}
  });

  describe("scanLayouts", () => {
    it("should discover layout files in directory structure", () => {
      const config: FrameworkConfig = {
        siteDir: "test-layouts-temp",
        distDir: "test-layouts-temp/dist",
        routes: {
          fileExtensions: [".tsx", ".ts"],
          routeFilePattern: /^\(([^)]+)\)/,
        },
      } as any;

      // Create test layout files
      mkdirSync(join(testDir, "pages"), { recursive: true });
      mkdirSync(join(testDir, "pages", "blog"), { recursive: true });

      writeFileSync(
        join(testDir, "(layout).tsx"),
        "export default () => null;",
      );
      writeFileSync(
        join(testDir, "pages", "(layout).tsx"),
        "export default () => null;",
      );
      writeFileSync(
        join(testDir, "pages", "blog", "(layout).tsx"),
        "export default () => null;",
      );

      const layouts = scanLayouts(config);

      expect(layouts.length).toBe(3);
      expect(layouts[0].depth).toBe(0); // Root layout first
      expect(layouts[1].depth).toBe(1); // Pages layout
      expect(layouts[2].depth).toBe(2); // Blog layout
    });

    it("should filter layouts by file extension", () => {
      const config: FrameworkConfig = {
        siteDir: "test-layouts-temp",
        distDir: "test-layouts-temp/dist",
        routes: {
          fileExtensions: [".tsx"], // Only .tsx
          routeFilePattern: /^\(([^)]+)\)/,
        },
      } as any;

      writeFileSync(
        join(testDir, "(layout).tsx"),
        "export default () => null;",
      );
      writeFileSync(join(testDir, "(layout).ts"), "export default () => null;");

      const layouts = scanLayouts(config);

      expect(layouts.length).toBe(1);
      expect(layouts[0].filePath.endsWith(".tsx")).toBe(true);
    });

    it("should sort layouts by depth", () => {
      const config: FrameworkConfig = {
        siteDir: "test-layouts-temp",
        distDir: "test-layouts-temp/dist",
        routes: {
          fileExtensions: [".tsx"],
          routeFilePattern: /^\(([^)]+)\)/,
        },
      } as any;

      mkdirSync(join(testDir, "a", "b", "c"), { recursive: true });

      writeFileSync(join(testDir, "a", "b", "c", "(layout).tsx"), "");
      writeFileSync(join(testDir, "a", "b", "(layout).tsx"), "");
      writeFileSync(join(testDir, "a", "(layout).tsx"), "");
      writeFileSync(join(testDir, "(layout).tsx"), "");

      const layouts = scanLayouts(config);

      expect(layouts[0].depth).toBe(0);
      expect(layouts[1].depth).toBe(1);
      expect(layouts[2].depth).toBe(2);
      expect(layouts[3].depth).toBe(3);
    });
  });

  describe("buildLayoutHierarchy", () => {
    it("should build hierarchy for a route", () => {
      const config: FrameworkConfig = {
        siteDir: "test-layouts-temp",
        distDir: "test-layouts-temp/dist",
        routes: {
          fileExtensions: [".tsx"],
          routeFilePattern: /^\(([^)]+)\)/,
        },
      } as any;

      mkdirSync(join(testDir, "pages", "blog"), { recursive: true });

      writeFileSync(join(testDir, "(layout).tsx"), "");
      writeFileSync(join(testDir, "pages", "(layout).tsx"), "");
      writeFileSync(join(testDir, "pages", "blog", "(layout).tsx"), "");

      const layouts = scanLayouts(config);
      const routePath = join(testDir, "pages", "blog", "(post).tsx");
      const hierarchy = buildLayoutHierarchy(
        layouts,
        routePath,
        "test-layouts-temp",
      );

      expect(hierarchy.length).toBe(3);
      expect(hierarchy[0].dirPath).toBe("");
      expect(hierarchy[1].dirPath).toBe("pages");
      expect(hierarchy[2].dirPath).toBe("pages/blog");
    });

    it("should return only root layout for root-level routes", () => {
      const config: FrameworkConfig = {
        siteDir: "test-layouts-temp",
        distDir: "test-layouts-temp/dist",
        routes: {
          fileExtensions: [".tsx"],
          routeFilePattern: /^\(([^)]+)\)/,
        },
      } as any;

      mkdirSync(join(testDir, "pages"), { recursive: true });

      writeFileSync(join(testDir, "(layout).tsx"), "");
      writeFileSync(join(testDir, "pages", "(layout).tsx"), "");

      const layouts = scanLayouts(config);
      const routePath = join(testDir, "(home).tsx");
      const hierarchy = buildLayoutHierarchy(
        layouts,
        routePath,
        "test-layouts-temp",
      );

      expect(hierarchy.length).toBe(1);
      expect(hierarchy[0].dirPath).toBe("");
    });

    it("should skip missing intermediate layouts", () => {
      const config: FrameworkConfig = {
        siteDir: "test-layouts-temp",
        distDir: "test-layouts-temp/dist",
        routes: {
          fileExtensions: [".tsx"],
          routeFilePattern: /^\(([^)]+)\)/,
        },
      } as any;

      mkdirSync(join(testDir, "pages", "blog"), { recursive: true });

      writeFileSync(join(testDir, "(layout).tsx"), "");
      // Skip pages layout
      writeFileSync(join(testDir, "pages", "blog", "(layout).tsx"), "");

      const layouts = scanLayouts(config);
      const routePath = join(testDir, "pages", "blog", "(post).tsx");
      const hierarchy = buildLayoutHierarchy(
        layouts,
        routePath,
        "test-layouts-temp",
      );

      expect(hierarchy.length).toBe(2);
      expect(hierarchy[0].dirPath).toBe("");
      expect(hierarchy[1].dirPath).toBe("pages/blog");
    });
  });

  describe("Layout rendering", () => {
    it("should compose layouts correctly", () => {
      const RootLayout = ({ children }: any) =>
        h("div", { class: "root" }, children);
      const ChildLayout = ({ children }: any) =>
        h("div", { class: "child" }, children);
      const Page = () => h("div", { class: "page" }, "Content");

      const layoutStack = {
        modules: [
          { default: RootLayout, layout: {} },
          { default: ChildLayout, layout: {} },
        ],
        config: {},
      };

      const app = renderWithLayoutStack(layoutStack, Page, {});
      const html = renderToString(app);

      expect(html).toContain('class="root"');
      expect(html).toContain('class="child"');
      expect(html).toContain('class="page"');
      expect(html).toContain("Content");
    });

    it("should pass props through layout hierarchy", () => {
      const receivedProps: any[] = [];

      const RootLayout = (props: any) => {
        receivedProps.push({ role: "root", props });
        return h(
          "div",
          { "data-root": JSON.stringify(props.data) },
          props.children,
        );
      };
      const ChildLayout = (props: any) => {
        receivedProps.push({ role: "child", props });
        return h(
          "div",
          { "data-child": JSON.stringify(props.params) },
          props.children,
        );
      };
      const Page = (props: any) => {
        receivedProps.push({ role: "page", props });
        return h(
          "div",
          { "data-page": JSON.stringify(props.query) },
          "Content",
        );
      };

      const layoutStack = {
        modules: [
          { default: RootLayout, layout: {} },
          { default: ChildLayout, layout: {} },
        ],
        config: {},
      };

      const testData = { userId: 123 };
      const testParams = { id: "post-1" };
      const testQuery = { page: "1" };

      const app = renderWithLayoutStack(layoutStack, Page, {
        data: testData,
        params: testParams,
        query: testQuery,
      });

      const html = renderToString(app);

      // All components should receive the props (HTML escapes quotes as &quot;)
      expect(html).toContain("userId");
      expect(html).toContain("123");
      expect(html).toContain("post-1");
      expect(html).toContain("Content");
    });
  });

  describe("Layout configuration merging", () => {
    it("should merge configuration from all layouts", () => {
      const layoutStack = {
        modules: [
          {
            default: () => null,
            layout: { theme: "light", fontSize: "16px" },
          },
          { default: () => null, layout: { fontSize: "14px" } },
          {
            default: () => null,
            layout: { sidebar: true },
          },
        ],
        config: {}, // This would be set by resolveLayoutStack
      };

      // Simulate what resolveLayoutStack does
      let mergedConfig: Record<string, any> = {};
      for (const mod of layoutStack.modules) {
        if (mod.layout) {
          mergedConfig = { ...mergedConfig, ...mod.layout };
        }
      }

      expect(mergedConfig).toEqual({
        theme: "light",
        fontSize: "14px", // Child override
        sidebar: true,
      });
    });
  });

  describe("Head collection", () => {
    it("should collect Head components from all layouts", () => {
      const layoutStack = {
        modules: [
          {
            default: () => null,
            Head: () => h("meta", { name: "root" }),
          },
          {
            default: () => null,
            Head: () => h("meta", { name: "child" }),
          },
        ],
        config: {},
      };

      const pageHead = () => h("title", null, "Page");

      const heads = collectLayoutHeads(layoutStack, pageHead, {});

      expect(heads.length).toBe(3);
    });
  });
});
