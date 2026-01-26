---
sidebar_position: 17
---

# Performance Optimization

Build fast, efficient Jen.js applications.

## Performance Metrics

Key metrics to measure:

- **FCP** (First Contentful Paint) - When first content appears
- **LCP** (Largest Contentful Paint) - When largest content appears
- **CLS** (Cumulative Layout Shift) - Visual stability
- **FID** (First Input Delay) - Responsiveness
- **TTFB** (Time to First Byte) - Server speed

## Measuring Performance

### Web Vitals

Track Core Web Vitals in your routes:

```typescript
// site/components/Analytics.tsx

import { useEffect } from 'preact/hooks';

export default function Analytics() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'web-vitals' in window) {
      const { getCLS, getFID, getFCP, getLCP, getTTFB } = 
        (window as any)['web-vitals'];
      
      getCLS(console.log);
      getFID(console.log);
      getFCP(console.log);
      getLCP(console.log);
      getTTFB(console.log);
    }
  }, []);
  
  return null;
}
```

### Browser DevTools

Use Chrome DevTools Performance tab:

1. Open DevTools (F12)
2. Go to Performance tab
3. Click Record
4. Interact with page
5. Click Stop
6. Analyze timeline

### Lighthouse

Run Lighthouse audit:

```bash
# CLI
npm install -g lighthouse
lighthouse https://example.com --view

# Chrome DevTools
# F12 → Lighthouse → Generate report
```

## Build Performance

### Code Splitting

Automatically split at route boundaries:

```typescript
// Each route loads independently
site/(home).tsx        → home.js
site/(about).tsx       → about.js
site/(blog).tsx        → blog.js
```

### Lazy Loading

Defer non-critical components:

```typescript
import { lazy, Suspense } from 'preact';

const HeavyComponent = lazy(() => import('./Heavy.tsx'));

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  );
}
```

### Tree Shaking

Remove unused code automatically:

```typescript
// Only imported functions are included
import { used } from '@src/utils';

used();  // Included
// unused() not included - removed by bundler
```

### Bundle Analysis

Check bundle size:

```bash
npm run build -- --analyze
```

## JavaScript Optimization

### Minimize Dependencies

Use lightweight alternatives:

```typescript
// Heavy
import moment from 'moment';  // 67KB

// Light
import dayjs from 'dayjs';    // 2KB
```

### Remove Console Logs

Strip in production:

```typescript
const config: FrameworkConfig = {
  build: {
    drop: ['console']  // Remove console.log in production
  }
};
```

### Defer Non-Critical Scripts

Load scripts asynchronously:

```typescript
export function Head() {
  return (
    <>
      {/* Critical scripts - blocking */}
      <script src="/critical.js"></script>
      
      {/* Non-critical scripts - async */}
      <script src="/analytics.js" async></script>
      
      {/* Very non-critical - defer */}
      <script src="/ads.js" defer></script>
    </>
  );
}
```

## CSS Optimization

### Minify CSS

```typescript
const config: FrameworkConfig = {
  build: {
    css: { minify: true }
  }
};
```

### Remove Unused CSS

Use CSS purging:

```typescript
export function Head() {
  // Only used classes included in bundle
  return <style>{`
    .home { /* ... */ }
    .about { /* ... */ }
    /* Unused styles removed */
  `}</style>;
}
```

### Critical CSS

Inline critical CSS:

```typescript
export function Head() {
  return (
    <>
      {/* Inline critical styles */}
      <style>{criticalCSS}</style>
      
      {/* Defer non-critical */}
      <link rel="stylesheet" href="/styles.css" media="print" 
            onload="this.media='all'" />
    </>
  );
}
```

## Image Optimization

### Responsive Images

```typescript
export default function Hero() {
  return (
    <picture>
      {/* Mobile */}
      <source srcSet="/hero-mobile.webp" media="(max-width: 640px)" />
      
      {/* Tablet */}
      <source srcSet="/hero-tablet.webp" media="(max-width: 1024px)" />
      
      {/* Desktop */}
      <source srcSet="/hero-desktop.webp" />
      
      <img src="/hero-desktop.jpg" alt="Hero" />
    </picture>
  );
}
```

### Modern Formats

Use WebP with fallback:

```typescript
export default function Image({ src, alt }: any) {
  return (
    <picture>
      <source srcSet={src.replace('.jpg', '.webp')} type="image/webp" />
      <img src={src} alt={alt} loading="lazy" />
    </picture>
  );
}
```

### Lazy Loading

Load images only when visible:

```typescript
export default function Image({ src, alt }: any) {
  return (
    <img 
      src={src} 
      alt={alt} 
      loading="lazy"
      decoding="async"
    />
  );
}
```

## Database Optimization

### Query Optimization

Use indexes:

```typescript
// Add index on frequently queried column
CREATE INDEX idx_posts_slug ON posts(slug);
```

```typescript
export async function loader(ctx: LoaderContext) {
  // Indexed query - fast!
  const post = await db.query('posts', {
    where: { slug: ctx.params.slug }
  });
  
  return post;
}
```

### Limit Results

```typescript
export async function loader(ctx: LoaderContext) {
  const { page = 1, limit = 10 } = ctx.query;
  
  // Don't fetch all records
  const posts = await db.query('posts', {
    limit: parseInt(limit),
    offset: (parseInt(page) - 1) * parseInt(limit)
  });
  
  return { posts };
}
```

### Denormalization

Cache expensive joins:

```typescript
// Instead of joining every query
const posts = await db.query('posts', {
  include: { author: true, comments: true }
});

// Store denormalized data
const posts = await db.query('posts', {
  select: ['id', 'title', 'author_name', 'comment_count']
});
```

## Caching Strategy

### HTTP Caching

```typescript
export function Head() {
  return (
    // Cache static content forever
    <meta httpEquiv="cache-control" 
          content="public, max-age=31536000, immutable" />
  );
}
```

### Data Caching

```typescript
export const renderConfig = {
  cache: {
    ttl: 3600  // Cache loader result for 1 hour
  }
};

export async function loader(ctx: LoaderContext) {
  return await expensiveQuery();
}
```

### Stale-While-Revalidate

```typescript
export function Head() {
  return (
    <meta httpEquiv="cache-control" 
          content="public, max-age=600, stale-while-revalidate=86400" />
  );
}
```

## Server Optimization

### Enable Compression

```typescript
import { gzip } from 'node:zlib';

export const compressionMiddleware: Middleware = (req, res, next) => {
  if (req.headers['accept-encoding']?.includes('gzip')) {
    res.setHeader('content-encoding', 'gzip');
  }
  next();
};
```

### Keep-Alive

```typescript
const server = createServer(/* ... */);
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;
```

### Connection Pooling

```typescript
const db = new DB(config);
db.setPool({
  min: 5,
  max: 20
});
```

## Frontend Optimization

### Memoization

```typescript
import { useMemo } from 'preact/hooks';

export default function ExpensiveComponent() {
  const computed = useMemo(() => {
    return expensiveCalculation();
  }, []);
  
  return <div>{computed}</div>;
}
```

### Callback Memoization

```typescript
import { useCallback } from 'preact/hooks';

export default function List({ items }: any) {
  const handleClick = useCallback((id: number) => {
    updateItem(id);
  }, []);
  
  return items.map(item => (
    <Item key={item.id} onClick={() => handleClick(item.id)} />
  ));
}
```

### Virtual Scrolling

For large lists, virtualize:

```typescript
export default function LargeList({ items }: any) {
  const visibleItems = items.slice(0, 50);  // Show 50 items
  
  return (
    <div style={{ height: '600px', overflow: 'auto' }}>
      {visibleItems.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}
```

## Monitoring

### Instrument Code

Add timing logs:

```typescript
export async function loader(ctx: LoaderContext) {
  console.time('loader');
  
  const data = await fetchData();
  
  console.timeEnd('loader');  // Logs execution time
  
  return data;
}
```

### Error Tracking

```typescript
import * as Sentry from "@sentry/node";

export async function loader(ctx: LoaderContext) {
  try {
    return await fetchData();
  } catch (error) {
    Sentry.captureException(error);
    throw error;
  }
}
```

## Performance Checklist

- [ ] Lighthouse score 90+
- [ ] FCP < 1.8s
- [ ] LCP < 2.5s
- [ ] CLS < 0.1
- [ ] Bundle size < 200KB
- [ ] No console errors
- [ ] Images optimized
- [ ] Caching enabled
- [ ] Compression enabled
- [ ] Database indexed

## Performance Benchmarks

Target metrics:

| Metric | Target | 90th Percentile |
|--------|--------|-----------------|
| FCP | 1.8s | 3.0s |
| LCP | 2.5s | 4.0s |
| CLS | 0.1 | 0.25 |
| TTI | 3.8s | 7.3s |
| TTFB | 0.6s | 1.2s |

## Next Steps

- [Build](./build) - Build optimization
- [Caching](./cache) - Cache strategies
- [Deployment](./deployment) - Production deployment
