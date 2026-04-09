// src/build/StaticSiteGenerator.ts
import { build, createServer as createViteServer, ViteDevServer } from 'vite';
import { RouteScanner } from '../core/scan.js';
import { ISRBuildIntegration } from './isr-build.js';
import { ConfigLoader } from '../config/loader.js';
import { AdapterManager } from '../adapters/index.js';
import { RuntimeConfig } from '../config/config.js';
import renderToString from 'preact-render-to-string';
import { h } from 'preact';
import { jenImageOptimizerPlugin } from '../plugin/image.js';
import fs from 'node:fs';
import path from 'node:path';
import { parseMetadata } from '../server/metadata.js';

/**
 * Utility for constructing complete HTML documents during the build phase.
 */
export class HtmlGenerator {
  /**
   * Generates a structural HTML template with the interpolation token `<!--app-html-->`
   * exactly where the core React tree should mount, making chunked string replacement or
   * streams viable without duplicating the head and hydrate hooks.
   */
  public static constructTemplate(
    pageFilePath: string,
    cssFiles: string[] = [],
    metadataHtml: string = '',
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
    <meta name="generator" content="Jen.js/1.0">
    ${metadataHtml || '<title>Jen.js App</title>'}
    ${styleTag}
</head>
<body>
    <div id="jen-root" data-page-path="${relativePath}"><!--app-html--></div>
    
    <script type="module">
        import { hydrate, h } from 'preact';
        
        async function init() {
            const container = document.getElementById('jen-root');
            if (!container) return;

            const currentPath = window.location.pathname;
            
            try {
                const manifest = window.__JEN_ROUTE_MANIFEST__ || {};
                
                // Find matching route in manifest
                let routeDef = null;
                for (const [pattern, def] of Object.entries(manifest)) {
                    if (!def.isDynamic) {
                        if (pattern === currentPath) routeDef = def;
                    } else {
                        const regexStr = '^' + pattern.replace(/:[^\\\\s/]+/g, '([^/]+)') + '$';
                        if (new RegExp(regexStr).test(currentPath)) routeDef = def;
                    }
                }

                if (!routeDef) {
                    console.error('No route definition found for', currentPath);
                    return;
                }

                const layoutPromises = (routeDef.layouts || []).map(l => import(/* @vite-ignore */ l));
                const pagePromise = import(/* @vite-ignore */ routeDef.page);
                
                const modules = await Promise.all([
                    import('/src/client/router.tsx'),
                    pagePromise,
                    ...layoutPromises
                ]);

                const routerModule = modules[0];
                const pageModule = modules[1];
                const layoutModules = modules.slice(2);

                const { Router } = routerModule;
                const components = [...layoutModules.map(m => m.default), pageModule.default];

                if (Router && components.length > 0) {
                    hydrate(
                        h(Router, { 
                            initialPath: currentPath, 
                            initialComponents: components
                        }), 
                        container
                    );
                }
            } catch (e) {
                console.error('Jen.js Hydration Error:', e);
                // Fallback rendering
            }
        }

        init();
    </script>
</body>
</html>`.trim();
  }

  /**
   * Takes a pre-rendered JSX/TSX snippet and wraps it in a standard HTML5 shell,
   * injecting hydration scripts to bootstrap Preact on the client edge.
   *
   * @param renderedHtml The inner HTML rendered by the server/generator
   * @param pageFilePath Path to the source page component
   * @param cssFiles List of raw CSS strings to inject in the `<head>`
   * @returns A complete HTML document string ready to be saved
   */
  public static constructDocument(
    renderedHtml: string,
    pageFilePath: string,
    cssFiles: string[] = [],
    metadataHtml: string = '',
  ): string {
    return this.constructTemplate(pageFilePath, cssFiles, metadataHtml).replace(
      '<!--app-html-->',
      renderedHtml,
    );
  }
}

/**
 * Static Site Generator for pre-building routes at compile time.
 */
export class StaticSiteGenerator {
  /**
   * Initializes the config, scans available routes, and builds static
   * Preact markup to the `dist/static` directory.
   */
  public static async generate(options?: { adapter?: string }): Promise<void> {
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

    // Generate Route Manifest for SSG
    const manifestObj: Record<string, unknown> = {};
    for (const r of routes) {
      if (!r.filePathTsx && !r.filePathJsx) continue;
      const rPath = r.filePathTsx || r.filePathJsx || '';
      manifestObj[r.urlPath] = {
        page: '/' + path.relative(process.cwd(), rPath).replace(/\\/g, '/'),
        layouts: (r.layouts || [])
          .map((l) => {
            const lp = l.tsx || l.jsx;
            if (!lp) return '';
            return '/' + path.relative(process.cwd(), lp).replace(/\\/g, '/');
          })
          .filter(Boolean),
        isDynamic: r.isDynamic,
      };
    }
    const manifestJson = JSON.stringify(manifestObj);

    const locales = (RuntimeConfig as any).i18n?.locales || [undefined];

    for (const locale of locales) {
      for (const route of routes) {
        if (route.isDynamic) {
          continue;
        }

        const filePath = route.filePathTsx || route.filePathJsx;
        if (!filePath) continue;

        const baseRouteName =
          route.urlPath === '/'
            ? 'index'
            : route.urlPath.replace(/^\//, '').replace(/\//g, '-');

        const fileKeyName = locale
          ? `${locale}/${route.urlPath === '/' ? 'index' : route.urlPath.replace(/^\//, '')}`
          : baseRouteName;
        const safeTempName = locale
          ? `${locale}-${baseRouteName}`
          : baseRouteName;

        const outDirForHtml = path.join(tempDir, locale || '.');
        if (!fs.existsSync(outDirForHtml))
          fs.mkdirSync(outDirForHtml, { recursive: true });

        const htmlPath = path.join(outDirForHtml, `${baseRouteName}.html`);
        const entryName = `entry-${safeTempName}.tsx`;
        const entryPath = path.join(outDirForHtml, entryName);

        // 1. Create a physical TSX file for Vite to bundle
        let relativeComponentPath = path
          .relative(outDirForHtml, filePath)
          .replace(/\\/g, '/');
        if (!relativeComponentPath.startsWith('.'))
          relativeComponentPath = './' + relativeComponentPath;

        let imports = `import Page from '${relativeComponentPath}';\n`;
        let structure = `h(Page, {})`;
        if (route.layouts && route.layouts.length > 0) {
          for (let i = route.layouts.length - 1; i >= 0; i--) {
            const lPath = route.layouts[i].tsx || route.layouts[i].jsx;
            if (!lPath) continue;
            let relativeLayoutPath = path
              .relative(outDirForHtml, lPath)
              .replace(/\\/g, '/');
            if (!relativeLayoutPath.startsWith('.'))
              relativeLayoutPath = './' + relativeLayoutPath;
            imports += `import Layout${i} from '${relativeLayoutPath}';\n`;
            structure = `h(Layout${i}, null, ${structure})`;
          }
        }

        const entryContent = `
import { hydrate, h } from 'preact';
${imports}
const root = document.getElementById('jen-root');
if (root) {
    hydrate(${structure}, root);
}
      `.trim();
        fs.writeFileSync(entryPath, entryContent.trim());

        // 2. Load the component directly (bypassing SsrEngine to avoid dev scripts)
        const pageModule = await viteDev.ssrLoadModule(filePath);
        const PageComponent = pageModule.default;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pageProps: any = {};
        if (locale) pageProps.locale = locale;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let page: any = h(PageComponent as any, pageProps);

        // Nest inside layouts sequentially
        if (route.layouts && route.layouts.length > 0) {
          for (let i = route.layouts.length - 1; i >= 0; i--) {
            const layoutPath = route.layouts[i].tsx || route.layouts[i].jsx;
            if (layoutPath) {
              const layoutModule = await viteDev.ssrLoadModule(layoutPath);
              const Layout = layoutModule.default;
              if (Layout) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                page = h(Layout as any, null, page);
              }
            }
          }
        }

        const componentHtml = RuntimeConfig.csr?.enabled
          ? RuntimeConfig.csr.loadingIndicator || ''
          : renderToString(page);

        // Evaluate static metadata
        let metadataHtml = '';
        if (typeof pageModule.generateMetadata === 'function') {
          try {
            const dynamicMeta = await pageModule.generateMetadata({});
            metadataHtml = parseMetadata(dynamicMeta);
          } catch (e) {}
        } else if (pageModule.metadata) {
          metadataHtml = parseMetadata(pageModule.metadata);
        }

        // 3. Create a totally clean HTML file with NO inline scripts
        const html = `<!DOCTYPE html>
<html lang="${locale || 'en'}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="generator" content="Jen.js/1.0">
    <script>window.__JEN_ROUTE_MANIFEST__ = ${manifestJson};</script>
    ${metadataHtml || '<title>Jen.js App</title>'}
</head>
<body>
    <div id="jen-root" data-page-path="/${path.relative(process.cwd(), filePath).replace(/\\/g, '/')}">${componentHtml}</div>
    <script type="module" src="./${entryName}"></script>
</body>
</html>`;

        fs.writeFileSync(htmlPath, html);
        inputFiles[fileKeyName] = htmlPath;
      }
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
      plugins: [jenImageOptimizerPlugin()],
      define: {
        __JEN_REQUIRE_SCRIPT_FLAG__: JSON.stringify(
          RuntimeConfig.requireDangerouslySetScripts ?? true,
        ),
      },
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

    // Generate sitemap.xml and robots.txt into final dist
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const siteUrl = (RuntimeConfig as any).baseUrl || 'https://example.com';
    const sitemapEntries = routes
      .filter((r) => !r.isDynamic)
      .map(
        (r) =>
          `  <url>\n    <loc>${siteUrl}${r.urlPath === '/' ? '' : r.urlPath}</loc>\n  </url>`,
      )
      .join('\n');

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries}\n</urlset>`;

    fs.writeFileSync(path.join(outDir, 'sitemap.xml'), sitemapXml);
    fs.writeFileSync(
      path.join(outDir, 'robots.txt'),
      `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml`,
    );

    // 5. Clean up the temporary folder
    fs.rmSync(tempDir, { recursive: true });

    console.log('\x1b[32m✓ Build complete\x1b[0m');

    if (options?.adapter) {
      await AdapterManager.build(options.adapter, {
        outDir,
        rootDir: process.cwd(),
      });
    }
  }
}
