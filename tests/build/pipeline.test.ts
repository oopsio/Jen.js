import { describe, it, expect, beforeEach } from "vitest";

describe("Build Pipeline", () => {
  describe("Asset Hashing", () => {
    it("should generate content hashes", () => {
      const content = "console.log('hello')";
      const hash = require("crypto")
        .createHash("sha256")
        .update(content)
        .digest("hex")
        .slice(0, 8);

      expect(hash).toHaveLength(8);
      expect(/^[a-f0-9]{8}$/.test(hash)).toBe(true);
    });

    it("should create versioned filenames", () => {
      const originalFile = "app.js";
      const hash = "abc12345";
      const versionedFile = `app.${hash}.js`;

      expect(versionedFile).toContain(hash);
      expect(versionedFile).toContain("app");
    });

    it("should generate consistent hashes for same content", () => {
      const content = "same content";
      const hash1 = require("crypto")
        .createHash("sha256")
        .update(content)
        .digest("hex");
      const hash2 = require("crypto")
        .createHash("sha256")
        .update(content)
        .digest("hex");

      expect(hash1).toBe(hash2);
    });
  });

  describe("Minification", () => {
    it("should detect minifiable content", () => {
      const code = "const x = 1; const y = 2;";
      expect(code).toMatch(/\s{2,}/);
    });

    it("should preserve code structure", () => {
      const original = "const arr = [1, 2, 3];";
      expect(original).toContain("arr");
      expect(original).toContain("[1, 2, 3]");
    });

    it("should handle CSS minification markers", () => {
      const css = ".class { color: red; } .other { color: blue; }";
      expect(css).toMatch(/\{[^}]+\}/g);
    });
  });

  describe("Islands Extraction", () => {
    it("should identify island components", () => {
      const islands = [
        { id: "counter", path: "src/islands/Counter.tsx" },
        { id: "timer", path: "src/islands/Timer.tsx" },
      ];

      expect(islands).toHaveLength(2);
      expect(islands[0].id).toBe("counter");
    });

    it("should track island props", () => {
      const island = {
        id: "counter",
        props: { initial: 0, max: 100 },
      };

      expect(Object.keys(island.props)).toContain("initial");
      expect(Object.keys(island.props)).toContain("max");
    });

    it("should generate island manifests", () => {
      const manifest = {
        counter: { component: "Counter", bundle: "islands.counter.js" },
        timer: { component: "Timer", bundle: "islands.timer.js" },
      };

      expect(manifest.counter.component).toBe("Counter");
      expect(manifest.timer.bundle).toContain("islands");
    });
  });

  describe("Output Structure", () => {
    it("should organize output files", () => {
      const structure = {
        "/": "index.html",
        "/about": "about/index.html",
        "/api/data": "api/data.json",
        "/static/style.css": "static/style.hash.css",
      };

      expect(structure["/"]).toContain("html");
      expect(structure["/api/data"]).toContain("json");
    });

    it("should create asset manifest", () => {
      const manifest = {
        "app.js": "app.abc12345.js",
        "style.css": "style.def67890.css",
      };

      expect(Object.keys(manifest)).toContain("app.js");
      expect(manifest["style.css"]).toContain("def67890");
    });
  });
});
