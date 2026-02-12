import { createServer } from 'vite';
import { createVitePressPlugin } from './vite-plugin.js';
import { loadConfig } from './config.js';
import { resolve } from 'path';
import type { SiteConfig } from './config.ts';

export async function createDevServer(cwd: string, config: SiteConfig) {
  const server = await createServer({
    root: cwd,
    server: {
      port: 5173,
      host: 'localhost',
      middlewareMode: false,
      watch: {
        ignored: [`**/.jenpress-cache/**`],
      },
    },
    plugins: [
      createVitePressPlugin({ srcDir: cwd, docsDir: config.srcDir }),
      {
        name: 'spa-fallback',
        configResolved() {},
        apply: 'serve',
        enforce: 'pre',
        async transform(code: string, id: string) {
          return null;
        },
        configureServer(middlewareServer) {
          return () => {
            middlewareServer.middlewares.use((req, res, next) => {
              // Serve index.html for non-file routes (but NOT for .md files or static assets)
              // This MUST come AFTER vite's own middleware
              if (!req.url) {
                next();
                return;
              }
              
              const url = req.url.split('?')[0]; // Remove query string for matching
              const isStaticFile = /\.(js|css|json|png|jpg|gif|svg|ico|woff|woff2|ttf|eot|md)$/.test(url);
              const isNodeModules = url.includes('node_modules');
              const isDotFile = /\/\./.test(url);
              
              if (!isStaticFile && !isNodeModules && !isDotFile) {
                req.url = '/index.html';
              }
              next();
            });
          };
        },
      },
    ],
    optimizeDeps: {
      include: ['preact', 'preact-render-to-string'],
    },
    resolve: {
      alias: {
        '@': resolve(cwd, 'src'),
      },
    },
  });

  return server;
}

export async function startDevServer(cwd: string) {
  const config = await loadConfig(cwd);
  const server = await createDevServer(cwd, config);

  await server.listen();
  
  console.log(`\n  ➜  Local: http://localhost:5173`);

  return { server, config };
}
