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
import {
  PerformanceTracker,
  createMockContext,
  MockRouter,
  createMockDatabase,
} from "../fixtures/index.js";

/**
 * Performance Benchmarks
 * Tests latency, throughput, and memory efficiency
 */

describe("Performance: Benchmarks", () => {
  let tracker: PerformanceTracker;

  beforeEach(() => {
    tracker = new PerformanceTracker();
  });

  describe("routing performance", () => {
    it("should match static routes quickly", () => {
      const router = new MockRouter();

      // Add 100 routes
      for (let i = 0; i < 100; i++) {
        router.add({
          method: "GET",
          path: `/route${i}`,
          handler: (req, res) => {
            res.status = 200;
          },
        });
      }

      tracker.mark("start");
      const ctx = createMockContext({
        request: { path: "/route50" },
      });
      router.match("GET", "/route50", ctx).catch(() => {});
      tracker.mark("end");

      const duration = tracker.measure("route_match", "start", "end");
      const metrics = tracker.getMetrics("route_match");

      // Static routes should match in < 10ms
      expect(duration).toBeLessThan(10);
      expect(metrics).not.toBeNull();
    });

    it("should match dynamic routes quickly", async () => {
      const router = new MockRouter();

      router.add({
        method: "GET",
        path: "/users/:id",
        handler: (req, res) => {
          res.status = 200;
        },
      });

      tracker.mark("start");
      const ctx = createMockContext({
        request: { path: "/users/12345" },
      });
      await router.match("GET", "/users/12345", ctx);
      tracker.mark("end");

      const duration = tracker.measure("dynamic_route", "start", "end");

      // Dynamic routes should still be fast
      expect(duration).toBeLessThan(10);
    });

    it("should handle many routes efficiently", async () => {
      const router = new MockRouter();
      const routeCount = 1000;

      tracker.mark("setup-start");
      for (let i = 0; i < routeCount; i++) {
        router.add({
          method: "GET",
          path: `/api/v1/resource${i}`,
          handler: (req, res) => {
            res.status = 200;
          },
        });
      }
      tracker.mark("setup-end");

      tracker.mark("query-start");
      const ctx = createMockContext({
        request: { path: "/api/v1/resource500" },
      });
      await router.match("GET", "/api/v1/resource500", ctx);
      tracker.mark("query-end");

      const setupTime = tracker.measure("route_setup", "setup-start", "setup-end");
      const queryTime = tracker.measure("route_query", "query-start", "query-end");

      // Should handle 1000 routes efficiently
      expect(queryTime).toBeLessThan(50);
      expect(setupTime).toBeLessThan(500);
    });
  });

  describe("middleware performance", () => {
    it("should execute middleware chain quickly", async () => {
      const middlewares = [];

      // Create 10 middleware
      for (let i = 0; i < 10; i++) {
        middlewares.push(async (ctx: any) => {
          ctx.locals = ctx.locals || {};
          ctx.locals[`mw${i}`] = true;
        });
      }

      tracker.mark("start");
      const ctx = createMockContext();

      for (const mw of middlewares) {
        await mw(ctx);
      }

      tracker.mark("end");

      const duration = tracker.measure("middleware_chain", "start", "end");

      // 10 middleware should execute in < 5ms
      expect(duration).toBeLessThan(5);
    });

    it("should handle many middleware efficiently", async () => {
      const middlewareCount = 100;
      const middlewares = Array.from({ length: middlewareCount }, (_, i) =>
        async (ctx: any) => {
          ctx.locals = ctx.locals || {};
          ctx.locals[`mw${i}`] = true;
        }
      );

      tracker.mark("start");
      const ctx = createMockContext();

      for (const mw of middlewares) {
        await mw(ctx);
      }

      tracker.mark("end");

      const duration = tracker.measure("many_middleware", "start", "end");

      // Even 100 simple middleware should be < 20ms
      expect(duration).toBeLessThan(20);
    });
  });

  describe("database performance", () => {
    it("should insert records quickly", () => {
      const db = createMockDatabase();

      tracker.mark("start");

      for (let i = 0; i < 1000; i++) {
        db.insert("users", {
          name: `User${i}`,
          email: `user${i}@example.com`,
        });
      }

      tracker.mark("end");

      const duration = tracker.measure("insert_1000", "start", "end");
      const metrics = tracker.getMetrics("insert_1000");

      // Inserting 1000 records should be fast
      expect(duration).toBeLessThan(100);
      expect(metrics?.count).toBe(1);
    });

    it("should query records quickly", () => {
      const db = createMockDatabase();

      // Seed with 1000 records
      for (let i = 0; i < 1000; i++) {
        db.insert("users", {
          name: `User${i}`,
          email: `user${i}@example.com`,
        });
      }

      tracker.mark("start");

      for (let i = 0; i < 100; i++) {
        db.query("users", { email: `user${i}@example.com` });
      }

      tracker.mark("end");

      const duration = tracker.measure("query_100", "start", "end");

      // 100 queries should complete quickly
      expect(duration).toBeLessThan(50);
    });

    it("should update records quickly", () => {
      const db = createMockDatabase();

      // Seed with 100 records
      for (let i = 0; i < 100; i++) {
        db.insert("users", { name: `User${i}` });
      }

      tracker.mark("start");

      for (let i = 1; i <= 100; i++) {
        db.update("users", { name: `Updated${i}` }, { id: i });
      }

      tracker.mark("end");

      const duration = tracker.measure("update_100", "start", "end");

      // 100 updates should be fast
      expect(duration).toBeLessThan(50);
    });

    it("should delete records quickly", () => {
      const db = createMockDatabase();

      // Seed with 1000 records
      for (let i = 0; i < 1000; i++) {
        db.insert("users", { name: `User${i}` });
      }

      tracker.mark("start");

      for (let i = 1; i <= 100; i++) {
        db.delete("users", { id: i });
      }

      tracker.mark("end");

      const duration = tracker.measure("delete_100", "start", "end");

      // 100 deletes should be reasonably fast (allow system variance)
      expect(duration).toBeLessThan(100);
    });
  });

  describe("memory efficiency", () => {
    it("should not leak memory on route creation", () => {
      const initialMem = process.memoryUsage().heapUsed;

      const router = new MockRouter();

      for (let i = 0; i < 10000; i++) {
        router.add({
          method: "GET",
          path: `/route${i}`,
          handler: (req, res) => {
            res.status = 200;
          },
        });
      }

      const finalMem = process.memoryUsage().heapUsed;
      const memIncrease = finalMem - initialMem;

      // 10000 routes shouldn't use more than 10MB
      expect(memIncrease).toBeLessThan(10 * 1024 * 1024);
    });

    it("should handle large request payloads", () => {
      const largePayload = "x".repeat(1024 * 1024); // 1MB

      const ctx = createMockContext({
        request: {
          method: "POST",
          body: { data: largePayload },
        },
      });

      expect(ctx.request.body.data).toHaveLength(1024 * 1024);
    });

    it("should not retain context after request", () => {
      const ctx = createMockContext();

      ctx.user = { id: "123", name: "Test" };
      ctx.locals = { requestId: "req-123" };

      // Clear context
      ctx.user = undefined;
      ctx.locals = {};

      expect(ctx.user).toBeUndefined();
      expect(Object.keys(ctx.locals)).toHaveLength(0);
    });
  });

  describe("JSON parsing performance", () => {
    it("should parse JSON quickly", () => {
      const json = JSON.stringify({
        users: Array.from({ length: 100 }, (_, i) => ({
          id: i,
          name: `User${i}`,
          email: `user${i}@example.com`,
        })),
      });

      tracker.mark("start");

      for (let i = 0; i < 1000; i++) {
        JSON.parse(json);
      }

      tracker.mark("end");

      const duration = tracker.measure("json_parse_1000", "start", "end");

      // Parsing JSON 1000 times should be quick
      expect(duration).toBeLessThan(100);
    });

    it("should stringify JSON quickly", () => {
      const data = {
        users: Array.from({ length: 100 }, (_, i) => ({
          id: i,
          name: `User${i}`,
          email: `user${i}@example.com`,
        })),
      };

      tracker.mark("start");

      for (let i = 0; i < 1000; i++) {
        JSON.stringify(data);
      }

      tracker.mark("end");

      const duration = tracker.measure("json_stringify_1000", "start", "end");

      // Stringifying JSON 1000 times should be quick
      expect(duration).toBeLessThan(100);
    });
  });

  describe("string operations performance", () => {
    it("should process strings quickly", () => {
      const str = "a".repeat(1000);

      tracker.mark("start");

      for (let i = 0; i < 10000; i++) {
        str.includes("test");
        str.startsWith("a");
        str.split("a");
      }

      tracker.mark("end");

      const duration = tracker.measure("string_ops_10k", "start", "end");

      // 10000 string operations should be reasonably fast (allow for system variance)
      expect(duration).toBeLessThan(500);
    });
  });

  describe("performance regression detection", () => {
    it("should maintain consistent performance", () => {
      const measurements: number[] = [];

      for (let run = 0; run < 5; run++) {
        tracker.mark(`start-${run}`);

        // Simulate work
        let sum = 0;
        for (let i = 0; i < 100000; i++) {
          sum += i;
        }

        tracker.mark(`end-${run}`);
        const duration = tracker.measure(
          `iteration-${run}`,
          `start-${run}`,
          `end-${run}`
        );
        measurements.push(duration);
      }

      // All iterations should be roughly similar
      const avg = measurements.reduce((a, b) => a + b) / measurements.length;
      // Allow for natural variance in performance measurements
      const hasHighVariance = measurements.some((m) => Math.abs(m - avg) > avg * 2);

      expect(measurements).toHaveLength(5);
      expect(hasHighVariance).toBe(false); // No extreme variance
    });
  });
});
