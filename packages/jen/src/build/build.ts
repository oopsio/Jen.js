// src/build/StaticSiteGenerator.ts
import { build, createServer as createViteServer } from 'vite';
import { RouteScanner } from '../core/scan';
import { ISRBuildIntegration } from './isr-build';
import { ConfigLoader } from '../config/loader';
import { RuntimeConfig } from '../config/config';
import renderToString from 'preact-render-to-string';
import { h } from 'preact';
import fs from 'node:fs';
import path from 'node:path';

export class HtmlGenerator {
  public static constructDocument(
    renderedHtml: string,
    pageFilePath: string,
    cssFiles: string[] = [],
  ): string {
    const rootDir = process.cwd();
    // Ensure the path is relative and web-friendly
    const relativePath =
      '/' + path.relative(rootDir, pageFilePath).replace(/\\/g, '/');

    const styleTag =
      cssFiles.length > 0 ? `<style>${cssFiles.join('\n')}</style>` : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Jen.js App</title>
    ${styleTag}
</head>
<body>
    <div id="jen-root" data-page-path="${relativePath}">${renderedHtml}</div>
    
    <script type="module">
        import { hydrate, h } from 'preact';
        
        async function init() {
            const container = document.getElementById('jen-root');
            if (!container) return;

            const initialPagePath = container.dataset.pagePath;
            const currentPath = window.location.pathname;
            
            try {
                // 1. Load the Router and the Page component in parallel
                const [routerModule, pageModule] = await Promise.all([
                    import('/src/client/router.tsx'),
                    import(/* @vite-ignore */ initialPagePath)
                ]);

                const { Router } = routerModule;
                const Page = pageModule.default;

                if (Router && Page) {
                    // Hydrate with EXACTLY the same structure as SSR:
                    // h(Router, { children: h(Page, {}) })
                    hydrate(
                        h(Router, { 
                            initialPath: currentPath, 
                            initialPagePath: initialPagePath,
                            children: h(Page, {})
                        }), 
                        container
                    );
                }
            } catch (e) {
                console.error('Jen.js Hydration Error:', e);
                // Fallback to simple hydration if Router fails
                const module = await import(/* @vite-ignore */ initialPagePath);
                if (module.default) {
                    hydrate(h(module.default, {}), container);
                }
            }
        }

        init();
    </script>
</body>
</html>`.trim();
  }
}

export class StaticSiteGenerator {
  public static async generate(): Promise<void> {
    // Load config first
    await ConfigLoader.initialize();

    console.log('\x1b[36m→ Starting static site generation...\x1b[0m');

    const scanner = new RouteScanner();
    const routes = scanner.scanPages();

    const tempDir = path.resolve(process.cwd(), '.jen');
    const outDir = path.resolve(process.cwd(), 'dist/static');

    if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true });
    fs.mkdirSync(tempDir, { recursive: true });

    // Boot Vite just to safely load your TSX files
    const viteDev = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });

    const inputFiles: Record<string, string> = {};

    for (const route of routes) {
      if (route.isDynamic) {
        continue;
      }

      const filePath = route.filePathTsx || route.filePathJsx;
      if (!filePath) continue;

      const routeName =
        route.urlPath === '/'
          ? 'index'
          : route.urlPath.replace(/^\//, '').replace(/\//g, '-');
      const htmlPath = path.join(tempDir, `${routeName}.html`);
      const entryName = `entry-${routeName}.tsx`;
      const entryPath = path.join(tempDir, entryName);

      // 1. Create a physical TSX file for Vite to bundle
      const relativeComponentPath = path
        .relative(tempDir, filePath)
        .replace(/\\/g, '/');
      const entryContent = `
import { hydrate, h } from 'preact';
import Page from './${relativeComponentPath}';
const root = document.getElementById('jen-root');
if (root) {
    hydrate(h(Page, {}), root);
}
            `;
      fs.writeFileSync(entryPath, entryContent.trim());

      // 2. Load the component directly (bypassing SsrEngine to avoid dev scripts)
      const pageModule = await viteDev.ssrLoadModule(filePath);
      const PageComponent = pageModule.default;
      const componentHtml = renderToString(h(PageComponent, {}));

      // 3. Create a totally clean HTML file with NO inline scripts
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Jen.js App</title>
</head>
<body>
    <div id="jen-root">${componentHtml}</div>
    <script type="module" src="./${entryName}"></script>
</body>
</html>`;

      fs.writeFileSync(htmlPath, html);
      inputFiles[routeName] = htmlPath;
    }

    await viteDev.close();

    // Generate ISR cache if enabled
    if (RuntimeConfig.isr?.enabled) {
      try {
        const vite = await createViteServer({
          server: { middlewareMode: true },
          appType: 'custom',
        });
        await ISRBuildIntegration.generateCache(vite);
        await vite.close();
      } catch (error) {
        console.error('ISR cache generation failed:', error);
      }
    }

    console.log('\x1b[36m→ Building static assets...\x1b[0m');

    // 4. Run the build with Preact rules applied
    // NO devtools plugin in production builds
    await build({
      root: tempDir,
      mode: 'production',
      build: {
        outDir: outDir,
        emptyOutDir: true,
        rollupOptions: {
          input: inputFiles,
        },
        minify: 'esbuild',
      },
      esbuild: {
        jsxFactory: 'h',
        jsxFragment: 'Fragment',
      },
    });

    // 5. Clean up the temporary folder
    fs.rmSync(tempDir, { recursive: true });

    console.log('\x1b[32m✓ Build complete\x1b[0m');
  }
}
