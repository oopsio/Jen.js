# Jen.js Blog Example

A modern, fast blog example showcasing Jen.js capabilities including:

- ✨ **Markdown Support** - Write blog posts in Markdown with YAML frontmatter
- 🚀 **Dynamic Routes** - Automatic route generation from markdown files
- 🎨 **Beautiful Design** - Clean, responsive design with dark mode support
- 📱 **Mobile Responsive** - Works perfectly on all devices
- ⚡ **Fast Performance** - Optimized builds with Jen.js
- 🔍 **SEO Friendly** - Server-side rendering with proper meta tags
- 🧩 **Reusable Components** - Header, Footer, Blog Card components

## Project Structure

```
blog/
├── site/
│   ├── components/       # Reusable React components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── BlogCard.tsx
│   │   └── TagList.tsx
│   ├── pages/            # Page routes
│   │   ├── (index).tsx   # Home page
│   │   └── (blog)/
│   │       ├── index.tsx # Blog list
│   │       └── [slug].tsx # Individual post
│   ├── posts/            # Markdown blog posts
│   │   ├── getting-started.md
│   │   ├── markdown-guide.md
│   │   ├── design-principles.md
│   │   └── performance-tips.md
│   ├── styles/
│   │   └── global.scss   # Global styles
│   └── assets/
│       └── images/       # Static images
├── lib/                  # Framework library (dist/src)
├── jen.config.ts        # Framework configuration
├── server.ts            # Development server
├── build.ts             # Build script
├── package.json         # Dependencies
└── README.md            # This file
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

### Running the Blog

**Development Mode:**
```bash
npm run dev
```

The blog will be available at `http://localhost:3000`

**Production Mode:**
```bash
npm run build
npm run start
```

### Creating Blog Posts

Blog posts are stored in `site/posts/` as Markdown files. Each post needs YAML frontmatter:

```markdown
---
title: My Blog Post
date: 2026-02-22
author: Your Name
excerpt: A brief summary of the post
featured: false
---

# My Blog Post

Your content here...
```

#### Frontmatter Fields:

- `title` (required) - Post title
- `date` (required) - Publication date (YYYY-MM-DD)
- `author` (required) - Author name
- `excerpt` (required) - Brief summary shown in listings
- `featured` (optional) - If true, shows on home page featured section

### Writing Content

The blog supports full Markdown syntax:

- **Headings**: `# H1`, `## H2`, etc.
- **Bold**: `**text**`
- **Italic**: `*text*`
- **Lists**: `- item` or `1. item`
- **Code**: `` `inline` `` or triple backticks for blocks
- **Links**: `[text](url)`
- **Images**: `![alt](url)`
- **Tables**: Standard Markdown tables
- **Blockquotes**: `> quote`

See `site/posts/markdown-guide.md` for complete examples.

## Features

### 1. Server-Side Rendering (SSR)

All pages are rendered on the server for:
- ✅ Perfect SEO
- ✅ Fast initial page load
- ✅ No blank screens
- ✅ Accessibility benefits

### 2. Dynamic Markdown Processing

- Parse markdown files at build/runtime
- Extract YAML frontmatter
- Convert to HTML with proper syntax highlighting
- Meta information available in components

### 3. Responsive Design

The design uses a mobile-first approach:
- Works on all screen sizes (480px+)
- Touch-friendly navigation
- Readable on phones, tablets, and desktops

### 4. Dark Mode

Built-in dark mode support via `prefers-color-scheme` media query.

### 5. Fast Performance

- Optimized images
- Minified CSS and JavaScript
- Static site generation ready
- No unnecessary dependencies

## Components

### Header
Navigation header with logo and links to main sections.

```tsx
<Header />
```

### Footer
Footer with links, social media, and copyright information.

```tsx
<Footer year={2026} author="Your Name" />
```

### BlogCard
Card component to display blog post previews.

```tsx
<BlogCard 
  title="Post Title"
  excerpt="Brief description"
  author="Author Name"
  date="2026-02-22"
  slug="post-slug"
  featured={false}
/>
```

## Customization

### Colors

Edit `site/styles/global.scss` to customize the color scheme. All colors are defined as CSS variables in `:root`:

```scss
:root {
  --color-primary: #0f172a;
  --color-accent: #3b82f6;
  // ...
}
```

### Fonts

Google Fonts are included by default. To change fonts:
1. Edit the imports in `jen.config.ts`
2. Update `--font-family-sans` in `global.scss`

### Navigation

Edit `site/components/Header.tsx` to add/remove navigation links.

## Adding New Features

### Add a New Page

Create a new file in `site/pages/`:

```tsx
// site/pages/(about).tsx
export default function About() {
  return (
    <div className="page">
      <Header />
      <main>
        {/* Your content */}
      </main>
      <Footer />
    </div>
  );
}
```

### Add a Tags System

Create `site/pages/(tags)/[tag].tsx` to display posts by tag:

```tsx
export default function TagPage({ posts }: { posts: Post[] }) {
  return (
    // Render posts with this tag
  );
}

export async function getStaticPaths() {
  // Return all available tags
}

export async function getStaticProps({ params }) {
  // Get posts for this tag
}
```

## Deployment

### Static Site Generation (Recommended)

```bash
npm run build
```

Upload the `dist/` folder to any static hosting:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Any web server

### Server Deployment

The blog can also run as a Node.js server:

```bash
npm run start
```

Supports:
- Heroku
- Railway
- Vercel
- Any Node.js hosting

## Performance Tips

1. **Optimize Images**
   - Use modern formats (WebP, AVIF)
   - Compress before uploading
   - Use descriptive alt text

2. **Lazy Load Content**
   - Images load only when needed
   - Non-critical JavaScript loads later

3. **Enable Caching**
   - Static assets cached for 1 year
   - HTML cached for shorter duration
   - Use CDN for global distribution

4. **Monitor Performance**
   - Run Google PageSpeed Insights
   - Check Web Vitals
   - Monitor real user metrics

## TypeScript Support

This project is fully typed with TypeScript. The framework library in `lib/` provides:

- Type-safe component props
- Static site generation types
- Configuration types

All code is checked with strict TypeScript mode.

## Dependencies

- **preact**: Lightweight React alternative
- **preact-render-to-string**: SSR support
- **marked**: Markdown parser
- **gray-matter**: YAML frontmatter parser
- **sirv**: Static file serving

## Development

### Type Checking

```bash
npm run typecheck
```

### Clean Build

```bash
npm run clean
```

## License

This example is part of [Jen.js](https://github.com/oopsio/jen.js) and is licensed under the GNU General Public License v3.0.

## Resources

- [Jen.js Documentation](https://github.com/oopsio/jen.js)
- [Preact Documentation](https://preactjs.com)
- [Markdown Guide](https://www.markdownguide.org)

## Support

For issues and questions:
- 📖 Check the [examples](https://github.com/oopsio/jen.js/tree/main/examples)
- 🐛 Report bugs on [GitHub](https://github.com/oopsio/jen.js/issues)
- 💬 Join the [community](https://discord.gg/example)

---

Built with ❤️ using Jen.js
