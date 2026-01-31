# Introduction to Jen.js

## What is Jen.js?

Jen.js is a TypeScript-first, full-stack web framework that combines:

- **TypeScript** — Type-safe development with strict mode
- **Preact** — Lightweight component framework (3KB vs React's 40KB+)
- **File-based routing** — Zero-config route discovery
- **Dual rendering** — SSG for static sites, SSR for dynamic content
- **Production-optimized** — Minimal bundle sizes and fast performance

Think of it as **Next.js for TypeScript teams who want lightweight, performant applications**.

## Core Philosophies

### TypeScript First
All code is written in TypeScript with strict type checking. You get:
- Type safety across your entire application
- Better IDE support and auto-completion
- Compile-time error detection

### Progressive Enhancement
- Build static sites when possible (SSG)
- Switch to dynamic rendering (SSR) when needed
- No JavaScript by default (unless you need interactivity)

### Simplicity by Default
- File-based routing — no configuration needed
- Preact for minimal overhead
- Native modules for performance-critical paths

### Extensibility
- Plugin system for custom functionality
- Middleware system for request handling
- Multiple database drivers

## Framework Highlights

### Zero-Config Routing
Your file structure automatically becomes your routes:

```
site/
├── (home).tsx          → /
├── (about).tsx         → /about
├── posts/
│   └── ($id).tsx       → /posts/:id
└── api/
    └── (users).ts      → /api/users
```

### Preact Components
Write interactive UIs with Preact (70% API compatible with React):

```typescript
export default function HomePage() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <h1>Welcome</h1>
      <button onClick={() => setCount(count + 1)}>
        Clicks: {count}
      </button>
    </div>
  );
}
```

### Dual Rendering Modes

**Static Site Generation (SSG)**
```bash
npm run build  # Generates pre-rendered HTML
```

Benefits:
- Fast, cacheable, no server needed
- Perfect for blogs, docs, marketing sites
- Lower hosting costs (CDN only)

**Server-Side Rendering (SSR)**
```bash
npm run dev    # Dynamic rendering per request
npm run start  # Production server
```

Benefits:
- Real-time content, personalization
- SEO-friendly dynamic rendering
- Instant updates without rebuilding

### Multiple Database Support
Pick your database:

```typescript
// SQLite (embedded, zero config)
const db = new DB({ type: "sqlite" });

// PostgreSQL / MySQL (production)
const db = new DB({ type: "postgres", ... });

// MongoDB
const db = new DB({ type: "mongodb", ... });

// jDB (Jen's embedded database)
const db = new DB({ type: "jdb", ... });
```

### Plugin System
Extend Jen.js with custom plugins:

```typescript
// src/plugin/plugins/my-plugin.ts
export default {
  name: "my-plugin",
  onBuild: async () => {
    console.log("Building...");
  },
  onServe: async () => {
    console.log("Server running...");
  }
};
```

## Project Structure

```
jen.js/
├── src/                    # Framework source code
│   ├── build/              # Static site generation logic
│   ├── server/             # HTTP server and SSR
│   ├── core/               # Core config, routing, types
│   ├── runtime/            # Preact SSR and hydration
│   ├── api/                # REST API utilities
│   ├── auth/               # Authentication (JWT)
│   ├── cache/              # Caching layer
│   ├── db/                 # Database abstraction
│   ├── middleware/         # Express-style middleware
│   ├── plugin/             # Plugin system
│   ├── native/             # Native module stubs
│   ├── cli/                # CLI tooling
│   └── shared/             # Shared utilities
├── site/                   # Your application
│   ├── (home).tsx
│   ├── (about).tsx
│   ├── posts/
│   └── api/
├── dist/                   # Build output (generated)
├── jen.config.ts          # Configuration
├── build.ts               # Build entry point
└── server.ts              # Server entry point
```

## When to Use Jen.js

Jen.js is ideal for:

- Blogs and documentation sites
- Marketing websites with dynamic content
- Hybrid applications (static + dynamic)
- API-first applications
- Teams familiar with React/TypeScript
- Projects requiring type safety
- Applications needing multiple database drivers

## When to Consider Alternatives

- If you need a pure frontend framework → Use React/Vue/Svelte
- If you need a backend framework → Use Express/Fastify
- If you need GraphQL-only → Consider Apollo Server
- If you need complex routing → Consider other frameworks
