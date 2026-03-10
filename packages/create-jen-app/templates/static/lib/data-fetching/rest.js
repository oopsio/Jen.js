import { createCacheKey, executeCacheStrategy } from "./cache.js";
/**
 * Unified REST/HTTP data fetcher for both server and client.
 * Integrates with cache, retry logic, interceptors, and timeout handling.
 *
 * Supports:
 * - Multiple HTTP methods (GET, POST, PUT, DELETE, PATCH)
 * - Request/response transformation via interceptors
 * - Automatic retry with backoff strategies
 * - Pluggable cache backends
 * - Comprehensive error handling
 */
export class RestFetcher {
    cache;
    interceptors;
    baseUrl;
    defaultHeaders = {};
    constructor(opts) {
        this.cache = opts?.cache;
        this.interceptors = opts?.interceptors || [];
        this.baseUrl = opts?.baseUrl;
        this.defaultHeaders = opts?.defaultHeaders || {};
    }
    /**
     * Registers a new interceptor for request/response transformation.
     */
    addInterceptor(interceptor) {
        this.interceptors.push(interceptor);
    }
    /**
     * Performs a GET request with optional caching.
     */
    async get(url, config) {
        return this.fetch(url, { ...config, method: "GET" });
    }
    /**
     * Performs a POST request.
     */
    async post(url, body, config) {
        return this.fetch(url, { ...config, method: "POST", body });
    }
    /**
     * Performs a PUT request.
     */
    async put(url, body, config) {
        return this.fetch(url, { ...config, method: "PUT", body });
    }
    /**
     * Performs a DELETE request.
     */
    async delete(url, config) {
        return this.fetch(url, { ...config, method: "DELETE" });
    }
    /**
     * Performs a PATCH request.
     */
    async patch(url, body, config) {
        return this.fetch(url, { ...config, method: "PATCH", body });
    }
    /**
     * Core fetch method with cache, retry, and interceptor support.
     */
    async fetch(url, config) {
        const fullUrl = this.resolveUrl(url);
        const method = config?.method || "GET";
        // Merge headers
        const headers = {
            ...this.defaultHeaders,
            ...config?.headers,
            ...(config?.body && !config.headers?.["content-type"]
                ? { "content-type": "application/json" }
                : {}),
        };
        let options = {
            method,
            headers,
            body: config?.body,
            timeout: config?.timeout || 30000,
            credentials: config?.credentials || "same-origin",
            signal: config?.signal,
        };
        // Run beforeRequest interceptors
        for (const interceptor of this.interceptors) {
            if (interceptor.beforeRequest) {
                options = await interceptor.beforeRequest(options);
            }
        }
        try {
            // Check cache first if enabled
            const cacheStrategy = typeof config?.cache === "boolean"
                ? config.cache
                    ? "cache-first"
                    : "no-cache"
                : config?.cache?.strategy || "no-cache";
            const cacheKey = createCacheKey(fullUrl, options);
            const cacheTags = (typeof config?.cache === "object" && config.cache.tags) || [];
            const cacheTtl = (typeof config?.cache === "object" && config.cache.ttl) || 60000;
            let result;
            if (cacheStrategy !== "no-cache" && method === "GET") {
                const { data, cached } = await executeCacheStrategy(cacheStrategy, {
                    key: cacheKey,
                    cache: this.cache,
                    fetchFn: () => this.performFetch(fullUrl, options),
                    ttl: cacheTtl,
                    tags: cacheTags,
                });
                result = {
                    ok: true,
                    data,
                    meta: {
                        status: 200,
                        statusText: "OK",
                        headers: {},
                        url: fullUrl,
                        ok: true,
                        cached,
                    },
                };
            }
            else {
                const data = await this.performFetch(fullUrl, options);
                result = {
                    ok: true,
                    data,
                    meta: {
                        status: 200,
                        statusText: "OK",
                        headers: {},
                        url: fullUrl,
                        ok: true,
                        cached: false,
                    },
                };
            }
            // Run afterResponse interceptors
            for (const interceptor of this.interceptors) {
                if (interceptor.afterResponse) {
                    result = await interceptor.afterResponse(result);
                }
            }
            return result;
        }
        catch (err) {
            const errorResult = {
                ok: false,
                error: {
                    message: err.message || "Unknown error",
                    code: err.code,
                    status: err.status,
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
     * Internal method to perform the actual HTTP request with retry logic.
     */
    async performFetch(url, options) {
        const retryConfig = {
            attempts: 3,
            delay: 100,
            backoff: "exponential",
        };
        let lastError = null;
        for (let attempt = 0; attempt < retryConfig.attempts; attempt++) {
            try {
                const response = await this.executeRequest(url, options);
                return response;
            }
            catch (err) {
                lastError = err;
                // Don't retry on client-side errors (4xx)
                if (err.status && err.status >= 400 && err.status < 500) {
                    throw err;
                }
                // Calculate backoff delay
                if (attempt < retryConfig.attempts - 1) {
                    const delay = retryConfig.backoff === "exponential"
                        ? retryConfig.delay * Math.pow(2, attempt)
                        : retryConfig.delay * (attempt + 1);
                    await new Promise((resolve) => setTimeout(resolve, delay));
                }
            }
        }
        throw lastError || new Error("Failed to fetch after retries");
    }
    /**
     * Executes the actual HTTP request using fetch API (universal).
     */
    async executeRequest(url, options) {
        const fetchOpts = {
            method: options.method,
            headers: options.headers,
            credentials: options.credentials,
            signal: options.signal,
        };
        if (options.body) {
            fetchOpts.body =
                typeof options.body === "string"
                    ? options.body
                    : JSON.stringify(options.body);
        }
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), options.timeout || 30000);
        try {
            const response = await fetch(url, {
                ...fetchOpts,
                signal: controller.signal,
            });
            if (!response.ok) {
                const errorText = await response.text().catch(() => "");
                const error = new Error(errorText || response.statusText || "HTTP Error");
                error.status = response.status;
                throw error;
            }
            const contentType = response.headers.get("content-type") || "";
            if (contentType.includes("application/json")) {
                return await response.json();
            }
            else if (contentType.includes("text")) {
                return (await response.text());
            }
            else {
                return (await response.arrayBuffer());
            }
        }
        finally {
            clearTimeout(timeoutId);
        }
    }
    /**
     * Resolves relative URLs using baseUrl if configured.
     */
    resolveUrl(url) {
        if (this.baseUrl && !url.startsWith("http")) {
            return this.baseUrl.replace(/\/$/, "") + "/" + url.replace(/^\//, "");
        }
        return url;
    }
}
/**
 * Creates a REST fetcher with sensible defaults.
 */
export function createRestFetcher(opts) {
    return new RestFetcher(opts);
}
