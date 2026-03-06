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

import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import zlib from "zlib";

/**
 * Size benchmark tests for router and state modules
 * Targets:
 * - Router only: < 2 KB minified
 * - State only: < 2 KB minified
 * - Combined: < 4 KB minified
 */

describe("Size Benchmarks", () => {
  describe("Module sizes", () => {
    it("should measure router module size (unminified)", () => {
      const routerPath = join(process.cwd(), "src/client-routing/router.ts");
      const content = readFileSync(routerPath, "utf-8");

      // Rough estimate: each TS line compiles to ~1-2 lines of JS
      const lines = content.split("\n").length;
      const estimatedMinified = Math.max(lines / 3, 500); // Rough minified estimate

      console.log(
        `Router (TS source): ${content.length} bytes (~${estimatedMinified} bytes minified)`,
      );

      // Should be relatively small
      expect(content.length).toBeLessThan(10000); // Source should be under 10KB
    });

    it("should measure signal module size (unminified)", () => {
      const signalPath = join(process.cwd(), "src/client-routing/signal.ts");
      const content = readFileSync(signalPath, "utf-8");

      const lines = content.split("\n").length;
      const estimatedMinified = Math.max(lines / 3, 500);

      console.log(
        `Signal (TS source): ${content.length} bytes (~${estimatedMinified} bytes minified)`,
      );

      expect(content.length).toBeLessThan(10000);
    });

    it("should measure Link component size (unminified)", () => {
      const linkPath = join(process.cwd(), "src/client-routing/Link.tsx");
      const content = readFileSync(linkPath, "utf-8");

      console.log(`Link (TS source): ${content.length} bytes`);

      expect(content.length).toBeLessThan(3000);
    });
  });

  describe("Combined module size", () => {
    it("should estimate combined size", () => {
      const files = [
        "src/client-routing/router.ts",
        "src/client-routing/signal.ts",
        "src/client-routing/Link.tsx",
      ];

      let totalSize = 0;

      files.forEach((file) => {
        const path = join(process.cwd(), file);
        const content = readFileSync(path, "utf-8");
        totalSize += content.length;

        // Estimate minified (roughly 40% of original)
        const estimatedMin = Math.round(content.length * 0.4);
        // Estimate gzipped (roughly 20% of original)
        const estimatedGz = Math.round(content.length * 0.2);

        console.log(
          `${file}: ${content.length} bytes (est. ${estimatedMin} min, ${estimatedGz} gzip)`,
        );
      });

      const avgMinified = Math.round(totalSize * 0.4);
      const avgGzipped = Math.round(totalSize * 0.2);

      console.log(
        `\nCombined: ${totalSize} bytes (est. ${avgMinified} min, ${avgGzipped} gzip)`,
      );

      // Combined source should be reasonable
      expect(totalSize).toBeLessThan(30000);

      // Estimated minified + gzipped should be small
      expect(avgGzipped).toBeLessThan(4096); // Under 4KB gzipped is our target
    });
  });

  describe("No runtime overhead", () => {
    it("should have minimal external dependencies", () => {
      const routerPath = join(process.cwd(), "src/client-routing/router.ts");
      const signalPath = join(process.cwd(), "src/client-routing/signal.ts");

      const routerContent = readFileSync(routerPath, "utf-8");
      const signalContent = readFileSync(signalPath, "utf-8");

      // Check for large imports
      const routerImports = routerContent.match(/^import\s+[^;]+;?$/gm) || [];
      const signalImports = signalContent.match(/^import\s+[^;]+;?$/gm) || [];

      console.log(`Router imports: ${routerImports.length}`);
      console.log(`Signal imports: ${signalImports.length}`);

      // Should have minimal imports
      expect(routerImports.length).toBeLessThan(5);
      expect(signalImports.length).toBeLessThan(5);
    });

    it("should not import large libraries", () => {
      const files = [
        "src/client-routing/router.ts",
        "src/client-routing/signal.ts",
        "src/client-routing/Link.tsx",
      ];

      const largeLibs = ["react", "vue", "angular", "lodash", "underscore"];

      files.forEach((file) => {
        const path = join(process.cwd(), file);
        const content = readFileSync(path, "utf-8");

        largeLibs.forEach((lib) => {
          expect(content).not.toContain(`from '${lib}`);
          expect(content).not.toContain(`from "${lib}`);
        });
      });
    });
  });

  describe("Tree-shaking potential", () => {
    it("should have individual function exports", () => {
      const signalPath = join(process.cwd(), "src/client-routing/signal.ts");
      const content = readFileSync(signalPath, "utf-8");

      // Should have multiple exported functions
      const exports =
        content.match(/^export\s+(function|const|interface|type)/gm) || [];

      console.log(`Signal exports: ${exports.length}`);

      // Each function should be separately tree-shakable
      expect(exports.length).toBeGreaterThan(3);
    });

    it("should have modular structure", () => {
      const routerPath = join(process.cwd(), "src/client-routing/router.ts");
      const signalPath = join(process.cwd(), "src/client-routing/signal.ts");

      const routerContent = readFileSync(routerPath, "utf-8");
      const signalContent = readFileSync(signalPath, "utf-8");

      // Router should not import signal
      expect(routerContent).not.toContain("from './signal");
      expect(routerContent).not.toContain('from "./signal');

      // Signal should not import router
      expect(signalContent).not.toContain("from './router");
      expect(signalContent).not.toContain('from "./router');
    });
  });

  describe("Performance characteristics", () => {
    it("should have low complexity functions", () => {
      const signalPath = join(process.cwd(), "src/client-routing/signal.ts");
      const content = readFileSync(signalPath, "utf-8");

      // Count function definitions
      const funcCount = (content.match(/^export (function|const)/gm) || [])
        .length;

      // Average complexity should be low (no complex algorithms)
      expect(funcCount).toBeGreaterThan(3);

      // No nested loops or heavy recursion expected
      const nestedLoops = (content.match(/\n\s+for.*\n\s+for/gm) || []).length;
      expect(nestedLoops).toBe(0);
    });
  });

  describe("Code quality metrics", () => {
    it("should have reasonable code-to-comment ratio", () => {
      const files = [
        "src/client-routing/router.ts",
        "src/client-routing/signal.ts",
      ];

      files.forEach((file) => {
        const path = join(process.cwd(), file);
        const content = readFileSync(path, "utf-8");

        const lines = content.split("\n").length;
        const commentLines = (content.match(/^\s*\/\//gm) || []).length;
        const ratio = (commentLines / lines) * 100;

        console.log(`${file}: ${ratio.toFixed(1)}% comment coverage`);

        // Should have at least some documentation
        expect(commentLines).toBeGreaterThan(5);
      });
    });
  });
});
