---
title: Getting Started
description: Quick start guide for JenPress
---

# Getting Started with JenPress

This guide will help you set up your first JenPress documentation site.

## Installation

```bash
npm install -D @jenjs/jenpress
```

## Project Structure

Create a `docs/` directory in your project:

```
my-docs/
├── docs/
│   ├── index.md
│   ├── guide/
│   │   └── getting-started.md
│   └── api/
│       └── overview.md
├── jenpress.config.ts
└── package.json
```

## Configuration

Create a `jenpress.config.ts` file:

```typescript
import { defineConfig } from '@jenjs/jenpress';

export default defineConfig({
  title: 'My Documentation',
  description: 'Built with JenPress',
  base: '/',
  
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'API', link: '/api/' },
    ],
    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Introduction', link: '/guide/' },
          { text: 'Installation', link: '/guide/getting-started' },
        ],
      },
    ],
  },
});
```

## Running the Dev Server

```bash
npx jenpress dev
```

The dev server starts at `http://localhost:5173` with hot reload enabled.

## Building for Production

```bash
npx jenpress build
```

This generates a static HTML site in the `dist/` directory, ready for deployment.

## Markdown Syntax

### Frontmatter

Each document starts with YAML frontmatter:

```markdown
---
title: Page Title
description: Page description
---

# Content here
```

### Code Highlighting

Use code fences with language specification:

````markdown
```typescript
const greeting = "Hello, JenPress!";
console.log(greeting);
```
````

### Links

Internal links use relative paths:

```markdown
[Link to API](../api/overview.md)
```

## Next Steps

- Learn about [configuration](./config.md)
- Explore [components](./components.md)
- Deploy to [hosting](./deploy.md)
