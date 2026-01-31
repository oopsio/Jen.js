# Routing

Jen.js uses **file-based routing** — your file structure automatically becomes your routes. No configuration needed.

## Basic Concept

Files in `site/` are converted to routes:

| File | Route | Type |
|------|-------|------|
| `(home).tsx` | `/` | Page |
| `(about).tsx` | `/about` | Page |
| `contact/(form).tsx` | `/contact/form` | Page |
| `api/(users).ts` | `/api/users` | API |

## Route File Naming

Route files follow the pattern: `(name).tsx` or `(name).ts`

**Valid names:**
- `(home).tsx` — alphanumeric, hyphens, underscores
- `(user-profile).tsx` — hyphens are allowed
- `(api_users).ts` — underscores are allowed

**Invalid names:**
- `home.tsx` — missing parentheses
- `(home).test.tsx` — test files ignored
- `home.module.tsx` — module files ignored

## Static Routes

Create a file to create a static route:

`site/(about).tsx`

```typescript
export default function About() {
  return <h1>About Page</h1>;
}
```

Access at `/about`

## Nested Routes

Nested directories create nested routes:

```
site/
├── (home).tsx              → /
├── blog/
│   ├── (index).tsx        → /blog
│   └── (post).tsx         → /blog/post
└── docs/
    ├── (intro).tsx        → /docs/intro
    └── api/
        └── (reference).tsx → /docs/api/reference
```

## Dynamic Routes

Use `$` prefix for dynamic segments:

`site/posts/($id).tsx`

```typescript
import type { LoaderContext } from '@src/core/routes';

export async function loader(ctx: LoaderContext) {
  const postId = ctx.params.id;
  // Fetch post by ID
  const post = await getPost(postId);
  return post;
}

export default function Post({ data }: any) {
  return (
    <article>
      <h1>{data.title}</h1>
      <p>{data.content}</p>
    </article>
  );
}
```

Access with: `/posts/1`, `/posts/hello`, `/posts/any-value`

### Multiple Dynamic Segments

`site/users/($userId)/posts/($postId).tsx`

```typescript
export async function loader(ctx: LoaderContext) {
  const userId = ctx.params.userId;
  const postId = ctx.params.postId;
  // ...
}
```

Access with: `/users/john/posts/42`

## Catch-All Routes

Use `(...name)` for catch-all routes:

`site/docs/(...rest).tsx`

```typescript
export async function loader(ctx: LoaderContext) {
  const pathSegments = ctx.params.rest; // array of segments
  // Handle any path under /docs/*
}
```

Access with:
- `/docs/intro`
- `/docs/api/reference`
- `/docs/api/reference/functions`

## Route Exports

### Default Export (Required)

The default export is your page component:

```typescript
export default function MyPage() {
  return <h1>Hello</h1>;
}
```

### Loader Export (Optional)

Load data before rendering:

```typescript
export async function loader(ctx: LoaderContext) {
  return {
    title: 'My Page',
    items: await fetchItems()
  };
}
```

Data passed to component:

```typescript
export default function MyPage({ data }: { data: any }) {
  return <h1>{data.title}</h1>;
}
```

### Head Export (Optional)

Custom head elements:

```typescript
export function Head({ data }: any) {
  return (
    <>
      <title>{data.title}</title>
      <meta name="description" content={data.description} />
      <meta property="og:title" content={data.title} />
    </>
  );
}
```

## API Routes

API routes handle HTTP requests without rendering HTML:

`site/api/(users).ts`

```typescript
import type { IncomingMessage, ServerResponse } from 'node:http';

export async function handle(req: IncomingMessage, res: ServerResponse) {
  if (req.method === 'GET') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ users: [] }));
  } else if (req.method === 'POST') {
    // Handle POST
  } else {
    res.writeHead(405);
    res.end('Method Not Allowed');
  }
}
```

### Reading Request Body

```typescript
export async function handle(req: IncomingMessage, res: ServerResponse) {
  if (req.method === 'POST') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      const data = JSON.parse(body);
      // Process data
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
    });
  }
}
```

### Query Parameters

```typescript
export async function handle(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url!, `http://${req.headers.host}`);
  const search = url.searchParams.get('search');
  // Use search parameter
}
```

## Route Context

The `LoaderContext` provides:

```typescript
interface LoaderContext {
  params: Record<string, string | string[]>;  // Route parameters
  request: IncomingMessage;                   // HTTP request
  response: ServerResponse;                   // HTTP response
  query: URLSearchParams;                     // Query parameters
}
```

### Example

For route `/users/john/posts/42?tab=comments`:

```typescript
export async function loader(ctx: LoaderContext) {
  console.log(ctx.params);           // { userId: 'john', postId: '42' }
  console.log(ctx.query.get('tab')); // 'comments'
}
```

## Route Ordering

Routes are matched in order of specificity:

1. Static routes (e.g., `/about`)
2. Dynamic routes (e.g., `/posts/:id`)
3. Catch-all routes (e.g., `/docs/*`)

So `/posts/new` matches the static route before `($id)` route.

## Special Routes

### Error Pages

Create `site/(error).tsx` for 404s:

```typescript
export default function NotFound() {
  return <h1>Page Not Found</h1>;
}
```

### Redirects

Use middleware or loader to redirect:

```typescript
export async function loader(ctx: LoaderContext) {
  if (!userAuthenticated) {
    ctx.response.writeHead(302, { location: '/login' });
    ctx.response.end();
    return {};
  }
  // ...
}
```

## Static vs Dynamic Routes

### Static Generation

For routes that don't change:

```typescript
// site/(about).tsx
export default function About() {
  return <h1>About</h1>;
}
```

Build with `npm run build` — creates static HTML.

### Dynamic Routes

For routes that change per request:

```typescript
// site/posts/($id).tsx
export async function loader(ctx: LoaderContext) {
  // This runs on every request (SSR)
  return { post: await getPost(ctx.params.id) };
}
```

Leave running or use SSR mode.

## Best Practices

- Use meaningful names: `(user-profile)` not `(up)`
- Keep routes flat unless nesting is logical
- Use API routes for backend logic
- Export loaders for data dependencies
- Use Head export for SEO meta tags
