---
sidebar_position: 3
---

# Project Structure

Jen.js follows a well-organized structure for both framework code and application routes.

## Framework Layout

```
Jen.js/
├── src/                    # Framework source (TypeScript)
│   ├── build/             # Static site generation
│   │   └── build.ts       # SSG orchestrator
│   ├── server/            # HTTP server
│   │   ├── app.ts         # Express-like app
│   │   ├── api.ts         # API route handler
│   │   └── runtimeServe.ts # Server-side rendering
│   ├── core/              # Core utilities
│   │   ├── config.ts      # Config loading
│   │   ├── types.ts       # Framework types
│   │   ├── routes/        # Routing logic
│   │   └── http.ts        # HTTP utilities
│   ├── runtime/           # Preact runtime
│   │   ├── render.ts      # SSR rendering
│   │   ├── hydrate.ts     # Client hydration
│   │   └── client-runtime.ts # Browser runtime
│   ├── native/            # Native module stubs
│   │   ├── dev-server.ts  # Dev server
│   │   ├── bundler.ts     # Asset bundling
│   │   ├── style-compiler.ts # CSS compilation
│   │   └── optimizer.ts   # Code optimization
│   ├── db/                # Database layer
│   │   ├── index.ts       # DB manager
│   │   ├── types.ts       # DB types
│   │   ├── schema.ts      # Schema management
│   │   ├── migrations.ts  # Migration runner
│   │   ├── luaHooks.ts    # Lua script hooks
│   │   └── drivers/       # Database drivers
│   │       ├── sqlite.ts
│   │       ├── postgres.ts
│   │       ├── mysql.ts
│   │       └── mongodb.ts
│   ├── api/               # REST API helpers
│   │   └── index.ts
│   ├── auth/              # Authentication
│   │   └── jwt.ts         # JWT tokens
│   ├── cache/             # Caching layer
│   │   └── redis.ts       # Redis client
│   ├── middleware/        # Express-style middleware
│   │   ├── types.ts       # Middleware types
│   │   └── runner.ts      # Middleware executor
│   ├── plugin/            # Plugin system
│   │   ├── loader.ts      # Plugin loader
│   │   └── plugins/       # Built-in plugins
│   ├── i18n/              # Internationalization
│   │   └── index.ts
│   ├── graphql/           # GraphQL support
│   │   ├── schema.ts
│   │   ├── resolvers.ts
│   │   └── index.ts
│   ├── build-tools/       # Build utilities
│   │   └── index.ts
│   └── shared/            # Shared utilities
│       └── log.ts         # Logging
├── site/                  # Example site / your routes
│   ├── (home).tsx         # Homepage (route: /)
│   ├── (about).tsx        # About page (route: /about)
│   ├── posts/
│   │   └── ($id).tsx      # Dynamic route (route: /posts/:id)
│   └── api/
│       └── (users).ts     # API route (route: /api/users)
├── dist/                  # Build output (generated)
│   ├── index/             # Rendered pages
│   ├── api/               # API routes
│   ├── styles.css         # Global styles
│   └── assets/            # Static files
├── native/                # Native source (deprecated)
├── build.ts               # Build entry point
├── server.ts              # Server entry point
├── jen.config.ts          # Framework configuration
├── tsconfig.json          # TypeScript config
├── package.json           # Dependencies
└── README.md              # Project readme
```

## Site Routes Directory

Your application routes live in the `site/` directory. Routes are auto-discovered using file-based routing.

### Route File Naming

Routes use the pattern: `(routeName).tsx` or `(routeName).ts`

```
site/
├── (home).tsx           → / (homepage)
├── (about).tsx          → /about
├── (contact).tsx        → /contact
├── posts/
│   ├── (index).tsx      → /posts
│   └── ($id).tsx        → /posts/:id (dynamic)
├── api/
│   ├── (users).ts       → /api/users
│   └── (posts).ts       → /api/posts
└── admin/
    └── (dashboard).tsx  → /admin/dashboard
```

### Dynamic Segments

Use `$` prefix for dynamic route parameters:

- `($id).tsx` → `/:id` (single parameter)
- `(...rest).tsx` → `/*` (catch-all)
- `($slug).tsx` → `/:slug` (named parameter)

### API Routes

API routes are `.ts` files (not JSX components):

```
site/api/
├── (users).ts      → /api/users
├── (posts).ts      → /api/posts
└── auth/
    └── (login).ts  → /api/auth/login
```

## Key Files

### `jen.config.ts`
Framework configuration - rendering mode, routing patterns, plugin settings.

### `build.ts`
SSG build orchestrator - runs during `npm run build`.

### `server.ts`
Server entry point - runs during `npm run dev` and `npm run start`.

### `tsconfig.json`
TypeScript configuration with strict mode and path aliases.

## Source Structure

### Framework Modules

| Module | Purpose |
|--------|---------|
| `src/build/` | Static site generation (SSG) |
| `src/server/` | HTTP server & request handling |
| `src/core/` | Config, routing, paths, types |
| `src/runtime/` | Preact SSR + client hydration |
| `src/native/` | Native module stubs (Rust/C++) |
| `src/db/` | Multi-driver database support |
| `src/api/` | REST API utilities |
| `src/auth/` | JWT authentication |
| `src/cache/` | Redis caching layer |
| `src/plugin/` | Plugin system & loader |
| `src/middleware/` | Express-style middleware |
| `src/i18n/` | Internationalization |
| `src/graphql/` | GraphQL support |

### Type Aliases

In `tsconfig.json`, the `@src/*` alias maps to `src/*`:

```json
{
  "paths": {
    "@src/*": ["src/*"]
  }
}
```

Use in your routes:

```typescript
import { DB } from '@src/db';
import { signToken } from '@src/auth/jwt';
import config from '@src/core/config';
```

## Build Output

After running `npm run build`, output appears in `dist/`:

```
dist/
├── index/              # Rendered HTML pages
│   ├── index.html      # Homepage
│   ├── about/
│   │   └── index.html  # /about
│   └── posts/
│       ├── 1/
│       │   └── index.html
│       └── 2/
│           └── index.html
├── api/                # API routes (if applicable)
├── styles.css          # Global CSS
├── assets/             # Images, fonts, etc.
└── manifest.json       # Build manifest
```

## Development vs Production

### Development (`npm run dev`)
- Runs SSR server on port 3000
- Hot reload on file changes
- Full error messages & stack traces
- No optimization

### Production (`npm run build && npm run start`)
- Builds static site (SSG)
- Minified output
- Asset optimization
- Ready to deploy

## Next Steps

- [Routing](./routing) - Understand file-based routing
- [Components & Data](./components) - Build pages
- [API Routes](./api) - Create REST endpoints
