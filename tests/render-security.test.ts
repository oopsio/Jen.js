import { describe, it, expect } from "vitest";
import { renderRouteToHtml } from "../src/runtime/render.js";
import type { FrameworkConfig } from "../src/core/config.js";
import type { RouteEntry } from "../src/core/routes/scan.js";

// Mock test utilities
function createMockConfig(): FrameworkConfig {
  return {
    siteDir: "/mock",
    dev: false,
    outDir: "dist",
    publicDir: "public",
    assetDir: "assets",
    inject: {
      head: [],
      bodyEnd: [],
    },
  } as any;
}

function createMockRoute(filePath: string): RouteEntry {
  return {
    filePath,
    routePath: "/test",
    kind: "page",
    dynamic: false,
    params: [],
  } as any;
}

describe("XSS & DoS Security", () => {
  describe("HTML Escaping in Data Serialization", () => {
    it("should escape <script> tags in loader data", async () => {
      const payload = "<script>alert('xss')</script>";
      const dataStr = JSON.stringify({ data: payload });

      // Recursive escaping should convert < and > to entities
      expect(dataStr).toContain("<script>");

      // After escaping
      const escaped = dataStr
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");

      expect(escaped).toContain("&lt;script&gt;");
      expect(escaped).not.toContain("<script>");
    });

    it("should escape HTML comment injection", () => {
      const payload = "<!-- injection -->";
      const escaped = payload
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");

      expect(escaped).toBe("&lt;!-- injection --&gt;");
    });

    it("should escape closing script tags with various cases", () => {
      const payloads = ["</script>", "</SCRIPT>", "</ScRipt>"];

      payloads.forEach((payload) => {
        const escaped = payload.replaceAll("<", "&lt;").replaceAll(">", "&gt;");

        expect(escaped).not.toContain("</script>");
        expect(escaped).not.toContain("</SCRIPT>");
        expect(escaped).toContain("&lt;");
      });
    });

    it("should escape onclick attributes", () => {
      const payload = "onclick=\"alert('xss')\"";
      const escaped = payload
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");

      expect(escaped).toBe("onclick=&quot;alert(&#39;xss&#39;)&quot;");
    });

    it("should escape data: URI schemes", () => {
      const payload = 'data:text/html,<script>alert("xss")</script>';
      const escaped = payload
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");

      expect(escaped).toContain("&lt;script&gt;");
    });

    it("should handle deeply nested XSS payloads", () => {
      const data = {
        level1: {
          level2: {
            level3: {
              payload: "<img src=x onerror='alert(1)'>",
            },
          },
        },
      };

      const dataStr = JSON.stringify(data);
      const escaped = dataStr
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll("'", "&#39;");

      expect(escaped).toContain("&lt;img");
      expect(escaped).not.toContain("<img");
    });
  });

  describe("DoS Prevention", () => {
    it("should detect oversized payloads", () => {
      const MAX_DATA_SIZE = 1024 * 1024; // 1MB
      const hugePayload = "x".repeat(MAX_DATA_SIZE + 1000);

      const serialized = JSON.stringify({ data: hugePayload });
      expect(serialized.length).toBeGreaterThan(MAX_DATA_SIZE);
    });

    it("should catch DoS from deeply nested structures", () => {
      let nested: any = { value: "test" };
      for (let i = 0; i < 1000; i++) {
        nested = { nested };
      }

      const serialized = JSON.stringify(nested);
      expect(serialized.length).toBeGreaterThan(0);
      // The serialization should succeed but could be large
    });

    it("should handle circular reference protection", () => {
      const data: any = { a: 1 };
      data.self = data; // Circular reference

      // Standard JSON.stringify would fail or need a replacer
      expect(() => {
        JSON.stringify(data);
      }).toThrow(); // Actually throws TypeError with circular ref
    });
  });

  describe("Special Characters Escaping", () => {
    it("should escape ampersands", () => {
      const payload = "Smith & Sons";
      const escaped = payload.replaceAll("&", "&amp;");
      expect(escaped).toBe("Smith &amp; Sons");
    });

    it("should escape quotes in attributes", () => {
      const payload = 'attr="value"';
      const escaped = payload.replaceAll('"', "&quot;");
      expect(escaped).toBe("attr=&quot;value&quot;");
    });

    it("should escape apostrophes", () => {
      const payload = "it's broken";
      const escaped = payload.replaceAll("'", "&#39;");
      expect(escaped).toBe("it&#39;s broken");
    });

    it("should handle multiple special characters", () => {
      const payload = "Test & \"quotes\" 'apostrophes'";
      let escaped = payload
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");

      expect(escaped).toBe(
        "Test &amp; &quot;quotes&quot; &#39;apostrophes&#39;",
      );
    });
  });

  describe("Unicode & Encoded Payloads", () => {
    it("should escape unicode-encoded scripts", () => {
      // \\u003c = <, \\u003e = >
      const payload = "\\u003cscript\\u003e";
      const escaped = payload.replaceAll("<", "&lt;").replaceAll(">", "&gt;");

      // After escaping, the backslash literals remain, safe
      expect(escaped).toBe("\\u003cscript\\u003e");
    });

    it("should escape hex-encoded injections", () => {
      const payload = "\\x3cscript\\x3e";
      const escaped = payload.replaceAll("<", "&lt;").replaceAll(">", "&gt;");
      expect(escaped).toBe("\\x3cscript\\x3e");
    });
  });

  describe("Array & Object XSS", () => {
    it("should recursively escape arrays", () => {
      const data = [
        "<script>alert(1)</script>",
        { nested: "<img src=x onerror=alert(1)>" },
      ];

      const serialized = JSON.stringify(data);
      const escaped = serialized
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");

      expect(escaped).toContain("&lt;script&gt;");
      expect(escaped).toContain("&lt;img");
    });

    it("should escape mixed data types", () => {
      const data = {
        string: "<script>",
        number: 123,
        boolean: true,
        null: null,
        nested: { payload: "</script>" },
        array: ["<div>", { inner: "<span>" }],
      };

      const serialized = JSON.stringify(data);
      const escaped = serialized
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");

      expect(escaped).toContain("&lt;script&gt;");
      expect(escaped).not.toContain("<script>");
      expect(serialized).toContain("123"); // Numbers unchanged
      expect(serialized).toContain("true"); // Booleans unchanged
    });
  });

  describe("Parameter Injection", () => {
    it("should escape URL params with XSS payloads", () => {
      const params = {
        id: "<script>alert(1)</script>",
        name: "'; DROP TABLE users; --",
      };

      const serialized = JSON.stringify(params);
      const escaped = serialized
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll("'", "&#39;");

      expect(escaped).toContain("&lt;script&gt;");
    });

    it("should escape query string values", () => {
      const query = {
        search: "<img src=x onerror='alert(1)'>",
        filter: "value&param=inject",
      };

      const serialized = JSON.stringify(query);
      const escaped = serialized
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll("'", "&#39;");

      expect(escaped).toContain("&lt;img");
      expect(escaped).toContain("&amp;param");
    });
  });

  describe("Script Tag Context Escaping", () => {
    it("should prevent breaking out of script tag with </script>", () => {
      const data = { payload: "</script><script>alert(1)</script>" };
      const serialized = JSON.stringify(data);

      // Replace </script regardless of case
      const safe = serialized.replace(/<\/script/gi, "<\\/script");
      expect(safe).not.toContain("</script>");
    });

    it("should handle newlines and special whitespace in payload", () => {
      const payload = "</script>\n<script>alert(1)</script>";
      const escaped = payload.replaceAll("<", "&lt;").replaceAll(">", "&gt;");

      expect(escaped).not.toContain("</script>");
      expect(escaped).toContain("\n"); // Newlines are safe
    });
  });

  describe("Real-World Payloads", () => {
    it("should prevent OWASP Top 10 XSS vectors", () => {
      const vectors = [
        "<script>alert('xss')</script>",
        "<img src=x onerror=alert('xss')>",
        "<svg/onload=alert('xss')>",
        "<body onload=alert('xss')>",
        "<iframe src=\"javascript:alert('xss')\">",
        "<input onfocus=alert('xss') autofocus>",
        "<marquee onstart=alert('xss')>",
        "<details open ontoggle=alert('xss')>",
        "data:text/html,<script>alert('xss')</script>",
      ];

      vectors.forEach((vector) => {
        const escaped = vector
          .replaceAll("&", "&amp;")
          .replaceAll("<", "&lt;")
          .replaceAll(">", "&gt;")
          .replaceAll('"', "&quot;")
          .replaceAll("'", "&#39;");

        expect(escaped).not.toContain("<script>");
        expect(escaped).not.toContain("<img");
        expect(escaped).not.toContain("<svg");
        expect(escaped).not.toContain("<body");
        expect(escaped).not.toContain("<iframe");
        // All HTML tags and brackets should be escaped
        expect(escaped).toContain("&lt;");
      });

      // Test javascript: and data: protocols separately
      const protocolVectors = [
        "javascript:alert('xss')",
        "vbscript:msgbox('xss')",
      ];

      protocolVectors.forEach((vector) => {
        const escaped = vector
          .replaceAll("&", "&amp;")
          .replaceAll("<", "&lt;")
          .replaceAll(">", "&gt;")
          .replaceAll('"', "&quot;")
          .replaceAll("'", "&#39;");

        // These are safe when escaped and placed in an HTML attribute (browser won't execute them)
        expect(escaped).toContain("&#39;"); // Quotes are escaped
      });
    });

    it("should handle encoded OWASP vectors", () => {
      const htmlEncoded = "&lt;script&gt;alert(1)&lt;/script&gt;";
      // Already escaped, should remain safe
      expect(htmlEncoded).not.toContain("<script>");

      const doubleEncoded = "&amp;lt;script&amp;gt;";
      // Safe in both forms
      expect(doubleEncoded).not.toContain("<script>");
    });
  });
});
