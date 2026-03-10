# Data Fetching Module

Comprehensive data fetching infrastructure for Jen.js with support for REST APIs, GraphQL, caching, and both server-side and client-side fetching.

## Features

- **REST/HTTP Client**: Full HTTP method support (GET, POST, PUT, DELETE, PATCH) with automatic retry and timeout handling
- **GraphQL Client**: Query and mutation execution with proper error handling and operation caching
- **Multi-Strategy Caching**: `cache-first`, `network-first`, `stale-while-revalidate`, `no-cache`
- **Pluggable Cache Backends**: Memory, Redis, or custom implementations
- **Request/Response Interceptors**: Transform requests and responses globally
- **Server-Side Fetching**: Optimized for SSR and static generation with loader context
- **Client-Side Fetching**: Browser-safe utilities with hooks and deduplication
- **Tag-Based Invalidation**: Invalidate multiple cache entries by tags
- **Type-Safe Configuration**: Full TypeScript support throughout

## Quick Start

### REST API Fetching

```typescript
import {
  getServerDataFetcher,
  MemoryDataCache,
  initializeServerFetch,
} from "jenjs";

// Initialize during app startup
initializeServerFetch({
  cache: new MemoryDataCache(),
  interceptors: [],
  config: { timeout: 30000 },
});

// Use in loaders
export async function loader(ctx) {
  const fetcher = getServerDataFetcher(ctx);

  const result = await fetcher.rest.get("/api/posts");
  if (!result.ok) {
    throw new Error(result.error.message);
  }

  return { posts: result.data };
}
```

### GraphQL Queries

```typescript
export async function loader(ctx) {
  const fetcher = getServerDataFetcher(ctx);

  const result = await fetcher.graphql.query(`
    query GetPosts {
      posts {
        id
        title
        author
      }
    }
  `);

  if (!result.ok) {
    throw new Error(result.error.message);
  }

  return { posts: result.data };
}
```

### Client-Side Fetching

```typescript
import { useData, useMutation } from 'jenjs';

export function PostsList({ posts }) {
  const { refetch } = useData('/api/posts', {
    cache: { strategy: 'cache-first' }
  });

  const { execute: publishPost } = useMutation(`
    mutation PublishPost($id: ID!) {
      publishPost(id: $id) {
        id
        published
      }
    }
  `);

  return (
    <div>
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <button onClick={() => publishPost({ id: post.id })}>
            Publish
          </button>
        </article>
      ))}
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

## Architecture

### Module Structure

```
src/data-fetching/
├── types.ts          # Type definitions
├── cache.ts          # Cache implementations and strategies
├── rest.ts           # REST/HTTP client
├── graphql.ts        # GraphQL client
├── server.ts         # Server-side utilities
├── client.ts         # Client-side utilities and hooks
├── feature-guard.ts  # Feature gating
├── index.ts          # Barrel exports
└── README.md         # This file
```

### Data Flow

#### Server-Side Rendering

```
Route Loader
  └─> ServerDataFetcher
      ├─> Cache (check for data)
      ├─> Request Interceptors
      ├─> REST/GraphQL Client
      └─> Response Interceptors
          └─> Cache (store data)
```

#### Client-Side

```
Component (useData/useMutation)
  └─> ClientDataFetcher
      ├─> Cache (check for data)
      ├─> Request Deduplication
      ├─> Interceptors
      ├─> REST/GraphQL Client
      └─> Component Update
```

## Cache Strategies

### `cache-first`

Returns cached data if available, otherwise fetches fresh data. Suitable for:

- Static or rarely-changing data
- Offline support
- Reducing API calls

```typescript
const result = await fetcher.rest.get("/api/posts", {
  cache: {
    strategy: "cache-first",
    ttl: 300000, // 5 minutes
  },
});
```

### `network-first`

Always tries to fetch fresh data, falls back to cache on error. Suitable for:

- Real-time data
- User-generated content
- Data that changes frequently

```typescript
const result = await fetcher.rest.get("/api/user", {
  cache: {
    strategy: "network-first",
    ttl: 60000, // 1 minute
  },
});
```

### `stale-while-revalidate`

Returns cached data immediately, updates cache in background. Suitable for:

- Optimal perceived performance
- Data that's acceptable when slightly stale
- Reducing server load

```typescript
const result = await fetcher.rest.get("/api/posts", {
  cache: {
    strategy: "stale-while-revalidate",
    ttl: 300000,
  },
});
```

### `no-cache`

Always fetches fresh data, no caching. Suitable for:

- Authentication endpoints
- Sensitive data
- Operations with side effects

```typescript
const result = await fetcher.rest.post("/api/login", body, {
  cache: false,
});
```

## Interceptors

Interceptors allow global request/response transformation:

```typescript
const fetcher = getServerDataFetcher(ctx);

// Add authentication
fetcher.rest.addInterceptor({
  beforeRequest: (req) => {
    req.headers.Authorization = `Bearer ${token}`;
    return req;
  },
});

// Add error logging
fetcher.rest.addInterceptor({
  onError: (err) => {
    console.error(`API Error: ${err.error.message}`);
    return err;
  },
});

// Transform response
fetcher.rest.addInterceptor({
  afterResponse: (res) => {
    if (res.ok && Array.isArray(res.data)) {
      res.data = res.data.map(normalizeItem);
    }
    return res;
  },
});
```

## Cache Invalidation

Invalidate cache entries by tags:

```typescript
// Fetch with tags
await fetcher.rest.get("/api/posts", {
  cache: {
    tags: ["posts", "homepage"],
  },
});

// Invalidate all posts-related data after mutation
await fetcher.rest
  .post("/api/posts", newPost, {
    cache: { strategy: "no-cache" },
  })
  .then(() => {
    return fetcher.rest.cache.invalidate(["posts"]);
  });
```

## GraphQL Features

### Queries (Cached by default)

```typescript
const result = await fetcher.graphql.query(
  `
  query GetPost($id: ID!) {
    post(id: $id) {
      id
      title
      content
      author {
        name
      }
    }
  }
`,
  {
    variables: { id: "123" },
    cache: { ttl: 600000 }, // 10 minutes
  },
);
```

### Mutations (No cache by default)

```typescript
const result = await fetcher.graphql.mutation(
  `
  mutation CreatePost($title: String!, $content: String!) {
    createPost(title: $title, content: $content) {
      id
      title
    }
  }
`,
  {
    variables: { title: "New Post", content: "..." },
  },
);
```

### Batch Queries

```typescript
const result = await fetcher.graphql.batch({
  posts: "query { posts { id title } }",
  users: "query { users { id name } }",
  comments: "query { comments { id text } }",
});

if (result.ok) {
  console.log(result.data.posts);
  console.log(result.data.users);
  console.log(result.data.comments);
}
```

### Operation Invalidation

```typescript
// Invalidate all cached results for specific operations
await fetcher.graphql.invalidate(["GetPost", "GetPosts"]);
```

## Data Loaders

Convenience helpers for common loader patterns:

### Simple Loader

```typescript
import { createDataLoader } from "jenjs";

const loader = createDataLoader(async (fetcher) => {
  const result = await fetcher.rest.get("/api/posts");
  if (!result.ok) throw new Error(result.error.message);
  return result.data;
});

export { loader };
```

### Parallel Loaders

```typescript
import { createParallelDataLoader } from 'jenjs';

export const loader = createParallelDataLoader({
  posts: createDataLoader(async (f) => {
    const res = await f.rest.get('/api/posts');
    return res.ok ? res.data : [];
  }),
  users: createDataLoader(async (f) => {
    const res = await f.rest.get('/api/users');
    return res.ok ? res.data : [];
  }),
});

// In route component
export default function Page({ posts, users }) {
  return <div>{posts.length} posts, {users.length} users</div>;
}
```

### Conditional Loaders

```typescript
import { createConditionalDataLoader } from "jenjs";

const loader = createConditionalDataLoader(
  (ctx) => ctx.params.id === "me",
  createDataLoader(async (f) => {
    const res = await f.rest.get("/api/user/me");
    return res.ok ? res.data : null;
  }),
  { id: "guest", name: "Guest User" }, // fallback
);
```

### Resilient Loaders

```typescript
import { createResilientDataLoader } from "jenjs";

const loader = createResilientDataLoader(
  createDataLoader(async (f) => {
    const res = await f.rest.get("/api/analytics");
    return res.ok ? res.data : null;
  }),
  { views: 0, clicks: 0 }, // fallback on error
);
```

## Error Handling

```typescript
const result = await fetcher.rest.get("/api/posts");

if (!result.ok) {
  console.error("Status:", result.error.status);
  console.error("Message:", result.error.message);
  console.error("Code:", result.error.code);
  console.error("Details:", result.error.details);

  // Handle different error types
  if (result.error.status === 404) {
    // Not found
  } else if (result.error.status === 401) {
    // Unauthorized
  } else if (result.error.code === "TIMEOUT") {
    // Timeout error
  }
}
```

## TypeScript Support

Full type-safe API:

```typescript
import type { FetchResult } from "jenjs";

interface Post {
  id: string;
  title: string;
  content: string;
}

const result: FetchResult<Post[]> = await fetcher.rest.get("/api/posts");

if (result.ok) {
  // result.data is typed as Post[]
  result.data.forEach((post) => {
    console.log(post.title);
  });
}
```

## Configuration

### Feature Gating

Enable data-fetching in `jen.config.ts`:

```typescript
export default {
  features: {
    api: true,
    cache: true,
    dataFetching: true, // Enable this module
  },
  // ... rest of config
};
```

### Cache Configuration

```typescript
import { MemoryDataCache } from "jenjs";

initializeServerFetch({
  cache: new MemoryDataCache(),
  config: {
    timeout: 30000,
    baseUrl: "https://api.example.com",
    cache: {
      strategy: "cache-first",
      ttl: 300000,
    },
  },
});
```

## Best Practices

1. **Use appropriate cache strategies**
   - `cache-first` for static/infrequently-changing data
   - `network-first` for real-time data
   - `stale-while-revalidate` for better UX
   - `no-cache` for mutations and sensitive operations

2. **Tag your cache entries**

   ```typescript
   cache: {
     tags: ["posts", "user-content"];
   }
   ```

3. **Invalidate cache after mutations**

   ```typescript
   await fetcher.rest.post("/api/posts", newPost);
   await fetcher.rest.cache.invalidate(["posts"]);
   ```

4. **Use parallel data loaders for independent data**

   ```typescript
   export const loader = createParallelDataLoader({...});
   ```

5. **Handle errors gracefully with resilient loaders**

   ```typescript
   const loader = createResilientDataLoader(fetch, fallbackValue);
   ```

6. **Use interceptors for common patterns**

   ```typescript
   fetcher.withAuthToken(token);
   fetcher.withHeaders({ "X-Custom": "value" });
   fetcher.withLogging();
   ```

7. **Deduplicate requests on the client**
   - ClientDataFetcher automatically deduplicates in-flight requests

8. **Use GraphQL mutations separately from queries**
   - Mutations always use `no-cache` strategy by default
   - This prevents stale data from mutations

## Performance Considerations

- **Memory Cache**: Suitable for single-process deployments, ~10MB per 1000 cached entries
- **Request Deduplication**: Automatic on client, prevents thundering herd
- **Background Revalidation**: `stale-while-revalidate` doesn't block on revalidation
- **Cache Expiration**: Set appropriate TTLs to balance freshness vs. load

## Advanced Usage

### Custom Cache Backend

```typescript
import type { CacheBackend } from "jenjs";

class RedisCache implements CacheBackend {
  async get<T>(key: string): Promise<T | null> {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async set<T>(key: string, value: T, ttl: number): Promise<void> {
    await redis.set(key, JSON.stringify(value), "EX", ttl / 1000);
  }

  async delete(key: string): Promise<void> {
    await redis.del(key);
  }

  async clear(): Promise<void> {
    await redis.flushdb();
  }

  async invalidate(tags: string[]): Promise<void> {
    // Tag-based invalidation implementation
  }
}

initializeServerFetch({
  cache: new RedisCache(),
  // ...
});
```

### Custom Interceptor

```typescript
fetcher.rest.addInterceptor({
  beforeRequest: async (req) => {
    // Add tracing ID
    req.headers["x-trace-id"] = generateTraceId();
    return req;
  },

  afterResponse: async (res) => {
    // Log response times
    console.log(
      `Response received in ${res.meta?.headers["x-response-time"]}ms`,
    );
    return res;
  },

  onError: async (err) => {
    // Report to error tracking service
    await errorTracker.report(err.error);
    return err;
  },
});
```

## Related Features

- **API Routes**: Use with `features.api` for server-side endpoints
- **Cache**: Use with `features.cache` for advanced caching
- **Middleware**: Integrate with request middleware for auth/logging
- **GraphQL**: Full support for `features.graphql`

## Migration Guide

For existing projects using manual fetch calls:

### Before

```typescript
const response = await fetch("/api/posts");
const data = await response.json();
```

### After

```typescript
const fetcher = getServerDataFetcher(ctx);
const result = await fetcher.rest.get("/api/posts");
if (result.ok) {
  const data = result.data;
}
```

Benefits:

- Automatic caching and cache invalidation
- Error handling
- Request retries
- Timeout protection
- Type safety
