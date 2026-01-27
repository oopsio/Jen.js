# Jen.js Boilerplate

A full-featured boilerplate for Jen.js with Tailwind CSS, custom styling, built-in plugins, and production-ready components.

## 🚀 Features

- **Tailwind CSS** - Fully configured with custom theme and utilities
- **TypeScript** - Strict mode enabled for maximum type safety
- **Custom Styling** - SCSS with CSS variables for easy theming
- **Plugins** - Analytics, theme management, and notifications included
- **Components** - Pre-built responsive Header, Hero, FeatureGrid, and Footer
- **SSR/SSG** - Flexible rendering modes for optimal performance
- **Mobile First** - Responsive design approach built-in
- **Production Ready** - Optimized builds and asset management

## 📋 Project Structure

```
boilerplate/
├── site/
│   ├── components/              # Reusable components
│   │   ├── Header.tsx           # Main navigation header
│   │   ├── Hero.tsx             # Hero sections
│   │   ├── FeatureGrid.tsx      # Feature showcase
│   │   └── Footer.tsx           # Footer with links
│   ├── plugins/                 # Extensible plugins
│   │   ├── analytics.ts         # Page view & event tracking
│   │   ├── theme.ts             # Light/dark mode management
│   │   └── notification.ts      # Toast notifications
│   ├── styles/
│   │   └── global.scss          # Global styles, animations, utilities
│   ├── (index).tsx              # Home page
│   └── about.tsx                # About page
├── dist/                        # Built output (generated)
├── .esbuild/                    # Build cache (generated)
├── package.json                 # Dependencies
├── jen.config.ts                # Jen.js configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── postcss.config.js            # PostCSS configuration
├── tsconfig.json                # TypeScript configuration
└── README.md                    # This file
```

## 🏃 Quick Start

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 2. Start Development Server

```bash
npm run dev
```

The dev server will start at `http://0.0.0.0:3000`

### 3. Build for Production

```bash
npm run build
```

Output will be generated in the `dist/` directory.

### 4. Start Production Server

```bash
npm run start
```

## 📚 Scripts

- `npm run dev` - Start development server with hot reload
- `npm run start` - Start production server
- `npm run build` - Build for production (SSG)
- `npm run typecheck` - Run TypeScript type checking
- `npm run clean` - Remove build artifacts

## 🎨 Customization

### Tailwind CSS

The Tailwind configuration is in `tailwind.config.js`. Customize:
- Colors (primary and accent color schemes included)
- Fonts (Inter font pre-configured)
- Animations (fadeIn, slideUp, pulseGlow)
- Custom utilities (text-gradient, card-shadow, btn-primary, etc.)

### Global Styles

Edit `site/styles/global.scss` to customize:
- CSS variables for theming
- Base element styles
- Component styles (cards, buttons, forms)
- Responsive utilities
- Animations

### Components

All components are in `site/components/` and can be easily modified:
- `Header.tsx` - Navigation and branding
- `Hero.tsx` - Large banner sections
- `FeatureGrid.tsx` - Feature showcase grid
- `Footer.tsx` - Footer with links

### Plugins

Extend functionality using plugins in `site/plugins/`:

#### Analytics Plugin
```typescript
import { analytics } from './plugins/analytics.ts';

// Track page views automatically
// Track custom events
analytics.trackEvent('user_signup', { method: 'email' });
```

#### Theme Plugin
```typescript
import { themeManager } from './plugins/theme.ts';

themeManager.setTheme('dark');
themeManager.toggleTheme();
```

#### Notifications Plugin
```typescript
import { notifications } from './plugins/notification.ts';

notifications.success('Changes saved!');
notifications.error('Something went wrong');
notifications.warning('Please review this');
```

## 🔧 Configuration

### Jen.js Config (`jen.config.ts`)

```typescript
const config: FrameworkConfig = {
  siteDir: "site",           // Directory containing your pages
  distDir: "dist",           // Output directory
  rendering: {
    defaultMode: "ssr",      // or "ssg" for static generation
    defaultRevalidateSeconds: 60
  },
  // ... more options
};
```

### Adding New Pages

Create files in the `site/` directory following the naming pattern:
- `(index).tsx` → `/`
- `about.tsx` → `/about`
- `contact.tsx` → `/contact`

Use the `Head` export for page-specific metadata:

```typescript
export function Head() {
  return (
    <>
      <title>Page Title</title>
      <meta name="description" content="..." />
    </>
  );
}
```

## 🎯 Development Tips

1. **Hot Reload** - Changes to components and styles reload automatically
2. **Type Safety** - Run `npm run typecheck` before building
3. **CSS Classes** - Use Tailwind classes first, then custom SCSS
4. **Component Props** - Type all component props for better DX
5. **Mobile Testing** - Use responsive design utilities in global.scss

## 📦 Dependencies

- **preact** - Lightweight React alternative
- **esbuild** - Fast JavaScript bundler
- **tailwindcss** - Utility-first CSS framework
- **typescript** - Type-safe JavaScript
- **clsx** - Utility for constructing className strings

## 🚀 Deployment

The boilerplate can be deployed to:
- **Vercel** - Automatic from GitHub
- **Netlify** - Drop-in deployment
- **Docker** - Container-based deployment
- **Traditional Servers** - Just run `npm run build && npm run start`

## 📝 License

MIT - Feel free to use this boilerplate for any project.

## 🤝 Contributing

Have improvements? Feel free to submit pull requests or open issues!

## 🆘 Support

For help with Jen.js:
- Check the [Jen.js Documentation](https://github.com/kessud2021/Jen.js)
- Review example projects in the `example/` directory
- Submit issues on GitHub

---

Happy building! 🎉
