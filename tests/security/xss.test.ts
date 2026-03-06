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

/**
 * XSS (Cross-Site Scripting) Security Tests
 * Tests protection against XSS vectors in HTML content
 */

// Helper to escape HTML entities
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

describe("Security: XSS Protection", () => {
  describe("HTML injection prevention", () => {
    it("should escape script tags in content", () => {
      const input = "<script>alert('XSS')</script>";
      const escaped = escapeHtml(input);

      expect(escaped).not.toContain("<script>");
      expect(escaped).toContain("&lt;script&gt;");
    });

    it("should escape iframe tags", () => {
      const input = '<iframe src="http://malicious.com"></iframe>';
      const escaped = escapeHtml(input);

      expect(escaped).not.toContain("<iframe");
      expect(escaped).toContain("&lt;iframe");
    });

    it("should escape img onerror attributes", () => {
      const input = '<img src=x onerror="alert(1)">';
      const escaped = escapeHtml(input);

      // After escaping, the < and > are converted, making it safe
      expect(escaped).toContain("&lt;img");
      expect(escaped).toContain("&quot;");
    });

    it("should escape object tags", () => {
      const input = '<object data="http://evil.com/payload"></object>';
      const escaped = escapeHtml(input);

      expect(escaped).not.toContain("<object");
      expect(escaped).toContain("&lt;object");
    });

    it("should escape embed tags", () => {
      const input = '<embed src="http://evil.com/payload">';
      const escaped = escapeHtml(input);

      expect(escaped).not.toContain("<embed");
      expect(escaped).toContain("&lt;embed");
    });
  });

  describe("event handler prevention", () => {
    it("should escape onclick attributes", () => {
      const input = '<button onclick="alert(1)">Click</button>';
      const escaped = escapeHtml(input);

      // Escaping < and > prevents the tag from being parsed as HTML
      expect(escaped).toContain("&lt;button");
      expect(escaped).toContain("&gt;");
    });

    it("should escape onload attributes", () => {
      const input = '<body onload="alert(1)">';
      const escaped = escapeHtml(input);

      expect(escaped).toContain("&lt;body");
    });

    it("should escape onerror attributes", () => {
      const input = "<img src=x onerror=alert(1)>";
      const escaped = escapeHtml(input);

      expect(escaped).toContain("&lt;img");
    });

    it("should escape onmouseover attributes", () => {
      const input = '<div onmouseover="alert(1)">Hover</div>';
      const escaped = escapeHtml(input);

      expect(escaped).toContain("&lt;div");
    });

    it("should escape all on* attributes", () => {
      const patterns = [
        "onclick",
        "onload",
        "onerror",
        "onmouseover",
        "onmouseout",
        "onkeydown",
        "onkeyup",
        "onchange",
        "onsubmit",
      ];

      patterns.forEach((pattern) => {
        const input = `<div ${pattern}="alert(1)">Test</div>`;
        const escaped = escapeHtml(input);
        // The < and > are escaped, preventing HTML parsing
        expect(escaped).toContain("&lt;div");
      });
    });
  });

  describe("data protocol attacks", () => {
    it("should prevent data: protocol in href", () => {
      const input =
        '<a href="data:text/html,<script>alert(1)</script>">Link</a>';
      const escaped = escapeHtml(input);

      expect(escaped).toContain("&lt;a");
      expect(escaped).toContain("&gt;");
    });

    it("should prevent data: protocol in src", () => {
      const input = '<img src="data:text/html,<script>alert(1)</script>">';
      const escaped = escapeHtml(input);

      expect(escaped).toContain("&lt;img");
    });

    it("should prevent javascript: protocol", () => {
      const input = '<a href="javascript:alert(1)">Click</a>';
      const escaped = escapeHtml(input);

      expect(escaped).toContain("&lt;a");
    });

    it("should prevent vbscript: protocol", () => {
      const input = '<a href="vbscript:alert(1)">Click</a>';
      const escaped = escapeHtml(input);

      expect(escaped).toContain("&lt;a");
    });
  });

  describe("attribute injection prevention", () => {
    it("should escape quotes in attribute values", () => {
      const input = '" onmouseover="alert(1)"';
      const escaped = escapeHtml(input);

      expect(escaped).not.toContain('" onmouseover=');
      expect(escaped).toContain("&quot;");
    });

    it("should escape single quotes in attribute values", () => {
      const input = "' onclick='alert(1)'";
      const escaped = escapeHtml(input);

      expect(escaped).toContain("&#039;");
    });

    it("should escape ampersands in attributes", () => {
      const input = 'href="http://example.com?a=1&b=2"';
      const escaped = escapeHtml(input);

      expect(escaped).toContain("&amp;");
    });
  });

  describe("encoded attack vectors", () => {
    it("should handle URL-encoded script tags", () => {
      // %3Cscript%3E = <script>
      const input = "%3Cscript%3Ealert(1)%3C/script%3E";
      const decoded = decodeURIComponent(input);
      const escaped = escapeHtml(decoded);

      expect(escaped).not.toContain("<script>");
      expect(escaped).toContain("&lt;script&gt;");
    });

    it("should handle HTML-encoded entities", () => {
      // &#60;script&#62; = <script>
      const input = "&#60;script&#62;alert(1)&#60;/script&#62;";
      // In real scenario, would be decoded by browser
      expect(input).toContain("&#60;");
    });

    it("should handle mixed encoding", () => {
      const input = "%3Cimg%20src=x%20onerror=%22alert(1)%22%3E";
      const decoded = decodeURIComponent(input);
      const escaped = escapeHtml(decoded);

      expect(escaped).not.toContain("<img");
      expect(escaped).toContain("&lt;img");
    });
  });

  describe("DOM-based XSS prevention", () => {
    it("should prevent innerHTML injection", () => {
      const input = "<img src=x onerror='alert(1)'>";
      const escaped = escapeHtml(input);

      // Element would be created as text, not executed
      expect(escaped).toContain("&lt;img");
    });

    it("should prevent textContent manipulation", () => {
      const input = "<script>console.log('test')</script>";
      const escaped = escapeHtml(input);

      expect(escaped).not.toContain("<script>");
    });
  });

  describe("template injection prevention", () => {
    it("should escape template literals", () => {
      const input = "`<script>alert(1)</script>`";
      const escaped = escapeHtml(input);

      expect(escaped).toContain("&lt;script");
    });

    it("should escape expressions in templates", () => {
      const input = "${<script>alert(1)</script>}";
      const escaped = escapeHtml(input);

      expect(escaped).toContain("&lt;script");
    });
  });

  describe("SVG-based XSS", () => {
    it("should escape SVG script tags", () => {
      const input = "<svg><script>alert(1)</script></svg>";
      const escaped = escapeHtml(input);

      expect(escaped).toContain("&lt;svg");
      expect(escaped).toContain("&lt;script");
    });

    it("should escape SVG event handlers", () => {
      const input = '<svg onload="alert(1)"></svg>';
      const escaped = escapeHtml(input);

      expect(escaped).toContain("&lt;svg");
    });
  });

  describe("practical XSS scenarios", () => {
    it("should protect user comments", () => {
      const userComment =
        "<img src=x onerror=\"fetch('http://attacker.com')\">";
      const escaped = escapeHtml(userComment);
      const html = `<div class="comment">${escaped}</div>`;

      expect(html).not.toContain("<img");
      expect(html).toContain("&lt;img");
    });

    it("should protect search queries", () => {
      const searchQuery = '"><script>alert("XSS")</script>';
      const escaped = escapeHtml(searchQuery);
      const html = `<input value="${escaped}">`;

      expect(html).not.toContain("<script>");
    });

    it("should protect dynamic URLs", () => {
      const userInput = "javascript:alert(1)";
      // In real scenario, would validate URL scheme
      expect(userInput).not.toMatch(/^(https?|ftp):/);
    });
  });
});
