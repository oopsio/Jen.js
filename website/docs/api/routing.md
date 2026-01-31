# Routing API

Complete API reference for routing in Jen.js.

## Types

### LoaderContext

Data passed to loader functions:

```typescript
interface LoaderContext {
  params: Record<string, string | string[]>;
  request: IncomingMessage;
  response: ServerResponse;
  query: URLSearchParams;
}
```

### Route

Internal route representation:

```typescript
interface Route {
  path: string;               // /posts/:id
  file: string;              // site/posts/($id).tsx
  component: (props: any) => JSX.Element;
  loader?: (ctx: LoaderContext) => Promise<any>;
  head?: (props: any) => JSX.Element;
  staticPaths?: () => Promise<StaticPath[]>;
  mode?: 'ssr' | 'ssg';
  revalidate?: number;
}
```

## Loader Functions

Export async function to load data:

```typescript
export async function loader(ctx: LoaderContext) {
  return {
    title: 'Page Title',
    data: await fetchData()
  };
}

export default function Page({ data }: any) {
  return <h1>{data.title}</h1>;
}
```

### Access Parameters

```typescript
export async function loader(ctx: LoaderContext) {
  const id = ctx.params.id;           // Route parameter
  const page = ctx.query.get('page');  // Query parameter
  const token = ctx.request.headers.authorization;
  
  return { /* ... */ };
}
```

### Access Request/Response

```typescript
export async function loader(ctx: LoaderContext) {
  const method = ctx.request.method;
  const url = ctx.request.url;
  const headers = ctx.request.headers;
  
  // Set response headers
  ctx.response.setHeader('Cache-Control', 'max-age=3600');
  
  return { /* ... */ };
}
```

## Head Function

Custom head elements per page:

```typescript
export function Head({ data }: any) {
  return (
    <>
      <title>{data.title}</title>
      <meta name="description" content={data.description} />
      <meta property="og:title" content={data.title} />
      <meta property="og:image" content={data.image} />
      <link rel="canonical" href={`https://example.com${data.path}`} />
    </>
  );
}
```

## Static Paths

Precompute paths for dynamic routes (SSG):

```typescript
export async function staticPaths() {
  const posts = await getAllPosts();
  
  return posts.map(post => ({
    slug: post.slug,
    category: post.category
  }));
}

export async function loader(ctx: LoaderContext) {
  const post = await getPost(ctx.params.slug);
  return { post };
}
```

Generates routes for all returned paths.

## Route Matching

### Static Routes

Exact path matching:

```
site/(about).tsx → /about (only)
```

### Dynamic Routes

Parameter matching:

```
site/posts/($id).tsx → /posts/* (any id)
site/users/($userId)/posts/($postId).tsx → /users/*/posts/*
```

Parameters captured as `ctx.params.id`, `ctx.params.userId`, etc.

### Catch-All Routes

Matches remaining segments:

```
site/(...rest).tsx → /* (any path)
site/docs/(...path).tsx → /docs/* (under /docs)
```

Access remaining segments:

```typescript
export async function loader(ctx: LoaderContext) {
  const segments = ctx.params.rest;  // Array of segments
  const path = segments.join('/');
  
  return { path };
}
```

## Query Parameters

Access URL query string:

```typescript
export async function loader(ctx: LoaderContext) {
  const page = ctx.query.get('page');
  const search = ctx.query.get('search');
  const filters = ctx.query.getAll('filter');
  
  return { page, search, filters };
}
```

## Route Configuration

Override defaults per route:

```typescript
// Rendering mode
export const mode = 'ssr' | 'ssg';

// Revalidation time (seconds)
export const revalidate = 3600;

// Route metadata
export const meta = {
  title: 'Page Title',
  description: 'Page description'
};

// Middleware
export const middleware = [authMiddleware];
```

## Error Handling

```typescript
export async function loader(ctx: LoaderContext) {
  try {
    const data = await fetchData();
    return { data };
  } catch (err) {
    // Return error page
    ctx.response.writeHead(500);
    ctx.response.end('Server error');
    return {};
  }
}
```

## Redirects

```typescript
export async function loader(ctx: LoaderContext) {
  if (!isAuthenticated(ctx)) {
    ctx.response.writeHead(302, {
      location: '/login'
    });
    ctx.response.end();
    return {};
  }
  
  return { /* ... */ };
}
```

## Middleware in Routes

Apply middleware to specific routes:

```typescript
import { authMiddleware } from '@src/middleware/auth';

export const middleware = [authMiddleware];

export async function loader(ctx: LoaderContext) {
  // User is authenticated
  const userId = ctx.request.user?.id;
  return { userId };
}
```

## Component Props

```typescript
interface PageProps {
  data?: any;              // From loader
  params?: Record<string, any>;  // Route params
  query?: URLSearchParams;        // Query string
}

export default function Page({ data, params, query }: PageProps) {
  return <h1>{data?.title}</h1>;
}
```

## API Routes

Exports `handle` function instead of default:

```typescript
import type { IncomingMessage, ServerResponse } from 'node:http';

export async function handle(
  req: IncomingMessage,
  res: ServerResponse
) {
  if (req.method === 'GET') {
    res.writeHead(200);
    res.end('GET response');
  }
}
```

### Query Parameters in API Routes

```typescript
export async function handle(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url!, `http://${req.headers.host}`);
  const page = url.searchParams.get('page');
  const limit = url.searchParams.get('limit');
  
  // Use page, limit
}
```

## Route Order

Routes matched by specificity:

1. Exact matches (`/about` before `($slug)`)
2. Specific dynamic routes before catch-alls
3. More nested routes before less nested

## File Extensions

Supported route file extensions:

- `.tsx` — Page component
- `.jsx` — Page component (not recommended)
- `.ts` — API route
- `.js` — API route (not recommended)

## Naming Conventions

Good route names:

- `(home).tsx` — Homepage
- `(blog).tsx` — Blog index
- `($slug).tsx` — Dynamic route
- `(...rest).tsx` — Catch-all
- (...rest) — Avoid dots, use hyphens

Bad route names:

- `home.tsx` — Missing parentheses
- `(home page).tsx` — Space in name
- `(.tsx` — Syntax error
- `home-page.tsx` — Missing parentheses
