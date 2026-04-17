import { renderToReadableStream } from 'preact-render-to-string/stream';
import { HtmlGenerator } from '../build/build.js';
import type { ViteDevServer } from 'vite';
import { h } from 'preact';
import fs from 'fs-extra';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getUsedFonts } from '../fonts/google.js';
import { AppShellManager } from '../core/app-shell.js';
import { ErrorBoundary } from '../core/error-boundary.js';
import { DataLoaderManager } from '../core/data-loader.js';
import { parseMetadata } from './metadata.js';
import { ErrorFormatter } from './error-formatter.js';
import { RuntimeConfig } from '../config/config.js';

import { RouteDefinition } from '../types.js';

export class SsrEngine {
  public static manifest: string = '{}';

  public static async renderPage(
    route: RouteDefinition,
    url: string,
    vite: ViteDevServer,
    locale?: string,
  ): Promise<string | Response> {
    const ssrStartTime = performance.now();

    // Initialize app shell on first render
    await AppShellManager.initialize(vite);

    const filePath = route.filePathTsx || route.filePathJsx;
    if (!filePath)
      throw new Error(`Route ${route.urlPath} has no component file.`);

    const pageModule = await vite.ssrLoadModule(filePath);
    const PageComponent = pageModule.default;

    // ═══════════════════════════════════════════════════════════════
    // LOAD PAGE DATA (if load() function exists)
    // ═══════════════════════════════════════════════════════════════
    let pageProps: Record<string, unknown> = {};

    try {
      const context = DataLoaderManager.buildContext(url);
      const loadResult = await DataLoaderManager.loadPageData(
        filePath,
        vite,
        context,
      );

      if (loadResult) {
        // Handle redirect
        if (loadResult.redirect) {
          return DataLoaderManager.createRedirectResponse(loadResult.redirect);
        }

        // Handle not found
        if (loadResult.notFound) {
          return DataLoaderManager.createNotFoundResponse();
        }

        pageProps = loadResult.props;
      }
    } catch (error) {
      // Log data loader errors but don't fail the render
      if (typeof process !== 'undefined') {
        ErrorFormatter.printError(error, 'Data Loader Error');
      }
      // Continue with empty props
    }

    if (locale) {
      pageProps.locale = locale;
    }

    const __dirname = path.dirname(fileURLToPath(import.meta.url));

    // Resolve the router path relative to the framework directory, not the user's project
    const routerModule = await vite.ssrLoadModule(
      path.resolve(__dirname, '../client/router.js'),
    );
    const ViteRouter = routerModule.Router;

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

    // Get app shell components if they exist
    const AppComponent = AppShellManager.getAppComponent();
    // const DocumentComponent = AppShellManager.getDocumentComponent(); // unused but could have side effects?
    const ErrorComponent = AppShellManager.getErrorComponent();

    // Build the component tree: Router > ErrorBoundary > App > ...layouts > Page
    // ═══════════════════════════════════════════════════════════════
    // RESOLVE ASYNC COMPONENTS (Server Components)
    // ═══════════════════════════════════════════════════════════════
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resolveAsync = async (Cmp: any, props: any, children?: any) => {
      if (typeof Cmp === 'function' && (Cmp.constructor.name === 'AsyncFunction' || Cmp.toString().includes('__awaiter') || Cmp.toString().includes('async'))) {
        return await Cmp({ ...props, children });
      }
      return h(Cmp, props, children);
    };

    let pageTreePromise = resolveAsync(PageComponent, pageProps);

    // Apply nested layout wrappers sequentially
    if (route.layouts && route.layouts.length > 0) {
      for (let i = route.layouts.length - 1; i >= 0; i--) {
        const layoutFile = route.layouts[i].tsx || route.layouts[i].jsx;
        if (layoutFile) {
          const layoutModule = await vite.ssrLoadModule(layoutFile);
          const LayoutCmp = layoutModule.default;
          if (LayoutCmp) {
            const currentTree = await pageTreePromise;
            pageTreePromise = resolveAsync(LayoutCmp, null, currentTree);
          }
        }
      }
    }

    let page = await pageTreePromise;

    // If _app.tsx exists, wrap the page in it
    if (AppComponent) {
      // App component itself might be async (rare but supported)
      page = await resolveAsync(AppComponent as any, {
        Component: PageComponent,
        pageProps,
        children: page,
      });
    }

    // Wrap in error boundary to catch rendering errors
    page = h(ErrorBoundary, {
      fallback: ErrorComponent || undefined,
      onError: (error: Error) => {
        if (typeof process !== 'undefined') {
          ErrorFormatter.printError(
            error,
            'SSR Error Boundary (Component crashed on server)',
          );
        }
      },
      children: page,
    });

    const ssrDuration = performance.now() - ssrStartTime;

    // Evaluate dynamic or static SEO metadata properties
    let metadataHtml = '';
    if (typeof pageModule.generateMetadata === 'function') {
      try {
        const dynamicMeta = await pageModule.generateMetadata(pageProps);
        metadataHtml = parseMetadata(dynamicMeta);
      } catch (err) {
        if (typeof process !== 'undefined') {
          ErrorFormatter.printError(err, 'Metadata Error');
        }
      }
    } else if (pageModule.metadata) {
      metadataHtml = parseMetadata(pageModule.metadata);
    }

    // Shell configuration with empty root
    let template = HtmlGenerator.constructTemplate(
      filePath,
      cssFiles,
      metadataHtml,
    );
    if (locale) {
      template = template.replace(
        '<html lang="en">',
        `<html lang="${locale}">`,
      );
    }

    // ═════════════════════════════════════════════════════════════════
    // DEVTOOLS: Inject SSR metrics into HTML
    // ═════════════════════════════════════════════════════════════════
    const ssrMetrics = {
      renderTime: ssrDuration,
      componentCount: 1, // Optional: tracking components explicitly limits performance scaling
      url,
    };

    const fontLinks = getUsedFonts()
      .map((url) => `<link rel="stylesheet" href="${url}">`)
      .join('\n');

    const manifestScript = `<script>window.__JEN_ROUTE_MANIFEST__ = ${SsrEngine.manifest};</script>`;
    template = template.replace(
      '</head>',
      `${fontLinks}\n<script>window.__JEN_SSR_METRICS__ = ${JSON.stringify(ssrMetrics)};</script>\n${manifestScript}\n</head>`,
    );

    // Give Vite the opportunity to attach HMR connections into the split document
    template = await vite.transformIndexHtml(url, template);

    const [headChunk, tailChunk] = template.split('<!--app-html-->');

    if (RuntimeConfig.csr?.enabled) {
      const loader = RuntimeConfig.csr.loadingIndicator || '';
      return new Response(headChunk + loader + tailChunk, {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    if (RuntimeConfig.ppr?.enabled) {
      // For PPR we allow streaming of Suspense boundaries, which the readable stream natively handles
      // No special logic needed here as renderToReadableStream handles it natively
    }

    // Activate the Preact Stream
    const componentStream = renderToReadableStream(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      h(ViteRouter as any, {
        initialPath: url,
        initialPagePath: filePath,
        children: page,
      }),
    );

    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();

    (async () => {
      try {
        const encoder = new TextEncoder();
        await writer.write(encoder.encode(headChunk));

        const reader = componentStream.getReader();
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          // value is Uint8Array
          await writer.write(value);
        }

        await writer.write(encoder.encode(tailChunk));
      } catch (error) {
        ErrorFormatter.printError(error, 'SSR Streaming Error');
      } finally {
        await writer.close();
      }
    })();

    return new Response(readable, {
      headers: { 'Content-Type': 'text/html' },
    });
  }
}
