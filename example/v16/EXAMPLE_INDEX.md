# Release 16 Example - Complete Feature Showcase

Complete working example demonstrating all 4 major features of Jen.js Release 16.

## 📁 Directory Structure

```
release-16/
├── site/                           # Your application code
│   ├── (home).tsx                 # ⭐ Islands showcase
│   ├── (about).tsx                # ⭐ Zero-JS example
│   ├── (interactive).tsx          # ⭐ Multiple islands with different strategies
│   ├── (protected-dashboard).tsx  # ⭐ Middleware + auth + data
│   ├── (login).tsx                # ⭐ Login form island
│   ├── (docs).tsx                 # ⭐ Documentation (zero-JS)
│   ├── (blog)/
│   │   └── [slug].tsx            # ⭐ Dynamic zero-JS route
│   ├── api/
│   │   ├── (hello).ts            # ⭐ Simple API
│   │   ├── users.ts              # ⭐ CRUD list
│   │   └── users/
│   │       └── [id].ts           # ⭐ Dynamic CRUD
│   └── styles/
│       └── global.scss            # Global styles
├── jen.config.ts                  # Framework configuration
├── package.json                   # Package metadata
├── README.md                       # Getting started guide
└── EXAMPLE_INDEX.md               # This file
```

## 🎯 Features Demonstrated

### 1. **Islands** 🏝️

**Pages Using Islands**:

- `site/(home).tsx` - Counter with `client:load` strategy
- `site/(interactive).tsx` - Multiple islands (load, idle, visible)
- `site/(login).tsx` - Login form island

**Key Concepts**:

- Mark components as islands
- Three hydration strategies (load, idle, visible)
- Server renders HTML, client hydrates selectively
- Rest of page stays static

**Files to Study**:

1. `site/(home).tsx` - Start here, simplest example
2. `site/(interactive).tsx` - Multiple strategies
3. `site/(login).tsx` - Form interaction

### 2. **Route Middleware** 🔐

**Pages Using Middleware**:

- `site/(protected-dashboard).tsx` - Authentication + authorization
- `site/(login).tsx` - Also has middleware logic

**Key Concepts**:

- Middleware runs before rendering
- Can redirect or short-circuit
- Attach data for loader/page
- Perfect for auth, logging, data fetching

**Files to Study**:

1. `site/(protected-dashboard).tsx` - Auth example
2. `site/(login).tsx` - Form submission

**Example Flow**:

```
Request to /dashboard
  ↓
Middleware checks auth cookie
  ├─ No cookie? Redirect to /login
  └─ Has cookie? Load user data, attach to ctx.data
  ↓
Loader receives ctx.data
  ↓
Page renders with user data
```

### 3. **API Routes** 🌐

**API Endpoints**:

- `GET /api/hello` - Simple endpoint
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `GET /api/users/[id]` - Get user
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user

**Files to Study**:

1. `site/api/(hello).ts` - Start here, simplest API
2. `site/api/users.ts` - GET/POST handlers
3. `site/api/users/[id].ts` - Dynamic routes, all CRUD methods

**Testing APIs**:

```bash
# Hello
curl http://localhost:3000/api/hello?name=Alice

# Users
curl http://localhost:3000/api/users
curl -X POST http://localhost:3000/api/users -H "Content-Type: application/json" -d '{"name":"Dave","email":"dave@example.com"}'
curl http://localhost:3000/api/users/1
curl -X PUT http://localhost:3000/api/users/1 -H "Content-Type: application/json" -d '{"name":"Updated"}'
curl -X DELETE http://localhost:3000/api/users/1
```

### 4. **Zero-JS Pages** 📄

**Zero-JS Pages**:

- `site/(about).tsx` - Pure static about page
- `site/(blog)/[slug].tsx` - Dynamic blog posts
- `site/(docs).tsx` - Documentation

**Key Concepts**:

- `export const hydrate = false`
- No client-side JavaScript
- Works with loaders and middleware
- Perfect for static content

**Benefits**:

- Blazing fast (no JS parsing)
- Works without JavaScript
- Better SEO
- Smaller bundle size

**Files to Study**:

1. `site/(about).tsx` - Simplest zero-JS example
2. `site/(docs).tsx` - More complex zero-JS
3. `site/(blog)/[slug].tsx` - Dynamic + zero-JS

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# From repo root
cd example/release-16

# Install dependencies (should already be done)
npm install
```

### Development

```bash
npm run dev
```

Navigate to:

- http://localhost:3000 - Home (Islands)
- http://localhost:3000/about - Zero-JS page
- http://localhost:3000/interactive - Multiple islands
- http://localhost:3000/login - Login form
- http://localhost:3000/dashboard - Protected page (requires login)
- http://localhost:3000/blog/hello-world - Blog post (dynamic zero-JS)
- http://localhost:3000/docs - Documentation

### Production Build

```bash
npm run build  # Build static site to dist/
npm run start  # Run production server
```

## 📚 Learning Path

### Beginner

1. **Understand Islands**
   - Visit http://localhost:3000
   - Open DevTools Network tab
   - Click counter button
   - Notice only 1 hydration script loaded

2. **Understand Zero-JS**
   - Visit http://localhost:3000/about
   - Check Network tab - no hydration script
   - Disable JavaScript and reload - still works!

3. **Read Code**
   - `site/(home).tsx` - Simple island
   - `site/(about).tsx` - Simple zero-JS

### Intermediate

1. **Multiple Islands**
   - Visit http://localhost:3000/interactive
   - See different hydration strategies
   - Review code: `site/(interactive).tsx`

2. **Route Middleware**
   - Visit http://localhost:3000/dashboard
   - Gets redirected to /login (middleware)
   - Set cookie and try again
   - Review code: `site/(protected-dashboard).tsx`

3. **API Routes**
   - Test endpoints with curl
   - Review code: `site/api/users.ts` and `site/api/users/[id].ts`

### Advanced

1. **Combine Features**
   - Protected page with islands
   - Zero-JS with middleware
   - API routes feeding islands

2. **Extend Example**
   - Add more islands
   - Add more API endpoints
   - Add more middleware logic

## 🔬 Code Examples

### Simple Island

```tsx
// site/(home).tsx
import { Island } from "jenjs";

const Counter = ({ initial = 0 }) => {
  const [count, setCount] = createSignal(initial);
  return <button onClick={() => setCount(count() + 1)}>{count()}</button>;
};

export const Counter = Island(Counter, "load");

export default function Home() {
  return <Counter initial={5} />;
}
```

### Route Middleware

```tsx
// site/(protected-dashboard).tsx
export const middleware = async (ctx) => {
  if (!ctx.cookies.auth) return ctx.redirect("/login");
  ctx.data.user = await getUser(ctx.cookies.auth);
};

export async function loader(ctx) {
  return { user: ctx.data.user };
}

export default function Dashboard({ data }) {
  return <h1>Welcome {data.user.name}</h1>;
}
```

### API Route

```tsx
// site/api/users.ts
export const GET = async (ctx) => {
  const users = await db.users.list();
  return { users };
};

export const POST = async (ctx) => {
  const user = await db.users.create(ctx.body);
  ctx.res.statusCode = 201;
  return { user };
};
```

### Zero-JS Page

```tsx
// site/(about).tsx
export const hydrate = false;

export default function About() {
  return <h1>Pure HTML Page</h1>;
}
```

## 🧪 Testing

### Manual Testing

**Islands**:

1. Open http://localhost:3000
2. Click counter - should increment
3. Check DevTools console - no errors

**Middleware**:

1. Open http://localhost:3000/dashboard
2. Should redirect to /login
3. Submit login form
4. Check cookies - `auth` cookie set
5. Visit /dashboard again - should work

**API Routes**:

```bash
curl http://localhost:3000/api/users
curl http://localhost:3000/api/users/1
```

**Zero-JS**:

1. Open http://localhost:3000/about
2. DevTools Network - no hydration script
3. DevTools Console - disable JavaScript
4. Reload page - still works

### Browser Compatibility

✅ **Tested on**:

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

⚠️ **Note**: Some hydration strategies require modern browsers:

- `idle` requires `requestIdleCallback`
- `visible` requires `IntersectionObserver`
- Fallback to `load` in older browsers

## 📊 Performance Metrics

### Typical Page Loads

| Page        | Type                 | JS Bundle | Load Time |
| ----------- | -------------------- | --------- | --------- |
| Home        | Islands              | ~3KB      | ~500ms    |
| Interactive | Multiple islands     | ~5KB      | ~800ms    |
| About       | Zero-JS              | 0KB       | ~100ms    |
| Blog        | Zero-JS + Middleware | ~1KB      | ~150ms    |
| Dashboard   | Middleware + Islands | ~4KB      | ~700ms    |

_Metrics are approximate and depend on network/hardware_

## 🛠️ Customization

### Add New Island

```tsx
// site/api/new-island.ts
import { Island } from "jenjs";

const MyComponent = () => {
  /* ... */
};
export const MyIsland = Island(MyComponent, "load");
```

### Add New API Endpoint

```tsx
// site/api/my-endpoint.ts
export const GET = async (ctx) => {
  return { data: "..." };
};

export const POST = async (ctx) => {
  return { created: true };
};
```

### Add New Route

```tsx
// site/(my-page).tsx
export default function MyPage() {
  return <h1>My Page</h1>;
}
```

## 🐛 Troubleshooting

### Islands not working?

- Check browser console for errors
- Verify hydration strategy matches usage
- Ensure component props are JSON serializable

### Middleware not running?

- Verify middleware export
- Check redirect/json short-circuits
- Use browser dev tools to inspect request

### API routes not responding?

- Check HTTP method (GET, POST, etc.)
- Verify route path
- Check request/response format

### Zero-JS pages showing hydration script?

- Verify `export const hydrate = false`
- Check file is exported from route component
- Rebuild and clear cache

## 📖 Documentation Links

- [FEATURES.md](../../FEATURES.md) - Complete API reference
- [QUICK_START.md](../../QUICK_START.md) - Quick code examples
- [IMPLEMENTATION_GUIDE.md](../../IMPLEMENTATION_GUIDE.md) - Architecture
- [README.md](./README.md) - This example guide

## 🎓 Learning Resources

### Concepts

- Read about [Islands Architecture](https://jasonformat.com/islands-architecture/)
- Learn about [Server Components](https://vercel.com/blog/server-components)
- Understand [Hydration](https://web.dev/rendering-on-the-web/)

### Related Frameworks

- [Astro](https://astro.build/) - Islands pioneer
- [Fresh](https://fresh.deno.dev/) - Islands + Deno
- [Next.js 13](https://nextjs.org/) - Server Components

## 🤝 Contributing

Found an issue? Have an improvement?

1. File an issue on GitHub
2. Submit a pull request
3. Discuss in Discussions

## 📄 License

This example is part of Jen.js, licensed under MIT.

---

**Happy coding! 🚀**

For questions or feedback, check out the main Jen.js documentation or open an issue on GitHub.
