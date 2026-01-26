---
sidebar_position: 7
---

# Data Loading

Deep dive into loading and managing data in Jen.js routes.

## Loader Context

The `loader` function receives a `LoaderContext` object with all request information:

```typescript
interface LoaderContext {
  params: Record<string, string>;              // Dynamic route parameters
  query: Record<string, string | string[]>;   // Query string values
  req?: IncomingMessage;                      // HTTP request (SSR only)
  res?: ServerResponse;                       // HTTP response (SSR only)
}
```

## Using Params

Dynamic route parameters are available in `ctx.params`:

```typescript
// site/posts/($id)/($version).tsx

export async function loader(ctx: LoaderContext) {
  const { id, version } = ctx.params;
  
  console.log(`Loading post ${id}, version ${version}`);
  
  const post = await db.query('posts', { id, version });
  return post;
}
```

Visiting `/posts/123/2` provides `params: { id: '123', version: '2' }`.

## Using Query Parameters

Access URL query strings via `ctx.query`:

```typescript
// site/(search).tsx

export async function loader(ctx: LoaderContext) {
  const { q, page = '1', limit = '10' } = ctx.query;
  
  const offset = (parseInt(page) - 1) * parseInt(limit);
  
  const results = await db.query('posts', {
    search: q,
    offset,
    limit: parseInt(limit)
  });
  
  return { results, page, limit };
}
```

Visit `/search?q=typescript&page=2&limit=20` to search.

## Database Integration

### Initialize DB

```typescript
import { DB } from '@src/db';

export async function loader(ctx: LoaderContext) {
  const db = new DB({
    driver: 'sqlite',
    connectionString: 'data/app.db'
  });
  
  await db.connect();
  
  const users = await db.query('users', {});
  
  await db.disconnect();
  
  return { users };
}
```

### Query Patterns

#### Single Record

```typescript
const post = await db.query('posts', { id: 123 });
```

#### Multiple Records

```typescript
const posts = await db.query('posts', { where: { published: true } });
```

#### With Filtering

```typescript
const posts = await db.query('posts', {
  where: { published: true },
  orderBy: { createdAt: 'desc' },
  limit: 10
});
```

#### With Relationships

```typescript
const posts = await db.query('posts', {
  include: { author: true, comments: true }
});
```

## Caching

Cache loader results to improve performance:

### Set Cache in Loader

```typescript
export const renderConfig = {
  cache: {
    ttl: 3600,    // Cache for 1 hour
    tags: ['posts']
  }
};

export async function loader(ctx: LoaderContext) {
  return await fetchExpensiveData();
}
```

### Revalidate Cache

Invalidate cache on updates:

```typescript
// site/api/(posts).ts

export async function handle(req: IncomingMessage, res: ServerResponse) {
  if (req.method === 'POST') {
    const post = await createPost(req);
    
    // Invalidate posts cache
    await revalidateTag('posts');
    
    res.writeHead(201, { 'content-type': 'application/json' });
    res.end(JSON.stringify(post));
  }
}
```

## Parallel Data Loading

Load multiple data sources in parallel:

```typescript
export async function loader(ctx: LoaderContext) {
  const [posts, users, comments] = await Promise.all([
    db.query('posts', {}),
    db.query('users', {}),
    db.query('comments', {})
  ]);
  
  return { posts, users, comments };
}
```

## Conditional Loading

Load data based on conditions:

```typescript
export async function loader(ctx: LoaderContext) {
  const { id } = ctx.params;
  const userId = ctx.req?.headers['x-user-id'];
  
  const post = await db.query('posts', { id });
  
  // Only load comments if authenticated
  const comments = userId 
    ? await db.query('comments', { postId: id })
    : [];
  
  return { post, comments };
}
```

## Error Handling

### Not Found

Return a 404 status:

```typescript
export async function loader(ctx: LoaderContext) {
  const { id } = ctx.params;
  
  const post = await db.query('posts', { id });
  
  if (!post) {
    return { notFound: true };
  }
  
  return post;
}

export default function Post({ data }: any) {
  if (data.notFound) {
    return <h1>404 - Post not found</h1>;
  }
  
  return <h1>{data.title}</h1>;
}
```

### Error Response

Handle errors gracefully:

```typescript
export async function loader(ctx: LoaderContext) {
  try {
    const data = await fetchData();
    return data;
  } catch (error) {
    console.error('Failed to load data:', error);
    return { 
      error: 'Failed to load data',
      statusCode: 500 
    };
  }
}

export default function Page({ data }: any) {
  if (data.error) {
    return <h1>Error: {data.error}</h1>;
  }
  
  return <h1>Success</h1>;
}
```

### Validation

Validate inputs before processing:

```typescript
export async function loader(ctx: LoaderContext) {
  const { id } = ctx.params;
  
  // Validate ID format
  if (!/^\d+$/.test(id)) {
    return { error: 'Invalid ID format' };
  }
  
  const post = await db.query('posts', { id: parseInt(id) });
  
  return post;
}
```

## Server Context (SSR Only)

In SSR mode, access HTTP request and response objects:

```typescript
export async function loader(ctx: LoaderContext) {
  // HTTP request headers
  const authHeader = ctx.req?.headers['authorization'];
  const userAgent = ctx.req?.headers['user-agent'];
  
  // Validate authentication
  if (!authHeader) {
    ctx.res?.writeHead(401, { 'content-type': 'application/json' });
    ctx.res?.end(JSON.stringify({ error: 'Unauthorized' }));
    return;
  }
  
  // Load authenticated user data
  const user = await getCurrentUser(authHeader);
  
  return { user };
}
```

## Streaming Data

For large datasets, stream data instead of loading all at once:

```typescript
export async function loader(ctx: LoaderContext) {
  const { limit = 10 } = ctx.query;
  
  // Load initial batch
  const posts = await db.query('posts', { 
    limit: parseInt(limit),
    orderBy: { createdAt: 'desc' }
  });
  
  return { 
    posts,
    hasMore: posts.length === parseInt(limit)
  };
}

export default function PostsList({ data }: any) {
  const [posts, setPosts] = useState(data.posts);
  
  const loadMore = async () => {
    const res = await fetch(`?limit=10&offset=${posts.length}`);
    const newPosts = await res.json();
    setPosts([...posts, ...newPosts]);
  };
  
  return (
    <div>
      {posts.map(p => <div key={p.id}>{p.title}</div>)}
      {data.hasMore && <button onClick={loadMore}>Load More</button>}
    </div>
  );
}
```

## Caching Strategies

### Cache-Control Headers

```typescript
export function Head() {
  return (
    <meta 
      httpEquiv="cache-control" 
      content="public, max-age=3600, must-revalidate" 
    />
  );
}
```

### ETag / Last-Modified

```typescript
export async function loader(ctx: LoaderContext) {
  const data = await fetchData();
  const etag = generateETag(data);
  
  if (ctx.req?.headers['if-none-match'] === etag) {
    ctx.res?.writeHead(304);
    ctx.res?.end();
    return;
  }
  
  ctx.res?.setHeader('etag', etag);
  
  return data;
}
```

## Best Practices

1. **Load only needed data** - Don't fetch extra fields
2. **Use pagination** - Limit database queries
3. **Cache aggressively** - Set appropriate TTLs
4. **Validate inputs** - Check params and query before use
5. **Handle errors** - Provide fallbacks for missing data
6. **Optimize queries** - Use indexes and relationships
7. **Log failures** - Track data loading issues
8. **Test loaders** - Mock database and external APIs

## Performance Tips

1. **Use database indexes** for frequently queried fields
2. **Select only needed columns**:

```typescript
const posts = await db.query('posts', {
  select: ['id', 'title', 'slug', 'excerpt']
});
```

3. **Batch queries** when possible:

```typescript
const data = await Promise.all([
  db.query('posts', {}),
  db.query('users', {}),
  db.query('categories', {})
]);
```

4. **Cache external API calls**:

```typescript
const cache = new Map();

export async function loader(ctx: LoaderContext) {
  const cacheKey = `external-${ctx.params.id}`;
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  const data = await fetch(`https://api.example.com/${ctx.params.id}`);
  cache.set(cacheKey, data);
  
  return data;
}
```

## Next Steps

- [API Routes](./api) - Build endpoints
- [Database](./database) - Learn more about databases
- [Authentication](./auth) - Protect your data
