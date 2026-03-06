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
  scanServerActions,
  matchServerAction,
  required,
  minLength,
  email,
  custom,
} from "../src/server-actions/index.js";
import type {
  ServerActionEntry,
  ValidationSchema,
  ServerActionContext,
} from "../src/server-actions/index.js";
import { createServerActionContext } from "../src/server-actions/handler.js";
import type { IncomingMessage, ServerResponse } from "node:http";

describe("Server Actions", () => {
  describe("Scanning and Discovery", () => {
    it("should scan server actions from directory", () => {
      const config = {
        siteDir: "site",
        routes: {
          routeFilePattern: /^\(([^)]+)\)$/,
          fileExtensions: [".tsx", ".ts", ".jsx", ".js"],
        },
        distDir: "dist",
        css: {},
        build: {},
      };

      const actions = scanServerActions(config);

      // Should find example actions
      expect(actions.length).toBeGreaterThan(0);
      expect(actions.some((a) => a.actionPath === "/greet")).toBe(true);
      expect(actions.some((a) => a.actionPath === "/blog/publish")).toBe(true);
    });

    it("should generate correct action names", () => {
      const config = {
        siteDir: "site",
        routes: {
          routeFilePattern: /^\(([^)]+)\)$/,
          fileExtensions: [".tsx", ".ts", ".jsx", ".js"],
        },
        distDir: "dist",
        css: {},
        build: {},
      };

      const actions = scanServerActions(config);
      const greetAction = actions.find((a) => a.actionPath === "/greet");
      const publishAction = actions.find(
        (a) => a.actionPath === "/blog/publish",
      );

      expect(greetAction?.name).toBe("greet");
      expect(publishAction?.name).toBe("blog.publish");
    });
  });

  describe("Route Matching", () => {
    let actions: ServerActionEntry[];

    beforeEach(() => {
      actions = [
        {
          id: "greet",
          filePath: "/site/actions/greet.ts",
          actionPath: "/greet",
          name: "greet",
        },
        {
          id: "blog_publish",
          filePath: "/site/actions/blog/publish.ts",
          actionPath: "/blog/publish",
          name: "blog.publish",
        },
        {
          id: "user_id_update",
          filePath: "/site/actions/user/[id]/update.ts",
          actionPath: "/user/:id/update",
          name: "user.update",
        },
      ];
    });

    it("should match exact action paths", () => {
      const match = matchServerAction(actions, "/greet");

      expect(match).not.toBeNull();
      expect(match?.action.name).toBe("greet");
      expect(match?.params).toEqual({});
    });

    it("should match nested action paths", () => {
      const match = matchServerAction(actions, "/blog/publish");

      expect(match).not.toBeNull();
      expect(match?.action.name).toBe("blog.publish");
    });

    it("should match dynamic routes with parameters", () => {
      const match = matchServerAction(actions, "/user/123/update");

      expect(match).not.toBeNull();
      expect(match?.action.name).toBe("user.update");
      expect(match?.params).toEqual({ id: "123" });
    });

    it("should return null for unmatched paths", () => {
      const match = matchServerAction(actions, "/nonexistent");

      expect(match).toBeNull();
    });
  });

  describe("Validation", () => {
    it("should validate required fields", () => {
      const schema: ValidationSchema = {
        name: [required()],
      };

      const result = required().validate("");
      expect(result).toBeDefined();

      const result2 = required().validate("John");
      expect(result2).toBeUndefined();
    });

    it("should validate minimum length", () => {
      const rule = minLength(3);

      expect(rule.validate("ab")).toBeDefined(); // Too short
      expect(rule.validate("abc")).toBeUndefined(); // Valid
      expect(rule.validate("abcd")).toBeUndefined(); // Valid
    });

    it("should validate email format", () => {
      const rule = email();

      expect(rule.validate("invalid")).toBeDefined();
      expect(rule.validate("user@example.com")).toBeUndefined();
      expect(rule.validate("test.email+tag@domain.co.uk")).toBeUndefined();
    });

    it("should compose validation rules", () => {
      const schema: ValidationSchema = {
        email: [required(), email()],
        password: [required(), minLength(8)],
      };

      expect(schema.email.length).toBe(2);
      expect(schema.password.length).toBe(2);
    });

    it("should support custom validators", () => {
      const rule = custom((v) => {
        if (v.length < 3) return "Min 3 chars";
        return true;
      }, "Invalid username");

      expect(rule.validate("ab")).toBeDefined();
      expect(rule.validate("abc")).toBeUndefined();
    });
  });

  describe("Context Validation", () => {
    it("should validate input against schema", async () => {
      const mockReq = {} as IncomingMessage;
      const mockRes = {} as ServerResponse;
      const mockUrl = new URL("http://localhost/actions/test");

      const ctx = await createServerActionContext({
        req: mockReq,
        res: mockRes,
        url: mockUrl,
        headers: {},
        cookies: {},
      });

      const schema: ValidationSchema = {
        email: [required(), email()],
        name: [required(), minLength(2)],
      };

      // Valid input
      const validResult = ctx.validate(
        { email: "user@example.com", name: "John" },
        schema,
      );

      expect(validResult.success).toBe(true);
      expect(validResult.errors).toEqual({});

      // Invalid input - missing email
      const invalidResult = ctx.validate({ email: "", name: "John" }, schema);

      expect(invalidResult.success).toBe(false);
      expect(invalidResult.errors.email).toBeDefined();

      // Invalid input - invalid email format
      const badEmailResult = ctx.validate(
        { email: "invalid", name: "John" },
        schema,
      );

      expect(badEmailResult.success).toBe(false);
      expect(badEmailResult.errors.email).toBeDefined();
    });
  });
});
