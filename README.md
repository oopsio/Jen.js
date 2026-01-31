# Jen.js - TypeScript Web Framework

A modern TypeScript-first framework for building static-generated (SSG) and server-rendered (SSR) web applications with Preact.

## ✨ Features

- **TypeScript-first**: Full TypeScript support with strict type checking
- **SSG & SSR**: Build static sites or render on-the-fly
- **Preact-powered**: Lightweight 3KB alternative to React
- **Zero-config routing**: File-based routing (`(name).tsx`)
- **Native module stubs**: Ready for high-performance native compilation (Rust/C++)
- **Plugin system**: Extensible via TypeScript plugins
- **Multiple DB drivers**: SQLite, PostgreSQL, MySQL, MongoDB support
- **Built-in middleware**: Express-style middleware system
- **Production-ready**: Optimized build pipeline

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Development server (SSR)
npm run dev

# Build static site (SSG)
npm run build

# Type checking
npm run typecheck
```

## 📁 Project Structure

```
jen.js/
├── src/
│   ├── build/              # SSG build logic
│   ├── server/             # HTTP server & SSR
│   ├── core/               # Core config, routing, types
│   ├── runtime/            # Preact rendering & hydration
│   ├── native/             # Native module stubs (TypeScript)
│   ├── build-tools/        # Build utilities
│   ├── plugin/             # Plugin system
│   ├── db/                 # Database abstraction
│   ├── api/                # REST API utilities
│   ├── auth/               # Authentication
│   ├── cache/              # Caching layer
│   ├── middleware/         # Middleware system
│   ├── cli/                # CLI tooling
│   └── shared/             # Shared utilities
├── site/                   # Example site
├── dist/                   # Build output
├── native/                 # Native source (Rust/C++) - deprecated, use src/native/
├── jen.config.ts          # Framework config
├── build.ts               # Build entry point
└── server.ts              # Server entry point
```

## 🏗️ Architecture

### Core Modules

**Build System**
- `src/build/build.ts` - Static site generation
- `src/native/bundler.ts` - Asset bundling (esbuild wrapper)
- `src/native/optimizer.ts` - Code optimization

**Server**
- `src/server/app.ts` - HTTP application
- `src/runtime/render.ts` - Preact SSR
- `src/runtime/hydrate.ts` - Client-side hydration

**Routing**
- `src/core/routes/scan.ts` - File-based route discovery
- `src/core/routes/match.ts` - Route matching

**Features**
- `src/db/` - Multi-driver database support
- `src/api/` - REST API helpers
- `src/auth/jwt.ts` - JWT authentication
- `src/cache/redis.ts` - Caching (Redis)
- `src/plugin/loader.ts` - Plugin system

### File-Based Routing

Routes are auto-discovered from `site/` directory:

```
site/
├── (home).tsx           → / (homepage)
├── (about).tsx          → /about
├── posts/
│   └── ($id).tsx        → /posts/:id (dynamic)
└── api/
    └── (users).ts       → /api/users (API route)
```

**Dynamic segments** use `$` prefix:
- `($id).tsx` → `/:id` (single param)
- `(...rest).tsx` → `/*rest` (catch-all)

## 🔧 Configuration

Edit `jen.config.ts` to customize:

```typescript
const config: FrameworkConfig = {
  siteDir: "site",        // Route sources
  distDir: "dist",        // Build output
  rendering: {
    defaultMode: "ssr",   // or "ssg"
    defaultRevalidateSeconds: 60
  },
  routes: {
    fileExtensions: [".tsx", ".jsx", ".ts", ".js"],
    routeFilePattern: /^\((.+)\)\.(t|j)sx?$/,
    enableIndexFallback: true
  },
  // ... more options
};
```

## 📝 Writing Routes

**Page component** (`site/(about).tsx`):
```typescript
export default function About() {
  return <h1>About Us</h1>;
}

// Optional: load data
export async function loader(ctx: LoaderContext) {
  return { title: "About" };
}

// Optional: custom head
export function Head({ data }: any) {
  return <title>{data.title}</title>;
}
```

**API route** (`site/api/(users).ts`):
```typescript
import type { IncomingMessage, ServerResponse } from "node:http";

export async function handle(req: IncomingMessage, res: ServerResponse) {
  if (req.method === "GET") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ users: [] }));
  }
}
```

## 🔌 Plugins

Create plugins in `src/plugin/plugins/`:

```typescript
// src/plugin/plugins/example.ts
export default {
  name: "example-plugin",
  onBuild: async () => {
    console.log("Building...");
  },
  onServe: async () => {
    console.log("Server running...");
  },
  onDeploy: async () => {
    console.log("Deploying...");
  }
};
```

## 💾 Database

Supported drivers: jDB (embedded), SQLite, PostgreSQL, MySQL.

```typescript
import { DB } from "@src/db";

const db = new DB({
  type: "jdb",
  jdb: { root: "data" }
});

await db.connect();
const users = await db.find("users", {});
```

## 🔐 Authentication

```typescript
import { signToken, verifyToken } from "@src/auth/jwt";

const token = signToken({ userId: 123 }, "7d");
const payload = verifyToken(token);
```

## 📦 Build Output

Build outputs to `dist/`:
```
dist/
├── index/
│   └── index.html        # Rendered pages
├── api/                  # API routes (if SSR)
├── styles.css            # Global styles
└── assets/               # Static files
```

## 🚀 Native Modules

Currently implemented as TypeScript stubs in `src/native/`:

| Module | Status | Production |
|--------|--------|-----------|
| `dev-server.ts` | Stub (Node.js) | Rust (Tokio) |
| `bundler.ts` | esbuild wrapper | C++ |
| `style-compiler.ts` | Stub | Rust (sass) |
| `optimizer.ts` | Stub | Rust |

To use native implementations in production:
1. Replace TypeScript files in `src/native/` with bindings
2. Or use pre-built native packages

## 📖 Code Style

- **TypeScript**: Strict mode, ES2022 target
- **Imports**: Use `@src/*` path alias, imports transpiled to `.js`
- **Naming**: CamelCase for exports, kebab-case for files
- **Error handling**: Try-catch in async handlers, log via `@src/shared/log`

## 🤝 Contributing

1. Code must pass `npm run typecheck`
2. Follow TypeScript strict mode
3. Use Preact for UI components
4. Document plugin APIs

## 📄 License

MIT

---

**Built with TypeScript, Preact, and Node.js**
