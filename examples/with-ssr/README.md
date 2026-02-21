# Jen.js SSR Example

A complete server-side rendering (SSR) example demonstrating Jen.js capabilities for building fast, SEO-friendly web applications with dynamic data loading.

## Overview

This example showcases:

- ✅ **Server-Side Rendering** - Pages rendered on the server before sending to client
- ✅ **Dynamic Data Loading** - `loader` function pattern for server-side data fetching
- ✅ **Multiple Route Types** - Static routes, dynamic routes with parameters, catch-all routes
- ✅ **SEO Optimization** - Custom `Head` component for meta tags and document head
- ✅ **TypeScript Support** - Full type safety throughout
- ✅ **Preact Components** - Fast, lightweight component rendering

## Project Structure

```
with-ssr/
├── site/
│   ├── (home).tsx              # Route: GET /
│   ├── (blog).tsx              # Route: GET /blog
│   ├── (about).tsx             # Route: GET /about
│   ├── posts/
│   │   └── ($id).tsx           # Route: GET /posts/:id (dynamic)
│   └── styles.scss             # Global styles
├── jen.config.ts               # Framework configuration
├── package.json                # Dependencies
└── README.md                   # This file
```

## Quick Start

### Installation

```bash
# From the Jen.js root directory
cd examples/with-ssr
npm install
# or
pnpm install
```

### Development

```bash
npm run dev
# or
pnpm dev
```

Open http://localhost:3000 in your browser.

The dev server includes:

- Hot Module Replacement (HMR) for instant updates
- SCSS compilation on-the-fly
- Full SSR on every request

### Production Build

```bash
npm run build
# or
pnpm build
```

Then start the server:

```bash
npm start
# or
pnpm start
```

## Route Examples

### Static Route: `/` (Home)

**File:** `site/(home).tsx`

```typescript
import type { LoaderContext } from "jenjs";

// 1. Load data on the server
export const loader = async (ctx: LoaderContext) => {
  return {
    title: "Server-Side Rendering with Jen.js",
    features: [...],
    stats: [...],
  };
};

// 2. Customize <head> with SEO tags
export function Head({ data }) {
  return (
    <>
      <title>{data.title}</title>
      <meta name="description" content="..." />
    </>
  );
}

// 3. Render the page (receives data from loader)
export default function HomePage({ data, params, query }) {
  return <div>{data.title}</div>;
}
```

### Dynamic Route: `/posts/:id`

**File:** `site/posts/($id).tsx`

```typescript
export const loader = async (ctx: LoaderContext) => {
  // ctx.params.id contains the route parameter
  const postId = ctx.params.id;

  // Fetch from database based on parameter
  const post = await db.posts.findById(postId);

  if (!post) {
    throw new Error("404: Post not found");
  }

  return { post };
};

export default function PostPage({ data, params }) {
  return (
    <article>
      <h1>{data.post.title}</h1>
      <p>{data.post.content}</p>
    </article>
  );
}
```

## How SSR Works

### Request Flow

1. **Browser makes request** → `GET /posts/123`
2. **Server matches route** → `posts/($id).tsx` → param `id = "123"`
3. **Loader executes** → Fetches post #123 from database
4. **Component renders** → Preact renders to HTML string
5. **HTML response** → Complete page sent to client
6. **Browser displays** → Content immediately visible
7. **Hydration (optional)** → JavaScript can enable interactivity

### Key Advantages

| Benefit                       | Explanation                                         |
| ----------------------------- | --------------------------------------------------- |
| **Fast First Paint**          | HTML is complete and ready to display immediately   |
| **Better SEO**                | All content in initial HTML, no JS execution needed |
| **Works without JS**          | Pages are usable even if JavaScript fails to load   |
| **Smaller Client Bundle**     | Less JavaScript needed on client side               |
| **Server-side Security**      | Sensitive operations stay on server                 |
| **Better Mobile Performance** | Less processing needed on device                    |

## Loader Context

The `loader` function receives a `LoaderContext` object with:

```typescript
export type LoaderContext = {
  url: URL; // Full URL object
  params: Record<string, string>; // Route parameters (:id)
  query: Record<string, string>; // Query string (?sort=date)
  headers: Record<string, string>; // HTTP headers
  cookies: Record<string, string>; // Parsed cookies
  data?: Record<string, any>; // Middleware data
};
```

### Examples

```typescript
// Access route parameters
export const loader = async (ctx) => {
  const postId = ctx.params.id; // from /posts/:id
  const post = await db.posts.get(postId);
  return { post };
};

// Access query string
export const loader = async (ctx) => {
  const page = ctx.query.page ?? "1";
  const limit = ctx.query.limit ?? "10";
  const posts = await db.posts.list({ page, limit });
  return { posts };
};

// Check authentication from cookies
export const loader = async (ctx) => {
  const token = ctx.cookies.auth_token;
  const user = await auth.verify(token);
  if (!user) throw new Error("401: Unauthorized");
  return { user };
};

// Access request headers
export const loader = async (ctx) => {
  const userAgent = ctx.headers["user-agent"];
  const isMobile = /mobile/i.test(userAgent);
  return { isMobile };
};
```

## Route Naming Convention

Routes are discovered by filename pattern in `jen.config.ts`:

```typescript
routes: {
  fileExtensions: [".tsx", ".ts"],
  routeFilePattern: /\(/,  // Files with (name) pattern
}
```

### Examples

| File Path             | Route URL      | Type              |
| --------------------- | -------------- | ----------------- |
| `(home).tsx`          | `/`            | Static root       |
| `(about).tsx`         | `/about`       | Static            |
| `(blog).tsx`          | `/blog`        | Static            |
| `posts/(home).tsx`    | `/posts/`      | Nested static     |
| `posts/($id).tsx`     | `/posts/:id`   | Dynamic parameter |
| `posts/(...slug).tsx` | `/posts/*slug` | Catch-all         |

## Configuration

Edit `jen.config.ts` to customize:

```typescript
const config: FrameworkConfig = {
  // Site directory where routes are located
  siteDir: "site",

  // Output directory for production builds
  distDir: "dist",

  // Route discovery patterns
  routes: {
    fileExtensions: [".tsx", ".ts"],
    routeFilePattern: /\(/,
  },

  // Default rendering mode: "ssr", "ssg", "isr", or "ppr"
  rendering: {
    defaultMode: "ssr",
    defaultRevalidateSeconds: 3600,
  },

  // Global styles
  css: {
    globalScss: "site/styles.scss",
  },

  // Server configuration
  server: {
    port: 3000,
    hostname: "localhost",
  },
};
```

## Pages Included

### 1. Home Page `/`

- Overview of SSR capabilities
- Feature list with dynamically loaded data
- Performance metrics
- Links to other pages

### 2. Blog `/blog`

- List of blog posts (server-rendered)
- Metadata for each post
- Links to individual posts

### 3. Dynamic Post `/posts/:id`

- Single post rendered based on URL parameter
- Related posts section
- Navigation back to blog

### 4. About `/about`

- Information about SSR
- Technical explanation of how Jen.js SSR works
- Project structure and configuration guide

## Development Tips

### Hot Module Replacement (HMR)

Changes to route files automatically reload:

```bash
# Edit site/(home).tsx - page updates instantly
# Edit site/styles.scss - styles reload without full refresh
```

### Debug Loader Execution

Add console logs to see when loaders execute:

```typescript
export const loader = async (ctx: LoaderContext) => {
  console.log("Loader running for:", ctx.url.pathname);
  // Your data fetching logic
};
```

### Performance Monitoring

Access server render time through X-Render-Time header (if implemented):

```javascript
// In browser console
fetch("/posts/1").then((r) => {
  console.log("Render time:", r.headers.get("x-render-time"));
});
```

## Comparing Rendering Modes

```typescript
// Server-Side Rendering (SSR) - Default
// Renders on every request, real-time data
export const mode = "ssr";

// Static Site Generation (SSG)
// Renders at build time, cached
export const mode = "ssg";

// Incremental Static Regeneration (ISR)
// Static with periodic revalidation
export const mode = "isr";
export const revalidateSeconds = 3600;

// Partial Pre-Rendering (PPR)
// Mix of static and dynamic sections
export const mode = "ppr";
```

## Next Steps

1. **Customize the routes** - Edit `site/` files to match your needs
2. **Add a database** - Connect to your database in loaders
3. **Implement caching** - Add Redis or in-memory caching for performance
4. **Add middleware** - Use route-level middleware for auth, validation, etc.
5. **Deploy** - Deploy to your hosting platform

## Resources

- [Jen.js Documentation](https://github.com/oopsio/jen.js)
- [Server-Side Rendering Guide](https://web.dev/rendering-on-the-web/)
- [Preact Documentation](https://preactjs.com/)

## License

MIT - See LICENSE file in the root directory
