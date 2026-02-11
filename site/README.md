# Jen.js Official Website

This is the official website for **Jen.js**, a TypeScript-first web framework for building fast, modern applications with Preact and file-based routing.

## 🚀 Built With

- **[Astro](https://astro.build/)** - Fast static site generator
- **[Preact](https://preactjs.com/)** - Lightweight React alternative
- **[MDX](https://mdxjs.com/)** - Markdown with JSX support
- **Geist Design System** - Vercel-inspired clean design

## 📁 Project Structure

```
site/main/
├── public/                 # Static assets (favicon, etc.)
├── src/
│   ├── pages/             # Route pages (Astro + MDX)
│   │   ├── index.astro    # Landing page
│   │   ├── docs/          # Documentation pages (MDX)
│   │   ├── api/           # API reference
│   │   └── examples/      # Examples page
│   ├── layouts/           # Layout components
│   │   ├── Base.astro     # Base layout
│   │   └── Docs.astro     # Documentation layout
│   ├── components/        # Reusable components
│   │   ├── Navbar.astro
│   │   ├── Footer.astro
│   │   └── Sidebar.astro
│   └── styles/            # Global and page-specific CSS
│       ├── global.css     # Global styles (variables, typography)
│       ├── home.css       # Landing page styles
│       ├── docs.css       # Documentation styles
│       └── examples.css   # Examples page styles
├── astro.config.mjs       # Astro configuration
├── tsconfig.json          # TypeScript configuration
└── package.json
```

## 🎨 Features

### Landing Page
- Hero section with gradient text
- Feature cards showcasing key benefits
- Rendering modes comparison
- Quick start example
- Statistics section
- Call-to-action sections

### Documentation Site
- **Sidebar Navigation** - Auto-linked navigation
- **MDX Support** - Markdown with embedded components
- **Table of Contents** - On-page navigation for long docs
- **Responsive Design** - Mobile-friendly layout
- **Code Blocks** - Syntax highlighting ready

### Design System
- **Geist-inspired** - Clean, minimal aesthetic
- **Dark Mode Ready** - CSS variables for light/dark themes
- **Responsive** - Mobile-first approach
- **Accessible** - Semantic HTML, proper contrast

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18.0 or higher
- npm, pnpm, or yarn

### Quick Start

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:4321)
npm run dev

# Build static site
npm run build

# Preview production build
npm run preview
```

## 📄 Pages Included

### Landing Page (`/`)
The main entry point with hero section, features, and CTAs.

### Documentation
- `/docs` - Introduction
- `/docs/installation` - Installation guide
- `/docs/quick-start` - Quick start tutorial
- `/docs/file-based-routing` - Routing guide
- `/docs/rendering-modes` - SSG, SSR, ISR, PPR explained
- `/docs/islands-architecture` - Islands pattern guide

### API Reference (`/api`)
Complete Jen.js API documentation including:
- LoaderContext
- RouteModule
- Island Function
- API Routes
- Database APIs
- Caching
- Authentication
- i18n

### Examples (`/examples`)
Example projects and code snippets including:
- Blog template
- Documentation site
- Portfolio
- E-commerce
- SaaS Dashboard
- API Service

## 🎯 Key Sections

### Components

- **Navbar** - Fixed header with logo and navigation
- **Footer** - Links and company info
- **Sidebar** - Documentation navigation

### Layouts

- **Base** - Wraps all pages with header/footer
- **Docs** - Documentation layout with sidebar and TOC

### Styles

- **CSS Variables** - Color system, spacing, shadows
- **Responsive Design** - Mobile, tablet, desktop breakpoints
- **Dark Mode** - Using `prefers-color-scheme`

## 🚢 Deployment

Build outputs to `dist/` as static HTML:

```bash
npm run build
```

### Deploy to GitHub Pages

```bash
# The dist/ folder is ready to deploy
# Configure your repo to serve from /dist
```

### Deploy to Vercel, Netlify, or any static host

Simply point your host to the `dist/` directory.

## 📝 Adding New Pages

### Add a Documentation Page

Create a new MDX file in `src/pages/docs/`:

```mdx
---
layout: ../../layouts/Docs.astro
title: My Page Title
description: Page description
---

# My Page

Content here...
```

The sidebar navigation is configured in `src/components/Sidebar.astro`.

### Add a Regular Page

Create a new `.astro` file in `src/pages/`:

```astro
---
import Base from '../layouts/Base.astro';
---

<Base title="My Page">
  <div class="container">
    <h1>Hello World</h1>
  </div>
</Base>
```

## 🎨 Customization

### Colors
Edit CSS variables in `src/styles/global.css`:

```css
:root {
  --color-bg: #ffffff;
  --color-accent: #0070f3;
  --color-text: #000000;
  /* ... more colors ... */
}
```

### Typography
Modify fonts and sizes in `src/styles/global.css`.

### Branding
Update the logo and colors in `src/components/Navbar.astro`.

## 📚 Documentation Sidebar

Edit `src/components/Sidebar.astro` to add/remove documentation pages.

## 🔍 SEO

Each page includes:
- `<title>` tag
- `<meta name="description">`
- Semantic HTML
- Open Graph ready (can be added)

## 📦 Dependencies

- `astro@^4.8.0` - Static site generator
- `@astrojs/preact@^3.5.1` - Preact integration
- `@astrojs/mdx@^3.1.8` - MDX support
- `preact@^10.24.1` - UI library

## 🤝 Contributing

To contribute to the Jen.js website:

1. Clone the Jen.js repository
2. Navigate to `site/main/`
3. Make your changes
4. Test locally with `npm run dev`
5. Build with `npm run build`
6. Submit a pull request

## 📖 Learn More

- [Astro Documentation](https://docs.astro.build)
- [Jen.js Docs](./src/pages/docs/)
- [Preact Docs](https://preactjs.com)

## 📄 License

This website is part of Jen.js, licensed under GNU GPL 3.0. See [LICENSE](../../LICENSE) for details.
