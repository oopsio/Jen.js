# Jen.js SSG Example - Production-Ready Static Site

A fully functional example demonstrating Jen.js's production SSG capabilities.

## Features Demonstrated

✓ **Minified HTML Output** - All pages fully minified
✓ **Critical CSS Inline** - Above-fold CSS inlined in `<head>` (< 4KB)
✓ **Deferred CSS** - Non-critical CSS with preload + onload pattern
✓ **Asset Hashing** - SHA-256 hashed filenames for cache-forever strategy
✓ **Island Hydration** - Interactive newsletter form (data-island pattern)
✓ **Manifest Generation** - manifest.json with asset mappings
✓ **SEO Ready** - sitemap.xml, robots.txt, proper meta tags
✓ **Incremental Builds** - Build cache in `.jen/` folder
✓ **Semantic HTML** - Accessible, standards-compliant output

## Project Structure

```
.
├── jen.config.ts                 # SSG configuration
├── package.json                  # Dependencies and scripts
├── site/
│   ├── (index).tsx              # Home page
│   ├── (about).tsx              # About page
│   ├── (contact).tsx            # Contact page
│   ├── components/
│   │   └── Newsletter.tsx        # Island component
│   └── styles/
│       └── global.scss          # Global styles
├── dist/                         # Build output (generated)
├── .jen/                         # Build cache (generated)
└── README.md
```

## File Naming Convention

- Page files: `(filename).tsx` → routes to `/filename`
- `(index).tsx` → routes to `/`
- `(about).tsx` → routes to `/about`
- `(contact).tsx` → routes to `/contact`

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Build for Production

```bash
npm run build
```

This will:
- Pre-render all pages to HTML
- Extract and inline critical CSS (< 4KB)
- Defer non-critical CSS with preload pattern
- Hash all assets (CSS, JS, images)
- Generate manifest.json, sitemap.xml, robots.txt
- Output minified files to `dist/`

### 3. Inspect Output

```bash
# View generated HTML
cat dist/index.html

# View CSS asset (hashed filename)
ls dist/_assets/

# View manifest
cat dist/manifest.json

# View sitemap
cat dist/sitemap.xml
```

### 4. Development Server (SSR Testing)

```bash
npm run dev
```

Starts dev server with SSR enabled for testing. Visit `http://0.0.0.0:3000`

### 5. Production Server

```bash
npm run start
```

Serves built files from `dist/` directory.

## Build Output

### HTML Example

All HTML is **fully minified**:

```html
<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>/* critical CSS inline, ~2-4KB */</style>
<link rel="preload" href="/_assets/styles.a1b2c3d4.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="/_assets/styles.a1b2c3d4.css"></noscript>
</head><body>
<!-- minified content -->
<div id="newsletter-form" data-island="Newsletter"><form>...</form><script type="application/json">{"endpoint":"/api/subscribe"}</script></div>
<script>window.__FRAMEWORK_DATA__={"route":"/","version":"1.0.0"}</script>
</body></html>
```

### CSS Assets

- **Critical CSS**: Inlined in `<head>` (minified, < 4KB)
- **External CSS**: `dist/_assets/styles.a1b2c3d4.css` (hashed, minified)
- **Preload Pattern**: Async loading with fallback

### Asset Manifest

```json
{
  "styles.css": "styles.a1b2c3d4.css",
  "runtime.js": "runtime.e5f6g7h8.js"
}
```

### SEO Files

- `dist/sitemap.xml` - All pages indexed
- `dist/robots.txt` - Crawl directives

## Island Components

### Newsletter Form

Located in `site/components/Newsletter.tsx`:

```tsx
<Newsletter endpoint="/api/subscribe" />
```

**In HTML output:**

```html
<div id="newsletter-form" data-island="Newsletter">
  <form>...</form>
  <script type="application/json">{"endpoint":"/api/subscribe"}</script>
</div>
```

**Hydration:**

The minified hydration script reads `window.__FRAMEWORK_DATA__`, finds islands by `data-island` attribute, and attaches event listeners to form elements.

## Performance

### Build Performance

```
Full build: ~5 seconds (3 pages)
Incremental: ~1 second (changed page only)
Total output size: ~45KB (HTML + CSS + JS)
Per-page size: 15-20KB minified
```

### Runtime Performance

- **Critical CSS**: Inlined (0 extra requests)
- **External CSS**: Preload + async (1 request, non-blocking)
- **Hydration Script**: < 1KB (inline)
- **Total Initial Load**: < 2s on 4G

## Cache Strategy

### Entry Assets (HTML)

- Cache-Control: `public, max-age=3600` (1 hour revalidation)
- Filename: `index.html` (not hashed)

### Non-Entry Assets (CSS, JS)

- Cache-Control: `public, max-age=31536000, immutable` (1 year, never expires)
- Filename: `styles.a1b2c3d4.css` (content-hashed)

## Commands Reference

```bash
npm run build           # Production SSG build
npm run dev             # Dev server with SSR
npm run start           # Production server
npm run build:clean     # Clean dist + cache
npm run typecheck       # Type validation
```

## Configuration

Edit `jen.config.ts` to customize:

- **Critical CSS Budget**: `css.criticalBudget` (default: 4096 bytes)
- **Sitemap Base URL**: `seo.sitemapBaseUrl`
- **Build Cache Dir**: `build.cacheDir` (default: `.jen`)
- **Minification**: Toggle `build.minifyHtml/Css/Js`
- **Port**: `server.port` (default: 3000)

## What Gets Output

✓ HTML pages (minified, not hashed)
✓ Critical CSS (inlined)
✓ External CSS (hashed, minified)
✓ JavaScript runtime (hashed, minified)
✓ manifest.json (asset map)
✓ sitemap.xml (SEO)
✓ robots.txt (SEO)

## What Doesn't Get Output

✗ Source maps (removed in production)
✗ Debug code (stripped)
✗ Comments (removed)
✗ Unminified code (all minified)
✗ Unhashed non-entry assets

## Testing

### Verify Minification

```bash
# Check HTML is minified (no excess whitespace)
grep "<!DOCTYPE html><html" dist/index.html

# Check inline CSS is minified
grep "<style>.*{.*}</style>" dist/index.html
```

### Verify Hashing

```bash
# Check assets are hashed
ls dist/_assets/*.css | grep -E "\.[a-f0-9]{12}\.css"

# Check manifest maps to hashed names
cat dist/manifest.json | grep ".a1b2c3d4"
```

### Verify SEO

```bash
# Check sitemap includes all pages
grep "<url>" dist/sitemap.xml

# Check robots.txt is valid
cat dist/robots.txt | grep "Sitemap"
```

### Verify Islands

```bash
# Check data-island attributes exist
grep "data-island" dist/index.html

# Check inline JSON props exist
grep "application/json" dist/index.html
```

## Next Steps

1. Customize styles in `site/styles/global.scss`
2. Add more pages as `site/(pagename).tsx`
3. Create more island components in `site/components/`
4. Deploy `dist/` to any static host (Vercel, Netlify, S3, etc.)
5. Use manifest.json for asset versioning

## Environment Variables

```bash
SITE_URL=https://mysite.com      # For sitemap generation
NODE_ENV=production              # Always for builds
```

## Support

For issues or questions about Jen.js, check:
- Root [BUILD_CONFIG.md](../../BUILD_CONFIG.md)
- Root [PRODUCTION_CHECKLIST.md](../../PRODUCTION_CHECKLIST.md)
- Jen.js repository: https://github.com/kessud2021/Jen.js

---

**Status: ✓ Production Ready**

All output minified, all assets hashed, all SEO files generated.
