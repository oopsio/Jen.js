import { describe, it, expect } from "vitest";
import {
  defineLoader,
  validateLoaderData,
  defineMiddleware,
  type TypedPageProps,
  type ComposeDataSchemas,
} from "@src/core/loader-schema.js";

describe("Loader Schema", () => {
  describe("defineLoader", () => {
    it("should create a typed loader function", async () => {
      type PageData = { posts: Array<{ id: number; title: string }> };

      const loader = defineLoader<PageData>(async (ctx) => {
        return {
          posts: [
            { id: 1, title: "Post 1" },
            { id: 2, title: "Post 2" },
          ],
        };
      });

      const result = await loader({
        url: new URL("http://localhost/"),
        params: {},
        query: {},
        headers: {},
        cookies: {},
      });

      expect(result.posts).toHaveLength(2);
      expect(result.posts[0].title).toBe("Post 1");
    });

    it("should support sync loaders", async () => {
      type PageData = { message: string };

      const loader = defineLoader<PageData>(() => {
        return { message: "Hello from sync loader" };
      });

      const result = await loader({
        url: new URL("http://localhost/"),
        params: {},
        query: {},
        headers: {},
        cookies: {},
      });

      expect(result.message).toBe("Hello from sync loader");
    });
  });

  describe("validateLoaderData", () => {
    it("should validate correct data", () => {
      const schema = { posts: "object", count: "number" };
      const data = { posts: [], count: 5 };

      expect(() => validateLoaderData(data, schema)).not.toThrow();
    });

    it("should reject non-object data", () => {
      const schema = { posts: "object" };

      expect(() => validateLoaderData("string", schema)).toThrow(
        /Expected object/,
      );
      expect(() => validateLoaderData(null, schema)).toThrow(/Expected object/);
    });

    it("should validate array types", () => {
      const schema = { items: "object" };
      const data = { items: [1, 2, 3] };

      expect(() => validateLoaderData(data, schema)).not.toThrow();
    });

    it("should detect type mismatches", () => {
      const schema = { count: "number" };
      const data = { count: "not a number" };

      expect(() => validateLoaderData(data, schema)).toThrow(
        /expected count to be number/,
      );
    });

    it("should validate multiple fields", () => {
      const schema = { id: "number", name: "string", tags: "object" };
      const data = { id: 1, name: "Test", tags: [] };

      expect(() => validateLoaderData(data, schema)).not.toThrow();
    });
  });

  describe("defineMiddleware", () => {
    it("should create a typed middleware function", async () => {
      type MiddlewareData = { userId: number; isAdmin: boolean };

      const middleware = defineMiddleware<MiddlewareData>(async (ctx) => {
        return { userId: 42, isAdmin: true };
      });

      const result = await middleware({});

      expect(result.userId).toBe(42);
      expect(result.isAdmin).toBe(true);
    });

    it("should support sync middleware", async () => {
      type MiddlewareData = { requestId: string };

      const middleware = defineMiddleware<MiddlewareData>(() => {
        return { requestId: "req-123" };
      });

      const result = await middleware({});

      expect(result.requestId).toBe("req-123");
    });
  });

  describe("Type helpers", () => {
    it("TypedPageProps should define correct shape", () => {
      type PageData = { title: string };
      type Props = TypedPageProps<PageData>;

      const props: Props = {
        data: { title: "Test" },
        params: {},
        query: {},
      };

      expect(props.data.title).toBe("Test");
    });

    it("ComposeDataSchemas should combine schemas", () => {
      type Middleware = { userId: number };
      type Loader = { posts: string[] };
      type Combined = ComposeDataSchemas<Middleware, Loader>;

      const combined: Combined = {
        userId: 42,
        posts: ["a", "b"],
      };

      expect(combined.userId).toBe(42);
      expect(combined.posts).toHaveLength(2);
    });
  });

  describe("Real-world usage", () => {
    it("should handle blog post loader", async () => {
      interface Post {
        id: number;
        title: string;
        content: string;
        author: string;
      }

      type PageData = {
        post: Post | null;
        relatedPosts: Post[];
      };

      const loader = defineLoader<PageData>(async (ctx) => {
        const postId = ctx.params.id || "1";

        return {
          post: {
            id: parseInt(postId),
            title: "Test Post",
            content: "Content here",
            author: "John",
          },
          relatedPosts: [
            {
              id: 2,
              title: "Related Post",
              content: "Related content",
              author: "Jane",
            },
          ],
        };
      });

      const result = await loader({
        url: new URL("http://localhost/posts/1"),
        params: { id: "1" },
        query: {},
        headers: {},
        cookies: {},
      });

      expect(result.post?.title).toBe("Test Post");
      expect(result.relatedPosts).toHaveLength(1);
    });

    it("should combine middleware and loader data", async () => {
      type AuthData = { userId: number; isAdmin: boolean };
      type PageData = { user: { id: number; role: string } };
      type Combined = ComposeDataSchemas<AuthData, PageData>;

      const authMiddleware = defineMiddleware<AuthData>(async (ctx) => {
        return { userId: 42, isAdmin: true };
      });

      const pageLoader = defineLoader<PageData>(async (ctx) => {
        const authData = ctx.data as AuthData;
        return {
          user: {
            id: authData.userId,
            role: authData.isAdmin ? "admin" : "user",
          },
        };
      });

      const authResult = await authMiddleware({});
      const loaderResult = await pageLoader({
        url: new URL("http://localhost/"),
        params: {},
        query: {},
        headers: {},
        cookies: {},
        data: authResult,
      });

      const combined: Combined = {
        ...authResult,
        ...loaderResult,
      };

      expect(combined.userId).toBe(42);
      expect(combined.user.role).toBe("admin");
    });
  });
});
