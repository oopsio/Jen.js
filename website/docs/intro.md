---
sidebar_position: 0
---

# Welcome to Jen.js

Build fast, modern web applications with TypeScript and Preact.

## What is Jen.js?

Jen.js is a **TypeScript-first framework** for building:

- **Static Sites** (SSG) - Fast, scalable, perfect for content
- **Server Apps** (SSR) - Dynamic, real-time, personalized
- **REST APIs** - Built-in API route system
- **Full-stack** - Frontend + Backend in one framework

## Quick Facts

- **3KB** - Preact instead of React
- **Zero Config** - File-based routing out of the box
- **TypeScript** - Strict mode by default
- **Multi-DB** - SQLite, PostgreSQL, MySQL, MongoDB
- **Built-in Auth** - JWT authentication included
- **Native Ready** - Stubs for Rust/C++ compilation

## Why Jen.js?

### Simple

Create a route in seconds:

```bash
# Just add a file in site/
site/(hello).tsx
```

```typescript
export default function Hello() {
  return <h1>Hello, World!</h1>;
}
```

Visit `/hello` instantly.

### Fast

- Preact (3KB) instead of React
- Optimized build system
- Intelligent caching
- Static generation option

### TypeScript

Full type safety from database to frontend:

```typescript
interface Post {
  id: number;
  title: string;
  content: string;
}

export async function loader(ctx: LoaderContext): Promise<Post> {
  return await db.query('posts', { id: ctx.params.id });
}

export default function PostPage({ data }: { data: Post }) {
  return <h1>{data.title}</h1>;
}
```

### Production Ready

- Built-in security headers
- Error handling
- Request validation
- Database migrations
- Plugin system

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/kessud2021/Jen.js.git
cd Jen.js
npm install
```

### 2. Start Dev Server

```bash
npm run dev
```

Open http://localhost:3000

### 3. Create Your First Route

Add `site/(about).tsx`:

```typescript
export default function About() {
  return (
    <div>
      <h1>About Us</h1>
      <p>This is our about page.</p>
    </div>
  );
}
```

Visit http://localhost:3000/about

### 4. Build for Production

```bash
npm run build
npm start
```

## Choose Your Path

### Building a Blog?

Use **SSG** for fast, static pages:

```bash
npm run build
npm run serve dist/
```

→ Go to [SSG vs SSR](./ssg-ssr)

### Building an App?

Use **SSR** for dynamic, real-time content:

```bash
npm run dev
```

→ Go to [Components & Data](./components)

### Building an API?

Use **API Routes** for REST endpoints:

```typescript
// site/api/(users).ts
export async function handle(req, res) {
  res.writeHead(200, { 'content-type': 'application/json' });
  res.end(JSON.stringify({ users: [] }));
}
```

→ Go to [API Routes](./api)

## Documentation

- **[Getting Started](./getting-started)** - Installation & setup
- **[Routing](./routing)** - File-based routing
- **[Components](./components)** - Build pages with Preact
- **[Data Loading](./data-loading)** - Fetch & cache data
- **[API Routes](./api)** - Build REST endpoints
- **[Database](./database)** - Query your data
- **[Authentication](./auth)** - Secure your app
- **[Deployment](./deployment)** - Deploy to production

## Examples

### Dynamic Route with Data

```typescript
// site/posts/($id).tsx

export async function loader(ctx: LoaderContext) {
  const post = await db.query('posts', { 
    id: parseInt(ctx.params.id) 
  });
  
  if (!post) {
    return { notFound: true };
  }
  
  return post;
}

export default function Post({ data }: any) {
  if (data.notFound) {
    return <h1>Post not found</h1>;
  }
  
  return (
    <article>
      <h1>{data.title}</h1>
      <p>{data.content}</p>
    </article>
  );
}
```

### API Route

```typescript
// site/api/(users).ts

export async function handle(req, res) {
  if (req.method === 'GET') {
    const users = await db.query('users', {});
    
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify(users));
  }
}
```

### Protected Route

```typescript
// site/(dashboard).tsx

import { verifyToken } from '@src/auth/jwt';

export async function loader(ctx: LoaderContext) {
  const token = ctx.req?.headers['authorization'];
  
  if (!token) {
    return { unauthorized: true };
  }
  
  try {
    const user = verifyToken(token);
    return { user };
  } catch {
    return { unauthorized: true };
  }
}
```

## Community

- 💬 [GitHub Discussions](https://github.com/kessud2021/Jen.js/discussions)
- 🐛 [Report Issues](https://github.com/kessud2021/Jen.js/issues)
- ⭐ [Star on GitHub](https://github.com/kessud2021/Jen.js)

## Next Steps

Start with [Getting Started](./getting-started) or jump into [Routing](./routing).

---

**Happy coding! 🚀**
