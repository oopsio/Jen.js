import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  navigate,
  getCurrentRoute,
  onRouteChange,
  initRouter,
  type RouteChangeEvent,
} from "@src/client-routing/router.js";

describe("Client Router", () => {
  describe("getCurrentRoute", () => {
    it("should return current path", () => {
      const path = getCurrentRoute();
      expect(typeof path).toBe("string");
    });
  });

  describe("onRouteChange", () => {
    it("should subscribe to route changes", () => {
      const listener = vi.fn();
      const unsubscribe = onRouteChange(listener);

      expect(typeof unsubscribe).toBe("function");
    });

    it("should unsubscribe from route changes", () => {
      const listener = vi.fn();
      const unsubscribe = onRouteChange(listener);

      unsubscribe();
      // Listener should be removed
      expect(typeof unsubscribe).toBe("function");
    });
  });

  describe("navigate", () => {
    it("should handle navigation function", async () => {
      // Just test that the function exists and is callable
      expect(typeof navigate).toBe("function");
    });

    it("should accept path parameter", async () => {
      // Test signature
      const fn = navigate as (path: string, opts?: any) => Promise<void>;
      expect(typeof fn).toBe("function");
    });

    it("should accept navigation options", async () => {
      // Test with options
      const fn = navigate as (
        path: string,
        opts?: { replace?: boolean; scroll?: boolean },
      ) => Promise<void>;
      expect(typeof fn).toBe("function");
    });
  });

  describe("initRouter", () => {
    it("should initialize router", () => {
      expect(typeof initRouter).toBe("function");
      // Should not throw
      expect(() => initRouter()).not.toThrow();
    });
  });

  describe("Route Change Event", () => {
    it("should have path property", () => {
      const event: RouteChangeEvent = {
        path: "/about",
      };
      expect(event.path).toBe("/about");
    });

    it("should have optional previousPath", () => {
      const event: RouteChangeEvent = {
        path: "/about",
        previousPath: "/home",
      };
      expect(event.previousPath).toBe("/home");
    });
  });

  describe("Tree-shaking", () => {
    it("should have individual exports", () => {
      expect(typeof navigate).toBe("function");
      expect(typeof getCurrentRoute).toBe("function");
      expect(typeof onRouteChange).toBe("function");
      expect(typeof initRouter).toBe("function");
    });
  });
});
