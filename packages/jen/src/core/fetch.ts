import { GlobalCache } from './cache.js';

/**
 * Fetch options extension for Jen.js
 */
export interface JenFetchOptions extends RequestInit {
  next?: {
    revalidate?: number; // TTL in seconds
    tags?: string[]; // For tag-based revalidation (future)
  };
}

/**
 * In-flight requests for deduplication
 */
const inFlightRequests = new Map<string, Promise<any>>();

/**
 * Jen.js Fetch Wrapper
 * 
 * Features:
 * - Automatic deduplication of in-flight requests
 * - Integrated TTL caching via GlobalCache
 * - Fetch API compatible
 */
export function jenFetch(
  input: string | URL | Request,
  init?: JenFetchOptions
): Promise<Response> {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
  const method = init?.method || 'GET';
  
  // Create a deterministic cache key
  const cacheKey = `fetch:${method}:${url}`;

  // 1. Check in-flight requests (Deduplication)
  if (inFlightRequests.has(cacheKey)) {
    console.log(`[jen.fetch] Deduplicated: ${url}`);
    return inFlightRequests.get(cacheKey)!;
  }

  // 2. Check cache (if GET)
  if (method === 'GET') {
    const cached = GlobalCache.get<any>(cacheKey);
    if (cached) {
      console.log(`[jen.fetch] Cache HIT: ${url}`);
      return Promise.resolve(new Response(JSON.stringify(cached), {
        headers: { 'Content-Type': 'application/json', 'X-Jen-Cache': 'HIT' }
      }));
    }
  }

  // 3. Perform the actual fetch
  const fetchPromise = (async () => {
    try {
      const response = await fetch(input, init);
      const responseToCache = response.clone();

      if (response.ok && method === 'GET') {
        const revalidate = init?.next?.revalidate;
        if (revalidate !== undefined) {
          try {
            const data = await responseToCache.json();
            GlobalCache.set(cacheKey, data, { ttl: revalidate });
          } catch (e) {}
        }
      }
      return response;
    } finally {
      inFlightRequests.delete(cacheKey);
    }
  })();

  // Register as in-flight
  inFlightRequests.set(cacheKey, fetchPromise);

  return fetchPromise;
}
