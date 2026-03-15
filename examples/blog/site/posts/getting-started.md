---
title: Getting Started with Jen.js
date: 2026-02-22
author: Jen Team
excerpt: Learn how to build fast, modern web applications with Jen.js framework
featured: true
---

# Getting Started with Jen.js

Jen.js is a powerful, TypeScript-first framework for building static and server-rendered web applications with Preact.

## Why Jen.js?

- ** Lightning Fast**: Optimized builds with automatic code splitting
- ** Type-Safe**: Full TypeScript support with strict mode enabled
- ** Modern SSR**: Server-side rendering with optional hydration
- ** Zero Config**: Works out of the box with sensible defaults
- ** Flexible**: Build anything from static blogs to dynamic web apps

## Quick Start

```bash
npm create jen-app@latest my-project
cd my-project
npm run dev
```

## Directory Structure

```
my-project/
├── site/
│   ├── pages/        # Page routes
│   ├── components/   # Reusable components
│   ├── styles/       # Global styles
│   └── assets/       # Static files
├── lib/              # Framework library
├── jen.config.ts     # Configuration
├── server.ts         # Dev server
└── build.ts          # Build script
```

## Creating Your First Page

Create `site/pages/(index).tsx`:

```tsx
export default function Home() {
  return (
    <div>
      <h1>Welcome to Jen.js</h1>
      <p>Build modern web apps fast</p>
    </div>
  );
}
```

## Dynamic Routes

Dynamic routes use the `(param)` syntax:

```
site/pages/(blog)/[slug].tsx
```

This creates routes like `/blog/my-post`.

## Learn More

- Check out the [documentation](#)
- Explore [examples](https://github.com/oopsio/jen.js/tree/main/examples)
- Join our [community](#)

Happy building! 
