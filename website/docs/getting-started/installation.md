# Installation

## System Requirements

- Node.js 16.x or higher
- npm, yarn, or pnpm
- TypeScript 5.x or higher (included in project)

## Quick Start

### Option 1: Using create-jen-js (Recommended)

```bash
npm create jen-js@latest my-app
cd my-app
npm install
npm run dev
```

Visit http://localhost:3000 to see your app.

### Option 2: Manual Setup

Create a new directory and initialize:

```bash
mkdir my-app
cd my-app
npm init -y
```

Install dependencies:

```bash
npm install \
  preact \
  preact-render-to-string \
  esbuild \
  typescript \
  @types/node
```

Create folder structure:

```bash
mkdir -p src site dist
```

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2020",
    "lib": ["ES2022"],
    "jsx": "react-jsx",
    "jsxImportSource": "preact",
    "strict": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowImportingTsExtensions": true,
    "baseUrl": ".",
    "paths": {
      "@src/*": ["src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "site/**/*.tsx"]
}
```

Create `package.json` scripts:

```json
{
  "scripts": {
    "dev": "node server.ts dev",
    "start": "node server.ts start",
    "build": "node build.js",
    "typecheck": "tsc --noEmit"
  }
}
```

### Option 3: From GitHub

Clone the repository:

```bash
git clone https://github.com/your-repo/jen-js.git
cd jen-js
npm install
npm run dev
```

## Verify Installation

Run type checking:

```bash
npm run typecheck
```

Should complete without errors.

## First Page

Create `site/(home).tsx`:

```typescript
export default function Home() {
  return (
    <html>
      <head>
        <title>Hello Jen.js</title>
      </head>
      <body>
        <h1>Welcome to Jen.js</h1>
        <p>This is your first page!</p>
      </body>
    </html>
  );
}
```

Start dev server:

```bash
npm run dev
```

Visit http://localhost:3000

## Configuration File

Create `jen.config.ts` in your project root:

```typescript
import type { FrameworkConfig } from '@src/core/config';

const config: FrameworkConfig = {
  siteDir: 'site',
  distDir: 'dist',
  rendering: {
    defaultMode: 'ssr',
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

## Environment Variables

Create `.env` file (optional):

```
DATABASE_URL=sqlite://./data.db
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
NODE_ENV=development
```

Access in code:

```typescript
const dbUrl = process.env.DATABASE_URL;
```

## Next Steps

- Read the Quick Start guide
- Learn about routing
- Create your first interactive page
- Set up a database
