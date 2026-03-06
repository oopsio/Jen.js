import { describe, it, expect, beforeEach, vi } from "vitest";
import * as crypto from "crypto";

// Mock JWT functions for testing
function createToken(
  payload: Record<string, any>,
  secret: string,
  expiresIn: number,
): string {
  const header = Buffer.from(
    JSON.stringify({ alg: "HS256", typ: "JWT" }),
  ).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const claims = { ...payload, iat: now, exp: now + expiresIn };
  const encodedPayload = Buffer.from(JSON.stringify(claims)).toString(
    "base64url",
  );

  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${header}.${encodedPayload}`)
    .digest("base64url");

  return `${header}.${encodedPayload}.${signature}`;
}

function verifyToken(token: string, secret: string): Record<string, any> {
  const [header, payload, signature] = token.split(".");
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${header}.${payload}`)
    .digest("base64url");

  if (signature !== expectedSignature) {
    throw new Error("Invalid signature");
  }

  const decoded = JSON.parse(Buffer.from(payload, "base64url").toString());
  const now = Math.floor(Date.now() / 1000);

  if (decoded.exp < now) {
    throw new Error("Token expired");
  }

  return decoded;
}

describe("JWT Authentication", () => {
  let secret: string;
  let testPayload: Record<string, any>;

  beforeEach(() => {
    secret = "test-secret-key-12345";
    testPayload = { userId: 123, username: "testuser", role: "admin" };
  });

  describe("Token Creation", () => {
    it("should create a valid JWT token", () => {
      const token = createToken(testPayload, secret, 3600);
      expect(token).toBeDefined();
      expect(token.split(".")).toHaveLength(3);
    });

    it("should include payload in token", () => {
      const token = createToken(testPayload, secret, 3600);
      const decoded = verifyToken(token, secret);
      expect(decoded.userId).toBe(123);
      expect(decoded.username).toBe("testuser");
      expect(decoded.role).toBe("admin");
    });

    it("should set correct expiration time", () => {
      const expiresIn = 7200; // 2 hours
      const token = createToken(testPayload, secret, expiresIn);
      const decoded = verifyToken(token, secret);
      const now = Math.floor(Date.now() / 1000);
      expect(decoded.exp - decoded.iat).toBe(expiresIn);
    });
  });

  describe("Token Verification", () => {
    it("should successfully verify a valid token", () => {
      const token = createToken(testPayload, secret, 3600);
      const decoded = verifyToken(token, secret);
      expect(decoded).toHaveProperty("userId");
      expect(decoded).toHaveProperty("exp");
      expect(decoded).toHaveProperty("iat");
    });

    it("should reject token with invalid signature", () => {
      const token = createToken(testPayload, secret, 3600);
      const tamperedToken = token.slice(0, -5) + "XXXXX";
      expect(() => verifyToken(tamperedToken, secret)).toThrow(
        "Invalid signature",
      );
    });

    it("should reject expired token", async () => {
      const token = createToken(testPayload, secret, -1); // Already expired
      expect(() => verifyToken(token, secret)).toThrow("Token expired");
    });

    it("should reject token with wrong secret", () => {
      const token = createToken(testPayload, secret, 3600);
      const wrongSecret = "different-secret";
      expect(() => verifyToken(token, wrongSecret)).toThrow(
        "Invalid signature",
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty payload", () => {
      const token = createToken({}, secret, 3600);
      const decoded = verifyToken(token, secret);
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
    });

    it("should handle large payload", () => {
      const largePayload = {
        userId: 1,
        data: "x".repeat(5000),
        nested: { deep: { value: 123 } },
      };
      const token = createToken(largePayload, secret, 3600);
      const decoded = verifyToken(token, secret);
      expect(decoded.data).toBe("x".repeat(5000));
    });

    it("should handle special characters in payload", () => {
      const specialPayload = {
        email: "user@example.com",
        name: "John Döe",
        symbol: "€©™",
      };
      const token = createToken(specialPayload, secret, 3600);
      const decoded = verifyToken(token, secret);
      expect(decoded.email).toBe("user@example.com");
      expect(decoded.name).toBe("John Döe");
    });

    it("should validate token immediately after creation", () => {
      const token = createToken(testPayload, secret, 3600);
      expect(() => verifyToken(token, secret)).not.toThrow();
    });
  });
});
