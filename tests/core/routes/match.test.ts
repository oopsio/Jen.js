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
import {
  matchRoute,
  validateRouteParam,
  InvalidRouteParamError,
  type MatchResult,
} from "@src/core/routes/match.js";
import type { RouteEntry } from "@src/core/routes/scan.js";

describe("validateRouteParam", () => {
  describe("secure parameters", () => {
    it("allows alphanumeric IDs", () => {
      expect(() => validateRouteParam("id", "42", false)).not.toThrow();
      expect(() => validateRouteParam("id", "abc123", false)).not.toThrow();
    });

    it("allows underscore and hyphen", () => {
      expect(() => validateRouteParam("id", "my-id_123", false)).not.toThrow();
    });

    it("allows dots", () => {
      expect(() => validateRouteParam("file", "document.pdf", false)).not.toThrow();
    });
  });

  describe("directory traversal attacks", () => {
    it("rejects .. sequences", () => {
      expect(() => validateRouteParam("id", "..", false)).toThrow(
        InvalidRouteParamError,
      );
      expect(() => validateRouteParam("id", "../../etc/passwd", false)).toThrow(
        InvalidRouteParamError,
      );
    });

    it("rejects .. encoded as %2e%2e (after decoding)", () => {
      // Note: decodeURIComponent is called before validation in matchRoute
      const decoded = decodeURIComponent("%2e%2e");
      expect(() => validateRouteParam("id", decoded, false)).toThrow(
        InvalidRouteParamError,
      );
    });

    it("rejects mixed encoded paths like ..%2fetc", () => {
      const decoded = decodeURIComponent("..%2fetc");
      expect(() => validateRouteParam("id", decoded, false)).toThrow(
        InvalidRouteParamError,
      );
    });
  });

  describe("absolute paths", () => {
    it("rejects leading /", () => {
      expect(() => validateRouteParam("id", "/etc/passwd", false)).toThrow(
        InvalidRouteParamError,
      );
      expect(() => validateRouteParam("id", "/admin", false)).toThrow(
        InvalidRouteParamError,
      );
    });

    it("rejects %2f encoded leading slash", () => {
      const decoded = decodeURIComponent("%2fetc");
      expect(() => validateRouteParam("id", decoded, false)).toThrow(
        InvalidRouteParamError,
      );
    });
  });

  describe("null bytes", () => {
    it("rejects null bytes", () => {
      expect(() => validateRouteParam("id", "file\0.txt", false)).toThrow(
        InvalidRouteParamError,
      );
      expect(() => validateRouteParam("id", "admin\0bypass", false)).toThrow(
        InvalidRouteParamError,
      );
    });
  });

  describe("backslash attacks (Windows)", () => {
    it("rejects backslashes", () => {
      expect(() => validateRouteParam("id", "..\\etc\\passwd", false)).toThrow(
        InvalidRouteParamError,
      );
      expect(() => validateRouteParam("id", "admin\\config", false)).toThrow(
        InvalidRouteParamError,
      );
    });
  });

  describe("invalid characters", () => {
    it("rejects special characters in regular params", () => {
      expect(() => validateRouteParam("id", "a b", false)).toThrow(
        InvalidRouteParamError,
      );
      expect(() => validateRouteParam("id", "a@b", false)).toThrow(
        InvalidRouteParamError,
      );
      expect(() => validateRouteParam("id", "a!b", false)).toThrow(
        InvalidRouteParamError,
      );
    });

    it("rejects slashes in regular params", () => {
      expect(() => validateRouteParam("id", "a/b", false)).toThrow(
        InvalidRouteParamError,
      );
    });
  });

  describe("catch-all parameters", () => {
    it("allows slashes in catch-all params", () => {
      expect(() => validateRouteParam("rest", "api/v1/docs", true)).not.toThrow();
      expect(() => validateRouteParam("rest", "path/to/file", true)).not.toThrow();
    });

    it("still rejects .. in catch-all", () => {
      expect(() => validateRouteParam("rest", "../../etc/passwd", true)).toThrow(
        InvalidRouteParamError,
      );
      expect(() => validateRouteParam("rest", "api/../admin", true)).toThrow(
        InvalidRouteParamError,
      );
    });

    it("still rejects leading / in catch-all", () => {
      expect(() => validateRouteParam("rest", "/etc/passwd", true)).toThrow(
        InvalidRouteParamError,
      );
    });

    it("still rejects null bytes in catch-all", () => {
      expect(() => validateRouteParam("rest", "path\0.txt", true)).toThrow(
        InvalidRouteParamError,
      );
    });
  });
});

describe("matchRoute", () => {
  const mockRoute = (pattern: string, urlPath: string, paramNames: string[]): RouteEntry => ({
    filePath: "/src/pages/test.tsx",
    urlPath,
    pattern,
    paramNames,
    isDynamic: paramNames.length > 0,
    meta: {} as any,
  });

  describe("basic matching", () => {
    it("matches static routes", () => {
      const routes: RouteEntry[] = [mockRoute("^/$", "/", [])];
      const result = matchRoute(routes, "/");
      expect(result).not.toBeNull();
      expect(result?.route.urlPath).toBe("/");
    });

    it("matches dynamic routes with regular params", () => {
      const routes: RouteEntry[] = [
        mockRoute("^/posts/([^/]+)$", "/posts/:id", ["id"]),
      ];
      const result = matchRoute(routes, "/posts/42");
      expect(result).not.toBeNull();
      expect(result?.params.id).toBe("42");
    });

    it("matches catch-all routes", () => {
      const routes: RouteEntry[] = [
        mockRoute("^/docs/(.*)$", "/docs/*rest", ["rest"]),
      ];
      const result = matchRoute(routes, "/docs/api/v1/fetch");
      expect(result).not.toBeNull();
      expect(result?.params.rest).toBe("api/v1/fetch");
    });
  });

  describe("parameter validation", () => {
    it("rejects path traversal in regular params", () => {
      const routes: RouteEntry[] = [
        mockRoute("^/posts/([^/]+)$", "/posts/:id", ["id"]),
      ];
      // ../../etc/passwd after URL encoding would be %2e%2e%2fetc%2fpasswd
      // When decoded by the matchRoute function, it becomes ../../etc/passwd
      expect(() => matchRoute(routes, "/posts/%2e%2e%2fetc%2fpasswd")).toThrow(
        InvalidRouteParamError,
      );
    });

    it("rejects directory traversal with .. notation", () => {
      const routes: RouteEntry[] = [
        mockRoute("^/files/([^/]+)$", "/files/:name", ["name"]),
      ];
      // Direct match with .. in the param - regex only allows non-/ chars, so only .. will match
      expect(() => matchRoute(routes, "/files/..")).toThrow(InvalidRouteParamError);
    });

    it("rejects absolute paths", () => {
      const routes: RouteEntry[] = [
        mockRoute("^/user/([^/]+)$", "/user/:id", ["id"]),
      ];
      // The regex won't match if pathname starts with /user//, but let's test with encoded
      expect(() => matchRoute(routes, "/user/%2fetc")).toThrow(
        InvalidRouteParamError,
      );
    });

    it("rejects null bytes in params", () => {
      const routes: RouteEntry[] = [
        mockRoute("^/api/([^/]+)$", "/api/:endpoint", ["endpoint"]),
      ];
      expect(() => matchRoute(routes, "/api/users%00.php")).toThrow(
        InvalidRouteParamError,
      );
    });

    it("rejects backslash paths", () => {
      const routes: RouteEntry[] = [
        mockRoute("^/data/(.+)$", "/data/:file", ["file"]),
      ];
      // Backslash in param
      expect(() => matchRoute(routes, "/data/..\\..\\windows")).toThrow(
        InvalidRouteParamError,
      );
    });
  });

  describe("catch-all routes with traversal protection", () => {
    it("allows slashes in catch-all but rejects traversal", () => {
      const routes: RouteEntry[] = [
        mockRoute("^/static/(.*)$", "/static/*rest", ["rest"]),
      ];
      // Valid catch-all path
      const validResult = matchRoute(routes, "/static/css/style.css");
      expect(validResult).not.toBeNull();
      expect(validResult?.params.rest).toBe("css/style.css");

      // Traversal attempt
      expect(() => matchRoute(routes, "/static/%2e%2e%2fetc%2fpasswd")).toThrow(
        InvalidRouteParamError,
      );
    });
  });

  describe("multiple parameters", () => {
    it("validates all parameters", () => {
      const routes: RouteEntry[] = [
        mockRoute(
          "^/users/([^/]+)/posts/([^/]+)$",
          "/users/:userId/posts/:postId",
          ["userId", "postId"],
        ),
      ];

      // Valid params
      const result = matchRoute(routes, "/users/123/posts/456");
      expect(result).not.toBeNull();
      expect(result?.params.userId).toBe("123");
      expect(result?.params.postId).toBe("456");

      // Invalid first param - encoded as %2e%2e to bypass regex
      expect(() => matchRoute(routes, "/users/%2e%2e/posts/456")).toThrow(
        InvalidRouteParamError,
      );

      // Invalid second param
      expect(() => matchRoute(routes, "/users/123/posts/..%2fetc")).toThrow(
        InvalidRouteParamError,
      );
    });
  });

  describe("URL decoding", () => {
    it("decodes URL-encoded params before validation", () => {
      const routes: RouteEntry[] = [
        mockRoute("^/items/([^/]+)$", "/items/:id", ["id"]),
      ];

      // Valid encoded alphanumeric
      const result = matchRoute(routes, "/items/my%2Did");
      expect(result?.params.id).toBe("my-id");

      // Valid encoded with dots
      const dotResult = matchRoute(routes, "/items/v1%2E0");
      expect(dotResult?.params.id).toBe("v1.0");
    });

    it("rejects traversal attempts with URL encoding", () => {
      const routes: RouteEntry[] = [
        mockRoute("^/data/([^/]+)$", "/data/:file", ["file"]),
      ];

      // %2e%2e = .. after decoding
      expect(() => matchRoute(routes, "/data/%2e%2e")).toThrow(
        InvalidRouteParamError,
      );

      // %2e%2e%2fetc%2fpasswd = ../../etc/passwd after decoding
      expect(() => matchRoute(routes, "/data/%2e%2e%2fetc%2fpasswd")).toThrow(
        InvalidRouteParamError,
      );
    });
  });

  describe("no match scenarios", () => {
    it("returns null when no route matches", () => {
      const routes: RouteEntry[] = [
        mockRoute("^/posts/([^/]+)$", "/posts/:id", ["id"]),
      ];
      const result = matchRoute(routes, "/admin/settings");
      expect(result).toBeNull();
    });
  });
});
