---
sidebar_position: 12
---

# Caching

Optimize performance with intelligent caching strategies.

## Cache Layers

Jen.js supports multiple caching layers:

1. **HTTP Caching** - Browser and CDN cache
2. **Data Caching** - Cache query results
3. **Page Caching** - Cache rendered pages
4. **Asset Caching** - Cache static files

## HTTP Caching

Set cache headers on pages:

```typescript
// site/(blog).tsx

export function Head() {
  return (
    <meta
      httpEquiv="cache-control"
      content="public, max-age=3600, must-revalidate"
    />
  );
}

export async function loader(ctx: LoaderContext) {
  return { posts: [] };
}

export default function Blog({ data }: any) {
  return <div>{/* ... */}</div>;
}
```

### Cache Control Values

| Directive | Effect |
|-----------|--------|
| `public` | Cacheable by browser and CDN |
| `private` | Cacheable only by browser |
| `no-cache` | Must revalidate before use |
| `no-store` | Don't cache at all |
| `max-age=3600` | Cache for 3600 seconds |
| `must-revalidate` | Revalidate when stale |
| `immutable` | Never change (for assets) |

```typescript
// Static content - cache forever
<meta httpEquiv="cache-control" content="public, max-age=31536000, immutable" />

// Dynamic content - short cache
<meta httpEquiv="cache-control" content="public, max-age=300, must-revalidate" />

// Private data - browser only
<meta httpEquiv="cache-control" content="private, max-age=3600" />

// Don't cache
<meta httpEquiv="cache-control" content="no-store" />
```

## Data Caching

Cache database and API query results:

```typescript
// site/(users).tsx

const userCache = new Map<number, any>();
const CACHE_TTL = 5 * 60 * 1000;  // 5 minutes

export async function loader(ctx: LoaderContext) {
  const { id } = ctx.query;
  
  // Check cache
  if (userCache.has(parseInt(id))) {
    const cached = userCache.get(parseInt(id));
    if (Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
  }
  
  // Fetch fresh data
  const user = await db.query('users', { id: parseInt(id) });
  
  // Store in cache
  userCache.set(parseInt(id), {
    data: user,
    timestamp: Date.now()
  });
  
  return user;
}
```

## Page Caching

Cache entire rendered pages:

```typescript
export const renderConfig = {
  mode: 'ssg',
  cache: {
    ttl: 3600,      // Cache for 1 hour
    tags: ['posts']  // For invalidation
  }
};

export async function loader(ctx: LoaderContext) {
  return await expensiveDataFetch();
}
```

## Cache Invalidation

Invalidate cache when data changes:

```typescript
// site/api/posts/(create).ts

export async function handle(req: IncomingMessage, res: ServerResponse) {
  if (req.method === 'POST') {
    const newPost = await db.create('posts', req.body);
    
    // Invalidate posts cache
    await invalidateCache('posts');
    
    res.writeHead(201);
    res.end(JSON.stringify(newPost));
  }
}

async function invalidateCache(tag: string) {
  // Implementation depends on cache backend
  console.log(`Invalidated cache: ${tag}`);
}
```

## Redis Caching

Use Redis for distributed caching:

```typescript
// src/cache/redis.ts

import { createClient } from 'redis';

const client = createClient({ host: 'localhost', port: 6379 });

export async function get(key: string): Promise<any> {
  await client.connect();
  const value = await client.get(key);
  await client.disconnect();
  return value ? JSON.parse(value) : null;
}

export async function set(key: string, value: any, ttl?: number): Promise<void> {
  await client.connect();
  if (ttl) {
    await client.setEx(key, ttl, JSON.stringify(value));
  } else {
    await client.set(key, JSON.stringify(value));
  }
  await client.disconnect();
}

export async function del(key: string): Promise<void> {
  await client.connect();
  await client.del(key);
  await client.disconnect();
}
```

Use in loaders:

```typescript
import * as cache from '@src/cache/redis';

export async function loader(ctx: LoaderContext) {
  const cacheKey = `posts:${ctx.query.page}`;
  
  // Check cache
  let posts = await cache.get(cacheKey);
  
  if (!posts) {
    // Fetch from database
    posts = await db.query('posts', {
      limit: 10,
      offset: (parseInt(ctx.query.page) - 1) * 10
    });
    
    // Store in cache (1 hour TTL)
    await cache.set(cacheKey, posts, 3600);
  }
  
  return { posts };
}
```

## Memory Caching

Simple in-memory cache:

```typescript
// src/cache/memory.ts

interface CacheEntry {
  value: any;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

export function get(key: string): any {
  const entry = cache.get(key);
  
  if (!entry) return null;
  
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  
  return entry.value;
}

export function set(key: string, value: any, ttlSeconds: number = 3600): void {
  cache.set(key, {
    value,
    expiresAt: Date.now() + (ttlSeconds * 1000)
  });
}

export function delete(key: string): void {
  cache.delete(key);
}

export function clear(): void {
  cache.clear();
}
```

Use in loaders:

```typescript
import * as cache from '@src/cache/memory';

export async function loader(ctx: LoaderContext) {
  const cacheKey = `page:${ctx.params.slug}`;
  
  let page = cache.get(cacheKey);
  
  if (!page) {
    page = await db.query('pages', { slug: ctx.params.slug });
    cache.set(cacheKey, page, 1800);  // 30 minutes
  }
  
  return page;
}
```

## Cache Tags

Group related cache entries for bulk invalidation:

```typescript
// src/cache/tags.ts

const tagIndex = new Map<string, Set<string>>();

export function set(key: string, value: any, ttl: number, tags: string[]): void {
  // Store value
  cache.set(key, value, ttl);
  
  // Index tags
  for (const tag of tags) {
    if (!tagIndex.has(tag)) {
      tagIndex.set(tag, new Set());
    }
    tagIndex.get(tag)!.add(key);
  }
}

export function invalidateTag(tag: string): void {
  const keys = tagIndex.get(tag);
  
  if (keys) {
    for (const key of keys) {
      cache.delete(key);
    }
    tagIndex.delete(tag);
  }
}
```

Usage:

```typescript
export const renderConfig = {
  cache: {
    ttl: 3600,
    tags: ['posts', 'homepage']
  }
};

export async function loader(ctx: LoaderContext) {
  return await getPosts();
}

// On post update:
import * as cache from '@src/cache/tags';

export async function handle(req: IncomingMessage, res: ServerResponse) {
  if (req.method === 'POST') {
    const post = await db.create('posts', req.body);
    
    cache.invalidateTag('posts');
    cache.invalidateTag('homepage');
    
    res.writeHead(201);
    res.end(JSON.stringify(post));
  }
}
```

## Stale-While-Revalidate

Serve stale content while refreshing in background:

```typescript
export function Head() {
  return (
    <meta
      httpEquiv="cache-control"
      content="public, max-age=600, stale-while-revalidate=86400"
    />
  );
}
```

This caches for 10 minutes, and allows stale content for up to 1 day while revalidating.

## ETag

Use ETags for conditional requests:

```typescript
import { createHash } from 'node:crypto';

export async function loader(ctx: LoaderContext) {
  const data = await fetchData();
  const etag = createHash('md5').update(JSON.stringify(data)).digest('hex');
  
  // Check If-None-Match header
  if (ctx.req?.headers['if-none-match'] === etag) {
    ctx.res?.writeHead(304);  // Not Modified
    ctx.res?.end();
    return;
  }
  
  // Set ETag header
  ctx.res?.setHeader('etag', etag);
  
  return data;
}
```

## Cache Strategies

### Cache-First

Use cache, fallback to fetch:

```typescript
async function getCachedData(key: string, fetcher: () => Promise<any>) {
  const cached = await cache.get(key);
  if (cached) return cached;
  
  const fresh = await fetcher();
  await cache.set(key, fresh, 3600);
  return fresh;
}
```

### Network-First

Fetch fresh, fallback to cache:

```typescript
async function getFreshData(key: string, fetcher: () => Promise<any>) {
  try {
    const fresh = await fetcher();
    await cache.set(key, fresh, 3600);
    return fresh;
  } catch (error) {
    const cached = await cache.get(key);
    return cached || { error: 'Failed to fetch' };
  }
}
```

### Stale-While-Revalidate

Return cache immediately, update in background:

```typescript
async function getSwrData(key: string, fetcher: () => Promise<any>) {
  const cached = await cache.get(key);
  
  // Return cached immediately
  if (cached) {
    // Revalidate in background
    fetcher().then(fresh => {
      cache.set(key, fresh, 3600);
    });
    return cached;
  }
  
  // No cache, fetch
  const fresh = await fetcher();
  await cache.set(key, fresh, 3600);
  return fresh;
}
```

## Best Practices

1. **Cache at multiple layers** - HTTP, data, page
2. **Use appropriate TTLs** - Shorter for dynamic content
3. **Invalidate strategically** - Don't over-invalidate
4. **Monitor cache hits** - Track effectiveness
5. **Handle cache misses** - Graceful fallbacks
6. **Consider consistency** - vs performance tradeoff
7. **Test cache behavior** - Verify invalidation works
8. **Use cache headers** - Let CDN help

## Next Steps

- [Performance](./performance) - Optimize your site
- [Database](./database) - Query efficiently
- [Build](./build) - Production optimization
