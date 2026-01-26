---
sidebar_position: 5
---

# SSG vs SSR

Jen.js supports two rendering modes: Static Site Generation (SSG) and Server-Side Rendering (SSR). Choose based on your needs.

## SSG (Static Site Generation)

SSG builds your entire site to static `.html` files at build time. Perfect for blogs, documentation, and content-heavy sites.

### Advantages

✅ **Fast** - Pre-built HTML files serve instantly  
✅ **Scalable** - No server needed, host anywhere (CDN, S3, Netlify)  
✅ **SEO-friendly** - All content is indexable  
✅ **Secure** - No dynamic backend required  
✅ **Cheap** - Static file hosting is free/cheap  

### Disadvantages

❌ **Build time** - Must rebuild for content changes  
❌ **Dynamic data** - Can't generate infinite routes  
❌ **Real-time** - Can't show live updates  

### Build with SSG

Set in `jen.config.ts`:

```typescript
const config: FrameworkConfig = {
  rendering: {
    defaultMode: 'ssg',
    defaultRevalidateSeconds: 3600  // Revalidate hourly
  }
};
```

Build your site:

```bash
npm run build
```

Output in `dist/`:

```
dist/
├── index.html          # /
├── about/
│   └── index.html      # /about
├── posts/
│   ├── 1/
│   │   └── index.html  # /posts/1
│   ├── 2/
│   │   └── index.html  # /posts/2
│   └── ...
└── ...
```

Deploy to any static host:

```bash
# Netlify
netlify deploy --prod --dir dist

# Vercel
vercel deploy --prod dist

# GitHub Pages
git add dist/
git commit -m "Deploy"
git push
```

### Dynamic Routes with SSG

For dynamic routes like `/posts/:id`, you must tell SSG which IDs to build.

Export a `getStaticPaths` function:

```typescript
// site/posts/($id).tsx

export async function getStaticPaths() {
  const postIds = ['1', '2', '3', '4', '5'];
  
  return {
    paths: postIds.map(id => ({ params: { id } })),
    revalidate: 3600  // Revalidate every hour
  };
}

export async function loader(ctx: LoaderContext) {
  const { id } = ctx.params;
  
  return {
    id,
    title: `Post ${id}`,
    content: 'Content here...'
  };
}

export default function Post({ data }: any) {
  return <h1>{data.title}</h1>;
}
```

Run `npm run build` to generate all paths.

## SSR (Server-Side Rendering)

SSR renders routes on-demand when requested. Perfect for dynamic, real-time, and personalized content.

### Advantages

✅ **Dynamic** - Handle infinite routes  
✅ **Real-time** - Show live data  
✅ **Personalized** - Different content per user  
✅ **Interactive** - Respond to user input  
✅ **No rebuild** - Changes are instant  

### Disadvantages

❌ **Slow** - Render on every request  
❌ **Server cost** - Need a running server  
❌ **Scalability** - More complex infrastructure  
❌ **SEO** - Need proper caching for crawlers  

### Run with SSR

Set in `jen.config.ts`:

```typescript
const config: FrameworkConfig = {
  rendering: {
    defaultMode: 'ssr',
    defaultRevalidateSeconds: 60  // Cache for 60 seconds
  }
};
```

Start the server:

```bash
# Development
npm run dev          # Runs on http://localhost:3000

# Production
npm run build
npm run start        # Runs in production mode
```

### Dynamic Routes with SSR

No configuration needed! All dynamic routes work automatically:

```typescript
// site/posts/($id).tsx

export async function loader(ctx: LoaderContext) {
  const { id } = ctx.params;
  
  // Fetch from database
  const post = await fetchPost(id);
  
  return post;
}

export default function Post({ data }: any) {
  return <h1>{data.title}</h1>;
}
```

Visit `/posts/any-id` - the server handles it.

## Hybrid Approach

Use both modes simultaneously! Set per-route rendering:

### Route-Specific Configuration

Export a `renderConfig` from your route:

```typescript
// site/blog/($slug).tsx

export const renderConfig = {
  mode: 'ssg',  // or 'ssr'
  revalidate: 3600
};

export async function loader(ctx: LoaderContext) {
  return { /* ... */ };
}

export default function BlogPost({ data }: any) {
  return <h1>{data.title}</h1>;
}
```

### Static + Dynamic

- **Static pages** (home, about, pricing) → SSG
- **Blog posts** → SSG with ISR (incremental static regeneration)
- **User profiles** → SSR
- **Admin dashboard** → SSR

Set in `jen.config.ts`:

```typescript
const config: FrameworkConfig = {
  rendering: {
    defaultMode: 'ssr',  // Default to SSR
    routes: {
      '/': { mode: 'ssg' },
      '/about': { mode: 'ssg' },
      '/pricing': { mode: 'ssg' },
      '/blog/*': { mode: 'ssg', revalidate: 3600 },
      '/user/*': { mode: 'ssr' },
      '/dashboard/*': { mode: 'ssr' }
    }
  }
};
```

## ISR (Incremental Static Regeneration)

Revalidate specific routes without rebuilding the entire site.

### Cache Duration

Set `revalidate` in seconds:

```typescript
export const renderConfig = {
  mode: 'ssg',
  revalidate: 60  // Regenerate every 60 seconds
};
```

### On-Demand Revalidation

Trigger rebuilds manually:

```typescript
// site/api/(revalidate).ts

export async function handle(req: IncomingMessage, res: ServerResponse) {
  const { path } = req.query;
  
  // Revalidate route
  await revalidatePath(path);
  
  res.writeHead(200);
  res.end('Revalidated');
}
```

Call `POST /api/revalidate?path=/posts/123` to rebuild that page.

## Performance Comparison

| Factor | SSG | SSR |
|--------|-----|-----|
| **Page Load** | ~50ms | ~200-500ms |
| **Build Time** | Minutes | Seconds |
| **Dynamic Routes** | Limited | Unlimited |
| **Real-time Data** | No | Yes |
| **Hosting** | Cheap | Expensive |
| **SEO** | Perfect | Good |

## Caching

Both modes support caching:

### SSG Caching

```typescript
const config: FrameworkConfig = {
  rendering: {
    defaultMode: 'ssg',
    defaultRevalidate: 3600
  }
};
```

Set cache headers:

```typescript
export function Head() {
  return (
    <meta httpEquiv="cache-control" content="public, max-age=3600" />
  );
}
```

### SSR Caching

Cache frequently accessed routes:

```typescript
export const renderConfig = {
  mode: 'ssr',
  cache: {
    ttl: 300,  // Cache for 5 minutes
    tags: ['posts', 'public']
  }
};
```

## Best Practices

1. **Use SSG for static content** - Home, docs, about
2. **Use SSR for dynamic content** - Dashboards, user profiles
3. **Cache aggressively** - Set proper TTLs
4. **Monitor build time** - SSG builds can get slow with many routes
5. **Test both modes** - Some bugs only appear in certain modes

## Choosing Your Mode

### Use SSG if:
- Your site has mostly static content
- Content updates are infrequent
- You want maximum performance
- You're on a tight budget

### Use SSR if:
- Content changes frequently
- You need personalization
- You have dynamic routes
- You need real-time data

### Use Hybrid if:
- You have both static and dynamic content
- You want best of both worlds

## Next Steps

- [Components & Data](./components) - Build interactive pages
- [Database](./database) - Connect to your database
- [Deployment](./deployment) - Deploy your site
