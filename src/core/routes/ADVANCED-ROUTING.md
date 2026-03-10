# Advanced Routing System

The Jen.js advanced routing system provides a comprehensive set of features for building complex, production-grade web applications with dynamic routes, query parameter validation, middleware guards, redirects, and custom 404 handling.

## Features

### 1. Dynamic Routes

Routes can accept dynamic segments using file naming conventions:

**File**: `src/posts/($id).tsx`
**Route**: `/posts/:id`

Routes are automatically sorted by specificity, so more specific matches are tried before catch-all routes.

### 2. Query Parameters

Query parameters are automatically parsed from the URL search string and passed to route loaders:

```typescript
// URL: /search?q=test&limit=10
export const loader = async (ctx) => {
  console.log(ctx.query); // { q: "test", limit: "10" }
};
```

### 3. Query Parameter Validation

Validate and coerce query parameters using a schema:

```typescript
import type { AdvancedRouteConfig } from "jenjs";

export const routeConfig: AdvancedRouteConfig = {
  querySchema: {
    limit: {
      type: "number",
      default: 10,
      required: false,
    },
    sort: {
      type: "string",
      enum: ["asc", "desc"],
      default: "asc",
    },
    published: {
      type: "boolean",
      default: true,
    },
  },
};

export const loader = async (ctx) => {
  // Query parameters are automatically validated and type-coerced
  console.log(ctx.query.limit); // number
  console.log(ctx.query.sort); // string
  console.log(ctx.query.published); // boolean
};
```

### 4. Catch-all Routes

Catch-all routes match any sub-path using the `(...rest)` convention:

**File**: `src/docs/(...rest).tsx`
**Route**: `/docs/*rest`

The `rest` parameter contains the remaining path:

```typescript
// URL: /docs/api/fetch
export const loader = async (ctx) => {
  console.log(ctx.params.rest); // "api/fetch"
};
```

### 5. Middleware Guards

Run async functions before rendering to protect routes:

```typescript
export const routeConfig: AdvancedRouteConfig = {
  guards: [
    // Check authentication
    async (ctx) => {
      if (!ctx.cookies.sessionId) {
        return { status: 302, location: "/login" };
      }
      return true;
    },
    // Check authorization
    async (ctx) => {
      const userId = ctx.cookies.userId;
      const hasAccess = await checkUserAccess(userId, ctx.params.postId);
      if (!hasAccess) {
        return { status: 403, location: "/forbidden" };
      }
      return true;
    },
  ],
};
```

Guards are evaluated in order and must all return `true` to proceed. The first guard returning a response object (with `status` and optional `location`) will stop further execution.

Guard context includes:

- `route`: The matched RouteEntry
- `params`: Extracted URL parameters
- `query`: Parsed query parameters
- `url`: Full URL object
- `headers`: Request headers
- `cookies`: Parsed cookies
- `data`: Optional middleware data

### 6. Route-Level Redirects

Redirect from a route based on conditions:

```typescript
export const routeConfig: AdvancedRouteConfig = {
  redirect: {
    // Static redirect
    to: "/new-location",
    status: 301, // permanent

    // Or dynamic redirect based on context
    to: (ctx) => {
      if (ctx.query.lang === "es") {
        return `/es/posts/${ctx.params.id}`;
      }
      return `/posts/${ctx.params.id}`;
    },
  },
};
```

### 7. Application-Level Redirects

Configure redirects at the application level in `jen.config.ts`:

```typescript
import type { FrameworkConfig } from "jenjs";

export default {
  siteDir: "src",
  distDir: "dist",

  // Application-level redirects
  redirects: [
    // Exact match
    { from: "/old-page", to: "/new-page", status: 301 },

    // Pattern-based (prefix)
    { from: "/blog/*", to: "/posts/*", status: 301 },

    // Temporary redirect
    { from: "/temporary", to: "/moved", status: 302 },
  ],

  // ... rest of config
} as FrameworkConfig;
```

Redirects are processed **before** route matching, allowing URL rewriting at the application level.

### 8. 404 Handling

#### Custom 404 Handler Routes

Create a catch-all route to handle 404s for a specific prefix:

```typescript
// src/api/(...rest).tsx
export default function NotFound() {
  return (
    <div>
      <h1>API Not Found</h1>
      <p>The requested API endpoint does not exist.</p>
    </div>
  );
}
```

When a request to `/api/unknown` doesn't match any specific route, the `(...rest)` handler is used.

#### Default 404 Handling

If no custom handler exists, a default 404 page is served with:

```
404 Not Found
Path: /requested/path
```

A professional default HTML 404 page is available with:

```typescript
import { createDefault404Html } from "jenjs";

const html = createDefault404Html("/not/found");
```

## Architecture

### Route Resolution Flow

```
1. Request arrives
2. Check application-level redirects
3. Match against routes (by specificity)
4. Load route's advanced config
5. Check route-level redirects
6. Validate query parameters
7. Execute middleware guards
8. Render route or return response
```

### Route Specificity Order

Routes are matched in this order:

1. Static routes (no parameters): `/about`, `/api/users`
2. Dynamic routes: `/posts/:id`, `/users/:id/profile`
3. Catch-all routes: `/docs/*rest`

Within each category, routes are sorted alphabetically.

## Integration with Middleware Pipeline

The advanced routing system integrates seamlessly with Jen.js middleware:

1. **Request Logging**: All requests are logged through the middleware pipeline
2. **Guard Execution**: Route guards run in the SSR middleware after route matching
3. **Redirect Handling**: Redirects are sent before rendering, preserving the middleware chain
4. **404 Handling**: Custom 404 handlers can be route modules with loaders and middleware

## API Reference

### Advanced Routing Exports

All types and utilities are exported from `jenjs`:

```typescript
import type {
  AdvancedRouteConfig,
  RouteGuard,
  RouteGuardContext,
  RouteGuardResponse,
  QueryParamRule,
  RedirectConfig,
  NotFoundConfig,
} from "jenjs";

import {
  validateQueryParams,
  processQueryParams,
  getRedirect,
  getNotFoundHandler,
  send404,
  sendRedirect,
  createDefault404Html,
  createAdvancedRouter,
  AdvancedRouter,
} from "jenjs";
```

### Route Configuration Example

```typescript
import type { AdvancedRouteConfig, RouteGuardContext } from "jenjs";

const isAuthenticated = async (ctx: RouteGuardContext) => {
  if (!ctx.cookies.sessionId) {
    return { status: 302, location: "/login" };
  }
  return true;
};

const isAdmin = async (ctx: RouteGuardContext) => {
  const user = await fetchUser(ctx.cookies.userId);
  if (user.role !== "admin") {
    return { status: 403, location: "/forbidden" };
  }
  return true;
};

export const routeConfig: AdvancedRouteConfig = {
  // Middleware guards
  guards: [isAuthenticated, isAdmin],

  // Query parameter validation
  querySchema: {
    page: { type: "number", default: 1 },
    perPage: { type: "number", default: 20, enum: [10, 20, 50] },
    sort: { type: "string", default: "recent" },
  },

  // Route-level redirects
  redirect: {
    to: (ctx) => {
      if (!ctx.query.format) return `/admin`;
      return `/admin?format=${ctx.query.format}`;
    },
  },

  // Response caching
  cache: true,
  cacheSeconds: 3600,
};

export const loader = async (ctx) => {
  // All guards have passed, query params are validated
  return {
    users: await fetchUsers({
      page: ctx.query.page,
      perPage: ctx.query.perPage,
    }),
  };
};

export default function AdminUsers({ data }) {
  return (
    <div>
      <h1>Users</h1>
      {data.users.map((user) => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

## Error Handling

Guard functions should not throw errors; instead, return a response object:

```typescript
// ❌ Wrong - throws error
async (ctx) => {
  if (error) throw new Error("Access denied");
};

// ✅ Correct - returns response
async (ctx) => {
  if (error) {
    return { status: 403, location: "/forbidden" };
  }
  return true;
};
```

## Performance Considerations

1. **Guard caching**: Guards should cache expensive operations (e.g., database queries)
2. **Query validation**: Validation is synchronous and fast; use for basic type coercion
3. **404 handling**: Custom 404 handlers can be full route modules with loaders
4. **Redirect HTTP status codes**: Use 301 (permanent) for SEO, 302 (temporary) for user redirects

## Type Safety

All advanced routing features are fully typed:

```typescript
// Type-safe guards
const guard: RouteGuard = async (ctx) => {
  // ctx is typed as RouteGuardContext
  const userId = ctx.cookies.userId; // string
  const pageNum = ctx.query.page; // string

  return true; // or { status: 302, location: "..." }
};

// Type-safe config
const config: AdvancedRouteConfig = {
  guards: [guard],
  querySchema: {
    // Type-safe schema definition
    limit: { type: "number", default: 10 },
  },
};
```

## Examples

### Protected Admin Route

```typescript
// src/admin/(home).tsx
import type { AdvancedRouteConfig } from "jenjs";

const requireAdmin: RouteGuard = async (ctx) => {
  const user = await fetchUserFromSession(ctx.cookies.sessionId);
  if (!user || user.role !== "admin") {
    return { status: 403, location: "/" };
  }
  return true;
};

export const routeConfig: AdvancedRouteConfig = {
  guards: [requireAdmin],
};

export const loader = async (ctx) => {
  return { stats: await getAdminStats() };
};

export default function AdminDashboard({ data }) {
  return <div>{/* admin content */}</div>;
}
```

### Paginated API Endpoint

```typescript
// src/api/posts/(...rest).tsx
import type { AdvancedRouteConfig } from "jenjs";

export const routeConfig: AdvancedRouteConfig = {
  querySchema: {
    page: { type: "number", default: 1, required: false },
    limit: { type: "number", default: 20, required: false },
    sort: {
      type: "string",
      default: "recent",
      enum: ["recent", "popular", "trending"],
    },
  },
};

export const loader = async (ctx) => {
  return {
    posts: await fetchPosts({
      page: ctx.query.page,
      limit: ctx.query.limit,
      sort: ctx.query.sort,
    }),
  };
};

export default function Posts({ data }) {
  return <div>{/* posts list */}</div>;
}
```

### URL Rewriting

```typescript
// jen.config.ts - redirect old blog URLs to new structure
export default {
  redirects: [
    { from: "/blog/posts/*", to: "/posts/*", status: 301 },
    { from: "/articles/*", to: "/posts/*", status: 301 },
  ],
} as FrameworkConfig;
```

## Best Practices

1. **Order guards by cost**: Put cheap checks first (e.g., checking a cookie before querying the database)
2. **Use 301 for permanent redirects**: Better for SEO when moving content
3. **Validate query parameters**: Prevents invalid data from reaching your loader
4. **Document guard logic**: Guards affect route behavior, document when/why they block access
5. **Use type-safe schemas**: Leverage TypeScript's type system for query parameters
6. **Cache guard results**: Avoid repeated database queries for the same request

---

**See Also**: [Routing](./README.md), [Types](../types.ts), [Config](../config.ts)
