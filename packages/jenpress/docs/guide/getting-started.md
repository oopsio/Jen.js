---
title: Getting Started with JenPress
description: Learn how to set up and use JenPress
---

# Getting Started with JenPress

JenPress is a Markdown-first documentation static site generator built with Vite and Preact.

## Installation

```bash
npm install -D @jenjs/jenpress
```

Or from the monorepo:

```bash
pnpm --filter @jenjs/jenpress dev
```

## Creating Your First Page

Create a markdown file in the `docs/` directory:

```markdown
---
title: My Page
description: A great page
---

# Welcome

Your content here!
```

Then visit `http://localhost:5173/docs/my-page.md` to see it.

## Markdown Syntax

JenPress supports standard Markdown:

### Headings

```markdown
# H1
## H2
### H3
```

### Lists

```markdown
- Item 1
- Item 2
  - Nested item
```

### Code Blocks

Use triple backticks with language specification:

```typescript
// TypeScript with syntax highlighting
const greeting: string = "Hello, JenPress!";
console.log(greeting);
```

```javascript
// JavaScript
const greeting = "Hello, JenPress!";
console.log(greeting);
```

```python
# Python
def hello():
    print("Hello, JenPress!")
```

```bash
# Bash
echo "Hello, JenPress!"
```

### Inline Formatting

- **Bold text** with `**text**`
- *Italic text* with `*text*`
- `Inline code` with backticks
- [Links](https://example.com) with `[text](url)`

### Blockquotes

> This is a blockquote.
> 
> It can span multiple lines.

## Configuration

Create `jenpress.config.ts` to customize your site:

```typescript
import { defineConfig } from '@jenjs/jenpress';

export default defineConfig({
  title: 'My Documentation',
  description: 'Built with JenPress',
  
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/docs/guide/getting-started.md' },
    ],
  },
});
```

## Build for Production

```bash
pnpm build
```

This generates a static site in `dist/` that you can deploy anywhere.

## Next Steps

- Create your documentation structure
- Customize with `jenpress.config.ts`
- Deploy to GitHub Pages, Vercel, or Netlify

Happy documenting! 📚
