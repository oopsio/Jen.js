# Release 16 Feature Showcase

Complete example demonstrating all new Jen.js features:

1. **Islands** - Selective client-side hydration
2. **Route Middleware** - Request processing hooks
3. **API Routes** - REST endpoints with HTTP methods
4. **Zero-JS** - Pure static HTML pages

## Features Demonstrated

### 1. Islands (Interactive Components)

**Pages**:
- `(home).tsx` - Counter with `client:load` strategy
- `(interactive).tsx` - Multiple islands with different strategies

**APIs**:
```tsx
import { Island } from "jenjs";
export const Counter = Island(CounterImpl, "load");
```

### 2. Route Middleware

**Pages**:
- `(protected-dashboard).tsx` - Protected page with auth middleware
- `(profile).tsx` - Profile page with middleware data

**APIs**:
```tsx
export const middleware = async (ctx) => {
  if (!ctx.cookies.auth) return ctx.redirect("/login");
  ctx.data.user = await getUser(ctx.cookies.auth);
};
```

### 3. API Routes

**Endpoints**:
- `/api/hello` - Basic GET endpoint
- `/api/counter` - GET/POST stateless counter
- `/api/users` - GET all users, POST new user
- `/api/users/[id]` - GET/PUT/DELETE single user

**Usage**:
```tsx
export const GET = async (ctx) => { /* ... */ };
export const POST = async (ctx) => { /* ... */ };
```

### 4. Zero-JS Pages

**Pages**:
- `(about).tsx` - Pure static page
- `(blog)/[slug].tsx` - Blog posts (no JS)
- `(docs).tsx` - Documentation (pure HTML)

**Usage**:
```tsx
export const hydrate = false;
```

## File Structure

```
release-16/
├── site/
│   ├── (home).tsx                    # Islands showcase
│   ├── (about).tsx                   # Zero-JS static page
│   ├── (interactive).tsx             # Multiple islands
│   ├── (protected-dashboard).tsx     # Middleware + auth
│   ├── (profile).tsx                 # Middleware data
│   ├── (login).tsx                   # Login form
│   ├── (blog)/
│   │   └── [slug].tsx               # Dynamic zero-JS route
│   ├── (docs).tsx                    # Docs (zero-JS)
│   ├── api/
│   │   ├── (hello).ts               # Basic API
│   │   ├── (counter).ts             # GET/POST
│   │   ├── users.ts                 # CRUD users
│   │   └── users/
│   │       └── [id].ts              # Dynamic API
│   ├── styles/
│   │   └── global.scss              # Global styles
│   └── assets/
│       └── logo.svg
├── jen.config.ts                     # Framework config
└── README.md                         # This file
```

## Running the Example

### From Project Root
```bash
npm run dev
```

### From Example Directory
```bash
cd example/release-16
node build.js  # For dev server
```

Navigate to:
- http://localhost:3000 - Islands showcase
- http://localhost:3000/about - Zero-JS page
- http://localhost:3000/interactive - Multiple islands
- http://localhost:3000/dashboard - Protected page (requires auth)
- http://localhost:3000/login - Login
- http://localhost:3000/blog/hello-world - Blog post

### API Endpoints
```bash
# Hello world
curl http://localhost:3000/api/hello

# Counter
curl http://localhost:3000/api/counter
curl -X POST http://localhost:3000/api/counter

# Users
curl http://localhost:3000/api/users
curl -X POST http://localhost:3000/api/users -H "Content-Type: application/json" -d '{"name":"John"}'
curl http://localhost:3000/api/users/1
curl -X PUT http://localhost:3000/api/users/1 -H "Content-Type: application/json" -d '{"name":"Jane"}'
curl -X DELETE http://localhost:3000/api/users/1
```

## Example Flows

### 1. Interactive Home Page (Islands)

```tsx
// site/(home).tsx
import { Island } from "jenjs";

const CounterImpl = ({ initial = 0 }) => {
  const [count, setCount] = createSignal(initial);
  return (
    <button onClick={() => setCount(count() + 1)}>
      Clicks: {count()}
    </button>
  );
};

export const Counter = Island(CounterImpl, "load");

export default function Home() {
  return (
    <div>
      <h1>Welcome to Jen.js</h1>
      <p>Static content</p>
      <Counter initial={5} />
    </div>
  );
}
```

### 2. Protected Dashboard (Middleware)

```tsx
// site/(protected-dashboard).tsx
import { redirect } from "jenjs";

export const middleware = async (ctx) => {
  // Check if user has session
  if (!ctx.cookies.auth) {
    return ctx.redirect("/login");
  }
  
  // Attach user data
  ctx.data.user = {
    id: "123",
    name: "John Doe",
    email: "john@example.com"
  };
};

export async function loader(ctx) {
  return { user: ctx.data.user };
}

export default function Dashboard({ data }) {
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome {data.user.name}</p>
      <p>Email: {data.user.email}</p>
    </div>
  );
}
```

### 3. API Route (Users)

```tsx
// site/api/users.ts
let users = [
  { id: 1, name: "Alice", email: "alice@example.com" },
  { id: 2, name: "Bob", email: "bob@example.com" }
];

export const GET = async (ctx) => {
  return { users };
};

export const POST = async (ctx) => {
  const { name, email } = ctx.body;
  const user = { id: users.length + 1, name, email };
  users.push(user);
  ctx.res.statusCode = 201;
  return { user };
};

// site/api/users/[id].ts
export const GET = (ctx) => {
  const user = users.find(u => u.id === parseInt(ctx.params.id));
  return user ? { user } : { error: "Not found" };
};

export const PUT = async (ctx) => {
  const user = users.find(u => u.id === parseInt(ctx.params.id));
  if (!user) return { error: "Not found" };
  Object.assign(user, ctx.body);
  return { user };
};

export const DELETE = async (ctx) => {
  users = users.filter(u => u.id !== parseInt(ctx.params.id));
  return { deleted: true };
};
```

### 4. Static Blog Post (Zero-JS)

```tsx
// site/(blog)/[slug].tsx
export const hydrate = false;

const blogPosts = {
  "hello-world": {
    title: "Hello World",
    date: "2026-02-03",
    content: "Welcome to the blog!"
  },
  "jen-is-awesome": {
    title: "Jen is Awesome",
    date: "2026-02-02",
    content: "Learn why Jen.js is the best framework..."
  }
};

export async function loader(ctx) {
  const post = blogPosts[ctx.params.slug];
  if (!post) throw new Error("Post not found");
  return { post };
}

export default function BlogPost({ data }) {
  return (
    <article>
      <h1>{data.post.title}</h1>
      <time>{data.post.date}</time>
      <div>{data.post.content}</div>
    </article>
  );
}
```

## Testing the Features

### Test Islands
1. Open http://localhost:3000
2. Click the counter button
3. See count increase (client-side interactivity)
4. Check Network tab - only 1 hydration script loaded

### Test Middleware
1. Visit http://localhost:3000/dashboard
2. Should redirect to /login (middleware blocked it)
3. Manually set cookie: `document.cookie = "auth=test"`
4. Refresh - now you can see the dashboard

### Test API Routes
```bash
# Test GET
curl http://localhost:3000/api/users

# Test POST
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Charlie","email":"charlie@example.com"}'

# Test dynamic route
curl http://localhost:3000/api/users/1

# Test PUT
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated","email":"updated@example.com"}'

# Test DELETE
curl -X DELETE http://localhost:3000/api/users/1
```

### Test Zero-JS
1. Open http://localhost:3000/about
2. Check Network tab - no hydration script
3. Check Elements - no `__FRAMEWORK_DATA__` script
4. Page is pure HTML only

## Performance Notes

### Islands
- `(home)` - ~2KB hydration overhead
- `(interactive)` - Multiple islands, one hydration script
- Network tab shows one hydration request

### Middleware
- Dashboard protection happens server-side
- No performance penalty on client
- Middleware overhead: ~1-5ms per request

### API Routes
- `/api/users` returns JSON quickly
- Standard REST patterns
- No SSR overhead

### Zero-JS Pages
- `/about`, `/blog/*`, `/docs` have zero JS overhead
- Pure HTML output
- Fastest possible page loads

## Browser Support

- Modern browsers (ES2022)
- Fallback for requestIdleCallback (islands "idle")
- Fallback for IntersectionObserver (islands "visible")

## Next Steps

1. **Customize for your use case**
   - Update example routes
   - Add your own API endpoints
   - Create more islands

2. **Build for production**
   ```bash
   npm run build
   npm run start
   ```

3. **Deploy**
   - Static (zero-JS) routes work anywhere
   - Hydration-enabled routes need JS runtime
   - API routes need node/deno runtime

## Learning Resources

- `FEATURES.md` - Complete API reference
- `QUICK_START.md` - Quick code examples
- `IMPLEMENTATION_GUIDE.md` - Architecture deep-dive
- Example files in this directory

---

**Status**: ✅ Ready to explore  
**Last Updated**: February 3, 2026
