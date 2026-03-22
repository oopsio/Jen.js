import renderToString from 'preact-render-to-string';
import { HtmlGenerator } from '../build/build';
import type { ViteDevServer } from 'vite';
import { h } from 'preact';
import fs from 'node:fs';
import path from 'node:path';

export class SsrEngine {
  public static async renderPage(
    filePath: string,
    url: string,
    vite: ViteDevServer,
  ): Promise<string> {
    const ssrStartTime = performance.now();

    const pageModule = await vite.ssrLoadModule(filePath);
    const PageComponent = pageModule.default;
    if (!PageComponent) {
      throw new Error(`Page at ${filePath} does not have a default export.`);
    }
    
    // Collect CSS imports from the component directory
    const componentDir = path.dirname(filePath);
    const cssFiles: string[] = [];
    const styleFile = path.join(componentDir, 'style.css');
    
    if (fs.existsSync(styleFile)) {
      const cssContent = fs.readFileSync(styleFile, 'utf-8');
      cssFiles.push(cssContent);
    }
    
    const componentHtml = renderToString(h(PageComponent, {}));
    const ssrDuration = performance.now() - ssrStartTime;

    let html = HtmlGenerator.constructDocument(componentHtml, filePath, cssFiles);
    
    // ═════════════════════════════════════════════════════════════════
    // DEVTOOLS: Inject SSR metrics into HTML
    // ═════════════════════════════════════════════════════════════════
    const ssrMetrics = {
      renderTime: ssrDuration,
      componentCount: 1,
      url,
    };

    html = html.replace(
      '</head>',
      `<script>window.__JEN_SSR_METRICS__ = ${JSON.stringify(ssrMetrics)};</script>\n</head>`,
    );

    return await vite.transformIndexHtml(url, html);
  }
}
