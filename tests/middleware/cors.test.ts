import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock CORS middleware
interface CORSOptions {
  origin?: string | string[] | RegExp | ((origin: string) => boolean);
  methods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

interface Request {
  method: string;
  headers: Record<string, string>;
  origin?: string;
}

interface Response {
  headers: Record<string, string>;
  statusCode: number;
  body?: string;
}

function createCORSMiddleware(options: CORSOptions = {}) {
  const {
    origin = "*",
    methods = ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    allowedHeaders = ["Content-Type"],
    exposedHeaders = [],
    credentials = false,
    maxAge = 86400,
  } = options;

  return (req: Request): Response => {
    const response: Response = {
      headers: {},
      statusCode: 200,
    };

    const requestOrigin = req.origin || req.headers.origin;

    // Check if origin is allowed
    let allowOrigin = false;
    if (typeof origin === "string") {
      allowOrigin = origin === "*" || origin === requestOrigin;
    } else if (Array.isArray(origin)) {
      allowOrigin = origin.includes(requestOrigin);
    } else if (origin instanceof RegExp) {
      allowOrigin = origin.test(requestOrigin || "");
    } else if (typeof origin === "function") {
      try {
        const result = origin(requestOrigin || "");
        allowOrigin = result === true;
      } catch {
        allowOrigin = false;
      }
    }

    if (!allowOrigin) {
      response.statusCode = 403;
      response.body = "Origin not allowed";
      return response;
    }

    response.headers["Access-Control-Allow-Origin"] = requestOrigin;

    if (credentials) {
      response.headers["Access-Control-Allow-Credentials"] = "true";
    }

    // Handle preflight requests
    if (req.method === "OPTIONS") {
      response.headers["Access-Control-Allow-Methods"] = methods.join(", ");
      response.headers["Access-Control-Allow-Headers"] = allowedHeaders.join(", ");
      response.headers["Access-Control-Max-Age"] = maxAge.toString();
      response.statusCode = 204;
    }

    if (exposedHeaders.length > 0) {
      response.headers["Access-Control-Expose-Headers"] = exposedHeaders.join(", ");
    }

    return response;
  };
}

describe("CORS Middleware", () => {
  describe("Basic Configuration", () => {
    it("should allow all origins with default config", () => {
      const cors = createCORSMiddleware();
      const response = cors({
        method: "GET",
        headers: {},
        origin: "https://example.com",
      });

      expect(response.headers["Access-Control-Allow-Origin"]).toBe("https://example.com");
      expect(response.statusCode).toBe(200);
    });

    it("should set allowed methods", () => {
      const cors = createCORSMiddleware({
        methods: ["GET", "POST"],
      });
      const response = cors({
        method: "OPTIONS",
        headers: {},
        origin: "https://example.com",
      });

      expect(response.headers["Access-Control-Allow-Methods"]).toBe("GET, POST");
    });

    it("should set allowed headers", () => {
      const cors = createCORSMiddleware({
        allowedHeaders: ["Content-Type", "Authorization"],
      });
      const response = cors({
        method: "OPTIONS",
        headers: {},
        origin: "https://example.com",
      });

      expect(response.headers["Access-Control-Allow-Headers"]).toBe(
        "Content-Type, Authorization"
      );
    });

    it("should set max age for preflight cache", () => {
      const cors = createCORSMiddleware({ maxAge: 3600 });
      const response = cors({
        method: "OPTIONS",
        headers: {},
        origin: "https://example.com",
      });

      expect(response.headers["Access-Control-Max-Age"]).toBe("3600");
    });
  });

  describe("Origin Validation", () => {
    it("should accept requests from allowed origins", () => {
      const cors = createCORSMiddleware({
        origin: ["https://example.com", "https://app.example.com"],
      });

      const response = cors({
        method: "GET",
        headers: {},
        origin: "https://example.com",
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers["Access-Control-Allow-Origin"]).toBe("https://example.com");
    });

    it("should reject requests from disallowed origins", () => {
      const cors = createCORSMiddleware({
        origin: ["https://example.com"],
      });

      const response = cors({
        method: "GET",
        headers: {},
        origin: "https://evil.com",
      });

      expect(response.statusCode).toBe(403);
      expect(response.body).toBe("Origin not allowed");
    });

    it("should accept requests matching origin regex", () => {
      const cors = createCORSMiddleware({
        origin: /^https:\/\/.*\.example\.com$/,
      });

      const response1 = cors({
        method: "GET",
        headers: {},
        origin: "https://app.example.com",
      });

      const response2 = cors({
        method: "GET",
        headers: {},
        origin: "https://api.example.com",
      });

      expect(response1.statusCode).toBe(200);
      expect(response2.statusCode).toBe(200);
    });

    it("should reject requests not matching origin regex", () => {
      const cors = createCORSMiddleware({
        origin: /^https:\/\/.*\.example\.com$/,
      });

      const response = cors({
        method: "GET",
        headers: {},
        origin: "https://evil.com",
      });

      expect(response.statusCode).toBe(403);
    });
  });

  describe("Preflight Requests", () => {
    it("should handle OPTIONS preflight requests", () => {
      const cors = createCORSMiddleware();
      const response = cors({
        method: "OPTIONS",
        headers: {},
        origin: "https://example.com",
      });

      expect(response.statusCode).toBe(204);
      expect(response.headers["Access-Control-Allow-Methods"]).toBeDefined();
    });

    it("should include all required preflight headers", () => {
      const cors = createCORSMiddleware({
        methods: ["GET", "POST", "PUT"],
        allowedHeaders: ["Content-Type", "X-Custom"],
      });

      const response = cors({
        method: "OPTIONS",
        headers: {},
        origin: "https://example.com",
      });

      expect(response.headers["Access-Control-Allow-Origin"]).toBeDefined();
      expect(response.headers["Access-Control-Allow-Methods"]).toBeDefined();
      expect(response.headers["Access-Control-Allow-Headers"]).toBeDefined();
      expect(response.headers["Access-Control-Max-Age"]).toBeDefined();
    });

    it("should return 204 No Content for successful preflight", () => {
      const cors = createCORSMiddleware();
      const response = cors({
        method: "OPTIONS",
        headers: {},
        origin: "https://example.com",
      });

      expect(response.statusCode).toBe(204);
    });
  });

  describe("Credentials", () => {
    it("should not set credentials header by default", () => {
      const cors = createCORSMiddleware();
      const response = cors({
        method: "GET",
        headers: {},
        origin: "https://example.com",
      });

      expect(response.headers["Access-Control-Allow-Credentials"]).toBeUndefined();
    });

    it("should set credentials header when enabled", () => {
      const cors = createCORSMiddleware({ credentials: true });
      const response = cors({
        method: "GET",
        headers: {},
        origin: "https://example.com",
      });

      expect(response.headers["Access-Control-Allow-Credentials"]).toBe("true");
    });
  });

  describe("Exposed Headers", () => {
    it("should not set exposed headers by default", () => {
      const cors = createCORSMiddleware();
      const response = cors({
        method: "GET",
        headers: {},
        origin: "https://example.com",
      });

      expect(response.headers["Access-Control-Expose-Headers"]).toBeUndefined();
    });

    it("should set exposed headers when configured", () => {
      const cors = createCORSMiddleware({
        exposedHeaders: ["X-Total-Count", "X-Page-Number"],
      });

      const response = cors({
        method: "GET",
        headers: {},
        origin: "https://example.com",
      });

      expect(response.headers["Access-Control-Expose-Headers"]).toBe(
        "X-Total-Count, X-Page-Number"
      );
    });
  });

  describe("Various HTTP Methods", () => {
    it("should allow configured HTTP methods", () => {
      const cors = createCORSMiddleware({
        methods: ["GET", "POST", "PUT"],
      });

      const response = cors({
        method: "OPTIONS",
        headers: {},
        origin: "https://example.com",
      });

      expect(response.headers["Access-Control-Allow-Methods"]).toBe("GET, POST, PUT");
    });

    it("should handle GET requests", () => {
      const cors = createCORSMiddleware();
      const response = cors({
        method: "GET",
        headers: {},
        origin: "https://example.com",
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers["Access-Control-Allow-Origin"]).toBeDefined();
    });

    it("should handle POST requests", () => {
      const cors = createCORSMiddleware();
      const response = cors({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        origin: "https://example.com",
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers["Access-Control-Allow-Origin"]).toBeDefined();
    });

    it("should handle DELETE requests", () => {
      const cors = createCORSMiddleware();
      const response = cors({
        method: "DELETE",
        headers: {},
        origin: "https://example.com",
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe("Edge Cases", () => {
    it("should handle requests without origin header", () => {
      const cors = createCORSMiddleware({ origin: "*" });
      const response = cors({
        method: "GET",
        headers: {},
      });

      expect(response.statusCode).toBe(200);
    });

    it("should handle origin with port number", () => {
      const cors = createCORSMiddleware({
        origin: ["https://localhost:3000"],
      });

      const response = cors({
        method: "GET",
        headers: {},
        origin: "https://localhost:3000",
      });

      expect(response.statusCode).toBe(200);
    });

    it("should handle subdomains", () => {
      const cors = createCORSMiddleware({
        origin: /^https:\/\/.*\.example\.com$/,
      });

      const response = cors({
        method: "GET",
        headers: {},
        origin: "https://api.v2.example.com",
      });

      expect(response.statusCode).toBe(200);
    });

    it("should handle case-sensitive origin matching", () => {
      const cors = createCORSMiddleware({
        origin: ["https://Example.COM"],
      });

      const response = cors({
        method: "GET",
        headers: {},
        origin: "https://example.com",
      });

      // Origins are typically case-sensitive
      expect(response.statusCode).toBe(403);
    });

    it("should handle trailing slashes in origin", () => {
      const cors = createCORSMiddleware({
        origin: (origin) => (origin?.endsWith("/") ? false : true),
      });

      const response1 = cors({
        method: "GET",
        headers: {},
        origin: "https://example.com",
      });

      const response2 = cors({
        method: "GET",
        headers: {},
        origin: "https://example.com/",
      });

      expect(response1.statusCode).toBe(200);
      expect(response2.statusCode).toBe(403);
    });
  });
});
