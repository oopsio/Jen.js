# Performance

Optimize your Jen.js application for speed and efficiency.

## Build Performance

### Faster Builds

Use incremental builds:

```bash
npm run build -- --incremental
```

Only rebuilds changed routes.

### Caching

Enable build caching:

```typescript
const config = {
  cache: {
    enabled: true,
    dir: '.jen-cache'
  }
};
```

### Parallel Builds

Jen.js automatically parallelizes:
- Route compilation
- Asset processing
- Page rendering

Adjust workers:

```typescript
const config = {
  build: {
    workers: 4  // CPU cores
  }
};
```

## Runtime Performance

### Minimize JavaScript

```typescript
// Only load interactivity when needed
const Counter = lazy(() => import('./counter.tsx'));

export default function Page() {
  return (
    <html>
      <head><title>Page</title></head>
      <body>
        <Suspense fallback={<div>Loading...</div>}>
          <Counter />
        </Suspense>
      </body>
    </html>
  );
}
```

### Use SSG When Possible

Pre-build static pages:

```typescript
// site/(about).tsx
export const mode = 'ssg';  // Pre-render

export default function About() {
  return <h1>About</h1>;
}
```

### Cache Database Queries

```typescript
const cache = new Map();

async function getCachedUser(id) {
  if (cache.has(id)) {
    return cache.get(id);
  }
  
  const user = await db.findOne('users', { id });
  cache.set(id, user);
  
  // Invalidate after 5 minutes
  setTimeout(() => cache.delete(id), 300000);
  
  return user;
}
```

### Use HTTP Caching

```typescript
export async function loader(ctx) {
  ctx.response.setHeader('Cache-Control', 'public, max-age=3600');
  return { data: await fetchData() };
}
```

## Database Optimization

### Use Indexes

```typescript
await db.exec('CREATE INDEX idx_email ON users(email)');
```

### Connection Pooling

```typescript
const config = {
  database: {
    default: {
      pool: {
        min: 2,
        max: 10
      }
    }
  }
};
```

### Query Optimization

```typescript
// Good: Single query
const user = await db.findOne('users', { id: 1 });

// Bad: Multiple queries (N+1)
const users = await db.find('users', {});
for (const user of users) {
  user.profile = await db.findOne('profiles', { userId: user.id });
}
```

## Bundle Size

### Check Bundle Size

```bash
npm run build -- --analyze
```

### Remove Unused Code

Tree-shaking removes unused exports:

```typescript
// Good: Named imports
import { Component } from '@src/components';

// Avoid: Namespace imports
import * as Components from '@src/components';
```

### Lazy Loading

```typescript
import { lazy, Suspense } from 'preact/compat';

const HeavyComponent = lazy(() => import('./heavy.tsx'));

export default function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  );
}
```

## Compression

Enable gzip compression:

```typescript
// src/middleware/compression.ts
import { createGzip } from 'node:zlib';

export function compressionMiddleware(req, res, next) {
  if (/gzip/.test(req.headers['accept-encoding'] || '')) {
    res.setHeader('Content-Encoding', 'gzip');
    const gzip = createGzip();
    gzip.pipe(res);
    res.write = (chunk) => gzip.write(chunk);
    res.end = (chunk) => gzip.end(chunk);
  }
  next();
}
```

## Monitoring

### Build Time Tracking

```bash
npm run build -- --verbose --time
```

Shows timing for each phase.

### Runtime Monitoring

```typescript
export async function loader(ctx) {
  const start = Date.now();
  
  const data = await fetchData();
  
  const duration = Date.now() - start;
  console.log(`Loader took ${duration}ms`);
  
  return { data };
}
```

### Memory Profiling

```bash
node --inspect build.js
# Open chrome://inspect
```

## CDN Configuration

```typescript
export async function loader(ctx) {
  // Enable browser caching
  ctx.response.setHeader('Cache-Control', 'public, max-age=31536000');
  
  // Version static assets
  // /assets/bundle-abc123.js
  
  return { /* ... */ };
}
```

## Performance Checklist

- [ ] Use SSG for static content
- [ ] Enable HTTP caching
- [ ] Minify production builds
- [ ] Use database indexes
- [ ] Implement query caching
- [ ] Compress responses
- [ ] Use CDN for assets
- [ ] Monitor build times
- [ ] Track runtime performance
- [ ] Profile memory usage
- [ ] Remove unused dependencies
- [ ] Use lazy loading for heavy components
- [ ] Implement rate limiting
- [ ] Use pagination for large data
- [ ] Monitor error rates

## Profiling Tools

### Node.js Profiler

```bash
node --prof build.js
node --prof-process isolate-*.log > profile.txt
```

### Clinic.js

```bash
npm install -g clinic
clinic doctor -- npm run build
```

### Artillery

Load testing:

```bash
npm install -g artillery
artillery quick --count 10 --num 100 http://localhost:3000
```

## Best Practices

1. Measure before optimizing
2. Focus on bottlenecks
3. Use caching strategically
4. Optimize database queries
5. Monitor in production
6. Test performance regularly
7. Use appropriate compression
8. Implement pagination
9. Use CDN for static assets
10. Profile regularly
