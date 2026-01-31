# Framework Config API

Complete reference for `jen.config.ts` options.

## Type Definition

```typescript
interface FrameworkConfig {
  siteDir?: string;
  distDir?: string;
  publicDir?: string;
  cacheDir?: string;
  
  rendering?: RenderingConfig;
  routes?: RoutesConfig;
  build?: BuildConfig;
  server?: ServerConfig;
  database?: DatabaseConfig;
  auth?: AuthConfig;
  plugins?: PluginConfig[];
  middleware?: MiddlewareConfig[];
  typescript?: TypeScriptConfig;
}
```

## Directories

```typescript
{
  siteDir: 'site',              // Source routes
  distDir: 'dist',              // Build output
  publicDir: 'public',          // Static assets
  cacheDir: '.jen-cache'        // Cache location
}
```

## Rendering

```typescript
{
  rendering: {
    defaultMode: 'ssr' | 'ssg',           // Default rendering
    defaultRevalidateSeconds: 60,          // Revalidation (SSG)
    hydrate: true,                        // Client hydration
    cssFramework: 'none'                  // CSS solution
  }
}
```

## Routes

```typescript
{
  routes: {
    fileExtensions: ['.tsx', '.jsx', '.ts', '.js'],
    routeFilePattern: /^\((.+)\)\.(t|j)sx?$/,
    enableIndexFallback: true,
    caseSensitive: false
  }
}
```

## Build

```typescript
{
  build: {
    minify: true,                         // Minify output
    sourceMaps: false,                    // Generate maps
    splitting: 'auto' | 'manual' | 'none',
    external: ['express'],                // Don't bundle
    define: {                             // Inline constants
      __VERSION__: '"1.0.0"'
    },
    workers: 4                            // Build workers
  }
}
```

## Server

```typescript
{
  server: {
    host: '0.0.0.0',
    port: 3000,
    cors: {
      origin: '*',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type']
    },
    timeout: 30000,                       // Request timeout (ms)
    bodySizeLimit: '10mb'
  }
}
```

## Database

```typescript
{
  database: {
    default: {
      type: 'sqlite' | 'postgres' | 'mysql' | 'mongodb' | 'jdb',
      config: {
        // Type-specific config
      }
    },
    connections: {
      cache: { /* ... */ },
      search: { /* ... */ }
    }
  }
}
```

### SQLite Config

```typescript
{
  type: 'sqlite',
  config: {
    filename: './data.db'
  }
}
```

### PostgreSQL Config

```typescript
{
  type: 'postgres',
  config: {
    host: 'localhost',
    port: 5432,
    database: 'myapp',
    user: 'postgres',
    password: 'secret',
    // OR
    connectionString: 'postgresql://...'
  }
}
```

### MySQL Config

```typescript
{
  type: 'mysql',
  config: {
    host: 'localhost',
    user: 'root',
    password: 'secret',
    database: 'myapp'
  }
}
```

### MongoDB Config

```typescript
{
  type: 'mongodb',
  config: {
    url: 'mongodb://localhost:27017/myapp'
  }
}
```

### jDB Config

```typescript
{
  type: 'jdb',
  config: {
    root: './data',
    name: 'app'
  }
}
```

## Authentication

```typescript
{
  auth: {
    secret: process.env.JWT_SECRET,
    algorithm: 'HS256' | 'RS256',
    issuer: 'your-app',
    audience: 'your-app',
    expiresIn: '7d'
  }
}
```

## Plugins

```typescript
{
  plugins: [
    '@jen/plugin-analytics',
    './src/plugins/custom.ts',
    createCustomPlugin({ option: 'value' })
  ]
}
```

## Middleware

```typescript
{
  middleware: [
    corsMiddleware,
    compressionMiddleware,
    authMiddleware
  ]
}
```

## TypeScript

```typescript
{
  typescript: {
    typeCheck: true,            // Check during build
    strict: true,               // Strict mode
    target: 'ES2022',
    lib: ['ES2022'],
    jsx: 'react-jsx',
    jsxImportSource: 'preact'
  }
}
```

## Environment-Specific Config

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
    port: parseInt(process.env.PORT || '3000')
  }
};

export default config;
```

## Per-Route Overrides

In route files:

```typescript
// site/(home).tsx
export const mode = 'ssg';              // Override rendering mode
export const revalidate = 3600;         // Revalidation (seconds)
export const meta = {
  title: 'Home',
  description: 'Welcome'
};
```

## Configuration Validation

Configuration is validated on startup:

```
Error: Unknown configuration key "invalidKey"
```

Check `jen.config.ts` for typos or unsupported options.

## Default Values

```typescript
const defaults = {
  siteDir: 'site',
  distDir: 'dist',
  publicDir: 'public',
  cacheDir: '.jen-cache',
  
  rendering: {
    defaultMode: 'ssr',
    defaultRevalidateSeconds: 60,
    hydrate: true,
    cssFramework: 'none'
  },
  
  routes: {
    fileExtensions: ['.tsx', '.jsx', '.ts', '.js'],
    routeFilePattern: /^\((.+)\)\.(t|j)sx?$/,
    enableIndexFallback: true,
    caseSensitive: false
  },
  
  build: {
    minify: true,
    sourceMaps: false,
    splitting: 'auto',
    external: [],
    workers: availableCpus
  },
  
  server: {
    host: '0.0.0.0',
    port: 3000,
    timeout: 30000,
    bodySizeLimit: '10mb'
  }
};
```
