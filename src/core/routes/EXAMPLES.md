# Advanced Routing Examples

This document contains practical examples of using the advanced routing system.

## Example 1: Protected Admin Route

```typescript
// src/admin/(home).tsx
import type { AdvancedRouteConfig, RouteGuard } from "jenjs";

// Define reusable guards
const requireAuthentication: RouteGuard = async (ctx) => {
  if (!ctx.cookies.sessionId) {
    return { status: 302, location: "/login" };
  }
  return true;
};

const requireAdmin: RouteGuard = async (ctx) => {
  const user = await fetchUserFromSession(ctx.cookies.sessionId);
  if (!user) {
    return { status: 302, location: "/login" };
  }
  if (user.role !== "admin") {
    return { status: 403, location: "/forbidden" };
  }
  return true;
};

export const routeConfig: AdvancedRouteConfig = {
  guards: [requireAuthentication, requireAdmin],
};

export const loader = async (ctx) => {
  return {
    stats: await getAdminStats(),
    users: await listUsers(),
  };
};

export default function AdminDashboard({ data }) {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Total Users: {data.users.length}</p>
      {/* admin content */}
    </div>
  );
}
```

## Example 2: Paginated Articles

```typescript
// src/articles/(home).tsx
import type { AdvancedRouteConfig } from "jenjs";

export const routeConfig: AdvancedRouteConfig = {
  querySchema: {
    page: {
      type: "number",
      default: 1,
      required: false,
    },
    perPage: {
      type: "number",
      default: 10,
      enum: [5, 10, 20, 50],
      required: false,
    },
    sort: {
      type: "string",
      default: "recent",
      enum: ["recent", "popular", "featured"],
      required: false,
    },
    search: {
      type: "string",
      required: false,
    },
  },
};

export const loader = async (ctx) => {
  const page = (ctx.query.page as number) || 1;
  const perPage = (ctx.query.perPage as number) || 10;
  const sort = (ctx.query.sort as string) || "recent";
  const search = (ctx.query.search as string) || "";

  const { articles, total } = await searchArticles({
    page,
    perPage,
    sort,
    search,
  });

  return {
    articles,
    total,
    page,
    perPage,
    hasMore: page * perPage < total,
  };
};

export default function Articles({ data }) {
  return (
    <div>
      <h1>Articles</h1>
      {data.articles.map((article) => (
        <article key={article.id}>
          <h2>{article.title}</h2>
          <p>{article.excerpt}</p>
        </article>
      ))}
      {data.hasMore && <a href={`?page=${data.page + 1}`}>Next Page</a>}
    </div>
  );
}
```

## Example 3: Dynamic Blog Post with Slug

```typescript
// src/posts/($slug).tsx
import type { AdvancedRouteConfig, RouteGuard } from "jenjs";

const loadPost: RouteGuard = async (ctx) => {
  const post = await getPostBySlug(ctx.params.slug);
  if (!post) {
    // Let this route show a 404 for missing posts
    ctx.data = { notFound: true };
  } else {
    ctx.data = { post };
  }
  return true;
};

export const routeConfig: AdvancedRouteConfig = {
  guards: [loadPost],
};

export const loader = async (ctx) => {
  if (ctx.data?.notFound) {
    // Return default data or null
    return { post: null };
  }

  const post = await getPostBySlug(ctx.params.slug);

  // Get related posts
  const relatedPosts = await getRelatedPosts(post.id, 3);

  return {
    post,
    relatedPosts,
  };
};

export function Head({ params }) {
  const post = useContext().data?.post;
  return (
    <>
      <title>{post?.title} - My Blog</title>
      <meta name="description" content={post?.excerpt} />
      <meta property="og:title" content={post?.title} />
    </>
  );
}

export default function Post({ data, params }) {
  if (!data.post) {
    return <h1>Post not found: {params.slug}</h1>;
  }

  return (
    <article>
      <h1>{data.post.title}</h1>
      <div>{data.post.content}</div>
      <section>
        <h2>Related Posts</h2>
        {data.relatedPosts.map((post) => (
          <a key={post.id} href={`/posts/${post.slug}`}>
            {post.title}
          </a>
        ))}
      </section>
    </article>
  );
}
```

## Example 4: API Route with Guard

```typescript
// src/api/todos/($id).tsx
import type { AdvancedRouteConfig, RouteGuard } from "jenjs";

const requireApiKey: RouteGuard = async (ctx) => {
  const apiKey = ctx.headers["x-api-key"];
  if (!apiKey || !isValidApiKey(apiKey)) {
    return { status: 401, location: "/api/unauthorized" };
  }
  return true;
};

const requireTodoOwnership: RouteGuard = async (ctx) => {
  const todo = await getTodo(ctx.params.id);
  if (!todo) {
    return { status: 404, location: "/api/not-found" };
  }

  const apiKey = ctx.headers["x-api-key"];
  const user = await getUserByApiKey(apiKey);

  if (todo.userId !== user.id) {
    return { status: 403, location: "/api/forbidden" };
  }

  ctx.data = { todo, user };
  return true;
};

export const routeConfig: AdvancedRouteConfig = {
  guards: [requireApiKey, requireTodoOwnership],
};

export const loader = async (ctx) => {
  return {
    todo: ctx.data.todo,
  };
};

export default function TodoHandler({ data }) {
  return JSON.stringify(data.todo);
}
```

## Example 5: Catch-all Documentation Route

```typescript
// src/docs/(...path).tsx
import type { AdvancedRouteConfig } from "jenjs";
import { readFileSync } from "fs";
import { join } from "path";

export const routeConfig: AdvancedRouteConfig = {
  querySchema: {
    version: {
      type: "string",
      enum: ["1.0", "2.0", "latest"],
      default: "latest",
    },
  },
};

export const loader = async (ctx) => {
  // ctx.params.path = "api/fetch" or "guides/getting-started"
  const docPath = ctx.params.path.split("/");
  const docFile = join(process.cwd(), "docs", ...docPath) + ".md";

  try {
    const content = readFileSync(docFile, "utf-8");
    return { content, version: ctx.query.version };
  } catch {
    return { content: null, version: ctx.query.version };
  }
};

export default function Documentation({ data, params }) {
  if (!data.content) {
    return (
      <div>
        <h1>Documentation Not Found</h1>
        <p>Could not find: {params.path}</p>
      </div>
    );
  }

  return (
    <div>
      <p>Version: {data.version}</p>
      <div>{data.content}</div>
    </div>
  );
}
```

## Example 6: User Profile with Authentication

```typescript
// src/profile/($username).tsx
import type { AdvancedRouteConfig, RouteGuard } from "jenjs";

const requireAuth: RouteGuard = async (ctx) => {
  if (!ctx.cookies.sessionId) {
    return { status: 302, location: `/login?redirect=/profile/${ctx.params.username}` };
  }
  return true;
};

const loadUserProfile: RouteGuard = async (ctx) => {
  const user = await getUserByUsername(ctx.params.username);
  if (!user) {
    ctx.data = { notFound: true };
  } else {
    ctx.data = { user };
  }
  return true;
};

export const routeConfig: AdvancedRouteConfig = {
  guards: [requireAuth, loadUserProfile],
};

export const loader = async (ctx) => {
  if (ctx.data?.notFound) {
    return { user: null };
  }

  const user = ctx.data.user;
  const posts = await getUserPosts(user.id);
  const followers = await getFollowers(user.id);

  return { user, posts, followers };
};

export default function UserProfile({ data, params }) {
  if (!data.user) {
    return <div>User not found: {params.username}</div>;
  }

  return (
    <div>
      <h1>{data.user.name}</h1>
      <p>@{params.username}</p>
      <p>{data.followers} followers</p>

      <section>
        <h2>Posts ({data.posts.length})</h2>
        {data.posts.map((post) => (
          <div key={post.id}>{post.title}</div>
        ))}
      </section>
    </div>
  );
}
```

## Example 7: Query Parameter Redirection

```typescript
// src/search/(home).tsx
import type { AdvancedRouteConfig } from "jenjs";

export const routeConfig: AdvancedRouteConfig = {
  // Redirect to homepage if no query
  redirect: {
    to: (ctx) => {
      if (!ctx.query.q) {
        return "/";
      }
      return null; // Allow the route to render
    },
  },
  querySchema: {
    q: { required: true, type: "string" },
    type: { type: "string", enum: ["posts", "users", "tags"], default: "posts" },
  },
};

export const loader = async (ctx) => {
  const results = await search(ctx.query.q, ctx.query.type);
  return { results, query: ctx.query.q, type: ctx.query.type };
};

export default function Search({ data }) {
  return (
    <div>
      <h1>Search Results for: {data.query}</h1>
      <p>Type: {data.type}</p>
      {data.results.map((result) => (
        <div key={result.id}>{result.title}</div>
      ))}
    </div>
  );
}
```

## Example 8: App Config with Redirects

```typescript
// jen.config.ts
import type { FrameworkConfig } from "jenjs";

export default {
  siteDir: "src",
  distDir: "dist",

  // URL rewriting at app level
  redirects: [
    // Old blog structure to new
    { from: "/blog/*", to: "/posts/*", status: 301 },

    // Product pages
    { from: "/products/old-product", to: "/products/new-product", status: 301 },

    // Temp redirects
    { from: "/promo", to: "/offers/summer-2024", status: 302 },

    // Deprecations
    { from: "/api/v1/*", to: "/api/v2/*", status: 301 },
  ],

  routes: {
    fileExtensions: [".tsx", ".ts", ".jsx", ".js"],
    routeFilePattern: /^\(([^)]+)\)/,
    enableIndexFallback: true,
  },

  rendering: {
    defaultMode: "ssg",
    defaultRevalidateSeconds: 3600,
  },

  // ... rest of config
} as FrameworkConfig;
```

## Example 9: Rate-Limited API Endpoint

```typescript
// src/api/data/(endpoint).tsx
import type { AdvancedRouteConfig, RouteGuard } from "jenjs";

const rateLimiter = new Map<string, { count: number; resetTime: number }>();

const checkRateLimit: RouteGuard = async (ctx) => {
  const clientId = ctx.headers["x-client-id"] || ctx.headers["x-forwarded-for"];
  if (!clientId) {
    return { status: 400, location: "/api/error" };
  }

  const now = Date.now();
  const record = rateLimiter.get(clientId);

  if (record && record.resetTime > now) {
    if (record.count >= 100) {
      return { status: 429, location: "/api/rate-limited" };
    }
    record.count++;
  } else {
    rateLimiter.set(clientId, { count: 1, resetTime: now + 60000 });
  }

  return true;
};

export const routeConfig: AdvancedRouteConfig = {
  guards: [checkRateLimit],
};

export const loader = async (ctx) => {
  return { data: await fetchData(ctx.params.endpoint) };
};

export default function ApiEndpoint({ data }) {
  return JSON.stringify(data);
}
```

## Example 10: Multilingual Routes

```typescript
// src/(lang).tsx (root route with language parameter)
import type { AdvancedRouteConfig, RouteGuard } from "jenjs";

const validateLanguage: RouteGuard = async (ctx) => {
  const validLanguages = ["en", "es", "fr", "de"];
  if (!validLanguages.includes(ctx.params.lang)) {
    return { status: 302, location: "/en" };
  }
  ctx.data = { language: ctx.params.lang };
  return true;
};

export const routeConfig: AdvancedRouteConfig = {
  guards: [validateLanguage],
};

export const loader = async (ctx) => {
  const language = ctx.data.language;
  const messages = await loadMessages(language);
  return { messages, language };
};

export default function Home({ data }) {
  return <div>{data.messages.welcome}</div>;
}
```

---

These examples demonstrate the power and flexibility of the advanced routing system. Mix and match patterns to build complex, type-safe applications.
