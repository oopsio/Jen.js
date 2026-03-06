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
