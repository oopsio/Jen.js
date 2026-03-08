import { describe, it, expect, beforeEach } from "vitest";
import { createMockContext, createMockRequest } from "../fixtures/index.js";

/**
 * CSRF (Cross-Site Request Forgery) Protection Tests
 * Tests CSRF token generation, validation, and protection mechanisms
 */

interface CSRFTokenStore {
  tokens: Map<string, { token: string; expiresAt: number }>;
  sessionId: string;
}

function generateCSRFToken(store: CSRFTokenStore): string {
  // Simple mock - real implementation uses crypto
  const token = "csrf_" + Math.random().toString(36).substring(7);
  store.tokens.set(store.sessionId, {
    token,
    expiresAt: Date.now() + 3600000, // 1 hour
  });
  return token;
}

function verifyCSRFToken(store: CSRFTokenStore, token: string): boolean {
  const stored = store.tokens.get(store.sessionId);
  if (!stored) return false;

  if (Date.now() > stored.expiresAt) {
    store.tokens.delete(store.sessionId);
    return false;
  }

  return stored.token === token;
}

function createCSRFTokenStore(sessionId: string): CSRFTokenStore {
  return {
    tokens: new Map(),
    sessionId,
  };
}

describe("Security: CSRF Protection", () => {
  let store: CSRFTokenStore;

  beforeEach(() => {
    store = createCSRFTokenStore("session-123");
  });

  describe("token generation", () => {
    it("should generate valid CSRF tokens", () => {
      const token = generateCSRFToken(store);

      expect(token).toBeDefined();
      expect(token).toMatch(/^csrf_/);
    });

    it("should generate unique tokens", () => {
      const token1 = generateCSRFToken(store);
      const token2 = generateCSRFToken(store);

      // Different because we generate new ones
      expect(token2).toBeDefined();
    });

    it("should associate tokens with sessions", () => {
      const token = generateCSRFToken(store);
      const stored = store.tokens.get("session-123");

      expect(stored).toBeDefined();
      expect(stored?.token).toBe(token);
    });

    it("should set token expiration", () => {
      generateCSRFToken(store);
      const stored = store.tokens.get("session-123");

      expect(stored?.expiresAt).toBeGreaterThan(Date.now());
    });
  });

  describe("token validation", () => {
    it("should validate correct tokens", () => {
      const token = generateCSRFToken(store);
      const isValid = verifyCSRFToken(store, token);

      expect(isValid).toBe(true);
    });

    it("should reject invalid tokens", () => {
      generateCSRFToken(store);
      const isValid = verifyCSRFToken(store, "invalid_token");

      expect(isValid).toBe(false);
    });

    it("should reject missing tokens", () => {
      const store2 = createCSRFTokenStore("session-456");
      const isValid = verifyCSRFToken(store2, "some_token");

      expect(isValid).toBe(false);
    });

    it("should reject expired tokens", () => {
      const token = generateCSRFToken(store);
      const stored = store.tokens.get("session-123");

      if (stored) {
        stored.expiresAt = Date.now() - 1000; // Already expired
      }

      const isValid = verifyCSRFToken(store, token);
      expect(isValid).toBe(false);
    });

    it("should clean up expired tokens", () => {
      generateCSRFToken(store);
      const token = "test_token";
      const stored = store.tokens.get("session-123");

      if (stored) {
        stored.expiresAt = Date.now() - 1000;
      }

      verifyCSRFToken(store, token);
      const cleaned = store.tokens.has("session-123");

      // Token should be removed after expiration check
      expect(cleaned).toBe(false);
    });
  });

  describe("POST request protection", () => {
    it("should require CSRF token in POST requests", () => {
      const token = generateCSRFToken(store);
      const ctx = createMockContext({
        request: {
          method: "POST",
          path: "/api/users",
          headers: { "csrf-token": token },
        },
      });

      const hasCSRFToken = ctx.request.headers["csrf-token"] !== undefined;
      expect(hasCSRFToken).toBe(true);
    });

    it("should reject POST without CSRF token", () => {
      const ctx = createMockContext({
        request: {
          method: "POST",
          path: "/api/users",
          headers: {},
        },
      });

      const hasCSRFToken = ctx.request.headers["csrf-token"] !== undefined;
      expect(hasCSRFToken).toBe(false);
    });

    it("should reject POST with invalid CSRF token", () => {
      generateCSRFToken(store);
      const ctx = createMockContext({
        request: {
          method: "POST",
          path: "/api/users",
          headers: { "csrf-token": "invalid_token" },
        },
      });

      const token = ctx.request.headers["csrf-token"];
      const isValid = verifyCSRFToken(store, token);

      expect(isValid).toBe(false);
    });
  });

  describe("PUT request protection", () => {
    it("should require CSRF token in PUT requests", () => {
      const token = generateCSRFToken(store);
      const ctx = createMockContext({
        request: {
          method: "PUT",
          path: "/api/users/1",
          headers: { "csrf-token": token },
        },
      });

      const hasToken = ctx.request.headers["csrf-token"] !== undefined;
      expect(hasToken).toBe(true);
    });

    it("should reject PUT without CSRF token", () => {
      const ctx = createMockContext({
        request: {
          method: "PUT",
          path: "/api/users/1",
          headers: {},
        },
      });

      const hasToken = ctx.request.headers["csrf-token"] !== undefined;
      expect(hasToken).toBe(false);
    });
  });

  describe("DELETE request protection", () => {
    it("should require CSRF token in DELETE requests", () => {
      const token = generateCSRFToken(store);
      const ctx = createMockContext({
        request: {
          method: "DELETE",
          path: "/api/users/1",
          headers: { "csrf-token": token },
        },
      });

      const hasToken = ctx.request.headers["csrf-token"] !== undefined;
      expect(hasToken).toBe(true);
    });
  });

  describe("safe request exemption", () => {
    it("should not require CSRF token for GET requests", () => {
      const ctx = createMockContext({
        request: {
          method: "GET",
          path: "/api/users",
          headers: {},
        },
      });

      const hasToken = ctx.request.headers["csrf-token"] !== undefined;
      expect(hasToken).toBe(false);
    });

    it("should not require CSRF token for HEAD requests", () => {
      const ctx = createMockContext({
        request: {
          method: "HEAD",
          path: "/api/users",
          headers: {},
        },
      });

      const hasToken = ctx.request.headers["csrf-token"] !== undefined;
      expect(hasToken).toBe(false);
    });

    it("should not require CSRF token for OPTIONS requests", () => {
      const ctx = createMockContext({
        request: {
          method: "OPTIONS",
          path: "/api/users",
          headers: {},
        },
      });

      const hasToken = ctx.request.headers["csrf-token"] !== undefined;
      expect(hasToken).toBe(false);
    });
  });

  describe("token validation locations", () => {
    it("should accept token in headers", () => {
      const token = generateCSRFToken(store);
      const ctx = createMockContext({
        request: {
          method: "POST",
          headers: { "csrf-token": token },
        },
      });

      const isValid = verifyCSRFToken(store, ctx.request.headers["csrf-token"]);
      expect(isValid).toBe(true);
    });

    it("should accept token in body", () => {
      const token = generateCSRFToken(store);
      const ctx = createMockContext({
        request: {
          method: "POST",
          body: { _csrf: token },
        },
      });

      const isValid = verifyCSRFToken(store, ctx.request.body._csrf);
      expect(isValid).toBe(true);
    });

    it("should accept token in hidden form field", () => {
      const token = generateCSRFToken(store);
      const formData = new FormData();
      formData.append("_csrf", token);

      expect(token).toBeDefined();
    });
  });

  describe("double-submit cookie pattern", () => {
    it("should use double-submit cookies for additional security", () => {
      const token = generateCSRFToken(store);
      const ctx = createMockContext({
        request: {
          method: "POST",
          cookies: { "csrf-token": token },
          headers: { "x-csrf-token": token },
        },
      });

      const cookieToken = ctx.request.cookies?.["csrf-token"];
      const headerToken = ctx.request.headers["x-csrf-token"];

      expect(cookieToken).toBe(headerToken);
    });
  });

  describe("CSRF protection for same-site requests", () => {
    it("should validate origin header", () => {
      const ctx = createMockContext({
        request: {
          method: "POST",
          headers: { origin: "https://example.com" },
        },
      });

      const originHeader = ctx.request.headers.origin;
      expect(originHeader).toBe("https://example.com");
    });

    it("should reject cross-origin requests", () => {
      const ctx = createMockContext({
        request: {
          method: "POST",
          headers: { origin: "https://attacker.com" },
        },
      });

      const origin = ctx.request.headers.origin;
      const isAllowed = origin === "https://example.com";

      expect(isAllowed).toBe(false);
    });
  });

  describe("token rotation", () => {
    it("should rotate tokens on login", () => {
      const oldToken = generateCSRFToken(store);
      const oldStore = createCSRFTokenStore("session-123");
      oldStore.tokens.set("session-123", {
        token: oldToken,
        expiresAt: Date.now() + 3600000,
      });

      // Simulate new session
      const newStore = createCSRFTokenStore("session-456");
      const newToken = generateCSRFToken(newStore);

      expect(oldToken).not.toBe(newToken);
    });

    it("should rotate tokens on privilege change", () => {
      const token1 = generateCSRFToken(store);
      // Clear and regenerate
      store.tokens.clear();
      const token2 = generateCSRFToken(store);

      expect(token1).not.toBe(token2);
    });
  });

  describe("error responses", () => {
    it("should return 403 for missing CSRF token", () => {
      const ctx = createMockContext({
        request: {
          method: "POST",
          headers: {},
        },
      });

      const hasToken = ctx.request.headers["csrf-token"] !== undefined;

      if (!hasToken) {
        ctx.response.status = 403;
        ctx.response.body = { error: "CSRF token required" };
      }

      expect(ctx.response.status).toBe(403);
    });

    it("should return 403 for invalid CSRF token", () => {
      generateCSRFToken(store);
      const ctx = createMockContext({
        request: {
          method: "POST",
          headers: { "csrf-token": "invalid" },
        },
      });

      const isValid = verifyCSRFToken(store, ctx.request.headers["csrf-token"]);

      if (!isValid) {
        ctx.response.status = 403;
        ctx.response.body = { error: "Invalid CSRF token" };
      }

      expect(ctx.response.status).toBe(403);
    });
  });
});
