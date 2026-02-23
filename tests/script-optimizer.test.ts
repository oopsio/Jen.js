/**
 * Tests for script optimization module
 */

import { describe, it, expect } from "vitest";
import { ScriptOptimizer } from "../src/build/script-optimizer.js";
import { CodeSplitter } from "../src/build/code-splitter.js";
import { LazyLoader } from "../src/build/lazy-loader.js";

describe("ScriptOptimizer", () => {
  it("should hash content", () => {
    const optimizer = new ScriptOptimizer();
    const hash = optimizer.hashContent("console.log('hello')");
    expect(hash).toMatch(/^[a-f0-9]{12}$/);
  });

  it("should generate hashed filename", () => {
    const optimizer = new ScriptOptimizer();
    const result = optimizer.hashFilename("app.js", "a1b2c3d4e5f6");
    expect(result).toBe("app.a1b2c3d4e5f6.js");
  });

  it("should detect lazy modules", () => {
    const optimizer = new ScriptOptimizer();
    const source = `
      // @lazy-load:"dashboard"
      const load = () => import('./dashboard.js');
    `;
    const lazy = optimizer.detectLazyModules(source);
    expect(lazy.has("dashboard")).toBe(true);
  });

  it("should register and retrieve chunks", () => {
    const optimizer = new ScriptOptimizer();
    optimizer.registerChunk({
      id: "app",
      path: "app.js",
      size: 50000,
      dependencies: ["preact"],
    });

    const chunks = optimizer.getChunks();
    expect(chunks).toHaveLength(1);
    expect(chunks[0].filename).toBe("app.js");
  });

  it("should generate manifest", () => {
    const optimizer = new ScriptOptimizer();
    optimizer.registerChunk({
      id: "app",
      path: "app.js",
      size: 50000,
      dependencies: [],
    });

    const manifest = optimizer.generateManifest();
    expect(manifest).toHaveProperty("app.js");
    expect(manifest["app.js"]).toMatch(/^app\.[a-f0-9]{12}\.js$/);
  });

  it("should generate script tags", () => {
    const optimizer = new ScriptOptimizer();
    optimizer.registerChunk({
      id: "app",
      path: "app.js",
      size: 50000,
      dependencies: [],
    });

    const chunks = optimizer.getChunks();
    const tags = optimizer.generateScriptTags(chunks, { preload: true });

    expect(tags).toHaveLength(2); // 1 preload + 1 script
    expect(tags[0]).toContain("rel=\"preload\"");
    expect(tags[1]).toContain("<script");
  });

  it("should generate cache-busting strategy", () => {
    const optimizer = new ScriptOptimizer();
    const strategy = optimizer.generateCacheBustingStrategy();

    expect(strategy).toContain("Cache-Busting");
    expect(strategy).toContain("max-age=31536000");
    expect(strategy).toContain("immutable");
  });
});

describe("CodeSplitter", () => {
  it("should determine chunk for module paths", () => {
    const splitter = new CodeSplitter();

    expect(splitter.determineChunk("node_modules/preact/index.js")).toBe(
      "vendor",
    );
    expect(splitter.determineChunk("src/runtime/hydrate.js")).toBe("runtime");
    expect(splitter.determineChunk("src/components/button.tsx")).toBe(
      "common",
    );
  });

  it("should generate manual chunks", () => {
    const splitter = new CodeSplitter();
    const chunks = splitter.generateManualChunks();

    expect(chunks).toHaveProperty("vendor");
    expect(chunks).toHaveProperty("runtime");
    expect(chunks.vendor).toContain("preact");
  });

  it("should register custom strategy", () => {
    const splitter = new CodeSplitter();
    splitter.registerStrategy({
      name: "custom",
      test: (path) => path.includes("custom"),
      priority: 100,
    });

    // Custom strategy should match
    expect(splitter.determineChunk("src/custom/module.js")).toBe("custom");
  });

  it("should generate dependency graph", () => {
    const splitter = new CodeSplitter();
    const graph = splitter.generateDependencyGraph();

    expect(graph).toContain("Chunk Dependency Graph");
    expect(graph).toContain("vendor");
    expect(graph).toContain("runtime");
    expect(graph).toContain("Load Order");
  });

  it("should generate report", () => {
    const splitter = new CodeSplitter();
    const report = splitter.generateReport();

    expect(report).toContain("Active Strategies");
    expect(report).toContain("vendor");
  });
});

describe("LazyLoader", () => {
  it("should register lazy modules", () => {
    const loader = new LazyLoader("lazy");
    loader.register({
      id: "dashboard",
      name: "Dashboard",
      path: "src/pages/dashboard.tsx",
      chunkName: "dashboard",
    });

    const manifest = loader.getManifest();
    expect(manifest.modules).toHaveLength(1);
    expect(manifest.modules[0].name).toBe("Dashboard");
  });

  it("should detect lazy modules from source", () => {
    const loader = new LazyLoader();
    const source = `
      const Dashboard = () => import('./dashboard.tsx');
      // @lazy-load:"settings"
    `;

    const detected = loader.detectFromSource(source);
    expect(detected.length).toBeGreaterThan(0);
  });

  it("should support different loading strategies", () => {
    const lazy = new LazyLoader("lazy");
    expect(lazy.getManifest().loadingStrategy).toBe("lazy");

    const eager = new LazyLoader("eager");
    expect(eager.getManifest().loadingStrategy).toBe("eager");

    const progressive = new LazyLoader("progressive");
    expect(progressive.getManifest().loadingStrategy).toBe("progressive");
  });

  it("should generate runtime helper code", () => {
    const loader = new LazyLoader();
    const helper = loader.generateRuntimeHelper();

    expect(helper).toContain("loadLazy");
    expect(helper).toContain("prefetchLazy");
    expect(helper).toContain("lazyCache");
  });

  it("should generate lazy script tags", () => {
    const loader = new LazyLoader("progressive");
    loader.register({
      id: "dashboard",
      name: "Dashboard",
      path: "src/pages/dashboard.tsx",
      chunkName: "dashboard",
    });

    const tags = loader.generateLazyScriptTags();
    expect(tags).toContain("rel=\"prefetch\"");
    expect(tags).toContain("dashboard.js");
  });

  it("should generate visible-load helper", () => {
    const loader = new LazyLoader();
    const helper = loader.generateVisibleLoadHelper();

    expect(helper).toContain("IntersectionObserver");
    expect(helper).toContain("loadWhenVisible");
    expect(helper).toContain("loadOnInteraction");
  });

  it("should generate loading component code", () => {
    const loader = new LazyLoader();
    const component = loader.generateLoadingComponent();

    expect(component).toContain("LazyLoading");
    expect(component).toContain("LazyError");
    expect(component).toContain("withLazyFallback");
  });

  it("should generate report", () => {
    const loader = new LazyLoader("lazy");
    loader.register({
      id: "dashboard",
      name: "Dashboard",
      path: "src/pages/dashboard.tsx",
      chunkName: "dashboard",
    });

    const report = loader.generateReport();
    expect(report).toContain("Lazy-Loading Report");
    expect(report).toContain("dashboard");
    expect(report).toContain("lazy");
  });
});
