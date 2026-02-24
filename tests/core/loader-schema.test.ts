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

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  createTypedLoader,
  composeLoaders,
  validateSchema,
  withLoaderValidation,
  withLoaderContext,
  LoaderFactory,
  isLoaderData,
  LoaderSchemaError,
  type LoaderComponentProps,
  type LoaderSchema,
} from "../../../src/core/loader-schema.ts";
import type { LoaderContext } from "../../../src/core/types.ts";

/**
 * Test schemas
 */
interface BlogPost {
  id: number;
  title: string;
  content: string;
}

interface BlogListData extends LoaderSchema {
  posts: BlogPost[];
  count: number;
  timestamp: string;
}

interface PostDetailData extends LoaderSchema {
  post: BlogPost;
  relatedPosts: BlogPost[];
}

/**
 * Helper to create a loader context
 */
function createLoaderContext(overrides?: Partial<LoaderContext>): LoaderContext {
  return {
    url: new URL("http://localhost:3000"),
    params: {},
    query: {},
    headers: {},
    cookies: {},
    ...overrides,
  };
}

describe("loader-schema", () => {
  describe("createTypedLoader", () => {
    it("creates a typed loader with correct return type", async () => {
      const loader = createTypedLoader<BlogListData>(async (ctx) => ({
        posts: [
          { id: 1, title: "Post 1", content: "Content 1" },
          { id: 2, title: "Post 2", content: "Content 2" },
        ],
        count: 2,
        timestamp: new Date().toISOString(),
      }));

      const ctx = createLoaderContext();
      const result = await loader(ctx);

      expect(result.posts).toHaveLength(2);
      expect(result.count).toBe(2);
      expect(typeof result.timestamp).toBe("string");
    });

    it("supports synchronous loaders", () => {
      const loader = createTypedLoader<BlogListData>((ctx) => ({
        posts: [],
        count: 0,
        timestamp: new Date().toISOString(),
      }));

      const ctx = createLoaderContext();
      const result = loader(ctx);

      expect(result.posts).toEqual([]);
      expect(result.count).toBe(0);
    });

    it("receives LoaderContext with params", async () => {
      const ctx = createLoaderContext({
        params: { id: "123", slug: "test-post" },
      });

      const loader = createTypedLoader<{ id: string; slug: string }>(
        (loaderCtx) => ({
          id: loaderCtx.params.id || "",
          slug: loaderCtx.params.slug || "",
        })
      );

      const result = await loader(ctx);
      expect(result.id).toBe("123");
      expect(result.slug).toBe("test-post");
    });

    it("receives LoaderContext with query parameters", async () => {
      const ctx = createLoaderContext({
        query: { page: "2", limit: "10" },
      });

      const loader = createTypedLoader<{ page: string; limit: string }>(
        (loaderCtx) => ({
          page: loaderCtx.query.page || "1",
          limit: loaderCtx.query.limit || "5",
        })
      );

      const result = await loader(ctx);
      expect(result.page).toBe("2");
      expect(result.limit).toBe("10");
    });
  });

  describe("composeLoaders", () => {
    it("merges multiple loaders", async () => {
      const loader1 = createTypedLoader<{ posts: BlogPost[] }>(async (ctx) => ({
        posts: [
          { id: 1, title: "Post 1", content: "Content" },
          { id: 2, title: "Post 2", content: "Content" },
        ],
      }));

      const loader2 = createTypedLoader<{ count: number }>(async (ctx) => ({
        count: 2,
      }));

      const composed = composeLoaders([loader1, loader2]);
      const ctx = createLoaderContext();
      const result = await composed(ctx);

      expect(result.posts).toHaveLength(2);
      expect(result.count).toBe(2);
    });

    it("uses Promise.all for parallel execution", async () => {
      const timings: number[] = [];

      const loader1 = createTypedLoader<{ a: number }>(async (ctx) => {
        const start = Date.now();
        await new Promise((r) => setTimeout(r, 50));
        timings.push(Date.now() - start);
        return { a: 1 };
      });

      const loader2 = createTypedLoader<{ b: number }>(async (ctx) => {
        const start = Date.now();
        await new Promise((r) => setTimeout(r, 50));
        timings.push(Date.now() - start);
        return { b: 2 };
      });

      const composed = composeLoaders([loader1, loader2]);
      const ctx = createLoaderContext();
      const start = Date.now();
      await composed(ctx);
      const totalTime = Date.now() - start;

      // Should be ~50ms (parallel), not ~100ms (sequential)
      expect(totalTime).toBeLessThan(100);
    });

    it("supports 3+ loaders", async () => {
      const composed = composeLoaders([
        createTypedLoader<{ a: number }>((ctx) => ({ a: 1 })),
        createTypedLoader<{ b: number }>((ctx) => ({ b: 2 })),
        createTypedLoader<{ c: number }>((ctx) => ({ c: 3 })),
      ]);

      const ctx = createLoaderContext();
      const result = await composed(ctx);

      expect(result).toEqual({ a: 1, b: 2, c: 3 });
    });
  });

  describe("validateSchema", () => {
    it("validates correct data", () => {
      const schema = {
        posts: (v: unknown): v is BlogPost[] => Array.isArray(v),
        count: (v: unknown): v is number => typeof v === "number",
      };

      const data = {
        posts: [{ id: 1, title: "Post", content: "Content" }],
        count: 1,
      };

      expect(validateSchema(schema, data)).toBe(true);
    });

    it("rejects missing fields", () => {
      const schema = {
        posts: (v: unknown): v is BlogPost[] => Array.isArray(v),
        count: (v: unknown): v is number => typeof v === "number",
      };

      const data = { posts: [] };

      expect(validateSchema(schema, data)).toBe(false);
    });

    it("rejects invalid field types", () => {
      const schema = {
        posts: (v: unknown): v is BlogPost[] => Array.isArray(v),
        count: (v: unknown): v is number => typeof v === "number",
      };

      const data = {
        posts: "not an array",
        count: 1,
      };

      expect(validateSchema(schema, data)).toBe(false);
    });

    it("rejects null/undefined data", () => {
      const schema = {
        posts: (v: unknown): v is BlogPost[] => Array.isArray(v),
      };

      expect(validateSchema(schema, null)).toBe(false);
      expect(validateSchema(schema, undefined)).toBe(false);
    });
  });

  describe("withLoaderValidation", () => {
    it("validates loader output", async () => {
      const loader = createTypedLoader<BlogListData>(async (ctx) => ({
        posts: [{ id: 1, title: "Post", content: "Content" }],
        count: 1,
        timestamp: new Date().toISOString(),
      }));

      const validated = withLoaderValidation(
        loader,
        (data): data is BlogListData => {
          return (
            Array.isArray(data.posts) &&
            typeof data.count === "number" &&
            typeof data.timestamp === "string"
          );
        }
      );

      const ctx = createLoaderContext();
      const result = await validated(ctx);

      expect(result.posts).toHaveLength(1);
    });

    it("throws LoaderSchemaError on validation failure", async () => {
      const loader = createTypedLoader<BlogListData>(async (ctx) => ({
        posts: "invalid",
        count: 1,
        timestamp: new Date().toISOString(),
      } as any));

      const validated = withLoaderValidation(
        loader,
        (data): data is BlogListData => {
          return Array.isArray(data.posts);
        }
      );

      const ctx = createLoaderContext();

      await expect(validated(ctx)).rejects.toThrow(LoaderSchemaError);
    });
  });

  describe("withLoaderContext", () => {
    it("includes LoaderContext in data", async () => {
      const loader = withLoaderContext(
        createTypedLoader<BlogListData>(async (ctx) => ({
          posts: [],
          count: 0,
          timestamp: new Date().toISOString(),
        }))
      );

      const ctx = createLoaderContext({
        params: { id: "123" },
      });

      const result = await loader(ctx);

      expect(result._context).toBeDefined();
      expect(result._context.params.id).toBe("123");
    });
  });

  describe("LoaderFactory.byId", () => {
    it("extracts id from params", async () => {
      const loader = LoaderFactory.byId<PostDetailData>(async (id, ctx) => ({
        post: { id: parseInt(id), title: "Post", content: "Content" },
        relatedPosts: [],
      }));

      const ctx = createLoaderContext({ params: { id: "42" } });
      const result = await loader(ctx);

      expect(result.post.id).toBe(42);
    });

    it("throws if id is missing", async () => {
      const loader = LoaderFactory.byId<PostDetailData>(async (id, ctx) => ({
        post: { id: 0, title: "Post", content: "Content" },
        relatedPosts: [],
      }));

      const ctx = createLoaderContext({ params: {} });

      await expect(loader(ctx)).rejects.toThrow("Missing required route parameter: id");
    });
  });

  describe("LoaderFactory.paginated", () => {
    it("parses page from query params", async () => {
      const loader = LoaderFactory.paginated<BlogListData>(async (page, ctx) => ({
        posts: [],
        count: 100,
        timestamp: new Date().toISOString(),
      }));

      const ctx = createLoaderContext({ query: { page: "3" } });
      const result = await loader(ctx);

      expect(result.posts).toBeDefined();
    });

    it("defaults to page 1", async () => {
      const pageLoader = vi.fn(async (page: number) => ({
        posts: [],
        count: 0,
        timestamp: new Date().toISOString(),
      }));

      const loader = LoaderFactory.paginated<BlogListData>(pageLoader);
      const ctx = createLoaderContext({ query: {} });

      await loader(ctx);

      expect(pageLoader).toHaveBeenCalledWith(1, expect.any(Object));
    });
  });

  describe("LoaderFactory.protected", () => {
    it("returns error if no auth header", async () => {
      const loader = LoaderFactory.protected<BlogListData>(async (ctx) => ({
        posts: [],
        count: 0,
        timestamp: new Date().toISOString(),
      }));

      const ctx = createLoaderContext({ headers: {} });
      const result = await loader(ctx);

      expect(result).toEqual({ error: "Unauthorized" });
    });

    it("calls loader if auth header present", async () => {
      const loader = LoaderFactory.protected<BlogListData>(async (ctx) => ({
        posts: [{ id: 1, title: "Post", content: "Content" }],
        count: 1,
        timestamp: new Date().toISOString(),
      }));

      const ctx = createLoaderContext({
        headers: { authorization: "Bearer token" },
      });

      const result = await loader(ctx);

      expect(result.posts).toHaveLength(1);
    });
  });

  describe("isLoaderData", () => {
    it("identifies valid loader component props", () => {
      const props: LoaderComponentProps<BlogListData> = {
        data: {
          posts: [],
          count: 0,
          timestamp: new Date().toISOString(),
        },
      };

      expect(isLoaderData(props)).toBe(true);
    });

    it("rejects invalid props", () => {
      expect(isLoaderData(null)).toBe(false);
      expect(isLoaderData({})).toBe(false);
      expect(isLoaderData({ data: null })).toBe(false);
    });
  });

  describe("Type inference", () => {
    it("infers correct types from typed loader", async () => {
      const loader = createTypedLoader<{ messages: string[] }>(async (ctx) => ({
        messages: ["hello", "world"],
      }));

      const ctx = createLoaderContext();
      const result = await loader(ctx);

      // These should be type-safe
      expect(result.messages[0].toUpperCase()).toBe("HELLO");
    });

    it("component props match loader type", async () => {
      interface MyData extends LoaderSchema {
        count: number;
      }

      const loader = createTypedLoader<MyData>(async (ctx) => ({
        count: 42,
      }));

      const ctx = createLoaderContext();
      const result = await loader(ctx);

      // This should satisfy LoaderComponentProps<MyData>
      const props: LoaderComponentProps<MyData> = {
        data: result,
      };

      expect(props.data.count).toBe(42);
    });
  });

  describe("Error handling", () => {
    it("LoaderSchemaError stores data", () => {
      const badData = { invalid: true };
      const error = new LoaderSchemaError("Invalid shape", badData);

      expect(error.message).toBe("Invalid shape");
      expect(error.data).toEqual(badData);
      expect(error.name).toBe("LoaderSchemaError");
    });

    it("loader errors propagate", async () => {
      const loader = createTypedLoader<BlogListData>(async (ctx) => {
        throw new Error("Database error");
      });

      const ctx = createLoaderContext();

      await expect(loader(ctx)).rejects.toThrow("Database error");
    });
  });
});
