# Nested Layouts System

The nested layouts system in Jen.js enables automatic parent-child layout relationships with inheritance and overrides. Layouts are automatically discovered, stacked, and rendered based on your file structure.

## Features

- **Automatic Hierarchy**: Layouts are discovered from the filesystem structure and automatically organized into a parent-child hierarchy
- **Layout Inheritance**: Child layouts inherit configuration from parent layouts with ability to override
- **Composition**: Layouts wrap each other from root to leaf, creating a composable hierarchy
- **Head Management**: Each layout can contribute to document head (meta tags, title, links, etc.)
- **Configuration Merging**: Layout configurations cascade and merge, with child values overriding parent values

## Layout File Convention

Layout files must follow the naming pattern `(layout).tsx` (or `.ts`, `.jsx`, `.js`).

Layouts are discovered at any directory level in your site:

```
src/
├── (layout).tsx           # Root layout (depth 0)
├── pages/
│   ├── (layout).tsx       # Pages layout (depth 1)
│   ├── (home).tsx         # Page in pages/ - uses both layouts
│   └── blog/
│       ├── (layout).tsx   # Blog layout (depth 2)
│       └── (post).tsx     # Page in blog/ - uses all three layouts
└── admin/
    ├── (layout).tsx       # Admin layout (depth 1)
    └── (dashboard).tsx    # Page in admin/ - uses root + admin layouts
```

## Layout Hierarchy Resolution

For a route file at `src/pages/blog/(post).tsx`, the layout hierarchy is:

1. `src/(layout).tsx` - Root layout
2. `src/pages/(layout).tsx` - Parent layout
3. `src/pages/blog/(layout).tsx` - Current level layout

Layouts are rendered from root to leaf:

```
RootLayout(
  PagesLayout(
    BlogLayout(
      PageComponent
    )
  )
)
```

## Creating a Layout

```typescript
// src/(layout).tsx
import type { LayoutModule } from "jenjs";

export const layout = {
  siteName: "My Site",
  navItems: [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" }
  ]
};

export function Head() {
  return (
    <>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </>
  );
}

export default function RootLayout({ children, data, params, query }) {
  return (
    <html>
      <head>
        <title>My Site</title>
      </head>
      <body>
        <nav>{/* render navigation */}</nav>
        {children}
        <footer>© 2024</footer>
      </body>
    </html>
  );
}
```

## Nested Layouts

Child layouts inherit parent configuration and can override values:

```typescript
// src/pages/(layout).tsx
import type { LayoutModule } from "jenjs";

export const layout = {
  navItems: [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" },
    // Added more items - inherits siteName from parent
  ]
};

export default function PagesLayout({ children, data, params, query }) {
  return (
    <div class="pages-container">
      <aside>{/* sidebar */}</aside>
      <main>{children}</main>
    </div>
  );
}
```

The merged configuration for pages is:

```javascript
{
  siteName: "My Site",        // inherited from root
  navItems: [                 // overridden by pages layout
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" }
  ]
}
```

## Layout Props

Each layout receives the following props:

- **children**: The rendered output from the child layout or page component (VNode)
- **data**: Data passed from the page loader function
- **params**: URL route parameters (e.g., `{ id: "123" }` for `/posts/:id`)
- **query**: Query string parameters (e.g., `{ sort: "date" }` for `?sort=date`)

```typescript
export default function Layout({ children, data, params, query }) {
  return (
    <div>
      <header>
        {/* Use params for dynamic content */}
        {params.id && <h1>Item {params.id}</h1>}
      </header>
      {/* children is the next layout or page component */}
      <main>{children}</main>
    </div>
  );
}
```

## Head Components

Each layout and page can define a `Head` component that contributes to the document head. Head components are rendered in order from root to leaf:

```typescript
// Root layout head
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width" />

// Pages layout head
<meta name="description" content="Pages section" />

// Page head
<title>My Page Title</title>
```

This allows each level to add its own metadata without duplicating common head elements.

## Layout Configuration Merging

Configuration objects from all layouts in the hierarchy are merged (shallow merge) from root to leaf. Child values override parent values:

```typescript
// Root config
{ color: "blue", size: "large", theme: "light" }

// Child config override
{ size: "small" }

// Merged result
{ color: "blue", size: "small", theme: "light" }
```

Access the merged configuration via the `layout` export from any layout module.

## Examples

### Blog Layout with Sidebar

```typescript
// src/blog/(layout).tsx
export const layout = {
  category: "blog",
  showSidebar: true
};

export default function BlogLayout({ children, data, params }) {
  return (
    <div class="blog-container">
      <aside class="blog-sidebar">
        {/* Recent posts or categories */}
      </aside>
      <article>{children}</article>
    </div>
  );
}
```

### Admin Layout with Auth Check

```typescript
// src/admin/(layout).tsx
export const layout = {
  requiresAuth: true,
  role: "admin"
};

export default function AdminLayout({ children, data }) {
  // data comes from middleware that performed auth check
  if (!data.isAdmin) {
    return <div>Access Denied</div>;
  }
  
  return (
    <div class="admin-panel">
      <nav>{/* admin navigation */}</nav>
      {children}
    </div>
  );
}
```

### Conditional Layout Based on Route

```typescript
// src/pages/(layout).tsx
export default function PagesLayout({ children, params }) {
  const isBlogPost = params.slug?.startsWith("blog/");
  
  return (
    <div class={`layout ${isBlogPost ? "blog-post" : "page"}`}>
      {children}
    </div>
  );
}
```

## Implementation Details

### Layout Discovery (`scanLayouts`)

The `scanLayouts()` function:
- Walks the siteDir directory tree recursively
- Finds all files matching `(layout).tsx|ts|jsx|js` pattern
- Creates LayoutEntry objects with depth and directory path information
- Sorts layouts by depth (root first)

### Hierarchy Building (`buildLayoutHierarchy`)

The `buildLayoutHierarchy()` function:
- Takes a route file path
- Traces the directory structure from root to the route's directory
- Finds all applicable layouts at each level
- Returns an ordered array of LayoutEntry objects (root to leaf)

### Layout Resolution (`resolveLayoutStack`)

The `resolveLayoutStack()` function:
- Takes LayoutEntry objects
- Loads and compiles each layout module (TypeScript/JSX/Vue/Svelte)
- Merges configuration from all layouts
- Returns a ResolvedLayoutStack with modules and merged config

### Rendering (`renderWithLayoutStack`)

The `renderWithLayoutStack()` function:
- Takes a layout stack, page component, and props
- Composes layouts from leaf to root (creates Preact VNode tree)
- Returns a VNode with proper nesting
- Rendered to HTML by `preact-render-to-string`

## Performance Considerations

- Layouts are scanned once at startup and cached
- Module compilation uses esbuild cache for fast rebuilds
- Layout resolution happens per-request but is fast (file lookups only, no I/O)
- Head collection is efficient (no additional DOM operations)

## Integration with Other Features

- **Middleware**: Middleware runs before layout rendering; data can be passed through layouts
- **Islands**: Island components can be used within layouts for partial hydration
- **Data Loading**: Page loaders run before rendering; data is available to all layouts
- **Hydration**: Layouts participate in the full hydration process alongside pages

## Troubleshooting

### Layouts not being applied

Check that:
1. Layout files are named exactly `(layout).tsx` (or other supported extension)
2. They are in the correct directory structure relative to routes
3. Default export is a valid Preact component

### Configuration not merging

Remember:
- Configuration merging is shallow, not deep
- Only the `layout` export is merged
- Child values completely override parent values (no array merging)

### Head elements duplicated

Each layout's Head component is rendered; avoid duplicating common elements:
- Put common head elements only in the root layout
- Child layouts should only add specific elements
