# Configuration

Customize Jen.js behavior with `jen.config.ts` in your project root.

## Basic Configuration

`jen.config.ts`

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

## Configuration Options

### Directories

```typescript
{
  // Source directory containing site routes
  siteDir: 'site',
  
  // Output directory for built files
  distDir: 'dist',
  
  // Public assets directory (copied as-is)
  publicDir: 'public',
  
  // Cache directory
  cacheDir: '.jen-cache'
}
```

### Rendering

```typescript
{
  rendering: {
    // 'ssr' = Server-Side Rendering (dynamic per request)
    // 'ssg' = Static Site Generation (pre-built HTML)
    defaultMode: 'ssr',
    
    // How often to revalidate static pages (seconds)
    defaultRevalidateSeconds: 60,
    
    // Whether to hydrate client-side in SSG
    hydrate: true,
    
    // CSS-in-JS framework (if any)
    cssFramework: 'none' // or 'emotion', 'styled-components'
  }
}
```

### Routing

```typescript
{
  routes: {
    // File extensions to scan for routes
    fileExtensions: ['.tsx', '.jsx', '.ts', '.js'],
    
    // Regex pattern for route files: (name).tsx
    routeFilePattern: /^\((.+)\)\.(t|j)sx?$/,
    
    // Allow index routes like (index).tsx → /
    enableIndexFallback: true,
    
    // Case-sensitive routing
    caseSensitive: false
  }
}
```

### Build

```typescript
{
  build: {
    // Minify output
    minify: true,
    
    // Source maps in production
    sourceMaps: false,
    
    // Code splitting strategy
    splitting: 'auto', // 'auto', 'manual', 'none'
    
    // External dependencies (don't bundle)
    external: ['express', 'pg'],
    
    // Environment variables to inline
    define: {
      __VERSION__: '"1.0.0"'
    }
  }
}
```

### Server

```typescript
{
  server: {
    // Host and port
    host: '0.0.0.0',
    port: 3000,
    
    // CORS configuration
    cors: {
      origin: '*',
      credentials: true
    },
    
    // Request timeout (ms)
    timeout: 30000,
    
    // Body size limit
    bodySizeLimit: '10mb'
  }
}
```

### Database

```typescript
{
  database: {
    // Primary database configuration
    default: {
      type: 'sqlite',
      config: { filename: './data.db' }
    },
    
    // Additional databases
    connections: {
      cache: {
        type: 'redis',
        config: { url: 'redis://localhost:6379' }
      },
      search: {
        type: 'mongodb',
        config: { url: 'mongodb://localhost:27017/app' }
      }
    }
  }
}
```

### Plugins

```typescript
{
  plugins: [
    // Load plugins
    '@jen/plugin-analytics',
    './src/plugins/custom-plugin.ts'
  ]
}
```

### Middleware

```typescript
{
  middleware: [
    // Global middleware
    'cors',
    'compression',
    './src/middleware/auth.ts'
  ]
}
```

### TypeScript

```typescript
{
  typescript: {
    // Check types during build
    typeCheck: true,
    
    // Strict mode
    strict: true,
    
    // ES target
    target: 'ES2022'
  }
}
```

## Environment Variables

Load from `.env` file:

```bash
# .env
DATABASE_URL=sqlite://./data.db
REDIS_URL=redis://localhost:6379
API_KEY=secret123
NODE_ENV=development
```

Access in config or code:

```typescript
const config: FrameworkConfig = {
  server: {
    port: parseInt(process.env.PORT || '3000')
  },
  build: {
    define: {
      __API_URL__: JSON.stringify(process.env.API_URL)
    }
  }
};
```

## Different Configs Per Environment

Create separate config files:

```
jen.config.ts              # Development
jen.config.production.ts   # Production
jen.config.test.ts        # Testing
```

Or use environment variables:

```typescript
import type { FrameworkConfig } from '@src/core/config';

const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';

const config: FrameworkConfig = {
  rendering: {
    defaultMode: isProd ? 'ssg' : 'ssr'
  },
  build: {
    minify: isProd,
    sourceMaps: isDev
  },
  server: {
    port: isDev ? 3000 : 8080
  }
};

export default config;
```

## Common Configurations

### Static Site (Blog)

```typescript
const config: FrameworkConfig = {
  siteDir: 'site',
  distDir: 'dist',
  rendering: {
    defaultMode: 'ssg',  // Pre-build all pages
    defaultRevalidateSeconds: 3600
  },
  build: {
    minify: true,
    sourceMaps: false
  }
};
```

### Server-Side Rendering

```typescript
const config: FrameworkConfig = {
  rendering: {
    defaultMode: 'ssr'  // Render on request
  },
  server: {
    port: 3000,
    timeout: 30000
  }
};
```

### API Server

```typescript
const config: FrameworkConfig = {
  siteDir: 'api',  // Only API routes
  rendering: {
    defaultMode: 'ssr'
  },
  server: {
    cors: {
      origin: ['https://myapp.com'],
      credentials: true
    }
  }
};
```

### Hybrid (SSG + SSR)

```typescript
const config: FrameworkConfig = {
  rendering: {
    defaultMode: 'ssg'  // Most pages static
  },
  routes: {
    // Specific routes can override with frontmatter:
    // export const mode = 'ssr';
  }
};
```

## Per-Route Configuration

Override config in individual route files:

```typescript
// site/(home).tsx

// This route always uses SSR
export const mode = 'ssr';

// Cache for 1 hour
export const revalidate = 3600;

// Custom metadata
export const meta = {
  title: 'Home',
  description: 'Welcome'
};

export default function Home() {
  // ...
}
```

## TypeScript Configuration

Configure TypeScript in `tsconfig.json`:

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
    "baseUrl": ".",
    "paths": {
      "@src/*": ["src/*"]
    }
  },
  "include": ["src", "site"]
}
```

## Validation

Configuration is validated at startup. Invalid options cause errors:

```
Error: Unknown configuration key "invalidKey"
```

Check your `jen.config.ts` for typos or unsupported options.

## Next Steps

- Configure your database
- Set up environment variables
- Customize build settings
- Add plugins
