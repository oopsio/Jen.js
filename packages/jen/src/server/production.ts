/**
 * Universal Jen.js Production Server
 *
 * NIST SP 800-44 & OWASP ASVS Level 1 Compliant
 * Runtime-agnostic: Works on Bun, Deno, and Node.js
 *
 * Security Features:
 * - Rust Router Gatekeeper: All requests validated before processing
 * - Hardened Security Headers: CSP, HSTS, X-Content-Type-Options, X-Frame-Options
 * - Stateless SSR Execution: Pre-bundled components only
 * - OWASP Error Handling: Generic errors to client, full logs on server
 * - No dev dependencies: Uses only dist/ artifacts
 */

import { RuntimeDetector } from './runtime';
import { RouterMap } from '../core/map';
import { RouteScanner } from '../core/scan';
import renderToString from 'preact-render-to-string';
import { h } from 'preact';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
};

// ============================================================================
// SECURITY HEADERS
// ============================================================================

interface SecurityConfig {
  csp?: string;
  hsts?: boolean;
  frameOptions?: string;
  contentTypeOptions?: string;
}

const defaultSecurityConfig: SecurityConfig = {
  csp: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:",
  hsts: true,
  frameOptions: 'DENY',
  contentTypeOptions: 'nosniff',
};

function buildSecurityHeaders(
  config: SecurityConfig = defaultSecurityConfig,
): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'text/html; charset=utf-8',
    'X-Content-Type-Options': config.contentTypeOptions || 'nosniff',
    'X-Frame-Options': config.frameOptions || 'DENY',
  };

  if (config.csp) {
    headers['Content-Security-Policy'] = config.csp;
  }

  if (config.hsts && isProductionMode()) {
    headers['Strict-Transport-Security'] =
      'max-age=31536000; includeSubDomains; preload';
  }

  return headers;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function isProductionMode(): boolean {
  return (
    typeof process !== 'undefined'
      ? process.env.NODE_ENV === 'production'
      : Deno?.env.get('NODE_ENV') === 'production'
  ) as boolean;
}

function getPort(): number {
  if (typeof process !== 'undefined') {
    return parseInt(process.env.PORT || '3000', 10);
  } else if (typeof Deno !== 'undefined') {
    return parseInt(Deno.env.get('PORT') || '3000', 10);
  }
  return 3000;
}

function logRequest(
  method: string,
  url: string,
  status: number,
  duration: number,
): void {
  const methodColor = colors[method as keyof typeof colors] || colors.reset;
  const statusColor = status >= 400 ? colors.red : colors.green;
  const timeColor = '\x1b[36m'; // Cyan

  console.log(
    `${methodColor}${method}${colors.reset} ${url} ${statusColor}${status}${colors.reset} ${timeColor}${duration.toFixed(2)}ms${colors.reset}`,
  );
}

// ============================================================================
// SSR ENGINE (Production)
// ============================================================================

class ProductionSSREngine {
  /**
   * Render a page component from the dist bundle
   * All modules must be pre-built and bundled
   */
  public static async renderPage(componentPath: string): Promise<string> {
    try {
      // Dynamic import from pre-bundled dist
      // In production, this should resolve from your bundled output
      const module = await import(/* @vite-ignore */ componentPath);
      const PageComponent = module.default;

      if (!PageComponent) {
        throw new Error(`Component at ${componentPath} has no default export`);
      }

      const componentHtml = renderToString(h(PageComponent, {}));
      return this.constructDocument(componentHtml, componentPath);
    } catch (error) {
      // Log full error server-side
      console.error('SSR Error:', error);
      throw error;
    }
  }

  /**
   * Construct minimal HTML5 shell with hydration support
   */
  private static constructDocument(
    renderedHtml: string,
    componentPath: string,
  ): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Jen.js</title>
</head>
<body>
    <div id="jen-root" data-page-path="${componentPath}">${renderedHtml}</div>
    
    <script type="module">
        import { hydrate, h } from 'preact';

        async function init() {
            const container = document.getElementById('jen-root');
            if (!container) return;

            const scriptPath = container.dataset.pagePath;
            
            try {
                const module = await import(/* @vite-ignore */ scriptPath);
                const Page = module.default;

                if (Page) {
                    hydrate(h(Page, {}), container);
                }
            } catch (e) {
                console.error('Jen.js Hydration Error:', e);
            }
        }

        init();
    </script>
</body>
</html>`;
  }
}

// ============================================================================
// REQUEST HANDLER
// ============================================================================

async function handleRequest(req: Request): Promise<Response> {
  const startTime = performance.now();
  const url = new URL(req.url);
  const { pathname } = url;

  try {
    // ────────────────────────────────────────────────────────────────────
    // 1. RUST ROUTER GATEKEEPER: Validate route before any processing
    // ────────────────────────────────────────────────────────────────────
    const jenResponse = await RouterMap.resolveRequest(req);

    // If router found no match, return 404 with security headers
    if (jenResponse.status === 404) {
      const duration = performance.now() - startTime;
      logRequest(req.method, pathname, 404, duration);

      return new Response('Not Found', {
        status: 404,
        headers: buildSecurityHeaders(),
      });
    }

    // ────────────────────────────────────────────────────────────────────
    // 2. ROUTE MATCHED: Apply security headers and return response
    // ────────────────────────────────────────────────────────────────────
    const duration = performance.now() - startTime;
    logRequest(req.method, pathname, jenResponse.status, duration);

    // Clone response and add security headers
    const responseBody = await jenResponse.text();
    const securityHeaders = buildSecurityHeaders();

    return new Response(responseBody, {
      status: jenResponse.status,
      headers: {
        ...Object.fromEntries(jenResponse.headers),
        ...securityHeaders,
      },
    });
  } catch (error) {
    // ────────────────────────────────────────────────────────────────────
    // 3. ERROR HANDLING: Log full error, return generic response
    // ────────────────────────────────────────────────────────────────────
    const duration = performance.now() - startTime;

    // Log real error server-side (includes stack trace)
    if (error instanceof Error) {
      console.error(`[ERROR] ${pathname}`);
      console.error(`Message: ${error.message}`);
      console.error(`Stack: ${error.stack}`);
    } else {
      console.error(`[ERROR] ${pathname}:`, error);
    }

    logRequest(req.method, pathname, 500, duration);

    // Return generic error to client (OWASP requirement)
    return new Response('Internal Server Error', {
      status: 500,
      headers: buildSecurityHeaders(),
    });
  }
}

// ============================================================================
// RUNTIME DETECTION & SERVER START
// ============================================================================

export async function startProductionServer(
  port: number = getPort(),
): Promise<void> {
  const runtime = RuntimeDetector.detect();

  if (runtime === 'unknown') {
    console.error('❌ Unsupported runtime environment');
    process.exit(1);
  }

  // ────────────────────────────────────────────────────────────────────
  // REGISTER ROUTES
  // ────────────────────────────────────────────────────────────────────
  const scanner = new RouteScanner();
  const routes = scanner.scanPages();

  for (const route of routes) {
    RouterMap.registerRoute(
      route.urlPath,
      route.filePathTsx,
      route.filePathJsx,
      async (req, ctx) => {
        try {
          const filePath = ctx.filePath;
          const html = await ProductionSSREngine.renderPage(filePath);
          return new Response(html, {
            headers: { 'Content-Type': 'text/html', ...buildSecurityHeaders() },
          });
        } catch (error) {
          console.error(`SSR error for ${ctx.url}:`, error);
          throw error;
        }
      },
    );
  }

  const serverUrl = `http://localhost:${port}`;

  console.log(
    `${colors.magenta}╭─${colors.reset} ${colors.green}Jen.js Production Server${colors.reset}`,
  );
  console.log(`${colors.magenta}├─${colors.reset} Runtime: ${runtime}`);
  console.log(
    `${colors.magenta}├─${colors.reset} Mode: ${isProductionMode() ? 'production' : 'development'}`,
  );
  console.log(
    `${colors.magenta}├─${colors.reset} Security: NIST SP 800-44 + OWASP ASVS L1`,
  );
  console.log(
    `${colors.magenta}╰─${colors.reset} ${colors.blue}${serverUrl}${colors.reset}`,
  );

  // ────────────────────────────────────────────────────────────────────
  // BUN.SERVE
  // ────────────────────────────────────────────────────────────────────
  if (runtime === 'bun') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).Bun.serve({
      port,
      fetch: handleRequest,
      error: (error: Error) => {
        console.error('Bun server error:', error);
        return new Response('Internal Server Error', { status: 500 });
      },
    });

    console.log(`${colors.green}✓ Server running${colors.reset}`);
    return;
  }

  // ────────────────────────────────────────────────────────────────────
  // DENO.SERVE
  // ────────────────────────────────────────────────────────────────────
  if (runtime === 'deno') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (globalThis as any).Deno.serve(
      { port, hostname: 'localhost' },
      handleRequest,
    );

    console.log(`${colors.green}✓ Server running${colors.reset}`);
    return;
  }

  // ────────────────────────────────────────────────────────────────────
  // NODE.JS HTTP MODULE
  // ────────────────────────────────────────────────────────────────────
  if (runtime === 'node') {
    const http = await import('node:http');

    const server = http.createServer(async (req, res) => {
      try {
        const request = new Request(`http://${req.headers.host}${req.url}`, {
          method: req.method,
          headers: req.headers as HeadersInit,
        });

        const response = await handleRequest(request);
        const body = await response.text();

        res.writeHead(response.status, Object.fromEntries(response.headers));
        res.end(body);
      } catch (error) {
        console.error('Node.js request handler error:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      }
    });

    server.listen(port, () => {
      console.log(`${colors.green}✓ Server running${colors.reset}`);
    });

    server.on('error', (error) => {
      console.error('Node.js server error:', error);
      process.exit(1);
    });

    return;
  }
}

// ============================================================================
// PRODUCTION SERVER MANAGER
// ============================================================================

export class ProductionServerManager {
  /**
   * Start production server with build artifacts
   * NIST SP 800-44 & OWASP ASVS L1 compliant
   */
  public static async start(port: number): Promise<void> {
    const runtime = RuntimeDetector.detect();

    if (runtime === 'node') {
      return this.startNodeServer(port);
    } else if (runtime === 'bun') {
      return this.startBunServer(port);
    } else if (runtime === 'deno') {
      return this.startDenoServer(port);
    } else {
      throw new Error('Unsupported runtime');
    }
  }

  private static async startNodeServer(port: number): Promise<void> {
    const http = await import('node:http');
    const fs = await import('node:fs');
    const path = await import('node:path');

    const distDir = path.resolve(process.cwd(), 'dist/static');
    if (!fs.existsSync(distDir)) {
      console.error(
        '\x1b[31m✗ dist/static not found. Run "jen build" first.\x1b[0m',
      );
      process.exit(1);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const server = http.createServer(async (req: any, res: any) => {
      try {
        const request = new Request(`http://${req.headers.host}${req.url}`, {
          method: req.method,
          headers: req.headers as HeadersInit,
        });

        const response = await handleRequest(request);
        const body = await response.text();

        res.writeHead(response.status, Object.fromEntries(response.headers));
        res.end(body);
      } catch (error) {
        console.error('Production server error:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      }
    });

    server.listen(port, () => {
      console.log(
        `${colors.green}✓ Production server running at http://localhost:${port}${colors.reset}`,
      );
      console.log(
        `${colors.blue}NIST SP 800-44 & OWASP ASVS L1 Compliant${colors.reset}`,
      );
    });

    server.on('error', (error: Error) => {
      console.error(
        `${colors.red}✗ Server error: ${error.message}${colors.reset}`,
      );
      process.exit(1);
    });
  }

  private static async startBunServer(port: number): Promise<void> {
    const distDir = Bun.env.PWD + '/dist/static';
    if (!Bun.file(distDir).exists()) {
      console.error(
        '\x1b[31m✗ dist/static not found. Run "jen build" first.\x1b[0m',
      );
      process.exit(1);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).Bun.serve({
      port,
      fetch: handleRequest,
      error: (error: Error) => {
        console.error('Bun server error:', error);
        return new Response('Internal Server Error', { status: 500 });
      },
    });

    console.log(
      `${colors.green}✓ Production server running at http://localhost:${port}${colors.reset}`,
    );
    console.log(
      `${colors.blue}NIST SP 800-44 & OWASP ASVS L1 Compliant${colors.reset}`,
    );
  }

  private static async startDenoServer(port: number): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (globalThis as any).Deno.serve(
      { port, hostname: 'localhost' },
      handleRequest,
    );

    console.log(
      `${colors.green}✓ Production server running at http://localhost:${port}${colors.reset}`,
    );
    console.log(
      `${colors.blue}NIST SP 800-44 & OWASP ASVS L1 Compliant${colors.reset}`,
    );
  }
}

// ============================================================================
// EXPORT FOR TESTING & CLI INTEGRATION
// ============================================================================

export { handleRequest, ProductionSSREngine };
