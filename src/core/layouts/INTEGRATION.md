# Nested Layouts - Integration Guide

## For Framework Users

### Basic Usage

The nested layouts system works automatically - no configuration needed! Just create layout files following the naming convention.

### Step 1: Create a Root Layout

```typescript
// src/(layout).tsx
import type { LayoutModule } from "jenjs";

export const layout: LayoutModule["layout"] = {
  // Optional: configuration that child layouts can inherit
  siteName: "My App",
};

export function Head() {
  // Optional: meta tags, stylesheets, etc.
  return (
    <>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </>
  );
}

export default function RootLayout({ children, data, params, query }) {
  return (
    <html>
      <head>
        <title>My App</title>
      </head>
      <body>
        {/* Navigation, header, etc. */}
        {children}
        {/* Footer, etc. */}
      </body>
    </html>
  );
}
```

### Step 2: Create Section Layouts

```typescript
// src/blog/(layout).tsx
export const layout = {
  // Inherits siteName, can override or add new properties
  section: "blog",
  showSidebar: true,
};

export default function BlogLayout({ children, data }) {
  return (
    <div class="blog-section">
      <aside class="sidebar">{/* Sidebar content */}</aside>
      <main>{children}</main>
    </div>
  );
}
```

### Step 3: Create Pages

```typescript
// src/blog/(list).tsx
export const loader = async (ctx) => {
  const posts = await db.posts.list();
  return { posts };
};

export default function BlogListPage({ data }) {
  return (
    <div>
      <h1>Blog Posts</h1>
      {data.posts.map((post) => (
        <div key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
        </div>
      ))}
    </div>
  );
}
```

**That's it!** The page is automatically wrapped with:
- `BlogLayout` (from `src/blog/(layout).tsx`)
- `RootLayout` (from `src/(layout).tsx`)

## Layout Properties

Each layout can export:

### `layout` object (optional)
Configuration that can be inherited by child layouts. Shallow merge with children overriding parents.

```typescript
export const layout = {
  theme: "dark",
  spacing: "1rem",
  showNav: true,
};
```

### `Head` component (optional)
Contributes to `<head>` section. Receives props: `{ data, params, query }`

```typescript
export function Head({ params }) {
  return <title>{params.section} - My App</title>;
}
```

### `default` component (required)
The layout wrapper. Receives props:
- `children`: The rendered child layout or page (as Preact VNode)
- `data`: Data from page loader
- `params`: Route parameters
- `query`: Query string parameters

```typescript
export default function Layout({ children, data, params, query }) {
  return <div>{children}</div>;
}
```

## File Structure Guidelines

```
src/
├── (layout).tsx              # Root (depth 0)
│   └─ Applied to ALL routes
│
├── pages/
│   ├── (layout).tsx          # Pages section (depth 1)
│   │   └─ Applied to all /pages/* routes
│   ├── (home).tsx
│   ├── (about).tsx
│   │
│   └── blog/
│       ├── (layout).tsx      # Blog section (depth 2)
│       │   └─ Applied to all /pages/blog/* routes
│       ├── (list).tsx        # /pages/blog/
│       └── ($slug).tsx       # /pages/blog/:slug
│
└── admin/
    ├── (layout).tsx          # Admin section (depth 1)
    │   └─ Applied to all /admin/* routes
    ├── (dashboard).tsx       # /admin/
    └── users/
        ├── (layout).tsx      # Users subsection (depth 2)
        ├── (list).tsx        # /admin/users/
        └── ($id).tsx         # /admin/users/:id
```

## Layout Hierarchy for Different Routes

### `/pages/blog/hello-world`
Applies layouts in order:
1. `src/(layout).tsx` ← RootLayout
2. `src/pages/(layout).tsx` ← PagesLayout
3. `src/pages/blog/(layout).tsx` ← BlogLayout
4. Page component

### `/admin/users/123`
Applies layouts in order:
1. `src/(layout).tsx` ← RootLayout
2. `src/admin/(layout).tsx` ← AdminLayout
3. `src/admin/users/(layout).tsx` ← UsersLayout
4. Page component

### `/pages/about`
Applies layouts in order:
1. `src/(layout).tsx` ← RootLayout
2. `src/pages/(layout).tsx` ← PagesLayout
3. Page component
(No blog layout because route doesn't go through blog/)

## Common Patterns

### Authentication/Authorization

```typescript
// src/admin/(layout).tsx
export default function AdminLayout({ children, data }) {
  if (!data.user?.isAdmin) {
    return <div>Access Denied</div>;
  }
  return <div>{children}</div>;
}
```

Pass user from middleware/loader:

```typescript
// In route loader or middleware
const loaderCtx: LoaderContext = {
  // ... other context
  data: { user: getCurrentUser() },
};
```

### Conditional Content

```typescript
// src/blog/(layout).tsx
export default function BlogLayout({ children, params, data }) {
  const showSidebar = params.slug ? false : true; // Hide on post pages
  
  return (
    <div class="blog">
      {showSidebar && <aside>Sidebar</aside>}
      <main>{children}</main>
    </div>
  );
}
```

### Configuration Cascade

```typescript
// Root: dark theme, large font
export const layout = { theme: "dark", fontSize: "18px" };

// Blog: inherits theme, overrides font
export const layout = { fontSize: "16px" };

// Result for /blog: { theme: "dark", fontSize: "16px" }
```

## TypeScript Support

The `LayoutModule` type helps with autocompletion:

```typescript
import type { LayoutModule } from "jenjs";

export const layout: LayoutModule["layout"] = {
  // TypeScript will help here
};

export function Head(): LayoutModule["Head"] {
  return null;
}

export default: LayoutModule["default"] = function Layout(props) {
  return null;
};
```

## Accessing Layout Configuration

Currently, layouts are merged internally but not exposed to pages. To pass configuration to pages, use the layout's rendered output:

```typescript
// src/blog/(layout).tsx
export const layout = { category: "blog" };

export default function BlogLayout({ children }) {
  // Pass via attributes or context if needed
  return <div data-category="blog">{children}</div>;
}
```

Or use middleware to pass data:

```typescript
// In middleware
ctx.data = { ...ctx.data, category: "blog" };
```

## Performance Tips

1. **Keep root layout simple** - It wraps every page
2. **Shared resources in root** - CSS, fonts, fonts, scripts
3. **Section-specific elements in section layouts** - Navigation, sidebars
4. **Minimize prop drilling** - Use composition over prop passing for deeply nested layouts
5. **Use CSS for styling** - Not JavaScript logic in layouts

## Troubleshooting

### Layouts not being applied
- Check file naming: must be exactly `(layout).tsx` (with parentheses)
- Check file location: must be in the same directory or parent directories
- Check file extensions: must match config.routes.fileExtensions

### Configuration not merging
- Only the `layout` export is merged
- Merging is shallow, not deep (array values are replaced, not merged)
- Child values completely override parent values

### Head elements duplicated
- Each layout's Head is rendered
- Put shared elements only in root layout's Head
- Child layouts should only add specific elements

### Props not available in layout
- `children`: always present (the child layout or page)
- `data`: from page loader (or middleware)
- `params`: from route parameters
- `query`: from query string

## Examples

See `examples.md` for detailed real-world examples:
- Multi-level blog with hierarchy
- Admin panel with authentication
- Configuration inheritance and overrides

## For Framework Developers

### Internal Flow

1. **scanLayouts(config)** - Discovers all layout files
2. **buildLayoutHierarchy(entries, routePath)** - Builds chain for route
3. **resolveLayoutStack(entries)** - Loads and merges layouts
4. **renderWithLayoutStack(stack, page, props)** - Composes tree
5. **collectLayoutHeads(stack, pageHead, props)** - Gathers head content

### Adding Features

To add new layout functionality:

1. Modify `scan.ts` for discovery logic
2. Extend `types.ts` for new types
3. Update `render.ts` for composition/rendering changes
4. Update `src/runtime/render.ts` to use new features

### Testing

```bash
npm run test:run -- tests/layouts.test.ts
```

10 comprehensive tests covering all major functionality.

## API Reference

See `README.md` for complete API documentation.
