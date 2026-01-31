# Plugins

Extend Jen.js functionality with plugins. Create custom plugins to hook into build, serve, and deploy lifecycle.

## Plugin Basics

Create a plugin in `src/plugins/`:

```typescript
// src/plugins/my-plugin.ts
export default {
  name: 'my-plugin',
  version: '1.0.0',
  description: 'My custom plugin',
  
  onBuild: async (context) => {
    console.log('Building...');
  },
  
  onServe: async (context) => {
    console.log('Serving...');
  },
  
  onDeploy: async (context) => {
    console.log('Deploying...');
  }
};
```

## Register Plugin

In `jen.config.ts`:

```typescript
import myPlugin from '@src/plugins/my-plugin';

const config: FrameworkConfig = {
  plugins: [
    myPlugin,
    '@jen/plugin-analytics',  // npm package
    './src/plugins/custom.ts'
  ]
};
```

## Plugin Hooks

### onBuild

Runs during build (SSG):

```typescript
export default {
  name: 'build-plugin',
  
  onBuild: async (context) => {
    const { routes, config } = context;
    
    // Process routes
    console.log(`Building ${routes.length} routes`);
    
    // Generate additional files
    await generateSitemap(routes);
  }
};
```

### onServe

Runs when dev server starts:

```typescript
export default {
  name: 'serve-plugin',
  
  onServe: async (context) => {
    const { server, config } = context;
    
    // Add custom routes
    server.use('/custom', (req, res) => {
      res.end('Custom route');
    });
    
    console.log('Dev server ready');
  }
};
```

### onDeploy

Runs during deployment:

```typescript
export default {
  name: 'deploy-plugin',
  
  onDeploy: async (context) => {
    const { distDir, config } = context;
    
    // Upload to CDN
    await uploadToS3(distDir);
    
    console.log('Deployment complete');
  }
};
```

## Example Plugins

### Sitemap Generator

```typescript
// src/plugins/sitemap.ts
export default {
  name: 'sitemap-generator',
  
  onBuild: async (context) => {
    const { routes } = context;
    
    const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + routes.map(route => 
        `<url><loc>${route.path}</loc></url>`
      ).join('\n')
    + '</urlset>';
    
    await fs.writeFile('dist/sitemap.xml', sitemap);
  }
};
```

### Analytics Plugin

```typescript
// src/plugins/analytics.ts
export default {
  name: 'analytics',
  
  onBuild: async (context) => {
    const { distDir } = context;
    
    // Add analytics script to all HTML files
    const files = glob.sync(`${distDir}/**/*.html`);
    
    for (const file of files) {
      let content = fs.readFileSync(file, 'utf-8');
      content = content.replace('</head>', 
        '<script src="/analytics.js"></script>\n</head>'
      );
      fs.writeFileSync(file, content);
    }
  }
};
```

### Image Optimization Plugin

```typescript
// src/plugins/image-optimizer.ts
export default {
  name: 'image-optimizer',
  
  onBuild: async (context) => {
    const { distDir } = context;
    
    const images = glob.sync(`${distDir}/**/*.{jpg,png}`);
    
    for (const image of images) {
      // Compress image
      await sharp(image)
        .resize(1920, 1080, { fit: 'inside' })
        .toFile(image);
    }
  }
};
```

## Plugin Context

Plugins receive context with:

```typescript
interface PluginContext {
  config: FrameworkConfig;        // Framework config
  routes: Route[];                // Discovered routes
  distDir: string;                // Build output directory
  siteDir: string;                // Source directory
  server?: ExpressApp;            // Dev server (in onServe)
  isDev: boolean;                 // Development mode?
  timestamp: Date;                // Build/serve timestamp
}
```

## Creating Reusable Plugins

Export as npm package:

```json
{
  "name": "@myorg/jen-plugin-custom",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts"
}
```

```typescript
// src/index.ts
export default {
  name: '@myorg/custom',
  onBuild: async (context) => {
    // Plugin logic
  }
};
```

Install and use:

```bash
npm install @myorg/jen-plugin-custom
```

```typescript
import customPlugin from '@myorg/jen-plugin-custom';

const config = {
  plugins: [customPlugin]
};
```

## Plugin Configuration

Pass options to plugins:

```typescript
// src/plugins/configurable.ts
export default function createPlugin(options = {}) {
  return {
    name: 'configurable',
    onBuild: async (context) => {
      if (options.enabled) {
        // Run plugin
      }
    }
  };
}
```

Use with configuration:

```typescript
import createPlugin from '@src/plugins/configurable';

const config = {
  plugins: [
    createPlugin({ enabled: true, setting: 'value' })
  ]
};
```

## Error Handling

Plugins should handle errors gracefully:

```typescript
export default {
  name: 'safe-plugin',
  
  onBuild: async (context) => {
    try {
      const result = await riskyOperation();
      console.log('Success:', result);
    } catch (err) {
      console.error('Plugin error:', err);
      // Don't throw — let build continue
    }
  }
};
```

## Best Practices

1. Use descriptive plugin names
2. Include version information
3. Handle errors gracefully
4. Document plugin options
5. Use namespaces for organization
6. Test plugins thoroughly
7. Publish reusable plugins to npm
8. Provide TypeScript types

## Testing Plugins

```typescript
// plugin.test.ts
import plugin from '@src/plugins/my-plugin';

test('plugin runs on build', async () => {
  const context = {
    routes: [{ path: '/' }],
    config: {},
    distDir: './dist'
  };
  
  await plugin.onBuild(context);
  // Assert plugin behavior
});
```

## Next Steps

- Create a custom plugin
- Publish to npm
- Share with community
