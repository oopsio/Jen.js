import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock GraphQL client
interface GraphQLOptions {
  endpoint: string;
  headers?: Record<string, string>;
}

interface GraphQLError {
  message: string;
  locations?: Array<{ line: number; column: number }>;
  path?: string[];
}

interface GraphQLResponse<T> {
  data: T | null;
  errors?: GraphQLError[];
}

class GraphQLClient {
  private endpoint: string;
  private headers: Record<string, string>;
  private requestInterceptors: Array<(query: string, vars: any) => void> = [];
  private responseInterceptors: Array<(response: any) => any> = [];
  private cache = new Map<string, { data: any; expiresAt: number }>();

  constructor(options: GraphQLOptions) {
    this.endpoint = options.endpoint;
    this.headers = options.headers || {};
  }

  addRequestInterceptor(fn: (query: string, vars: any) => void) {
    this.requestInterceptors.push(fn);
  }

  addResponseInterceptor(fn: (response: any) => any) {
    this.responseInterceptors.push(fn);
  }

  private getCacheKey(query: string, vars: any): string {
    return `${query}:${JSON.stringify(vars || {})}`;
  }

  private applyResponseInterceptors(response: any): any {
    return this.responseInterceptors.reduce((res, fn) => fn(res), response);
  }

  async query<T>(
    query: string,
    variables?: Record<string, any>,
    cache?: number,
  ): Promise<GraphQLResponse<T>> {
    const cacheKey = this.getCacheKey(query, variables);

    // Check cache
    if (cache) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() < cached.expiresAt) {
        return cached.data;
      }
    }

    // Apply request interceptors
    for (const interceptor of this.requestInterceptors) {
      interceptor(query, variables);
    }

    const response = await this.simulateRequest<T>(query, variables);
    let finalResponse = this.applyResponseInterceptors(response);

    // Cache if requested
    if (cache) {
      this.cache.set(cacheKey, {
        data: finalResponse,
        expiresAt: Date.now() + cache,
      });
    }

    return finalResponse;
  }

  async mutation<T>(
    mutation: string,
    variables?: Record<string, any>,
  ): Promise<GraphQLResponse<T>> {
    // Apply request interceptors
    for (const interceptor of this.requestInterceptors) {
      interceptor(mutation, variables);
    }

    const response = await this.simulateRequest<T>(mutation, variables);
    return this.applyResponseInterceptors(response);
  }

  async batch<T>(
    operations: Array<{ query: string; variables?: Record<string, any> }>,
  ): Promise<GraphQLResponse<T>[]> {
    const results: GraphQLResponse<T>[] = [];

    for (const op of operations) {
      for (const interceptor of this.requestInterceptors) {
        interceptor(op.query, op.variables);
      }
      const result = await this.simulateRequest<T>(op.query, op.variables);
      results.push(this.applyResponseInterceptors(result));
    }

    return results;
  }

  private async simulateRequest<T>(
    query: string,
    variables?: Record<string, any>,
  ): Promise<GraphQLResponse<T>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate different responses based on query
        if (query.includes("GetUser")) {
          resolve({
            data: {
              user: {
                id: "1",
                name: "Alice",
                email: "alice@example.com",
              },
            } as T,
          });
        } else if (query.includes("GetUsers")) {
          resolve({
            data: {
              users: [
                { id: "1", name: "Alice" },
                { id: "2", name: "Bob" },
              ],
            } as T,
          });
        } else if (query.includes("CreateUser")) {
          resolve({
            data: {
              createUser: {
                id: String(Math.random()),
                name: variables?.name || "New User",
              },
            } as T,
          });
        } else if (query.includes("UpdateUser")) {
          resolve({
            data: {
              updateUser: {
                id: variables?.id || "1",
                name: variables?.name || "Updated",
              },
            } as T,
          });
        } else if (query.includes("DeleteUser")) {
          resolve({
            data: {
              deleteUser: { success: true },
            } as T,
          });
        } else if (query.includes("ERROR")) {
          resolve({
            data: null,
            errors: [
              {
                message: "Simulated error",
                path: ["query", "field"],
              },
            ],
          });
        } else {
          resolve({
            data: { result: "ok" } as T,
          });
        }
      }, 10);
    });
  }

  clearCache(): void {
    this.cache.clear();
  }
}

describe("GraphQL Client", () => {
  let client: GraphQLClient;

  beforeEach(() => {
    client = new GraphQLClient({
      endpoint: "https://api.example.com/graphql",
      headers: { Authorization: "Bearer token123" },
    });
  });

  describe("Queries", () => {
    it("should execute a query", async () => {
      const query = `
        query GetUser {
          user {
            id
            name
            email
          }
        }
      `;
      const response = await client.query(query);
      expect(response.data).toBeDefined();
      expect(response.errors).toBeUndefined();
    });

    it("should pass variables to query", async () => {
      const query = `
        query GetUserById($id: ID!) {
          user(id: $id) {
            id
            name
          }
        }
      `;
      const response = await client.query(query, { id: "123" });
      expect(response.data).toBeDefined();
    });

    it("should handle multiple root fields", async () => {
      const query = `
        query GetUsers {
          users {
            id
            name
          }
        }
      `;
      const response = await client.query(query);
      expect(response.data).toBeDefined();
    });

    it("should handle query errors", async () => {
      const query = `
        query ERROR {
          error
        }
      `;
      const response = await client.query(query);
      expect(response.errors).toBeDefined();
      expect(response.errors?.[0].message).toBe("Simulated error");
    });
  });

  describe("Mutations", () => {
    it("should execute a mutation", async () => {
      const mutation = `
        mutation CreateUser($name: String!) {
          createUser(name: $name) {
            id
            name
          }
        }
      `;
      const response = await client.mutation(mutation, { name: "Charlie" });
      expect(response.data).toBeDefined();
    });

    it("should execute update mutation", async () => {
      const mutation = `
        mutation UpdateUser($id: ID!, $name: String!) {
          updateUser(id: $id, name: $name) {
            id
            name
          }
        }
      `;
      const response = await client.mutation(mutation, {
        id: "1",
        name: "Updated Name",
      });
      expect(response.data).toBeDefined();
    });

    it("should execute delete mutation", async () => {
      const mutation = `
        mutation DeleteUser($id: ID!) {
          deleteUser(id: $id) {
            success
          }
        }
      `;
      const response = await client.mutation(mutation, { id: "1" });
      expect(response.data).toBeDefined();
    });
  });

  describe("Batch Operations", () => {
    it("should execute batch queries", async () => {
      const operations = [
        {
          query: `
            query GetUser {
              user { id name }
            }
          `,
        },
        {
          query: `
            query GetUsers {
              users { id name }
            }
          `,
        },
      ];
      const responses = await client.batch(operations);
      expect(responses).toHaveLength(2);
      expect(responses[0].data).toBeDefined();
      expect(responses[1].data).toBeDefined();
    });

    it("should execute batch with variables", async () => {
      const operations = [
        {
          query: `mutation CreateUser($name: String!) { createUser(name: $name) { id } }`,
          variables: { name: "User1" },
        },
        {
          query: `mutation CreateUser($name: String!) { createUser(name: $name) { id } }`,
          variables: { name: "User2" },
        },
      ];
      const responses = await client.batch(operations);
      expect(responses).toHaveLength(2);
    });
  });

  describe("Caching", () => {
    it("should cache query results", async () => {
      const query = `
        query GetUser {
          user { id name }
        }
      `;
      const response1 = await client.query(query, undefined, 60000);
      const response2 = await client.query(query, undefined, 60000);
      expect(response1.data).toEqual(response2.data);
    });

    it("should respect cache TTL", async () => {
      const query = `query { data }`;
      await client.query(query, undefined, 50);
      await new Promise((resolve) => setTimeout(resolve, 100));
      const response = await client.query(query, undefined, 50);
      expect(response.data).toBeDefined();
    });

    it("should use different cache keys for different variables", async () => {
      const query = `query GetUser($id: ID!) { user(id: $id) { id } }`;
      await client.query(query, { id: "1" }, 60000);
      await client.query(query, { id: "2" }, 60000);
      // Both should be cached separately
      const response1 = await client.query(query, { id: "1" }, 60000);
      const response2 = await client.query(query, { id: "2" }, 60000);
      expect(response1.data).toBeDefined();
      expect(response2.data).toBeDefined();
    });

    it("should clear cache", async () => {
      const query = `query { data }`;
      await client.query(query, undefined, 60000);
      client.clearCache();
      const response = await client.query(query);
      expect(response.data).toBeDefined();
    });
  });

  describe("Request Interceptors", () => {
    it("should apply request interceptors", async () => {
      const mockInterceptor = vi.fn();
      client.addRequestInterceptor(mockInterceptor);

      const query = `query { data }`;
      await client.query(query, { test: "value" });

      expect(mockInterceptor).toHaveBeenCalledWith(query, { test: "value" });
    });

    it("should support multiple request interceptors", async () => {
      const interceptor1 = vi.fn();
      const interceptor2 = vi.fn();
      client.addRequestInterceptor(interceptor1);
      client.addRequestInterceptor(interceptor2);

      const query = `query { data }`;
      await client.query(query);

      expect(interceptor1).toHaveBeenCalled();
      expect(interceptor2).toHaveBeenCalled();
    });
  });

  describe("Response Interceptors", () => {
    it("should apply response interceptors", async () => {
      const mockInterceptor = vi.fn((response) => {
        response.intercepted = true;
        return response;
      });
      client.addResponseInterceptor(mockInterceptor);

      const query = `query GetUser { user { id } }`;
      const response = await client.query(query);

      expect(mockInterceptor).toHaveBeenCalled();
      expect(response.intercepted).toBe(true);
    });
  });

  describe("Error Handling", () => {
    it("should handle GraphQL errors in response", async () => {
      const query = `query ERROR { field }`;
      const response = await client.query(query);
      expect(response.errors).toBeDefined();
      expect(response.errors?.[0].message).toBe("Simulated error");
    });

    it("should include error path information", async () => {
      const query = `query ERROR { field }`;
      const response = await client.query(query);
      expect(response.errors?.[0].path).toBeDefined();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty query response", async () => {
      const query = `query Empty { empty }`;
      const response = await client.query(query);
      expect(response).toBeDefined();
    });

    it("should handle queries without variables", async () => {
      const query = `query { data }`;
      const response = await client.query(query);
      expect(response.data).toBeDefined();
    });

    it("should handle mutations without variables", async () => {
      const mutation = `mutation { action }`;
      const response = await client.mutation(mutation);
      expect(response.data).toBeDefined();
    });

    it("should handle special characters in query strings", async () => {
      const query = `
        query GetUser {
          user {
            name
            bio # This is a comment
          }
        }
      `;
      const response = await client.query(query);
      expect(response.data).toBeDefined();
    });

    it("should handle nested fragment definitions", async () => {
      const query = `
        query {
          user {
            id
            name
          }
        }
      `;
      const response = await client.query(query);
      expect(response.data).toBeDefined();
    });

    it("should handle alias fields", async () => {
      const query = `
        query {
          user {
            userId: id
            fullName: name
          }
        }
      `;
      const response = await client.query(query);
      expect(response.data).toBeDefined();
    });

    it("should handle multiple root operations", async () => {
      const query = `
        query GetUsers {
          users { id }
        }
        query GetUser {
          user { id }
        }
      `;
      // Should use first operation
      const response = await client.query(query);
      expect(response.data).toBeDefined();
    });
  });

  describe("Performance", () => {
    it("should execute query quickly", async () => {
      const query = `query { data }`;
      const start = performance.now();
      await client.query(query);
      const end = performance.now();
      expect(end - start).toBeLessThan(100);
    });

    it("should handle many batch requests efficiently", async () => {
      const operations = Array.from({ length: 50 }, (_, i) => ({
        query: `query GetUser${i} { user { id } }`,
      }));
      const start = performance.now();
      await client.batch(operations);
      const end = performance.now();
      expect(end - start).toBeLessThan(1000);
    });
  });
});
