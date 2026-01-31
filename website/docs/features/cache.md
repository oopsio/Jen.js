# Caching

Jen.js provides built-in caching capabilities for improving performance.

## HTTP Caching

Control how browsers and CDNs cache responses:

```typescript
export async function loader(ctx) {
  ctx.response.setHeader('Cache-Control', 'public, max-age=3600');
  return { data: await fetchData() };
}
```

### Cache-Control Directives

- `public` — Can be cached by any cache
- `private` — Only browser cache, not CDN
- `max-age=3600` — Cache for 3600 seconds
- `no-cache` — Must revalidate before serving
- `no-store` — Never cache
- `stale-while-revalidate=86400` — Serve stale while updating

## Page-Level Caching

Cache entire page responses:

```typescript
export async function loader(ctx) {
  const cached = await getFromCache(`page-${ctx.params.id}`);
  
  if (cached) {
    return cached;
  }
  
  const data = await expensiveOperation();
  await setInCache(`page-${ctx.params.id}`, data, 3600);
  return data;
}
```

## Database Query Caching

Cache frequently accessed data:

```typescript
async function getCachedUser(userId) {
  const key = `user-${userId}`;
  
  // Try cache first
  let user = await cache.get(key);
  
  if (!user) {
    // Not cached, fetch from DB
    user = await db.findOne('users', { id: userId });
    // Cache for 1 hour
    await cache.set(key, user, 3600);
  }
  
  return user;
}
```

## Redis Caching

For high-performance caching:

```typescript
import { createClient } from 'redis';

const redis = createClient({ url: process.env.REDIS_URL });

async function cacheData(key, data, ttl = 3600) {
  await redis.setEx(key, ttl, JSON.stringify(data));
}

async function getCachedData(key) {
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
}
```

## Cache Invalidation

Clear cache when data changes:

```typescript
// site/api/(users).ts
export async function handle(req, res) {
  if (req.method === 'POST') {
    const user = await createUser(...);
    
    // Invalidate user list cache
    await cache.delete('users-list');
    
    res.writeHead(200);
    res.end(JSON.stringify({ user }));
  }
}
```

## Best Practices

1. Cache read-heavy data
2. Set appropriate TTL
3. Invalidate on updates
4. Monitor cache hit rates
5. Use Redis for distributed caching
