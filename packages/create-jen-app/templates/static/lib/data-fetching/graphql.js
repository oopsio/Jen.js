import { RestFetcher } from "./rest.js";
import { executeCacheStrategy } from "./cache.js";
/**
 * GraphQL client for querying GraphQL APIs.
 * Integrates with REST fetcher infrastructure for cache and interceptor support.
 *
 * Features:
 * - Query and mutation execution
 * - Automatic error extraction from GraphQL responses
 * - Cache support with tag-based invalidation
 * - Request/response interceptors
 * - Type-safe operation configuration
 */
export class GraphQLClient {
  restFetcher;
  endpoint;
  cache;
  interceptors;
  constructor(opts) {
    this.endpoint = opts.endpoint;
    this.cache = opts.cache;
    this.interceptors = opts.interceptors || [];
    this.restFetcher = new RestFetcher({
      cache: opts.cache,
      interceptors: opts.interceptors,
      baseUrl: opts.endpoint.includes("http")
        ? undefined
        : "https://api.example.com",
      defaultHeaders: {
        "content-type": "application/json",
        ...opts.defaultHeaders,
      },
    });
  }
  /**
   * Registers a new interceptor.
   */
  addInterceptor(interceptor) {
    this.restFetcher.addInterceptor(interceptor);
    this.interceptors.push(interceptor);
  }
  /**
   * Executes a GraphQL query.
   * Queries are cached by default (cache-first strategy).
   */
  async query(request, config) {
    const gqlRequest =
      typeof request === "string" ? { query: request } : request;
    // Queries are safe to cache
    const cacheConfig = {
      strategy: "cache-first",
      ttl: 300000, // 5 minutes default
    };
    if (config?.cache && typeof config.cache === "object") {
      Object.assign(cacheConfig, config.cache);
    }
    return this.execute(gqlRequest, {
      ...config,
      cache: cacheConfig,
    });
  }
  /**
   * Executes a GraphQL mutation.
   * Mutations are NOT cached by default (no-cache strategy).
   */
  async mutation(request, config) {
    const gqlRequest =
      typeof request === "string" ? { query: request } : request;
    // Mutations should not be cached
    const cacheConfig = {
      strategy: "no-cache",
    };
    if (config?.cache && typeof config.cache === "object") {
      Object.assign(cacheConfig, config.cache);
    }
    return this.execute(gqlRequest, {
      ...config,
      cache: cacheConfig,
    });
  }
  /**
   * Core GraphQL execution with cache and interceptor support.
   */
  async execute(request, config) {
    const cacheStrategy = config?.cache?.strategy || "cache-first";
    const cacheKey = this.createGraphQLCacheKey(request);
    const cacheTtl = config?.cache?.ttl || 300000;
    const cacheTags = config?.cache?.tags || [
      `gql:${this.extractOperationName(request)}`,
    ];
    try {
      let data;
      if (cacheStrategy !== "no-cache") {
        const { data: cachedData, cached } = await executeCacheStrategy(
          cacheStrategy,
          {
            key: cacheKey,
            cache: this.cache,
            fetchFn: () => this.performRequest(request),
            ttl: cacheTtl,
            tags: cacheTags,
          },
        );
        data = cachedData;
      } else {
        data = await this.performRequest(request);
      }
      const result = {
        ok: true,
        data,
        meta: {
          status: 200,
          statusText: "OK",
          headers: { "content-type": "application/json" },
          url: this.endpoint,
          ok: true,
        },
      };
      // Run afterResponse interceptors
      for (const interceptor of this.interceptors) {
        if (interceptor.afterResponse) {
          const intercepted = await interceptor.afterResponse(result);
          if (!intercepted.ok) return intercepted;
          if (intercepted.ok) {
            result.data = intercepted.data;
          }
        }
      }
      return result;
    } catch (err) {
      const errorResult = {
        ok: false,
        error: {
          message: err.message || "GraphQL request failed",
          code: err.code,
          details: err,
        },
      };
      // Run onError interceptors
      for (const interceptor of this.interceptors) {
        if (interceptor.onError) {
          return await interceptor.onError(errorResult);
        }
      }
      return errorResult;
    }
  }
  /**
   * Performs the actual GraphQL request.
   */
  async performRequest(request) {
    const response = await this.restFetcher.post(this.endpoint, request, {
      cache: false, // Already handled by execute()
    });
    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.error.message}`);
    }
    const { data, errors } = response.data;
    if (errors && errors.length > 0) {
      const errorMessages = errors.map((e) => e.message).join("; ");
      throw new Error(`GraphQL errors: ${errorMessages}`);
    }
    return data;
  }
  /**
   * Generates cache key from GraphQL request.
   */
  createGraphQLCacheKey(request) {
    const key = `gql:${this.extractOperationName(request)}`;
    const varsStr = request.variables ? JSON.stringify(request.variables) : "";
    return `${key}:${varsStr}`;
  }
  /**
   * Extracts operation name from GraphQL query/mutation.
   */
  extractOperationName(request) {
    if (request.operationName) return request.operationName;
    // Try to extract from query string
    const match = request.query.match(/(?:query|mutation)\s+(\w+)/);
    return match ? match[1] : "anonymous";
  }
  /**
   * Invalidates cache entries by GraphQL operation name(s).
   */
  async invalidate(operationNames) {
    const tags = operationNames.map((name) => `gql:${name}`);
    await this.cache.invalidate(tags);
  }
  /**
   * Batch execute multiple GraphQL queries.
   */
  async batch(requests, config) {
    const results = {};
    for (const [key, request] of Object.entries(requests)) {
      const result = await this.query(request, config);
      if (!result.ok) {
        return result;
      }
      results[key] = result.data;
    }
    return {
      ok: true,
      data: results,
      meta: {
        status: 200,
        statusText: "OK",
        headers: {},
        url: this.endpoint,
        ok: true,
      },
    };
  }
}
/**
 * Creates a GraphQL client with sensible defaults.
 */
export function createGraphQLClient(opts) {
  return new GraphQLClient(opts);
}
/**
 * Helper to build GraphQL query strings programmatically.
 * Useful for type-safe query construction.
 */
export class GraphQLQueryBuilder {
  query = "";
  variables = {};
  /**
   * Adds a field selection to the query.
   */
  field(name, fields) {
    this.query += name;
    if (fields) {
      this.query += ` { ${fields.join(" ")} }`;
    }
    return this;
  }
  /**
   * Adds a variable to the query.
   */
  variable(name, type, value) {
    if (value !== undefined) {
      this.variables[name] = value;
    }
    return this;
  }
  /**
   * Builds the final GraphQL request.
   */
  build(operationType = "query", operationName) {
    const opName = operationName || "Operation";
    const vars = Object.entries(this.variables).map(
      ([name, value]) => `$${name}: ${typeof value}`,
    );
    const finalQuery = `
      ${operationType} ${opName}${vars.length ? `(${vars.join(", ")})` : ""} {
        ${this.query}
      }
    `.trim();
    return {
      query: finalQuery,
      variables: this.variables,
      operationName: opName,
    };
  }
}
