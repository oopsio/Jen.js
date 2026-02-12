---
title: Welcome to JenPress
description: Markdown-first documentation static site generator
---

# Welcome to JenPress

JenPress is a VitePress competitor built for the Jen.js ecosystem. It provides a fast, SEO-friendly documentation website with an excellent developer experience.

## Features

- ⚡️ **Fast Dev Server** - Vite-powered with instant startup
- 📝 **Markdown First** - Automatic file-based routing
- ⚛️ **Preact Runtime** - Lightweight and performant
- 🎨 **Themeable** - Default theme + custom overrides
- 🔍 **SEO Ready** - Proper meta tags and sitemaps
- 🚀 **Zero Config** - Works out of the box

## Getting Started

```bash
# Install JenPress
npm install -D @jenjs/jenpress

# Start dev server
jenpress dev

# Build for production
jenpress build
```

## File-Based Routing

Create markdown files in the `docs/` directory:

```
docs/
├── index.md           → /
├── guide/
│   └── getting-started.md   → /guide/getting-started
└── api/
    └── overview.md    → /api/overview
```

Each markdown file automatically becomes a page with proper routing.

## Markdown Support

JenPress supports standard Markdown with:

- Syntax highlighting with Shiki
- Frontmatter for page metadata
- Code blocks with language support
- Component embedding (Preact)

## Next Steps

- [Read the guide](./guide/getting-started.md)
- [Browse the API docs](./api/overview.md)
- [Check configuration](./guide/config.md)

---

Happy documenting! 📚
