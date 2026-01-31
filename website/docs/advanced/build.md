# Build System

Understand Jen.js build process for optimization and customization.

## Build Process

```bash
npm run build
```

1. Load configuration from `jen.config.ts`
2. Scan `site/` for routes
3. Run loaders for each route
4. Render components to HTML
5. Bundle and optimize assets
6. Output to `dist/`

## Output Structure

```
dist/
├── index/                    # Pages
│   ├── index.html           # /
│   ├── about/index.html     # /about
│   └── posts/
│       ├── 1/index.html     # /posts/1
│       └── 2/index.html     # /posts/2
├── assets/                  # Static files
├── styles.css              # Global styles
└── bundle.js               # JavaScript bundle
```

## Build Configuration

In `jen.config.ts`:

```typescript
const config: FrameworkConfig = {
  build: {
    minify: true,
    sourceMaps: false,
    splitting: 'auto',
    external: [],
    define: {}
  }
};
```

## Incremental Builds

Rebuild specific files:

```bash
npm run build -- --incremental site/(about).tsx
```

## Build Analysis

See what's being built:

```bash
npm run build -- --verbose
```

Shows:
- Routes discovered
- Build times
- Output file sizes
- Asset optimization stats

## Static Asset Handling

Place files in `public/`:

```
public/
├── favicon.ico
├── robots.txt
├── images/
└── styles.css
```

Automatically copied to `dist/`.

Reference in HTML:

```typescript
export default function Home() {
  return (
    <html>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <img src="/images/logo.png" alt="Logo" />
      </body>
    </html>
  );
}
```

## Code Splitting

Split large bundles:

```typescript
const config = {
  build: {
    splitting: 'auto'  // or 'manual', 'none'
  }
};
```

## Source Maps

Enable source maps for debugging:

```typescript
const config = {
  build: {
    sourceMaps: true  // Development only
  }
};
```

## Environment-Specific Builds

```bash
NODE_ENV=production npm run build
NODE_ENV=staging npm run build
```

Access in config:

```typescript
const config = {
  build: {
    minify: process.env.NODE_ENV === 'production'
  }
};
```

## Custom Build Steps

Use plugins:

```typescript
// src/plugins/build.ts
export default {
  name: 'custom-build',
  onBuild: async (context) => {
    // Custom logic after build
    await generateMetadata(context.distDir);
  }
};
```

## Performance Optimization

### Image Optimization

Use a plugin to compress images during build.

### Code Minification

```typescript
const config = {
  build: {
    minify: true
  }
};
```

### CSS Optimization

Unused CSS is automatically removed.

### Bundle Analysis

```bash
npm run build -- --analyze
```

Shows bundle composition.

## Troubleshooting

### Build Too Slow

- Check for slow loaders
- Reduce database queries
- Cache expensive computations
- Use incremental builds

### Large Bundle

- Use code splitting
- Remove unused dependencies
- Check for duplicate packages
- Run build analysis

### Memory Issues

- Build in smaller chunks
- Use incremental builds
- Monitor system resources
