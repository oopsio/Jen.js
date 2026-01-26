---
sidebar_position: 4
---

# Routing

Jen.js uses file-based routing with zero configuration. Routes are auto-discovered from your `site/` directory.

## Basic Routing

Routes are defined by creating files with the pattern `(routeName).tsx` or `(routeName).ts`.

### Simple Routes

```
site/
├── (home).tsx       → /
├── (about).tsx      → /about
├── (contact).tsx    → /contact
└── (blog).tsx       → /blog
```

Create `site/(about).tsx`:

```typescript
export default function About() {
  return (
    <div>
      <h1>About Us</h1>
      <p>Learn more about our company.</p>
    </div>
  );
}
```

Visit `/about` in your browser.

## Nested Routes

Use directories for nested routes:

```
site/
├── (home).tsx          → /
├── posts/
│   ├── (index).tsx     → /posts
│   └── (popular).tsx   → /posts/popular
└── docs/
    ├── (index).tsx     → /docs
    └── (getting-started).tsx → /docs/getting-started
```

Create `site/posts/(index).tsx`:

```typescript
export default function Posts() {
  return <h1>All Posts</h1>;
}
```

Visit `/posts`.

## Dynamic Routes

Use `$` prefix for dynamic parameters:

```
site/
├── posts/
│   └── ($id).tsx     → /posts/:id
├── users/
│   └── ($username).tsx → /users/:username
└── docs/
    └── (...slug).tsx  → /docs/* (catch-all)
```

### Single Parameter

Create `site/posts/($id).tsx`:

```typescript
import type { LoaderContext } from '@src/core/types';

interface RouteData {
  id: string;
}

export async function loader(ctx: LoaderContext) {
  const { id } = ctx.params;
  
  // Fetch post by ID
  return {
    id,
    title: `Post ${id}`,
    content: 'Post content here...'
  };
}

export default function Post({ data }: { data: RouteData }) {
  return (
    <article>
      <h1>{data.title}</h1>
      <p>{data.content}</p>
    </article>
  );
}
```

Visit `/posts/123` - the ID is passed to your component.

### Multiple Parameters

```
site/
└── users/
    └── ($username)/
        └── ($postId).tsx   → /users/:username/:postId
```

Create `site/users/($username)/($postId).tsx`:

```typescript
export default function UserPost({ data }: any) {
  const { username, postId } = data.params;
  
  return (
    <div>
      <h1>{username}'s Post {postId}</h1>
    </div>
  );
}
```

### Catch-All Routes

Use `(...rest)` to match any path:

```
site/
└── docs/
    └── (...slug).tsx   → /docs/* (and /docs/a/b/c/...)
```

Create `site/docs/(...slug).tsx`:

```typescript
export default function Docs({ data }: any) {
  const { slug } = data.params;
  
  return <h1>Documentation: {slug.join('/')}</h1>;
}
```

Visit `/docs/getting-started/installation` - `slug` will be `['getting-started', 'installation']`.

## Route Configuration

### File Extensions

Jen.js recognizes these extensions:
- `.tsx` - React/Preact component (page route)
- `.ts` - TypeScript (API route)
- `.jsx` - JavaScript component
- `.js` - JavaScript (API route)

### Export Properties

#### Default Export (Required for Pages)

Your route component:

```typescript
export default function Page({ data }: any) {
  return <h1>Hello</h1>;
}
```

#### `loader` Function (Optional)

Load data before rendering:

```typescript
export async function loader(ctx: LoaderContext) {
  return {
    title: 'Page Title',
    items: []
  };
}
```

The returned object is passed as the `data` prop.

#### `Head` Function (Optional)

Set custom head tags:

```typescript
export function Head({ data }: any) {
  return (
    <>
      <title>{data.title}</title>
      <meta name="description" content={data.description} />
    </>
  );
}
```

## API Routes

API routes are `.ts` files that export an async `handle` function:

```
site/api/
├── (users).ts       → /api/users
└── auth/
    └── (login).ts   → /api/auth/login
```

Create `site/api/(users).ts`:

```typescript
import type { IncomingMessage, ServerResponse } from 'node:http';

export async function handle(req: IncomingMessage, res: ServerResponse) {
  if (req.method === 'GET') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ users: [{ id: 1, name: 'Alice' }] }));
  }
}
```

Make a request: `GET /api/users` returns JSON.

### Dynamic API Routes

```
site/api/
└── users/
    └── ($id).ts    → /api/users/:id
```

Create `site/api/users/($id).ts`:

```typescript
export async function handle(req: IncomingMessage, res: ServerResponse) {
  const { id } = req.params as { id: string };
  
  res.writeHead(200, { 'content-type': 'application/json' });
  res.end(JSON.stringify({ id, name: `User ${id}` }));
}
```

## Query Parameters

Access query strings via `ctx.query`:

```typescript
export async function loader(ctx: LoaderContext) {
  const { page = '1', limit = '10' } = ctx.query;
  
  return {
    page: parseInt(page),
    limit: parseInt(limit)
  };
}
```

Visit `/posts?page=2&limit=20`.

## Route Context

The `loader` function receives a `LoaderContext` object:

```typescript
interface LoaderContext {
  params: Record<string, string>;        // Dynamic route params
  query: Record<string, string | string[]>; // Query string
  req?: IncomingMessage;                 // HTTP request (SSR only)
  res?: ServerResponse;                  // HTTP response (SSR only)
}
```

## Rendering Modes

### SSG (Static Site Generation)

Route components are rendered at build time:

```bash
npm run build
```

All routes become static `.html` files in `dist/`.

**Set in `jen.config.ts`:**

```typescript
{
  rendering: {
    defaultMode: 'ssg'
  }
}
```

### SSR (Server-Side Rendering)

Routes are rendered on-demand:

```bash
npm run dev
npm run start
```

**Set in `jen.config.ts`:**

```typescript
{
  rendering: {
    defaultMode: 'ssr'
  }
}
```

## Route Prefetching

Link to other routes with the `<a>` tag:

```typescript
export default function Home() {
  return (
    <div>
      <h1>Home</h1>
      <a href="/about">About Us</a>
      <a href="/posts/1">Read Post</a>
    </div>
  );
}
```

## Best Practices

1. **Use meaningful names** - `(about).tsx` not `(page).tsx`
2. **Keep routes shallow** - Avoid deeply nested directories
3. **Use dynamic routes** for parametrized content
4. **Lazy load data** - Use `loader` to fetch before render
5. **Test routing** - Ensure all routes render correctly

## Common Patterns

### Blog Post List & Detail

```
site/
└── posts/
    ├── (index).tsx      # /posts
    └── ($slug).tsx      # /posts/:slug
```

### Admin Dashboard

```
site/
└── admin/
    ├── (dashboard).tsx  # /admin/dashboard
    ├── users/
    │   ├── (index).tsx  # /admin/users
    │   └── ($id).tsx    # /admin/users/:id
    └── settings/
        └── (index).tsx  # /admin/settings
```

### API with Authentication

```
site/api/
├── (public).ts          # Public endpoint
└── auth/
    ├── (login).ts       # Login endpoint
    └── (logout).ts      # Logout endpoint
```

## Next Steps

- [SSG vs SSR](./ssg-ssr) - Choose your rendering mode
- [Components & Data](./components) - Build interactive routes
- [API Routes](./api) - Create REST endpoints
