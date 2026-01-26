---
sidebar_position: 2
---

# Installation

## System Requirements

- **Node.js** 18 or higher
- **npm** 9+ or **pnpm** 8+
- **TypeScript** 5.0+ (included)

## Setup

### Clone the Repository

```bash
git clone https://github.com/kessud2021/Jen.js.git
cd Jen.js
```

### Install Dependencies

Using npm:
```bash
npm install
```

Or using pnpm (recommended):
```bash
pnpm install
```

### Verify Installation

Check that TypeScript and build tools work:

```bash
npm run typecheck
npm run build
```

## Development Server

Start the dev server with SSR enabled:

```bash
npm run dev
```

The server runs on **http://0.0.0.0:3000**

Edit files in `site/` and see changes live!

## Configuration

Edit `jen.config.ts` to customize the framework:

```typescript
import type { FrameworkConfig } from '@src/core/types';

const config: FrameworkConfig = {
  siteDir: 'site',           // Route source directory
  distDir: 'dist',           // Build output directory
  rendering: {
    defaultMode: 'ssr',      // or 'ssg'
    defaultRevalidateSeconds: 60
  },
  routes: {
    fileExtensions: ['.tsx', '.jsx', '.ts', '.js'],
    routeFilePattern: /^\((.+)\)\.(t|j)sx?$/,
    enableIndexFallback: true
  }
};

export default config;
```

## Build for Production

### Static Site Generation (SSG)

```bash
npm run build
```

Outputs optimized HTML, CSS, and JS to `dist/`

### Server-Side Rendering (SSR)

Build and run in production:

```bash
npm run build
npm run start
```

## Project Structure

```
Jen.js/
├── src/
│   ├── build/              # SSG build logic
│   ├── server/             # HTTP server
│   ├── core/               # Config & routing
│   ├── runtime/            # Preact SSR & hydration
│   ├── native/             # Native module stubs
│   ├── db/                 # Database layer
│   ├── api/                # API utilities
│   ├── auth/               # Authentication
│   ├── cache/              # Caching
│   ├── middleware/         # Middleware system
│   ├── plugin/             # Plugins
│   └── shared/             # Utilities
├── site/                   # Your pages & routes
├── dist/                   # Build output
├── jen.config.ts          # Configuration
├── build.ts               # Build entry
└── server.ts              # Server entry
```

## Troubleshooting

### Module not found errors

Ensure path aliases work in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@src/*": ["src/*"]
    }
  }
}
```

### TypeScript errors

Run type checking:

```bash
npm run typecheck
```

Fix strict mode issues before building.

### Build failures

Clean build artifacts:

```bash
npm run clean
npm run build
```

## Next Steps

- [Project Structure](./project-structure) - Understand the layout
- [Routing](./routing) - Create your first route
- [SSG vs SSR](./ssg-ssr) - Choose rendering mode
