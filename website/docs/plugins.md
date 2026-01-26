---
sidebar_position: 13
---

# Plugins

Extend Jen.js functionality with a powerful plugin system.

## Plugin Overview

Plugins hook into framework lifecycle events:

- `onBuild` - Before/during build
- `onServe` - Before/during serving
- `onDeploy` - Before deployment
- `onRoute` - When route is processed
- `onData` - When data is loaded

## Creating a Plugin

Create plugin files in `src/plugin/plugins/`:

```typescript
// src/plugin/plugins/example.ts

import type { Plugin } from '@src/plugin/types';

export default {
  name: 'example-plugin',
  version: '1.0.0',
  
  onBuild: async () => {
    console.log('Building...');
  },
  
  onServe: async () => {
    console.log('Serving...');
  },
  
  onDeploy: async () => {
    console.log('Deploying...');
  }
} satisfies Plugin;
```

## Plugin Lifecycle

### onBuild Hook

Runs during `npm run build`:

```typescript
const plugin = {
  name: 'build-hook-plugin',
  
  onBuild: async (context: BuildContext) => {
    console.log(`Building to ${context.outDir}`);
    
    // Generate sitemap
    const sitemap = generateSitemap(context.routes);
    await writeSitemap(sitemap, context.outDir);
  }
};
```

### onServe Hook

Runs during `npm run dev` or `npm run start`:

```typescript
const plugin = {
  name: 'serve-hook-plugin',
  
  onServe: async (context: ServeContext) => {
    console.log(`Serving on ${context.port}`);
    
    // Start background jobs
    startScheduledTasks();
  }
};
```

### onRoute Hook

Runs for each route during build/serve:

```typescript
const plugin = {
  name: 'route-hook-plugin',
  
  onRoute: async (context: RouteContext) => {
    console.log(`Processing route: ${context.path}`);
    
    // Validate route
    if (context.isApiRoute) {
      validateApiRoute(context);
    }
  }
};
```

### onData Hook

Runs when loader data is fetched:

```typescript
const plugin = {
  name: 'data-hook-plugin',
  
  onData: async (context: DataContext) => {
    console.log(`Loaded data for ${context.route}`);
    
    // Enrich data
    context.data.metadata = {
      loadedAt: new Date(),
      source: 'database'
    };
  }
};
```

## Common Plugins

### Sitemap Generator

```typescript
// src/plugin/plugins/sitemap.ts

import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export default {
  name: 'sitemap-plugin',
  
  onBuild: async (context: BuildContext) => {
    const routes = context.routes.filter(r => !r.isApiRoute && !r.isPrivate);
    
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(r => `  <url><loc>https://example.com${r.path}</loc></url>`).join('\n')}
</urlset>`;
    
    await writeFile(join(context.outDir, 'sitemap.xml'), xml);
    console.log('Generated sitemap.xml');
  }
};
```

### Analytics Injector

```typescript
// src/plugin/plugins/analytics.ts

export default {
  name: 'analytics-plugin',
  
  onRoute: async (context: RouteContext) => {
    if (!context.isApiRoute && context.component) {
      // Inject analytics tracking
      context.component = wrapWithAnalytics(context.component);
    }
  }
};

function wrapWithAnalytics(component: any) {
  return function WithAnalytics(props: any) {
    useEffect(() => {
      // Track page view
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'page_view', {
          page_path: window.location.pathname
        });
      }
    }, []);
    
    return component(props);
  };
}
```

### Environment Variables

```typescript
// src/plugin/plugins/env.ts

export default {
  name: 'env-plugin',
  
  onBuild: async () => {
    // Validate required env vars
    const required = ['DATABASE_URL', 'API_KEY'];
    
    for (const key of required) {
      if (!process.env[key]) {
        throw new Error(`Missing env var: ${key}`);
      }
    }
    
    console.log('Environment variables validated');
  }
};
```

### RSS Feed Generator

```typescript
// src/plugin/plugins/rss.ts

export default {
  name: 'rss-plugin',
  
  onBuild: async (context: BuildContext) => {
    const posts = context.data.posts || [];
    
    const feed = `<?xml version="1.0"?>
<rss version="2.0">
  <channel>
    <title>My Blog</title>
    <link>https://example.com</link>
    <description>My blog feed</description>
${posts.map(p => `
    <item>
      <title>${p.title}</title>
      <link>https://example.com/posts/${p.slug}</link>
      <pubDate>${new Date(p.createdAt).toUTCString()}</pubDate>
    </item>
`).join('')}
  </channel>
</rss>`;
    
    await writeFile(join(context.outDir, 'feed.xml'), feed);
  }
};
```

### Cache Warmer

```typescript
// src/plugin/plugins/warmCache.ts

export default {
  name: 'warm-cache-plugin',
  
  onServe: async (context: ServeContext) => {
    // Pre-fetch and cache important routes
    const criticalRoutes = [
      '/',
      '/about',
      '/blog'
    ];
    
    for (const route of criticalRoutes) {
      try {
        await fetch(`http://localhost:${context.port}${route}`);
        console.log(`Warmed cache for ${route}`);
      } catch (error) {
        console.error(`Failed to warm ${route}`);
      }
    }
  }
};
```

## Registering Plugins

Add plugins to `jen.config.ts`:

```typescript
import examplePlugin from '@src/plugin/plugins/example';
import sitemapPlugin from '@src/plugin/plugins/sitemap';

const config: FrameworkConfig = {
  plugins: [
    examplePlugin,
    sitemapPlugin
  ]
};

export default config;
```

Or dynamically:

```typescript
const config: FrameworkConfig = {
  plugins: [
    ...(process.env.NODE_ENV === 'production' 
      ? [productionPlugin] 
      : [devPlugin])
  ]
};
```

## Plugin API

### Types

```typescript
interface Plugin {
  name: string;
  version?: string;
  
  onBuild?: (context: BuildContext) => Promise<void>;
  onServe?: (context: ServeContext) => Promise<void>;
  onDeploy?: (context: DeployContext) => Promise<void>;
  onRoute?: (context: RouteContext) => Promise<void>;
  onData?: (context: DataContext) => Promise<void>;
}

interface BuildContext {
  outDir: string;
  sourceDir: string;
  routes: RouteInfo[];
  config: FrameworkConfig;
}

interface ServeContext {
  port: number;
  host: string;
  isDev: boolean;
}

interface RouteContext {
  path: string;
  file: string;
  isApiRoute: boolean;
  isPrivate: boolean;
  component?: any;
}

interface DataContext {
  route: string;
  data: Record<string, any>;
}
```

## Error Handling

Handle errors gracefully in plugins:

```typescript
export default {
  name: 'safe-plugin',
  
  onBuild: async (context: BuildContext) => {
    try {
      // Plugin logic
      await doSomething();
    } catch (error) {
      console.error('Plugin error:', error);
      // Don't throw - let build continue
    }
  }
};
```

## Plugin Ordering

Plugins run in registration order:

```typescript
const config: FrameworkConfig = {
  plugins: [
    envPlugin,           // 1. Validate environment first
    analyticsPlugin,     // 2. Setup analytics
    sitemapPlugin,       // 3. Generate sitemap
    warmCachePlugin      // 4. Warm cache last
  ]
};
```

## Best Practices

1. **Name your plugin clearly** - Use descriptive names
2. **Handle errors** - Don't crash the build
3. **Log progress** - Help developers debug
4. **Don't mutate config** - Create copies if needed
5. **Respect context** - Don't modify context unnecessarily
6. **Document behavior** - Explain what the plugin does
7. **Make configurable** - Allow customization
8. **Test thoroughly** - Ensure reliability

## Publishing Plugins

Create npm packages for plugins:

```json
{
  "name": "@jen/plugin-sitemap",
  "version": "1.0.0",
  "exports": "./dist/index.js"
}
```

Use in projects:

```typescript
import sitemapPlugin from '@jen/plugin-sitemap';

const config = {
  plugins: [sitemapPlugin]
};
```

## Advanced Example

Full-featured plugin with options:

```typescript
// src/plugin/plugins/advanced.ts

interface AdvancedPluginOptions {
  enabled?: boolean;
  verbose?: boolean;
}

export default function createAdvancedPlugin(
  options: AdvancedPluginOptions = {}
) {
  const { enabled = true, verbose = false } = options;
  
  return {
    name: 'advanced-plugin',
    
    onBuild: async (context: BuildContext) => {
      if (!enabled) return;
      
      if (verbose) {
        console.log('Advanced plugin starting...');
      }
      
      // Do advanced things
      const result = await processRoutes(context.routes);
      
      if (verbose) {
        console.log(`Processed ${result.count} routes`);
      }
    }
  };
}

// Usage
const config: FrameworkConfig = {
  plugins: [
    createAdvancedPlugin({
      enabled: process.env.NODE_ENV === 'production',
      verbose: true
    })
  ]
};
```

## Next Steps

- [Build](./build) - Build optimization
- [Deployment](./deployment) - Deploy your site
