# JenPress

A **VitePress competitor** - Markdown-first documentation static site generator built for the Jen.js ecosystem.

Built with Vite, Preact, TypeScript, and ESM.

## Features

- ️ **Fast Dev Server** - Vite-powered with instant startup and HMR
-  **Markdown First** - Automatic file-based routing from markdown files
- ️ **Preact Runtime** - Lightweight UI framework with component support
-  **Theme System** - Default theme + custom theme override support
-  **SEO Ready** - Proper meta tags, sitemaps, canonical URLs
-  **Zero Config** - Works out of the box with optional `jenpress.config.ts`
-  **ESM Only** - Modern JavaScript/TypeScript package
-  **Type Safe** - Full TypeScript support

## Installation

### From npm (when published)

```bash
npm install -D @jenjs/jenpress
# or
pnpm add -D @jenjs/jenpress
```

### From monorepo

```bash
pnpm --filter @jenjs/jenpress dev
```

## Quick Start

### 1. Create docs directory

```
docs/
├── index.md
├── guide/
│   └── getting-started.md
└── api/
    └── overview.md
```

### 2. Create jenpress.config.ts (optional)

```typescript
import { defineConfig } from "@jenjs/jenpress";

export default defineConfig({
  title: "My Docs",
  description: "Documentation for my project",
  themeConfig: {
    nav: [
      { text: "Guide", link: "/guide/" },
      { text: "API", link: "/api/" },
    ],
  },
});
```

### 3. Run dev server

```bash
# In monorepo:
pnpm --filter @jenjs/jenpress dev

# Or locally:
pnpm dev
```

Visit `http://localhost:5173`

## Commands

```bash
# Development server with HMR
jenpress dev

# Build static site to dist/
jenpress build

# Serve dist/ folder
jenpress serve
```

## Markdown Syntax

### Frontmatter

```markdown
---
title: Getting Started
description: Learn the basics
---

# Content here...
```

### Component Usage

Import and use Preact components:

```markdown
---
title: Components
---

<Button onClick={() => alert('Clicked!')}>Click me</Button>
```

## Configuration

### jenpress.config.ts

```typescript
export default {
  title: string;
  description: string;
  base: string; // default: '/'

  themeConfig: {
    nav: Array<{ text: string; link: string }>;
    sidebar: Array<{
      text: string;
      items: Array<{ text: string; link: string }>;
    }>;
    logo: string;
    repo: string;
  };

  markdown: {
    lineNumbers: boolean;
    breaks: boolean;
  };
}
```

## Custom Theme

Create `.jenpress/theme/Layout.tsx` to override the default theme:

```typescript
import { h } from 'preact';
import type { PageData } from '@jenjs/jenpress';

export default function Layout({ page, children }: any) {
  return (
    <div class="custom-theme">
      <header>My Custom Header</header>
      <main>{children}</main>
      <footer>My Custom Footer</footer>
    </div>
  );
}
```

## Project Structure

```
packages/jenpress/
├── bin/
│   └── jenpress.js         # CLI entrypoint
├── src/
│   ├── cli/
│   │   ├── dev.ts          # Dev server command
│   │   ├── build.ts        # Build command
│   │   └── serve.ts        # Serve command
│   ├── node/
│   │   ├── config.ts       # Config loader
│   │   ├── builder.ts      # Build pipeline
│   │   ├── dev-server.ts   # Dev server
│   │   └── vite-plugin.ts  # Vite markdown plugin
│   ├── client/
│   │   ├── app.tsx         # Client entry
│   │   └── router.ts       # Client router
│   ├── theme-default/
│   │   ├── Layout.tsx      # Default layout
│   │   ├── Nav.tsx         # Navigation
│   │   ├── Sidebar.tsx     # Sidebar
│   │   └── index.css       # Default styles
│   ├── markdown/
│   │   ├── parser.ts       # Markdown parser
│   │   ├── highlight.ts    # Syntax highlighting
│   │   └── transform.ts    # MD to component transform
│   └── index.ts            # Main export
├── package.json
├── tsconfig.json
└── README.md
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## License

GPL-3.0-only
