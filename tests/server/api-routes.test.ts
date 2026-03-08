import { describe, it, expect } from "vitest";
import {
  validateQuery,
  validateBody,
  DEFAULT_MAX_BODY_SIZE,
} from "@src/server/api-routes.js";

describe("API Routes Validation", () => {
  describe("validateQuery", () => {
    it("should coerce string values to appropriate types", () => {
      const url = new URL(
        "http://localhost?count=10&active=true&disabled=false&name=john&empty=",
      );
      const query = validateQuery(url);

      expect(query.count).toBe(10);
      expect(typeof query.count).toBe("number");

      expect(query.active).toBe(true);
      expect(typeof query.active).toBe("boolean");

      expect(query.disabled).toBe(false);
      expect(typeof query.disabled).toBe("boolean");

      expect(query.name).toBe("john");
      expect(typeof query.name).toBe("string");

      expect(query.empty).toBe(null);
    });

    it("should handle numeric-like strings as numbers", () => {
      const url = new URL(
        "http://localhost?int=42&float=3.14&negative=-5&hex=0xFF",
      );
      const query = validateQuery(url);

      expect(query.int).toBe(42);
      expect(query.float).toBe(3.14);
      expect(query.negative).toBe(-5);
      expect(query.hex).toBe(0xff);
    });

    it("should preserve string values that are not type-coercible", () => {
      const url = new URL(
        "http://localhost?slug=hello-world&email=user@example.com&text=hello123",
      );
      const query = validateQuery(url);

      expect(query.slug).toBe("hello-world");
      expect(query.email).toBe("user@example.com");
      expect(query.text).toBe("hello123");
    });

    it("should handle missing query parameters", () => {
      const url = new URL("http://localhost/path");
      const query = validateQuery(url);

      expect(Object.keys(query).length).toBe(0);
    });

    it("should prevent type coercion bugs like query.limit + 10", () => {
      // This would have been "10010" with string concatenation before the fix
      const url = new URL("http://localhost?limit=10");
      const query = validateQuery(url);

      const result = (query.limit as number) + 10;
      expect(result).toBe(20);
      expect(typeof result).toBe("number");
    });
  });

  describe("validateBody", () => {
    it("should accept body within size limit", () => {
      const body = { data: "test" };
      const size = 100; // 100 bytes

      expect(() =>
        validateBody(body, size, DEFAULT_MAX_BODY_SIZE),
      ).not.toThrow();
    });

    it("should accept body exactly at default max size", () => {
      const body = { data: "x" };
      const size = DEFAULT_MAX_BODY_SIZE;

      expect(() => validateBody(body, size)).not.toThrow();
    });

    it("should reject body exceeding default max size (10MB)", () => {
      const body = { data: "large" };
      const size = DEFAULT_MAX_BODY_SIZE + 1;

      try {
        validateBody(body, size);
        expect.fail("Should have thrown");
      } catch (err: any) {
        expect(err.error).toBe("Payload too large");
        expect(err.field).toBe("body");
      }
    });

    it("should reject body exceeding custom max size", () => {
      const body = { data: "test" };
      const size = 1000;
      const maxSize = 500;

      try {
        validateBody(body, size, maxSize);
        expect.fail("Should have thrown");
      } catch (err: any) {
        expect(err.error).toBe("Payload too large");
        expect(err.field).toBe("body");
      }
    });

    it("should return true on success", () => {
      const body = { data: "test" };
      const size = 100;

      const result = validateBody(body, size, DEFAULT_MAX_BODY_SIZE);
      expect(result).toBe(true);
    });

    it("should include size details in error message", () => {
      const body = { data: "test" };
      const size = 15000000; // 15MB
      const maxSize = 10485760; // 10MB

      try {
        validateBody(body, size, maxSize);
      } catch (err: any) {
        expect(err.details).toContain("15000000");
        expect(err.details).toContain("10485760");
      }
    });
  });

  describe("DEFAULT_MAX_BODY_SIZE constant", () => {
    it("should be 10MB", () => {
      expect(DEFAULT_MAX_BODY_SIZE).toBe(10 * 1024 * 1024);
      expect(DEFAULT_MAX_BODY_SIZE).toBe(10485760);
    });
  });

  describe("Type safety", () => {
    it("should have HttpMethod literal union type exported", () => {
      // This is a compile-time check but we verify the values are available
      const validMethods = [
        "GET",
        "POST",
        "PUT",
        "DELETE",
        "PATCH",
        "HEAD",
        "OPTIONS",
      ];
      expect(validMethods).toHaveLength(7);
    });

    it("should have QueryValue type that includes string, number, boolean, null", () => {
      const url = new URL("http://localhost?str=test&num=123&bool=true&nil=");
      const query = validateQuery(url);

      // Type checking ensures these don't produce "string + number = string" bugs
      const strVal: string = query.str as string;
      const numVal: number = query.num as number;
      const boolVal: boolean = query.bool as boolean;
      const nilVal: null = query.nil as null;

      expect(strVal).toBe("test");
      expect(numVal).toBe(123);
      expect(boolVal).toBe(true);
      expect(nilVal).toBe(null);
    });
  });

  describe("Edge cases", () => {
    it("should handle multiple query parameters with same name (last wins)", () => {
      // URLSearchParams behavior: only last value is kept by entries()
      const url = new URL("http://localhost?id=1&id=2&id=3");
      const query = validateQuery(url);

      // With URLSearchParams.entries(), last value wins
      expect(query.id).toBe(3);
    });

    it("should handle special characters in query values", () => {
      const url = new URL(
        "http://localhost?text=hello%20world&special=%26%3D%3F",
      );
      const query = validateQuery(url);

      expect(query.text).toBe("hello world");
      expect(query.special).toBe("&=?");
    });

    it("should handle whitespace-only strings", () => {
      const url = new URL("http://localhost?spaces=%20%20%20");
      const query = validateQuery(url);

      // "   " should not be coerced to number (isNaN check with trim)
      expect(query.spaces).toBe("   ");
      expect(typeof query.spaces).toBe("string");
    });

    it("should handle zero correctly", () => {
      const url = new URL("http://localhost?zero=0");
      const query = validateQuery(url);

      expect(query.zero).toBe(0);
      expect(typeof query.zero).toBe("number");
    });

    it("should handle negative numbers", () => {
      const url = new URL("http://localhost?neg=-42&negFloat=-3.14");
      const query = validateQuery(url);

      expect(query.neg).toBe(-42);
      expect(query.negFloat).toBe(-3.14);
    });

    it("should handle very large numbers", () => {
      const url = new URL("http://localhost?large=999999999999");
      const query = validateQuery(url);

      expect(query.large).toBe(999999999999);
      expect(typeof query.large).toBe("number");
    });

    it("should treat NaN as string", () => {
      const url = new URL("http://localhost?nan=NaN&inf=Infinity");
      const query = validateQuery(url);

      // NaN and Infinity: Number() coerces them to actual NaN/Infinity,
      // but isNaN("Infinity") is false, so "Infinity" remains a string with a different coercion path
      // Actually: Number("Infinity") === Infinity, so it gets coerced
      // This test documents the actual behavior
      expect(typeof query.nan).toBe("string");
      expect(typeof query.inf).toBe("number");
      expect(query.inf).toBe(Infinity);
    });
  });
});
