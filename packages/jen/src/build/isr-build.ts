/**
 * ISR Build Integration - Generates ISR cache during static build
 */
import { RuntimeConfig } from '../config/config.js';
import { RouteScanner } from '../core/scan.js';
import {
  ISRFactory,
  RouteMetadataExtractor,
  FileStorage,
} from '../isr/index.js';
import renderToString from 'preact-render-to-string';
import { h } from 'preact';
import type { ViteDevServer } from 'vite';
import fs from 'fs-extra';

export class ISRBuildIntegration {
  /**
   * Generate ISR cache for all static routes during build
   */
  public static async generateCache(vite: ViteDevServer): Promise<void> {
    if (!RuntimeConfig.isr?.enabled) {
      return;
    }

    console.log('\x1b[36m→ Generating ISR cache...\x1b[0m');

    const scanner = new RouteScanner();
    const routes = scanner.scanPages();
    const cacheDir = RuntimeConfig.isr.cacheDir || '.cache/isr';

    // Create cache directory
    fs.mkdirSync(cacheDir, { recursive: true });

    // Initialize file storage
    const storage = new FileStorage(cacheDir);
    const cacheManager = ISRFactory.createCacheManager(storage, {
      cacheDir,
      maxRetries: RuntimeConfig.isr.maxRetries || 3,
      retryDelay: RuntimeConfig.isr.retryDelay || 1000,
    });

    let cached = 0;
    let skipped = 0;

    for (const route of routes) {
      try {
        const filePath = route.filePathTsx || route.filePathJsx;
        if (!filePath) continue;

        // Load module to get exports
        const moduleExports = route.filePathTsx
          ? await vite.ssrLoadModule(route.filePathTsx)
          : await vite.ssrLoadModule(route.filePathJsx!);

        // Extract metadata
        const metadata = await RouteMetadataExtractor.fromModule(
          filePath,
          route.urlPath,
          moduleExports,
        );

        // Apply global revalidate if set
        if (RuntimeConfig.isr?.globalRevalidate !== undefined) {
          metadata.revalidate = RuntimeConfig.isr.globalRevalidate;
        }

        // Skip if no revalidate set
        if (metadata.revalidate === undefined) {
          skipped++;
          continue;
        }

        // Render the page
        const pageModule = await vite.ssrLoadModule(filePath);
        const PageComponent = pageModule.default;
        if (!PageComponent) continue;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let page: any = h(PageComponent as any, {});

        if (route.layouts && route.layouts.length > 0) {
          for (let i = route.layouts.length - 1; i >= 0; i--) {
            const layoutPath = route.layouts[i].tsx || route.layouts[i].jsx;
            if (layoutPath) {
              const layoutModule = await vite.ssrLoadModule(layoutPath);
              const Layout = layoutModule.default;
              if (Layout) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                page = h(Layout as any, null, page);
              }
            }
          }
        }

        const componentHtml = renderToString(page);

        const manifestObj: Record<string, unknown> = {};
        const NodePath = await import('node:path');
        const rPath = route.filePathTsx || route.filePathJsx || '';
        manifestObj[route.urlPath] = {
          page:
            '/' + NodePath.relative(process.cwd(), rPath).replace(/\\/g, '/'),
          layouts: (route.layouts || []).map(
            (l) =>
              '/' +
              NodePath.relative(process.cwd(), l.tsx || l.jsx || '').replace(
                /\\/g,
                '/',
              ),
          ),
          isDynamic: route.isDynamic,
        };

        // Create HTML document
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Jen.js App</title>
    <script id="jen-route-manifest" type="application/json">${JSON.stringify(manifestObj)}</script>
</head>
<body>
    <div id="jen-root">${componentHtml}</div>
</body>
</html>`;

        // Cache the page
        await cacheManager.getPage(metadata, async () => html);

        cached++;
      } catch (error) {
        console.error(`Failed to cache ${route.urlPath}:`, error);
      }
    }

    console.log(
      `\x1b[32m[+] ISR cache: ${cached} routes (${skipped} skipped)\x1b[0m`,
    );
  }

  /**
   * Clean ISR cache
   */
  public static cleanCache(): void {
    if (!RuntimeConfig.isr?.enabled) {
      return;
    }

    const cacheDir = RuntimeConfig.isr.cacheDir || '.cache/isr';
    if (fs.existsSync(cacheDir)) {
      fs.rmSync(cacheDir, { recursive: true });
    }
  }
}
