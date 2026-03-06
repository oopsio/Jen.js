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
  createMockContext,
  createMockMiddleware,
  MockContext,
} from "../fixtures/index.js";

describe("Integration: Middleware Composition", () => {
  describe("middleware pipeline execution", () => {
    it("should execute middleware in order", async () => {
      const ctx = createMockContext();
      const order: string[] = [];

      const mw1 = await createMockMiddleware("first", (ctx) => {
        order.push("first");
      });

      const mw2 = await createMockMiddleware("second", (ctx) => {
        order.push("second");
      });

      const mw3 = await createMockMiddleware("third", (ctx) => {
        order.push("third");
      });

      await mw1(ctx);
      await mw2(ctx);
      await mw3(ctx);

      expect(order).toEqual(["first", "second", "third"]);
    });

    it("should pass context through all middleware", async () => {
      const ctx = createMockContext();

      const authMw = createMockMiddleware("auth", (c) => {
        c.user = { id: "123", name: "Test" };
      });

      const logMw = createMockMiddleware("log", (c) => {
        (c.locals as any).logged = true;
      });

      await authMw(ctx);
      expect(ctx.user?.id).toBe("123");

      await logMw(ctx);
      expect((ctx.locals as any).logged).toBe(true);
    });

    it("should allow middleware to modify context", async () => {
      const ctx = createMockContext();

      const modifyMw = createMockMiddleware("modifier", (c) => {
        c.request.path = "/modified";
        c.response.status = 201;
        c.locals!.custom = "value";
      });

      await modifyMw(ctx);

      expect(ctx.request.path).toBe("/modified");
      expect(ctx.response.status).toBe(201);
      expect((ctx.locals as any).custom).toBe("value");
    });
  });

  describe("middleware error handling", () => {
    it("should handle middleware errors", async () => {
      const ctx = createMockContext();
      let errorCaught = false;

      const errorMw = async (c: MockContext) => {
        throw new Error("Middleware error");
      };

      try {
        await errorMw(ctx);
      } catch {
        errorCaught = true;
      }

      expect(errorCaught).toBe(true);
    });

    it("should allow error recovery", async () => {
      const ctx = createMockContext();

      const errorMw = async (c: MockContext) => {
        throw new Error("Something went wrong");
      };

      const recoveryMw = createMockMiddleware("recovery", (c) => {
        c.response.status = 500;
        c.response.body = { error: "Internal Server Error" };
      });

      try {
        await errorMw(ctx);
      } catch {
        await recoveryMw(ctx);
      }

      expect(ctx.response.status).toBe(500);
      expect(ctx.response.body.error).toBe("Internal Server Error");
    });
  });

  describe("conditional middleware", () => {
    it("should apply middleware conditionally", async () => {
      const ctx = createMockContext({
        request: { path: "/api/private" },
      });

      const requireAuth = (path: string) => path.startsWith("/api/private");

      const authMw = createMockMiddleware("auth", (c) => {
        c.user = { id: "123" };
      });

      if (requireAuth(ctx.request.path)) {
        await authMw(ctx);
      }

      expect(ctx.user).toBeDefined();
    });

    it("should skip middleware for public paths", async () => {
      const ctx = createMockContext({
        request: { path: "/public/page" },
      });

      const authMw = createMockMiddleware("auth", (c) => {
        c.user = { id: "123" };
      });

      const publicPaths = ["/public", "/about"];
      const shouldAuth = !publicPaths.some((p) =>
        ctx.request.path.startsWith(p),
      );

      if (shouldAuth) {
        await authMw(ctx);
      }

      expect(ctx.user).toBeUndefined();
    });
  });

  describe("middleware composition patterns", () => {
    it("should compose middleware functions", async () => {
      const ctx = createMockContext();

      const compose = (fns: Array<(c: MockContext) => Promise<void>>) => {
        return async (c: MockContext) => {
          for (const fn of fns) {
            await fn(c);
          }
        };
      };

      const mw1 = createMockMiddleware("one", (c) => {
        c.locals!.count = 1;
      });

      const mw2 = createMockMiddleware("two", (c) => {
        c.locals!.count = (c.locals!.count || 0) + 1;
      });

      const mw3 = createMockMiddleware("three", (c) => {
        c.locals!.count = (c.locals!.count || 0) + 1;
      });

      const composed = compose([mw1, mw2, mw3]);
      await composed(ctx);

      expect((ctx.locals as any).count).toBe(3);
    });

    it("should support middleware factory pattern", async () => {
      const createHeaderMw = (headerName: string, headerValue: string) => {
        return createMockMiddleware("headers", (c) => {
          c.response.headers = c.response.headers || {};
          c.response.headers[headerName] = headerValue;
        });
      };

      const ctx = createMockContext();
      const cors = await createHeaderMw("Access-Control-Allow-Origin", "*");
      await cors(ctx);

      expect(ctx.response.headers["Access-Control-Allow-Origin"]).toBe("*");
    });

    it("should support middleware with early exit", async () => {
      const ctx = createMockContext({
        request: { headers: { authorization: "" } },
      });

      const order: string[] = [];

      const authMw = async (c: MockContext) => {
        order.push("auth");
        if (!c.request.headers.authorization) {
          c.response.status = 401;
          c.response.body = { error: "Unauthorized" };
          throw new Error("Unauthorized");
        }
      };

      const logMw = createMockMiddleware("log", (c) => {
        order.push("log");
      });

      try {
        await authMw(ctx);
        await logMw(ctx);
      } catch {
        // Error handled
      }

      expect(order).toEqual(["auth"]);
      expect(ctx.response.status).toBe(401);
    });
  });

  describe("middleware execution with multiple handlers", () => {
    it("should execute middleware before handler", async () => {
      const order: string[] = [];

      const ctx = createMockContext();

      const mw = createMockMiddleware("middleware", (c) => {
        order.push("middleware");
      });

      const handler = async () => {
        order.push("handler");
      };

      await mw(ctx);
      await handler();

      expect(order).toEqual(["middleware", "handler"]);
    });

    it("should support post-handler cleanup", async () => {
      const events: string[] = [];

      const ctx = createMockContext();

      const mw = async (c: MockContext) => {
        events.push("before");
        try {
          // Handler execution would happen here
          events.push("handler");
        } finally {
          events.push("after");
        }
      };

      await mw(ctx);

      expect(events).toEqual(["before", "handler", "after"]);
    });
  });

  describe("middleware state isolation", () => {
    it("should isolate context between requests", async () => {
      const mw = createMockMiddleware("tracker", (c) => {
        c.locals!.requestId = Math.random().toString();
      });

      const ctx1 = createMockContext();
      const ctx2 = createMockContext();

      await mw(ctx1);
      await mw(ctx2);

      expect((ctx1.locals as any).requestId).not.toBe(
        (ctx2.locals as any).requestId,
      );
    });
  });
});
