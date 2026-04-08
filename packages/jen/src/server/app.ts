import { createServer as createViteServer, ViteDevServer, Plugin } from 'vite';
import { RouteScanner } from '../core/scan.js';
import { RouterMap } from '../core/map.js';
import { SsrEngine } from './ssr.js';
import { ISRManager } from './isr-manager.js';
import { MiddlewareManager } from './middleware-manager.js';
import {
  APIRouteScanner,
  APIRouter,
  APIResponse,
  type HTTPMethod,
  type APIRequest,
} from '../core/api-router.js';
import { Buffer } from 'node:buffer';
import checker from 'vite-plugin-checker';
import { createDevToolsPlugin } from '../devtools/vite-plugin.js';
import { jenImageOptimizerPlugin } from '../plugin/image.js';
import { RuntimeConfig } from '../config/config.js';
import { RouterBridge } from '../devtools/router-bridge.js';
import { SecurityAuditor } from '../devtools/security-audit.js';
import { ErrorFormatter } from './error-formatter.js';
import path from 'node:path';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m', // Green
  yellow: '\x1b[33m', // Yellow
  blue: '\x1b[34m', // Blue
  red: '\x1b[31m', // Red
  magenta: '\x1b[35m', // Magenta
  error: '\x1b[1;31m',
};

// ============================================================================
// SECURITY HEADERS (NIST SP 800-44 & OWASP ASVS L1)
// ============================================================================
function buildSecurityHeaders(): Record<string, string> {
  return {
    'Content-Security-Policy':
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:",
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
  };
}

/**
 * Development Server Manager.
 * Orchestrates Vite, the Javascript runtime, Incremental Static Regeneration (ISR),
 * and dynamic route rendering to serve the application during development.
 */
export class DevServerManager {
  private static viteCompiler: ViteDevServer;

  /**
   * Starts the Jen.js development server.
   * Internally boots up Vite, assigns route handlers from the RouteScanner,
   * sets up middleware, ISR cache checks, and injects Security headers.
   *
   * @param serverPort The port to listen on (default: 3000)
   */
  public static async start(serverPort: number = 3000): Promise<void> {
    // ═══════════════════════════════════════════════════════════════
    // SCAN & REGISTER API ROUTES
    // ═══════════════════════════════════════════════════════════════
    const apiRoutes = APIRouteScanner.scanAPIRoutes();
    for (const apiRoute of apiRoutes) {
      try {
        const importedModule = await import(apiRoute.filePath);
        // Support both patterns:
        //   1. Named exports:  export function GET(req, res) { ... }
        //   2. Default export: export default { GET(req, res) { ... } }
        const moduleExports = importedModule.default ?? importedModule;

        // Collect all HTTP method handlers from the module
        // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
        const handlers: Record<string, Function> = {};
        for (const method of [
          'GET',
          'POST',
          'PUT',
          'DELETE',
          'PATCH',
          'HEAD',
          'OPTIONS',
        ]) {
          // Check named exports first, then default export object
          if (typeof importedModule[method] === 'function') {
            handlers[method] = importedModule[method];
          } else if (moduleExports && typeof moduleExports[method] === 'function') {
            handlers[method] = moduleExports[method];
          }
        }

        APIRouter.registerRoute(apiRoute.pathname, handlers);

        if (Object.keys(handlers).length > 0) {
          console.log(
            `${colors.green}API${colors.reset} ${Object.keys(handlers).join('|')} ${colors.blue}${apiRoute.pathname}${colors.reset}`,
          );
        }
      } catch {
        // API route failed to load, continue
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // SCAN & REGISTER PAGE ROUTES
    // ═══════════════════════════════════════════════════════════════
    const scanner = new RouteScanner();
    const routes = scanner.scanPages();

    // Compute route manifest for client hydration
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
    SsrEngine.manifest = JSON.stringify(manifestObj);

    for (const route of routes) {
      // Pass both file paths into the registerRoute function
      RouterMap.registerRoute(
        route.urlPath,
        route.filePathTsx,
        route.filePathJsx,
        async (req, ctx) => {
          // Try ISR first (if enabled)
          const locale = req.headers.get('x-jen-locale') || undefined;

          if (ISRManager.isISREnabled()) {
            // Load module to get exports (revalidate, isDynamic, etc.)
            const moduleExports = route.filePathTsx
              ? await this.viteCompiler.ssrLoadModule(route.filePathTsx)
              : await this.viteCompiler.ssrLoadModule(route.filePathJsx!);

            const isrResponse = await ISRManager.handleRequest(
              req,
              route,
              ctx.url,
              moduleExports,
              this.viteCompiler,
            );

            if (isrResponse) {
              return isrResponse;
            }
          }

          // Fall back to normal SSR
          const ssrResult = await SsrEngine.renderPage(
            route,
            ctx.url,
            this.viteCompiler,
            locale,
          );

          // If SSR returns a Response (redirect, 404, etc), return it
          if (ssrResult instanceof Response) {
            return ssrResult;
          }

          // Otherwise, return the HTML
          const html = ssrResult as string;
          return new Response(html, {
            headers: {
              'Content-Type': 'text/html',
              ...buildSecurityHeaders(),
            },
          });
        },
      );
    }

    // Initialize middleware system
    MiddlewareManager.initialize();

    // Initialize ISR system (deferred until after compiler ready)

    const jenJsPlugin = (): Plugin => ({
      name: 'vite-plugin-jenjs',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const start = performance.now();
          const method = req.method || 'GET';
          const url = req.url || '/';

          const originalEnd = res.end;

          res.end = function (...args: unknown[]) {
            const end = performance.now();
            const duration = (end - start).toFixed(2);

            const methodColor =
              colors[method as keyof typeof colors] || colors.reset;
            const timeColor = '\x1b[36m'; // Cyan
            const urlColor = '\x1b[90m'; // Gray
            const reset = '\x1b[0m';

            const statusCode = res.statusCode || 200;
            const statusColor = statusCode >= 400 ? '\x1b[31m' : '\x1b[32m';

            console.log(
              `${statusColor}${statusCode}${reset} ${methodColor}${method}${reset} ${urlColor}${url}${reset} - ${timeColor}${duration}ms${reset}`,
            );

            return originalEnd.apply(
              this,
              args as Parameters<typeof originalEnd>,
            );
          };

          next();
        });

        return () => {
          // Initialize ISR system now that compiler is ready
          ISRManager.initialize().catch((error) => {
            console.error('Failed to initialize ISR:', error);
          });

          server.middlewares.use(async (req, res, next) => {
            try {
              const url = req.url || '/';
              const routeStartTime = performance.now();

              if (url.startsWith('/@vite/') || url.startsWith('/@id/')) {
                return next();
              }

              const protocol = req.headers['x-forwarded-proto'] || 'http';
              const host = req.headers.host || `localhost:${serverPort}`;
              const fullUrl = `${protocol}://${host}${url}`;

              // ═══════════════════════════════════════════════════════════════
              // CHECK FOR API ROUTES FIRST
              // ═══════════════════════════════════════════════════════════════
              if (APIRouter.isAPIRoute(url)) {
                const method = (
                  req.method || 'GET'
                ).toUpperCase() as HTTPMethod;
                const handler = APIRouter.findRoute(url, method);

                if (handler) {
                  const apiReq = new Request(fullUrl, {
                    method: req.method,
                    headers: req.headers as HeadersInit,
                  }) as APIRequest;

                  // Parse query string
                  const urlObj = new URL(fullUrl);
                  apiReq.query = Object.fromEntries(urlObj.searchParams);

                  // Parse body for POST/PUT/PATCH
                  if (['POST', 'PUT', 'PATCH'].includes(method)) {
                    const bodyText = await new Promise<string>((resolve) => {
                      let data = '';
                      req.on('data', (chunk) => {
                        data += chunk;
                      });
                      req.on('end', () => resolve(data));
                    });

                    if (bodyText) {
                      try {
                        apiReq.body = JSON.parse(bodyText);
                      } catch {
                        apiReq.body = bodyText;
                      }
                    }
                  }

                  try {
                    const apiRes = new APIResponse();
                    const apiResponse = await handler(apiReq, apiRes);

                    const routeDuration = performance.now() - routeStartTime;
                    console.log(
                      `${colors.green}${method}${colors.reset} ${colors.blue}${url}${colors.reset} - ${colors.magenta}${apiResponse.status}${colors.reset} ${colors.reset}(${routeDuration.toFixed(2)}ms)${colors.reset}`,
                    );

                    res.writeHead(apiResponse.status, {
                      ...Object.fromEntries(apiResponse.headers),
                    });
                    res.end(await apiResponse.text());
                    return;
                  } catch (error: unknown) {
                    ErrorFormatter.printError(error, 'API Route Error');
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(
                      JSON.stringify({
                        error: 'Internal Server Error',
                        message:
                          error instanceof Error
                            ? error.message
                            : String(error),
                      }),
                    );
                    return;
                  }
                }
              }

              let webRequest = new Request(fullUrl, {
                method: req.method,
                headers: req.headers as HeadersInit,
              });

              // ────────────────────────────────────────────────────────────────────
              // 0. MIDDLEWARE: Intercept request before routing
              // ────────────────────────────────────────────────────────────────────
              const scanner = new RouteScanner();
              const middlewarePath = scanner.scanMiddleware();

              if (middlewarePath && DevServerManager.viteCompiler) {
                const middlewareModule =
                  await DevServerManager.viteCompiler.ssrLoadModule(
                    middlewarePath,
                  );
                const middleware = middlewareModule.default;

                if (typeof middleware === 'function') {
                  const mwResponse = await middleware(webRequest);
                  if (mwResponse instanceof Response) {
                    if (mwResponse.headers.get('x-jen-middleware') !== 'next') {
                      // Short-circuit with middleware response
                      res.statusCode = mwResponse.status;
                      for (const [key, value] of mwResponse.headers.entries()) {
                        res.setHeader(key, value);
                      }
                      res.end(await mwResponse.text());
                      return;
                    }

                    // Handle Rewrite
                    const rewriteUrl = mwResponse.headers.get('x-jen-rewrite');
                    if (rewriteUrl) {
                      const newUrl = new URL(rewriteUrl, webRequest.url);
                      webRequest = new Request(newUrl, {
                        method: webRequest.method,
                        headers: webRequest.headers,
                        body: webRequest.body,
                      });
                    }
                  }
                }
              }

              // ────────────────────────────────────────────────────────────────────
              // 0.5. i18n LOCALE ROUTING: Intercept and rewrite locale prefixes
              // ────────────────────────────────────────────────────────────────────
              const i18nConfig = RuntimeConfig.i18n;
              if (i18nConfig && i18nConfig.locales) {
                const urlObj = new URL(webRequest.url);
                const pathParts = urlObj.pathname.split('/');
                const firstPath = pathParts[1];

                if (firstPath && i18nConfig.locales.includes(firstPath)) {
                  pathParts.splice(1, 1);
                  urlObj.pathname = pathParts.join('/') || '/';

                  const newHeaders = new Headers(webRequest.headers);
                  newHeaders.set('x-jen-locale', firstPath);

                  webRequest = new Request(urlObj.toString(), {
                    method: webRequest.method,
                    headers: newHeaders,
                    body: webRequest.body,
                  });
                } else {
                  const newHeaders = new Headers(webRequest.headers);
                  newHeaders.set(
                    'x-jen-locale',
                    i18nConfig.defaultLocale || 'en',
                  );
                  webRequest = new Request(webRequest.url, {
                    method: webRequest.method,
                    headers: newHeaders,
                    body: webRequest.body,
                  });
                }
              }

              const jenResponse = await RouterMap.resolveRequest(webRequest);
              const routeDuration = performance.now() - routeStartTime;

              // ═══════════════════════════════════════════════════════════════
              // DEVTOOLS: Capture route trace
              // ═══════════════════════════════════════════════════════════════
              RouterBridge.captureMatch(
                url,
                jenResponse.status === 404
                  ? null
                  : {
                      found: true,
                      pathname: url,
                      filePathTsx: '',
                      filePathJsx: '',
                      params: '{}',
                    },
                routeDuration,
              );

              // ═══════════════════════════════════════════════════════════════
              // DEVTOOLS: Capture security headers
              // ═══════════════════════════════════════════════════════════════
              SecurityAuditor.audit(
                url,
                Object.fromEntries(
                  Array.from(Object.entries(jenResponse.headers || {})),
                ),
              );

              if (jenResponse.status !== 404) {
                const cacheStatus = jenResponse.headers.get('X-Cache-Status');
                const cacheAge = jenResponse.headers.get('X-Cache-Age');
                if (cacheStatus) {
                  console.log(
                    `${colors.yellow}${cacheStatus}${colors.reset} (age: ${cacheAge}s) ${colors.green}${url}${colors.reset}`,
                  );
                }

                res.statusCode = jenResponse.status;

                const responseHeaders = Object.fromEntries(
                  jenResponse.headers || {},
                );
                for (const [key, value] of Object.entries(responseHeaders)) {
                  if (key.toLowerCase() !== 'content-length') {
                    res.setHeader(key, String(value));
                  }
                }

                for (const [key, value] of Object.entries(
                  buildSecurityHeaders(),
                )) {
                  res.setHeader(key, value);
                }

                res.setHeader('Content-Type', 'text/html');

                if (
                  jenResponse.body &&
                  jenResponse.body instanceof ReadableStream
                ) {
                  res.setHeader('Transfer-Encoding', 'chunked');
                  const reader = jenResponse.body.getReader();

                  try {
                    while (true) {
                      const { done, value } = await reader.read();
                      if (done) {
                        res.end();
                        break;
                      }
                      res.write(Buffer.from(value));
                    }
                  } catch (streamErr) {
                    console.error('[Streaming Pipeline Failure]', streamErr);
                    if (!res.headersSent) res.writeHead(500);
                    res.end('Streaming abort');
                  }
                } else {
                  const bodyText = await jenResponse.text();
                  res.setHeader('Content-Length', Buffer.byteLength(bodyText));
                  res.end(bodyText);
                }

                return;
              }

              console.log(`${colors.yellow}404${colors.reset} ${colors.blue}→ ${url}${colors.reset}`);

              // ═══════════════════════════════════════════════════════════
              // Render _error.tsx for 404 responses instead of falling
              // through to Vite's default "Cannot GET" page
              // ═══════════════════════════════════════════════════════════
              const { AppShellManager } = await import('../core/app-shell.js');
              await AppShellManager.initialize(DevServerManager.viteCompiler);
              const ErrorComponent = AppShellManager.getErrorComponent();

              if (ErrorComponent && DevServerManager.viteCompiler) {
                try {
                  const { h } = await import('preact');
                  const { render } = await import('preact-render-to-string');
                  const { HtmlGenerator } = await import('../build/build.js');

                  const errorElement = h(ErrorComponent, {
                    error: new Error(`Page not found: ${url}`),
                    // eslint-disable-next-line @typescript-eslint/no-empty-function
                    reset: () => {},
                  });

                  const html = render(errorElement);
                  let template = HtmlGenerator.constructTemplate('_error.tsx', [], '');
                  template = await DevServerManager.viteCompiler.transformIndexHtml(url, template);
                  const fullHtml = template.replace('<!--app-html-->', html);

                  res.statusCode = 404;
                  res.setHeader('Content-Type', 'text/html');
                  for (const [key, value] of Object.entries(buildSecurityHeaders())) {
                    res.setHeader(key, value);
                  }
                  res.end(fullHtml);
                  return;
                } catch (errorRenderErr) {
                  console.error(`${colors.error}[Error Page Render Failed]${colors.reset}`, errorRenderErr);
                }
              }

              // No custom error page found — fall through to Vite
              next();
            } catch (error: unknown) {
              if (error instanceof Error) {
                server.ssrFixStacktrace(error);
              }

              ErrorFormatter.printError(error, 'Vite / Route Rendering Error');

              next(error);
            }
          });
        };
      },
    });

    this.viteCompiler = await createViteServer({
      plugins: [
        jenJsPlugin(),
        jenImageOptimizerPlugin(),
        createDevToolsPlugin(),
        checker({ typescript: true }),
      ],
      define: {
        __JEN_REQUIRE_SCRIPT_FLAG__: JSON.stringify(
          RuntimeConfig.requireDangerouslySetScripts ?? true,
        ),
      },
      server: { port: serverPort, strictPort: true, middlewareMode: false },
      appType: 'custom',
      root: process.cwd(),
    });

    await this.viteCompiler.listen();
    console.log(
      `${colors.magenta}╭─${colors.reset} ${colors.green}Jen.js${colors.reset} v1.0.0\n${colors.magenta}╰─${colors.reset} ${colors.blue}http://localhost:${serverPort}${colors.reset}`,
    );
  }
}
