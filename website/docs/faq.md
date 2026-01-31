# Frequently Asked Questions

## General Questions

### What is Jen.js?

Jen.js is a TypeScript-first framework for building static-generated (SSG) and server-rendered (SSR) web applications with Preact. It combines the simplicity of file-based routing with the power of TypeScript and multiple database drivers.

### How does Jen.js compare to Next.js?

| Feature | Jen.js | Next.js |
|---------|--------|---------|
| Language | TypeScript first | JavaScript + TypeScript |
| Framework | Preact | React |
| Bundle size | Smaller (3KB Preact) | Larger (40KB React) |
| Database | Built-in abstraction | Via third-party libraries |
| Authentication | JWT included | Via third-party libraries |
| Configuration | Convention over config | More configuration |
| Learning curve | Easier | Steeper |

Choose Jen.js if you want lightweight, TypeScript-first development. Choose Next.js if you need the React ecosystem.

### Is Jen.js production-ready?

Jen.js framework is production-ready. However, as with any framework, thoroughly test your application before deploying. The core features (routing, SSG, SSR, database) are stable.

### Can I use React instead of Preact?

Jen.js is built around Preact. You can use React components, but they'll be larger. Preact is 70% API-compatible with React, so most code works with minimal changes.

### How do I contribute?

Jen.js is open source. See the README for contribution guidelines. All contributions welcome.

## Getting Started

### How do I install Jen.js?

```bash
npm create jen-app@latest my-app
cd my-app
npm install
npm run dev
```

### Where do I put my pages?

Create files in the `site/` directory with the naming pattern `(name).tsx`:

```
site/(home).tsx        → /
site/(about).tsx       → /about
site/blog/($slug).tsx  → /blog/:slug
```

### How do I create an API endpoint?

Create `.ts` files instead of `.tsx`:

```ts
// site/api/(users).ts
export async function handle(req, res) {
  res.writeHead(200, { 'content-type': 'application/json' });
  res.end(JSON.stringify({ users: [] }));
}
```

## Routing

### How do I handle dynamic routes?

Use `$` prefix for parameters:

```typescript
// site/posts/($id).tsx
export async function loader(ctx) {
  return { post: await getPost(ctx.params.id) };
}
```

### How do I create nested routes?

Just create subdirectories:

```
site/
├── blog/
│   ├── (index).tsx    → /blog
│   └── ($slug).tsx    → /blog/:slug
└── docs/
    └── (intro).tsx    → /docs/intro
```

### How do I handle 404s?

Create `site/(404).tsx` or use catch-all routes:

```typescript
// site/(...rest).tsx - Catches all unmatched routes
export default function NotFound() {
  return <h1>404 Not Found</h1>;
}
```

## Development

### How do I access environment variables?

Use `process.env`:

```typescript
const apiKey = process.env.API_KEY;
const isDev = process.env.NODE_ENV === 'development';
```

### How do I use TypeScript?

Jen.js is TypeScript-first. Just use `.tsx` and `.ts` files:

```typescript
interface User {
  id: string;
  name: string;
}

export async function loader(ctx: LoaderContext): Promise<User> {
  return { id: '1', name: 'Alice' };
}
```

### How do I debug?

Use console.log, debugger, or a debugger tool:

```typescript
// VS Code debugger
export async function loader(ctx) {
  debugger;  // Pause here
  return { /* ... */ };
}
```

### How do I structure large projects?

Organize by feature:

```
src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── lib/
│   │   └── types.ts
│   ├── users/
│   └── posts/
```

## Building & Deployment

### What's the difference between npm run build and npm run dev?

- `npm run dev` starts a development server with SSR
- `npm run build` generates static HTML files for SSG

### How do I deploy?

Static sites (SSG):
```bash
npm run build
# Deploy dist/ to any CDN (Netlify, Vercel, etc.)
```

Server-rendered (SSR):
```bash
npm run build
npm run start
# Deploy to Node.js hosting (Heroku, Railway, etc.)
```

### Can I deploy to Vercel/Netlify?

Yes! Use SSG mode to generate static files, then deploy `dist/` to either service.

For SSR with dynamic routes, deploy to a Node.js compatible platform.

### How do I optimize for production?

1. Use SSG when possible
2. Enable minification in `jen.config.ts`
3. Remove source maps in production
4. Cache static assets on CDN
5. Use HTTP caching headers
6. Monitor bundle size

## Databases

### How do I connect to a database?

```typescript
const config: FrameworkConfig = {
  database: {
    default: {
      type: 'postgres',
      config: { connectionString: process.env.DATABASE_URL }
    }
  }
};
```

### Which database should I use?

- **SQLite** — Development, small projects
- **PostgreSQL** — Production, complex queries
- **MySQL** — Production, shared hosting
- **MongoDB** — Flexible schema, document storage
- **jDB** — Lightweight, embedded

### How do I run migrations?

Create migration files and run:

```bash
npm run migrate
```

### How do I handle database errors?

```typescript
export async function loader(ctx) {
  try {
    const user = await getUser(ctx.params.id);
    return { user };
  } catch (err) {
    ctx.response.writeHead(500);
    ctx.response.end('Server error');
    return {};
  }
}
```

## Features

### How do I add authentication?

```typescript
import { signToken, verifyToken } from '@src/auth/jwt';

const token = signToken({ userId: '1' }, '7d');
const payload = verifyToken(token);
```

### How do I use middleware?

Create middleware in `src/middleware/`:

```typescript
export async function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    res.writeHead(401);
    res.end('Unauthorized');
    return;
  }
  next();
}
```

### How do I add caching?

Configure in `jen.config.ts`:

```typescript
const config: FrameworkConfig = {
  cache: {
    type: 'redis',
    config: { url: 'redis://localhost:6379' }
  }
};
```

Or use HTTP caching headers:

```typescript
export async function loader(ctx) {
  ctx.response.setHeader('Cache-Control', 'public, max-age=3600');
  return { /* ... */ };
}
```

### How do I create a plugin?

Create in `src/plugins/`:

```typescript
export default {
  name: 'my-plugin',
  onBuild: async () => {
    console.log('Building...');
  },
  onServe: async () => {
    console.log('Serving...');
  }
};
```

## Performance

### How can I improve build speed?

- Use SSG for static content
- Avoid heavy computations in loaders
- Cache API responses
- Use database indexes

### How can I improve runtime performance?

- Minimize JavaScript
- Use SSR for dynamic content
- Cache responses
- Optimize database queries
- Use CDN for static assets

### How do I monitor performance?

```typescript
export async function loader(ctx) {
  const start = Date.now();
  const data = await fetchData();
  console.log(`Took ${Date.now() - start}ms`);
  return { data };
}
```

## Troubleshooting

### Routes not working?

- Check file naming: `(name).tsx` not `name.tsx`
- Ensure files are in `site/` directory
- Restart dev server

### TypeScript errors?

- Run `npm run typecheck`
- Check for missing type definitions
- Verify `tsconfig.json` configuration

### Build fails?

- Check for syntax errors
- Run `npm run typecheck` first
- Check plugin configurations
- See build output for error details

### Dev server slow?

- Check for slow loaders
- Reduce database queries
- Use caching
- Monitor network requests

### Database connection fails?

- Verify DATABASE_URL in `.env`
- Check database is running
- Check credentials
- Verify firewall/network access

## Advanced

### How do I add TypeScript types?

Create `.d.ts` files or use `src/types/`:

```typescript
// src/types/global.d.ts
declare global {
  interface Window {
    myVar: string;
  }
}

export {};
```

### How do I use WebSockets?

Currently not directly supported. Use polling or upgrade to a more complex server setup.

### How do I add GraphQL?

Use with API routes:

```typescript
import { graphql } from 'graphql';
import { schema } from '@src/lib/graphql';

export async function handle(req, res) {
  const result = await graphql({ schema, source: req.body });
  res.writeHead(200, { 'content-type': 'application/json' });
  res.end(JSON.stringify(result));
}
```

### How do I extend the framework?

- Create plugins
- Create custom middleware
- Create shared components and utilities
- Use path aliases for imports

## Still Have Questions?

- Check the full documentation
- Open an issue on GitHub
- Ask in discussions
