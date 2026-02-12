---
title: API Overview
description: JenPress API reference
---

# API Overview

JenPress provides a simple API for configuration and theming.

## defineConfig

Configure your JenPress site:

```typescript
import { defineConfig } from '@jenjs/jenpress';

export default defineConfig({
  title: 'My Docs',
  description: 'Documentation site',
  base: '/',
});
```

### Configuration Options

- `title` (string) - Site title
- `description` (string) - Site description
- `base` (string) - Base path for deployment
- `lang` (string) - HTML language attribute
- `srcDir` (string) - Source directory
- `outDir` (string) - Output directory
- `themeConfig` (object) - Theme configuration

## Type Definitions

```typescript
interface SiteConfig {
  title: string;
  description?: string;
  base?: string;
  lang?: string;
  themeConfig?: ThemeConfig;
  markdown?: MarkdownOptions;
}

interface ThemeConfig {
  nav?: NavLink[];
  sidebar?: SidebarItem[];
  logo?: string;
  repo?: string;
}

interface NavLink {
  text: string;
  link: string;
  activeMatch?: string;
}
```

## Exported Components

### Layout

The default layout component that wraps your pages.

### Nav

Navigation bar component.

### Sidebar

Sidebar navigation component.

## Markdown API

JenPress uses Markdown-it for parsing with these features:

- HTML support
- Link autodetection
- Typographic improvements
- Syntax highlighting with Shiki

---

For more details, check the documentation or file an issue on GitHub.
