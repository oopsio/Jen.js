import { createServer as createViteServer, ViteDevServer, Plugin } from 'vite';
import { RouteScanner } from '../core/scan';
import { RouterMap } from '../core/map';
import { SsrEngine } from './ssr';
import { ISRManager } from './isr-manager';
import { MiddlewareManager } from './middleware-manager';
import { Buffer } from 'node:buffer';
import checker from 'vite-plugin-checker';
import { createDevToolsPlugin } from '../devtools/vite-plugin';
import { RouterBridge } from '../devtools/router-bridge';
import { SecurityAuditor } from '../devtools/security-audit';
import { SSRHydrationDetector } from '../devtools/ssr-hydration';

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
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:",
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
  };
}

export class DevServerManager {
  private static viteCompiler: ViteDevServer;

  public static async start(serverPort: number = 3000): Promise<void> {
    const scanner = new RouteScanner();
    const routes = scanner.scanPages();

    for (const route of routes) {
      // Pass both file paths into the registerRoute function
      RouterMap.registerRoute(
        route.urlPath,
        route.filePathTsx,
        route.filePathJsx,
        async (req, ctx) => {
          // Try ISR first (if enabled)
          if (ISRManager.isISREnabled()) {
            // Load module to get exports (revalidate, isDynamic, etc.)
            const moduleExports = route.filePathTsx
              ? await this.viteCompiler.ssrLoadModule(route.filePathTsx)
              : await this.viteCompiler.ssrLoadModule(route.filePathJsx!);

            const isrResponse = await ISRManager.handleRequest(
              req,
              ctx.filePath,
              ctx.url,
              moduleExports,
              this.viteCompiler,
            );

            if (isrResponse) {
              return isrResponse;
            }
          }

          // Fall back to normal SSR
          const html = await SsrEngine.renderPage(
            ctx.filePath,
            ctx.url,
            this.viteCompiler,
          );
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

          res.end = function (...args: any[]) {
            const end = performance.now();
            const duration = (end - start).toFixed(2);

            const methodColor =
              colors[method as keyof typeof colors] || colors.reset;
            const timeColor = '\x1b[36m'; // Cyan
            const urlColor = '\x1b[90m'; // Gray
            const reset = '\x1b[0m';

            console.log(
              `${methodColor}${method}${reset} ${urlColor}${url}${reset} - ${timeColor}${duration}ms${reset}`,
            );

            return originalEnd.apply(this, args as any);
          };

          next();
        });

        return () => {
           // Initialize ISR system now that compiler is ready
           ISRManager.initialize(server as unknown as ViteDevServer).catch((error) => {
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

              const webRequest = new Request(fullUrl, {
                method: req.method,
                headers: req.headers as HeadersInit,
              });

              const jenResponse = await RouterMap.resolveRequest(webRequest);
              const routeDuration = performance.now() - routeStartTime;

              // ═══════════════════════════════════════════════════════════════
              // DEVTOOLS: Capture route trace
              // ═══════════════════════════════════════════════════════════════
              RouterBridge.captureMatch(
                url,
                jenResponse.status === 404 ? null : { found: true, pathname: url, filePathTsx: '', filePathJsx: '', params: '{}' },
                routeDuration,
              );

              // ═══════════════════════════════════════════════════════════════
              // DEVTOOLS: Capture security headers
              // ═══════════════════════════════════════════════════════════════
              const securityAudit = SecurityAuditor.audit(
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
                const body = await jenResponse.text();
                res.writeHead(jenResponse.status, {
                  'Content-Type': 'text/html',
                  'Content-Length': Buffer.byteLength(body),
                  ...buildSecurityHeaders(),
                  ...Object.fromEntries(jenResponse.headers),
                });
                res.end(body);
                return;
              }

              console.log(`${colors.blue}→ ${url}${colors.reset}`);
              next();
            } catch (error: any) {
              server.ssrFixStacktrace(error);

              console.error(`\n${colors.error}error: ${colors.reset}`);
              console.error(`\x1b[33m${error.message}${colors.reset}`);

              if (error.frame) {
                console.error(`\n${error.frame}\n`);
              } else {
                console.error(error.stack);
              }

              next(error);
            }
          });
        };
      },
    });

    this.viteCompiler = await createViteServer({
      plugins: [
        jenJsPlugin(),
        createDevToolsPlugin(),
        checker({ typescript: true }),
      ],
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
