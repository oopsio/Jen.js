# Static & Dynamic Rendering

Jen.js supports both Static Site Generation (SSG) and Server-Side Rendering (SSR). Choose the best approach for each route.

## Static Site Generation (SSG)

Pre-build all pages into static HTML at build time.

### When to Use SSG

- Blog posts and articles
- Documentation sites
- Marketing pages
- Any content that doesn't change per request

### How SSG Works

```bash
npm run build
```

1. Jen.js scans all routes in `site/`
2. Runs each loader function
3. Renders each page to HTML
4. Outputs static files to `dist/`
5. Deploy `dist/` to CDN

### Example

`site/(about).tsx`

```typescript
export async function loader() {
  // This runs at build time
  return {
    title: 'About Us',
    content: 'Our company...'
  };
}

export default function About({ data }: any) {
  return (
    <html>
      <head><title>{data.title}</title></head>
      <body>{data.content}</body>
    </html>
  );
}
```

### Dynamic Routes with SSG

For routes with dynamic parameters, precompute paths:

`site/posts/($slug).tsx`

```typescript
import type { LoaderContext } from '@src/core/routes';

// Tell SSG what paths to generate
export async function staticPaths() {
  const posts = await getAllPosts();
  return posts.map(post => ({ slug: post.slug }));
}

export async function loader(ctx: LoaderContext) {
  const post = await getPost(ctx.params.slug);
  return { post };
}

export default function Post({ data }: any) {
  return <article>{data.post.content}</article>;
}
```

Generates:
- `/posts/hello-world`
- `/posts/getting-started`
- etc.

### SSG Configuration

In `jen.config.ts`:

```typescript
const config: FrameworkConfig = {
  rendering: {
    defaultMode: 'ssg',
    defaultRevalidateSeconds: 3600  // Revalidate hourly
  }
};
```

Or per-route:

```typescript
// site/(about).tsx
export const mode = 'ssg';
export const revalidate = 86400;  // 1 day

export default function About() {
  // ...
}
```

### Incremental Static Regeneration

Rebuild specific pages without full rebuild:

```bash
npm run build -- --incremental site/(about).tsx
```

## Server-Side Rendering (SSR)

Render pages on each request. Dynamic, always fresh content.

### When to Use SSR

- User-specific content
- Real-time data
- Personalized pages
- Any content that changes frequently

### How SSR Works

```bash
npm run dev      # Start dev server
npm run start    # Start production server
```

1. Request comes in
2. Jen.js loads the route file
3. Runs loader function
4. Renders component to HTML
5. Sends to browser

### Example

`site/dashboard/($userId).tsx`

```typescript
import type { LoaderContext } from '@src/core/routes';

export async function loader(ctx: LoaderContext) {
  // This runs on EVERY request
  const user = await getUser(ctx.params.userId);
  const stats = await getUserStats(user.id);
  return { user, stats };
}

export default function Dashboard({ data }: any) {
  return (
    <html>
      <head><title>{data.user.name}'s Dashboard</title></head>
      <body>
        <h1>Welcome, {data.user.name}</h1>
        <p>Posts: {data.stats.postCount}</p>
      </body>
    </html>
  );
}
```

### SSR Configuration

In `jen.config.ts`:

```typescript
const config: FrameworkConfig = {
  rendering: {
    defaultMode: 'ssr'
  },
  server: {
    port: 3000,
    timeout: 30000  // 30 second timeout
  }
};
```

Or per-route:

```typescript
// site/(home).tsx
export const mode = 'ssr';

export default function Home() {
  // ...
}
```

## Hybrid Approach

Use both SSG and SSR in the same application.

### Configuration

```typescript
const config: FrameworkConfig = {
  rendering: {
    defaultMode: 'ssg'  // Most routes are static
  }
};
```

Then override for specific routes:

```typescript
// site/(about).tsx - Static
export const mode = 'ssg';
export default function About() { /* */ }

// site/dashboard/($id).tsx - Dynamic
export const mode = 'ssr';
export default function Dashboard() { /* */ }
```

### Smart Build

During build, Jen.js:
1. Generates all SSG routes
2. Skips SSR routes (handled at runtime)
3. Outputs mixed static + dynamic setup

Perfect for:
- Static home page
- Dynamic user dashboards
- Static blog posts
- Dynamic user profiles

## Client-Side Hydration

Pages can be interactive with Preact:

```typescript
import { useState } from 'preact/hooks';

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <html>
      <head><title>Counter</title></head>
      <body>
        <h1>Count: {count}</h1>
        <button onClick={() => setCount(count + 1)}>
          Increment
        </button>
      </body>
    </html>
  );
}
```

### Hydration in SSG

For SSG pages with interactivity:

1. Page generates as static HTML
2. JavaScript bundle included in build
3. Browser loads HTML + JavaScript
4. Preact hydrates (takes over)
5. Now fully interactive

### Hydration in SSR

For SSR pages:

1. Server renders HTML with current state
2. JavaScript bundle sent to browser
3. Preact hydrates with same state
4. Interactivity works immediately

## Cache Control

### HTTP Caching

Control browser/CDN caching:

```typescript
export async function loader(ctx: LoaderContext) {
  ctx.response.setHeader('Cache-Control', 'public, max-age=3600');
  // ...
}
```

### Revalidation

For SSG with Incremental Static Regeneration:

```typescript
export const revalidate = 300;  // Revalidate every 5 minutes

export async function loader() {
  return { data: await fetchData() };
}
```

Pages are served from cache, revalidated in background.

## Performance Tips

### For SSG

- Pre-render all static pages
- Serve from CDN
- Cache indefinitely (use versioning for updates)
- Rebuild on content changes

### For SSR

- Implement page-level caching
- Use middleware for compression
- Monitor response times
- Cache database queries

### For Hybrid

- Use SSG for high-traffic static content
- Use SSR for low-traffic dynamic content
- Cache API responses
- Pre-render above-the-fold content

## Monitoring

### Build Time

Check build performance:

```bash
npm run build -- --verbose
```

### Runtime

Monitor SSR performance:

```typescript
export async function loader(ctx: LoaderContext) {
  const start = Date.now();
  const data = await fetchData();
  console.log(`Loader took ${Date.now() - start}ms`);
  return { data };
}
```

## Best Practices

1. **Default to SSG** — Most content should be static
2. **Use SSR only when needed** — For truly dynamic content
3. **Cache aggressively** — Both browser and server-side
4. **Precompute static paths** — Use staticPaths() for dynamic routes
5. **Monitor performance** — Measure build and request times
6. **Use revalidation** — Keep content fresh without full rebuilds
