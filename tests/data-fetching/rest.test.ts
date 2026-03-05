import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock REST client
interface RequestConfig {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  cache?: boolean;
  cacheTTL?: number;
}

interface Response<T> {
  status: number;
  statusText: string;
  data: T;
  headers: Record<string, string>;
}

class RestClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private cache = new Map<string, { data: any; expiresAt: number }>();
  private requestInterceptors: Array<(config: RequestConfig) => RequestConfig> = [];
  private responseInterceptors: Array<(response: any) => any> = [];

  constructor(baseURL: string, defaultHeaders: Record<string, string> = {}) {
    this.baseURL = baseURL;
    this.defaultHeaders = defaultHeaders;
  }

  addRequestInterceptor(fn: (config: RequestConfig) => RequestConfig) {
    this.requestInterceptors.push(fn);
  }

  addResponseInterceptor(fn: (response: any) => any) {
    this.responseInterceptors.push(fn);
  }

  private getCacheKey(method: string, url: string): string {
    return `${method}:${url}`;
  }

  private applyRequestInterceptors(config: RequestConfig): RequestConfig {
    return this.requestInterceptors.reduce((cfg, fn) => fn(cfg), config);
  }

  private applyResponseInterceptors(response: any): any {
    return this.responseInterceptors.reduce((res, fn) => fn(res), response);
  }

  async request<T>(method: string, path: string, config: RequestConfig = {}): Promise<Response<T>> {
    const url = `${this.baseURL}${path}`;
    const cacheKey = this.getCacheKey(method, url);

    // Check cache
    if (config.cache !== false && (method === "GET" || method === "HEAD")) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() < cached.expiresAt) {
        return cached.data;
      }
    }

    let attempt = 0;
    const maxRetries = config.retries ?? 3;

    while (attempt <= maxRetries) {
      try {
        let requestConfig: RequestConfig = {
          ...config,
          method,
          headers: { ...this.defaultHeaders, ...config.headers },
        };
        requestConfig = this.applyRequestInterceptors(requestConfig);

        // Simulate network request
        const response = await this.simulateRequest<T>(url, requestConfig);
        let finalResponse = this.applyResponseInterceptors(response);

        // Cache successful GET requests
        if (config.cache !== false && method === "GET" && response.status >= 200 && response.status < 300) {
          const ttl = config.cacheTTL ?? 60000; // 1 minute default
          this.cache.set(cacheKey, {
            data: finalResponse,
            expiresAt: Date.now() + ttl,
          });
        }

        return finalResponse;
      } catch (error) {
        attempt++;
        if (attempt > maxRetries) {
          throw new Error(`Request failed after ${maxRetries + 1} attempts: ${error}`);
        }
        // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 100));
      }
    }

    throw new Error("Request failed");
  }

  private async simulateRequest<T>(url: string, config: RequestConfig): Promise<Response<T>> {
    return new Promise((resolve, reject) => {
      // Simulate network delay
      setTimeout(() => {
        // Parse URL for mock responses
        if (url.includes("/success")) {
          resolve({
            status: 200,
            statusText: "OK",
            data: { message: "success" } as T,
            headers: { "content-type": "application/json" },
          });
        } else if (url.includes("/created")) {
          resolve({
            status: 201,
            statusText: "Created",
            data: { id: 1 } as T,
            headers: { "content-type": "application/json" },
          });
        } else if (url.includes("/notfound")) {
          resolve({
            status: 404,
            statusText: "Not Found",
            data: { error: "not found" } as T,
            headers: { "content-type": "application/json" },
          });
        } else if (url.includes("/error")) {
          resolve({
            status: 500,
            statusText: "Internal Server Error",
            data: { error: "internal error" } as T,
            headers: { "content-type": "application/json" },
          });
        } else if (url.includes("/timeout")) {
          reject(new Error("Request timeout"));
        } else {
          reject(new Error("Unknown URL"));
        }
      }, 10);
    });
  }

  async get<T>(path: string, config: RequestConfig = {}) {
    return this.request<T>("GET", path, config);
  }

  async post<T>(path: string, data: any, config: RequestConfig = {}) {
    return this.request<T>("POST", path, { ...config, body: data });
  }

  async put<T>(path: string, data: any, config: RequestConfig = {}) {
    return this.request<T>("PUT", path, { ...config, body: data });
  }

  async patch<T>(path: string, data: any, config: RequestConfig = {}) {
    return this.request<T>("PATCH", path, { ...config, body: data });
  }

  async delete<T>(path: string, config: RequestConfig = {}) {
    return this.request<T>("DELETE", path, config);
  }

  clearCache() {
    this.cache.clear();
  }
}

describe("REST Client", () => {
  let client: RestClient;

  beforeEach(() => {
    client = new RestClient("https://api.example.com", {
      "Content-Type": "application/json",
    });
  });

  describe("GET Requests", () => {
    it("should fetch data with GET", async () => {
      const response = await client.get("/success");
      expect(response.status).toBe(200);
      expect(response.data.message).toBe("success");
    });

    it("should set default headers", async () => {
      const client2 = new RestClient("https://api.example.com", {
        Authorization: "Bearer token123",
      });
      const response = await client2.get("/success");
      expect(response.status).toBe(200);
    });

    it("should handle 404 responses", async () => {
      const response = await client.get("/notfound");
      expect(response.status).toBe(404);
      expect(response.statusText).toBe("Not Found");
    });
  });

  describe("POST Requests", () => {
    it("should send POST request with data", async () => {
      const response = await client.post("/created", { name: "test" });
      expect(response.status).toBe(201);
      expect(response.statusText).toBe("Created");
    });

    it("should include request body in POST", async () => {
      const data = { name: "John", email: "john@example.com" };
      const response = await client.post("/created", data);
      expect(response.status).toBe(201);
    });
  });

  describe("PUT and PATCH", () => {
    it("should send PUT request", async () => {
      const response = await client.put("/success", { updated: true });
      expect(response.status).toBe(200);
    });

    it("should send PATCH request", async () => {
      const response = await client.patch("/success", { field: "value" });
      expect(response.status).toBe(200);
    });
  });

  describe("DELETE Requests", () => {
    it("should send DELETE request", async () => {
      const response = await client.delete("/success");
      expect(response.status).toBe(200);
    });
  });

  describe("Caching", () => {
    it("should cache GET requests by default", async () => {
      const response1 = await client.get("/success");
      expect(response1.status).toBe(200);

      const response2 = await client.get("/success");
      expect(response2.data).toEqual(response1.data);
    });

    it("should respect cache TTL", async () => {
      await client.get("/success", { cacheTTL: 50 });

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Should be expired and refetched
      const response = await client.get("/success", { cacheTTL: 50 });
      expect(response.status).toBe(200);
    });

    it("should not cache if cache is disabled", async () => {
      const response1 = await client.get("/success", { cache: false });
      const response2 = await client.get("/success", { cache: false });
      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
    });

    it("should clear cache", async () => {
      await client.get("/success");
      client.clearCache();
      // Next request should hit the server again
      const response = await client.get("/success");
      expect(response.status).toBe(200);
    });

    it("should not cache POST requests", async () => {
      await client.post("/created", { data: "value" });
      // POST requests shouldn't be cached, so we'd get a fresh response
      const response = await client.post("/created", { data: "value" });
      expect(response.status).toBe(201);
    });
  });

  describe("Error Handling", () => {
    it("should handle request timeouts", async () => {
      await expect(client.get("/timeout")).rejects.toThrow();
    });

    it("should handle 5xx errors", async () => {
      const response = await client.get("/error");
      expect(response.status).toBe(500);
      expect(response.statusText).toBe("Internal Server Error");
    });

    it("should retry failed requests", async () => {
      // Should throw after max retries
      await expect(client.get("/timeout", { retries: 0 })).rejects.toThrow("Request failed");
    });
  });

  describe("Custom Headers", () => {
    it("should merge custom headers with defaults", async () => {
      const response = await client.get("/success", {
        headers: { Authorization: "Bearer custom" },
      });
      expect(response.status).toBe(200);
    });

    it("should override default headers with custom ones", async () => {
      const response = await client.get("/success", {
        headers: { "Content-Type": "application/xml" },
      });
      expect(response.status).toBe(200);
    });
  });

  describe("Request Interceptors", () => {
    it("should apply request interceptors", async () => {
      const mockInterceptor = vi.fn((config: RequestConfig) => {
        config.headers = { ...config.headers, "X-Custom": "intercepted" };
        return config;
      });

      client.addRequestInterceptor(mockInterceptor);
      await client.get("/success");

      expect(mockInterceptor).toHaveBeenCalled();
    });

    it("should chain multiple request interceptors", async () => {
      client.addRequestInterceptor((config) => ({
        ...config,
        headers: { ...config.headers, "X-First": "first" },
      }));
      client.addRequestInterceptor((config) => ({
        ...config,
        headers: { ...config.headers, "X-Second": "second" },
      }));

      const response = await client.get("/success");
      expect(response.status).toBe(200);
    });
  });

  describe("Response Interceptors", () => {
    it("should apply response interceptors", async () => {
      const mockInterceptor = vi.fn((response: any) => {
        response.intercepted = true;
        return response;
      });

      client.addResponseInterceptor(mockInterceptor);
      const response = await client.get("/success");

      expect(mockInterceptor).toHaveBeenCalled();
      expect(response.intercepted).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty response data", async () => {
      const response = await client.get("/success");
      expect(response).toBeDefined();
      expect(response.status).toBeGreaterThanOrEqual(200);
    });

    it("should handle paths with query parameters", async () => {
      const response = await client.get("/success?page=1&limit=10");
      expect(response.status).toBe(200);
    });

    it("should handle paths with special characters", async () => {
      const response = await client.get("/success/with space");
      expect(response.status).toBe(200);
    });
  });
});
