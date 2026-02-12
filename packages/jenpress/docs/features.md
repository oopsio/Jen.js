---
title: JenPress Features
description: Learn about all the great features JenPress offers - markdown extensions, components, and more
---

# JenPress Features

JenPress is a modern documentation SSG with VitePress-like features built on Jen.js, Vite, and Preact.

## Tables

JenPress supports GitHub-flavored markdown tables:

| Feature | Support | Status |
|---------|---------|--------|
| Markdown Tables | ✅ | Fully Supported |
| Callouts/Admonitions | ✅ | Fully Supported |
| Code Highlighting | ✅ | With Shiki |
| Dark Mode | ✅ | Built-in |
| Search | ✅ | In Development |

## Callouts & Admonitions

JenPress supports multiple callout types with VitePress-style syntax:

> [!NOTE]
> This is a note callout. Use it for general information that might be helpful.

> [!TIP]
> This is a tip callout. Use it for helpful suggestions and best practices.

> [!WARNING]
> This is a warning callout. Use it to warn users about potential issues.

> [!DANGER]
> This is a danger callout. Use it for critical warnings and breaking changes.

> [!INFO]
> This is an info callout. Use it for supplementary information.

## Code Highlighting

Code blocks are automatically syntax highlighted:

```javascript
// This is JavaScript
function hello(name) {
  console.log(`Hello, ${name}!`);
}

hello('JenPress');
```

```typescript
interface Config {
  title: string;
  description?: string;
  sidebar?: SidebarItem[];
}

const config: Config = {
  title: 'My Docs',
};
```

```python
def fibonacci(n):
    """Calculate the nth Fibonacci number"""
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print(fibonacci(10))  # Output: 55
```

## Markdown Elements

### Headings

All heading levels (h1-h6) are supported and automatically generate outline items.

### Lists

Unordered lists:
- Item one
- Item two
- Item three

Ordered lists:
1. First item
2. Second item
3. Third item

### Text Formatting

You can use **bold**, *italic*, and ***bold italic*** text.

You can also use `inline code` within sentences.

### Blockquotes

> This is a blockquote. It can span multiple paragraphs and contain other markdown elements.

### Horizontal Rule

---

## Frontmatter

Every page supports YAML frontmatter for metadata:

```
---
title: Page Title
description: A brief description
tags: [feature, guide]
---

# Page content starts here
```

## Navigation

- **Breadcrumbs**: Automatic breadcrumb navigation showing your position in the site hierarchy
- **Edit on GitHub**: Direct link to edit the page on GitHub
- **Sidebar**: Navigate between pages with the collapsible sidebar
- **Outline**: Right-side outline showing all headings on the current page
- **Search**: Full-text search across all pages (coming soon)

## Dark Mode

JenPress includes built-in dark mode support. Click the moon/sun icon in the top navigation to toggle.

## Responsive Design

The layout is fully responsive:
- On desktop: Sidebar + Content + Outline
- On tablet: Collapsible sidebar + Content + Collapsed outline
- On mobile: Full-width content with hamburger menu for navigation

## What's Next?

Check out the [Getting Started guide](/docs/guide/getting-started.md) to set up your own JenPress documentation site!
