# Jen.js Blog Example - Features Overview

## ✨ Key Features Demonstrated

### 1. **Markdown Blog Posts**

- Posts stored in `site/posts/` as `.md` files
- YAML frontmatter for metadata (title, date, author, excerpt)
- Automatic parsing with `gray-matter` and `marked`
- **Files:**
  - `getting-started.md` - Framework intro
  - `markdown-guide.md` - Content writing guide
  - `design-principles.md` - Web design tips
  - `performance-tips.md` - Performance optimization

### 2. **Dynamic Routes**

- **Home page** (`site/pages/(index).tsx`)
  - Featured posts section
  - Latest posts grid
  - Call-to-action sections
- **Blog listing** (`site/pages/(blog)/index.tsx`)
  - All posts in a grid
  - Sorted by date (newest first)
  - Responsive card layout

- **Individual post pages** (`site/pages/(blog)/[slug].tsx`)
  - Dynamic route generation from filenames
  - Full HTML rendering from markdown
  - Post metadata (author, date)
  - Back navigation

### 3. **Beautiful, Responsive Design**

- Modern, clean aesthetic
- Mobile-first approach
- Responsive grid layouts
- Smooth transitions and hover effects
- Sticky header navigation

### 4. **Reusable Components**

- **Header** - Navigation with logo
- **Footer** - Links and social placeholders
- **BlogCard** - Post preview cards
- **TagList** - Tag display (extensible)

### 5. **Professional Styling**

- **Comprehensive CSS framework** in `site/styles/global.scss`
  - CSS variables for theming
  - Responsive breakpoints
  - Dark mode support
  - Accessibility features

- **Features:**
  - Hero sections with gradients
  - Featured post badges
  - Code syntax highlighting
  - Table styling
  - Blockquote styling
  - Proper typography hierarchy

### 6. **Server-Side Rendering (SSR)**

- All pages render on the server
- Perfect SEO (no JS required for content)
- Fast initial page load
- Metadata injection via `jen.config.ts`

### 7. **TypeScript Support**

- Fully typed components with Preact
- Type-safe props
- Static generation type utilities
- 100% TypeScript codebase

### 8. **Performance Optimized**

- Automatic code splitting
- Minified CSS and JavaScript
- Asset hashing for caching
- No unnecessary dependencies
- Lean framework (~166 files in dist/)

## 📁 Project Architecture

```
examples/blog/
├── lib/                           # Framework library (from dist/src)
│   ├── build/                     # Build pipeline
│   ├── server/                    # HTTP server
│   ├── core/                      # Config, routing, types
│   ├── runtime/                   # SSR runtime
│   ├── middleware/                # Express-style middleware
│   └── ...                        # Other framework modules
│
├── site/                          # User content
│   ├── pages/                     # Route definitions
│   │   ├── (index).tsx            # Home page
│   │   └── (blog)/
│   │       ├── index.tsx          # Post listing
│   │       └── [slug].tsx         # Dynamic post page
│   │
│   ├── components/                # Reusable components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── BlogCard.tsx
│   │   └── TagList.tsx
│   │
│   ├── posts/                     # Markdown posts
│   │   ├── getting-started.md
│   │   ├── markdown-guide.md
│   │   ├── design-principles.md
│   │   └── performance-tips.md
│   │
│   ├── styles/                    # Global styles
│   │   └── global.scss
│   │
│   └── assets/                    # Static files
│       └── images/
│
├── jen.config.ts                  # Framework configuration
├── server.ts                      # Dev server entry
├── build.ts                       # Build entry
└── package.json                   # Dependencies
```

## 🎯 What You Can Learn

### Frontend Development

1. **Component Composition** - Building reusable UI components
2. **Styling** - SCSS with variables and responsive design
3. **Type Safety** - TypeScript with Preact
4. **State Management** - Props-based component architecture

### Content Management

1. **Markdown Processing** - Parsing and rendering markdown
2. **Metadata Extraction** - YAML frontmatter handling
3. **Dynamic Content** - Route generation from files
4. **SEO** - Meta tags and server rendering

### Framework Concepts

1. **Static Site Generation** - Pre-rendering at build time
2. **Server-Side Rendering** - Runtime HTML generation
3. **Routing System** - File-based route convention
4. **Configuration** - Framework config patterns

### Performance & Optimization

1. **Code Splitting** - Automatic module chunking
2. **Asset Management** - Hashing and caching
3. **Build Optimization** - Minification and tree-shaking
4. **Responsive Design** - Mobile-first CSS

## 🚀 Getting Started

### Quick Start

```bash
cd examples/blog
npm install
npm run dev
```

Visit `http://localhost:3000` to see the blog in action!

### Common Tasks

**Add a new blog post:**

1. Create `site/posts/your-post.md`
2. Add frontmatter and content
3. Restart dev server (auto-reload available)
4. Post appears in listings and at `/blog/your-post`

**Customize colors:**

1. Edit `site/styles/global.scss` CSS variables
2. Changes apply instantly

**Add a new page:**

1. Create `site/pages/(new-page).tsx`
2. Accessible at `/new-page`

## 📊 Technology Stack

- **Framework:** Jen.js (TypeScript-first SSG/SSR)
- **Runtime:** Preact (lightweight React)
- **Rendering:** preact-render-to-string
- **Content:** Markdown with YAML frontmatter
- **Styling:** SCSS with CSS variables
- **Build:** esbuild + Turborepo
- **Type Safety:** TypeScript strict mode

## 🎨 Design Highlights

### Color Scheme

- **Primary:** `#0f172a` (Dark navy)
- **Secondary:** `#1e293b` (Slate)
- **Accent:** `#3b82f6` (Blue)
- **Text:** `#1e293b` / Light mode, `#e2e8f0` / Dark mode

### Typography

- **Sans-serif:** Inter (system fallback)
- **Monospace:** JetBrains Mono

### Responsive Breakpoints

- Mobile: < 480px
- Tablet: 480px - 768px
- Desktop: 768px - 1200px
- Large: > 1200px

### Features

- Dark mode support
- Smooth transitions (150ms-350ms)
- Accessible focus states
- Reduced motion support

## 📝 Example Posts

The blog includes 4 example posts:

1. **Getting Started** - Introduction to Jen.js
2. **Markdown Guide** - Complete markdown syntax reference
3. **Design Principles** - Web design best practices
4. **Performance Tips** - Optimization strategies

Each demonstrates different markdown features and content types.

## 🔧 Extensibility

This example can be extended with:

- **Search functionality** - Index posts and add search
- **Tags system** - Categorize posts by tags
- **Comments** - Add user interaction
- **RSS feed** - Syndicate content
- **Dark mode toggle** - Client-side theme switching
- **Analytics** - Track visitor behavior
- **Related posts** - Show similar content
- **Reading time** - Estimate read duration

## 📚 Resources

- [Jen.js Repository](https://github.com/oopsio/jen.js)
- [Preact Documentation](https://preactjs.com)
- [Markdown Guide](https://www.markdownguide.org)
- [SCSS Documentation](https://sass-lang.com)

---

This blog example showcases the power of Jen.js for building fast, modern web applications with excellent developer experience! 🚀
