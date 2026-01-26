---
sidebar_position: 14
---

# Build System

Understand how Jen.js builds your site for production.

## Build Modes

### SSG (Static Site Generation)

Build entire site to static HTML at build time:

```bash
npm run build
```

Output in `dist/`:

```
dist/
├── index.html
├── about/
│   └── index.html
├── posts/
│   ├── 1/
│   │   └── index.html
│   └── 2/
│       └── index.html
└── assets/
    └── ...
```

**Pros:**
- Fast serving
- Works on any static host
- Great SEO
- Cheap hosting

**Cons:**
- Slower builds
- Limited dynamic routes
- Need rebuild for updates

### SSR (Server-Side Rendering)

Build assets, serve pages on-demand:

```bash
npm run build
npm run start
```

**Pros:**
- Instant updates
- Unlimited dynamic routes
- Personalized content
- Real-time data

**Cons:**
- Slower page loads
- Server required
- Higher hosting cost

## Build Process

### 1. Route Discovery

Jen.js scans your `site/` directory for routes:

```
site/
├── (home).tsx
├── posts/
│   └── ($id).tsx
└── api/
    └── (users).ts
```

Routes are discovered automatically.

### 2. Bundling

JavaScript and CSS are bundled with esbuild:

```bash
# Development (slow, readable output)
npm run build -- --dev

# Production (optimized, minified)
npm run build -- --prod
```

### 3. Rendering

For SSG, routes are rendered to static HTML:

```typescript
// Rendering engine processes each route
export default function Home() {
  return <h1>Hello</h1>;
}

// → becomes → <h1>Hello</h1> in HTML
```

### 4. Optimization

Assets are optimized:

- **CSS**: Minified, unused styles removed
- **JavaScript**: Minified, dead code eliminated
- **Images**: Compressed, resized
- **HTML**: Minified

### 5. Output

Final optimized files written to `dist/`.

## Configuration

Configure build behavior in `jen.config.ts`:

```typescript
const config: FrameworkConfig = {
  // Input/output directories
  siteDir: 'site',
  distDir: 'dist',
  
  // Build settings
  build: {
    minify: true,
    sourcemap: false,
    target: 'es2022'
  },
  
  // Rendering
  rendering: {
    defaultMode: 'ssg',
    defaultRevalidateSeconds: 3600
  },
  
  // Routing
  routes: {
    fileExtensions: ['.tsx', '.jsx', '.ts', '.js'],
    routeFilePattern: /^\((.+)\)\.(t|j)sx?$/
  }
};

export default config;
```

## Build Environment

Set environment for build:

```bash
# Development build
NODE_ENV=development npm run build

# Production build
NODE_ENV=production npm run build
```

Detect in your code:

```typescript
export async function loader(ctx: LoaderContext) {
  if (process.env.NODE_ENV === 'production') {
    // Use production API
    return await fetch('https://api.example.com/data');
  } else {
    // Use local API
    return await fetch('http://localhost:3000/api/data');
  }
}
```

## Code Splitting

Automatically split code by route:

```typescript
// Each route gets its own bundle
site/(home).tsx        → home.js
site/(about).tsx       → about.js
site/posts/($id).tsx   → posts.js
```

### Dynamic Imports

Lazy load components:

```typescript
import { lazy, Suspense } from 'preact';

const HeavyChart = lazy(() => import('./Chart.tsx'));

export default function Dashboard() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <HeavyChart />
    </Suspense>
  );
}
```

## Tree Shaking

Remove unused code automatically:

```typescript
// lib.ts
export function used() { /* ... */ }
export function unused() { /* ... */ }

// route.tsx
import { used } from './lib.ts';

used();  // Included in bundle
// unused() is removed
```

## Asset Handling

Reference static assets:

```typescript
// Reference files in site/assets/
export default function Home() {
  return (
    <div>
      <img src="/assets/logo.png" alt="Logo" />
      <video src="/assets/intro.mp4" controls></video>
    </div>
  );
}
```

Build copies assets to `dist/assets/`.

## Environment Variables

Access env vars in code:

```typescript
export async function loader(ctx: LoaderContext) {
  const apiKey = process.env.API_KEY;
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  
  return { apiKey, baseUrl };
}
```

Set via `.env` file:

```
API_KEY=secret123
BASE_URL=https://example.com
DATABASE_URL=postgresql://...
```

Or command line:

```bash
API_KEY=secret npm run build
```

## Build Optimization

### CSS Optimization

```typescript
const config: FrameworkConfig = {
  build: {
    css: {
      minify: true,
      removeUnused: true
    }
  }
};
```

### JavaScript Optimization

```typescript
const config: FrameworkConfig = {
  build: {
    minify: true,
    compress: true,
    mangle: true
  }
};
```

### Image Optimization

```typescript
const config: FrameworkConfig = {
  build: {
    images: {
      optimized: true,
      maxWidth: 1920
    }
  }
};
```

## Incremental Builds

Rebuild only changed files:

```bash
# Use cache for faster rebuilds
npm run build -- --incremental
```

## Monitoring Build Time

Check build performance:

```typescript
// Get build stats
npm run build -- --stats
```

Output:

```
Build Time: 12.3s
Routes: 45
Assets: 234KB
JS Bundle: 156KB
CSS Bundle: 23KB
```

## Production Checklist

Before deploying to production:

- [ ] Run TypeScript check: `npm run typecheck`
- [ ] Build succeeds: `npm run build`
- [ ] No console errors
- [ ] All routes work
- [ ] API endpoints respond
- [ ] Images load correctly
- [ ] CSS applies properly
- [ ] Database connection works
- [ ] Environment variables set
- [ ] Error pages configured

## Deployment Build

Generate optimized production build:

```bash
# Clean previous build
npm run clean

# Full production build
NODE_ENV=production npm run build
```

## Build Hooks

Plugins can hook into build process:

```typescript
export default {
  name: 'build-hook-plugin',
  
  onBuild: async (context: BuildContext) => {
    console.log(`Building ${context.routes.length} routes`);
    
    // Generate additional files
    await generateSitemap(context);
    await generateRSSFeed(context);
    await generateRobots(context);
  }
};
```

## Troubleshooting

### Build fails with TypeScript error

```bash
npm run typecheck
# Fix reported errors
npm run build
```

### Out of memory on large builds

```bash
# Increase Node memory
NODE_OPTIONS=--max-old-space-size=4096 npm run build
```

### Build is slow

```bash
# Use incremental builds
npm run build -- --incremental

# Skip source maps
npm run build -- --no-sourcemap
```

### Static assets not found

Check assets are in `site/assets/`:

```
site/
└── assets/
    ├── logo.png
    └── styles.css
```

Reference as `/assets/filename`.

## Next Steps

- [Deployment](./deployment) - Deploy your build
- [Performance](./performance) - Optimize build output
- [Native Modules](./native-modules) - Compile Rust code
