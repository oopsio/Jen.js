# Script Optimization Example

Comprehensive example demonstrating **tree-shaking, code splitting, lazy-loading, auto-hashing, and cache-busting** in Jen.js.

## Features Demonstrated

### 1. **Tree-Shaking**

Disabled features are completely removed from the bundle at build time.

```typescript
// jen.config.ts
features: {
  api: true,              // ✅ Included
  cache: true,            // ✅ Included
  graphql: false,         // ❌ Tree-shaken from bundle
  auth: false,            // ❌ Tree-shaken from bundle
}
```

**Result**: Only enabled features are in the final bundle. Saves ~20-50% bundle size depending on features used.

### 2. **Code Splitting**

The framework automatically splits your bundle into logical chunks:

- **vendor.js**: External dependencies (Preact, utilities) - cached long-term
- **runtime.js**: Framework runtime (hydration, SSR) - shared across routes
- **common.js**: Shared components - reused by multiple routes
- **route chunks**: Per-route code - loaded only when needed
- **entry.js**: Main bundle - minimal, loads immediately

**Example Output**:

```
dist/
├── index.html
├── vendor.a1b2c3d4e5f6.js      (12 KB, cached 1 year)
├── runtime.f6e5d4c3b2a1.js     (5 KB, cached 30 days)
├── common.e5f6a7b8c9d0.js      (8 KB, updated with app)
├── home.d0e1f2a3b4c5.js        (6 KB, route-specific)
├── dashboard.c5d6e7f8a9b0.js   (8 KB, lazy-loaded)
└── manifest.json               (maps originals → hashed)
```

### 3. **Lazy-Loading**

Components are loaded on-demand, reducing initial bundle size.

```typescript
// @lazy-load:"dashboard"
const loadDashboard = () => import("./dashboard.tsx");

// Load when user clicks button
const handleClick = async () => {
  const mod = await loadDashboard();
  // Component now available
};
```

**Options**:

- **Visible load**: Load when scrolled into view
- **Interaction load**: Load on hover/click/focus
- **Prefetch**: Load in background before needed
- **Preload**: Load immediately with low priority

### 4. **Auto-Hashing & Cache-Busting**

Every asset is automatically hashed based on its content:

```
Original: app.js
Hashed:   app.a1b2c3d4e5f6.js
          └─ 12-character content hash

Content changes → hash changes → new filename → cache miss
No manual cache purging needed!
```

**Cache Control Headers**:

```
# Hashed assets (cache forever)
Cache-Control: public, max-age=31536000, immutable

# Main bundle (check frequently)
Cache-Control: public, max-age=3600

# HTML pages (always validate)
Cache-Control: public, max-age=0, must-revalidate
```

### 5. **Manifest Generation**

The build process generates `manifest.json` for SSR/SSG template rendering:

```json
{
  "app.js": "app.a1b2c3d4e5f6.js",
  "vendor.js": "vendor.f6e5d4c3b2a1.js",
  "styles.css": "styles.a7b8c9d0e1f2.css"
}
```

Use in templates to insert correct hashed filenames:

```html
<script src="/{{ manifest['app.js'] }}"></script>
```

## Performance Impact

### Bundle Sizes (Gzipped)

| Chunk              | Size      | Loaded      | Impact              |
| ------------------ | --------- | ----------- | ------------------- |
| vendor             | 12 KB     | Immediately | Shared dependencies |
| runtime            | 5 KB      | Immediately | Framework internals |
| common             | 8 KB      | Immediately | Shared components   |
| home               | 6 KB      | Route load  | Page-specific       |
| dashboard          | 8 KB      | On click    | User interaction    |
| **Total Initial**  | **31 KB** | Immediately |                     |
| **With dashboard** | **39 KB** | After click | +8 KB when needed   |

### Load Times (3G Network)

- **Without optimization**: 800ms (all code upfront)
- **With optimization**: 200ms initial + 350ms dashboard (on demand)

### Cache Efficiency

- **Vendor**: Cached indefinitely (1 year expiry)
- **Runtime**: Cached per framework version
- **App code**: Cached until content changes
- **HTML**: Always validated

## Running the Example

```bash
# Install dependencies
npm install

# Navigate to example
cd examples/script-optimization

# Development mode (with HMR)
npm run dev

# Production build (with optimization)
npm run build

# View results
ls -la dist/
cat dist/manifest.json
```

## Build Analysis

Generate optimization reports:

```typescript
import { ScriptOptimizer, CodeSplitter, LazyLoader } from "jenjs";

// Analyze tree-shaking
const optimizer = new ScriptOptimizer();
console.log(optimizer.generateCacheBustingStrategy());

// Analyze code splitting
const splitter = new CodeSplitter();
console.log(splitter.generateDependencyGraph());

// Analyze lazy-loading
const lazyLoader = new LazyLoader("lazy");
console.log(lazyLoader.generateReport());
```

## Configuration Options

### Script Optimizer Config

```typescript
// jen.config.ts
export default {
  build: {
    // Enable asset hashing for cache-busting
    hashAssets: true,

    // Hash length (default: 12)
    // Shorter = more collisions, longer = bigger filenames
    // 8-12 recommended

    // Generate manifest for SSR reference
    generateManifest: true,

    // Minify output
    minifyJs: true,
    minifyCss: true,
    minifyHtml: true,
  },

  assets: {
    // Cache control for hashed assets
    cacheControl: "public,max-age=31536000,immutable",
    hashLength: 12,
  },
} as FrameworkConfig;
```

## Advanced Usage

### Custom Code Splitting Strategy

```typescript
import { CodeSplitter } from "jenjs";

const splitter = new CodeSplitter();

// Add custom chunk for analytics
splitter.registerStrategy({
  name: "analytics",
  test: (path) => path.includes("tracking") || path.includes("analytics"),
  priority: 85,
});
```

### Dynamic Prefetching

```typescript
import { prefetchLazy, preloadLazy } from "@src/build/lazy-loader.js";

// Prefetch dashboard when user hovers over link
const link = document.querySelector('a[href="/dashboard"]');
link.addEventListener("mouseover", () => {
  prefetchLazy("dashboard", "/dashboard.js");
});

// Preload critical lazy module
if (user.isPremium) {
  preloadLazy("premium-features", "/premium.js");
}
```

### Visible-Load Pattern

```typescript
import { loadWhenVisible } from "@src/build/lazy-loader.js";

// Load component when it scrolls into view
loadWhenVisible("below-fold", "recommendations", "/recommendations.js");
```

### Interaction-Load Pattern

```typescript
import { loadOnInteraction } from "@src/build/lazy-loader.js";

// Load on hover, focus, or click
loadOnInteraction("settings-btn", "settings", "/settings.js", [
  "mouseover",
  "focus",
  "click",
]);
```

## Performance Best Practices

1. **Tree-shake aggressively**: Disable features you don't use
2. **Split at route boundaries**: Each route gets its own chunk
3. **Lazy-load below the fold**: Load non-critical content on demand
4. **Prefetch wisely**: Use in idle time, not on critical path
5. **Monitor bundle size**: Set budgets and track over time
6. **Use long cache expiry**: Hashing ensures correctness

## Debugging

### View generated chunks:

```bash
npm run build
ls -la dist/
```

### Inspect manifest:

```bash
cat dist/manifest.json
```

### Check Network tab in DevTools:

- Filter for `.js` files
- Sort by size
- Check gzip size
- Verify lazy chunks load on demand

### Generate reports:

```typescript
import { ScriptOptimizer, CodeSplitter, LazyLoader } from "jenjs";

const optimizer = new ScriptOptimizer();
console.log(optimizer.generateManifest());

const splitter = new CodeSplitter();
console.log(splitter.generateReport());

const loader = new LazyLoader();
console.log(loader.generateReport());
```

## Next Steps

- Read [SCRIPT_OPTIMIZATION.md](../../docs/SCRIPT_OPTIMIZATION.md) for detailed API
- Check [BUILD.md](../../docs/BUILD.md) for build system internals
- Explore [examples/](../) for more patterns
- Join discussions on performance optimization

---

**Part of**: [Jen.js Script Optimization Upgrade](https://github.com/oopsio/jen.js)
