import fs from 'node:fs';
import path from 'node:path';
import { build } from 'esbuild';
import { minify } from '@swc/core';
import { RouteScanner } from '../core/scan.js';
import { RuntimeConfig } from '../config/config.js';

export class VercelAdapter {
  public static async build(options: { outDir: string; rootDir: string }) {
    console.log('\x1b[36m→ Building Vercel Serverless adapter...\x1b[0m');
    const vercelOut = path.join(options.rootDir, '.vercel', 'output');
    const basePath = RuntimeConfig.zone?.basePath || '';

    fs.mkdirSync(path.join(vercelOut, 'functions', 'index.func'), {
      recursive: true,
    });

    const srcRegex = basePath ? `${basePath}(/.*)?` : '/(.*)';
    const configObj = {
      version: 3,
      routes: [
        { handle: 'filesystem' },
        { src: srcRegex, dest: basePath ? `${basePath}/` : '/' },
      ],
    };
    fs.writeFileSync(
      path.join(vercelOut, 'config.json'),
      JSON.stringify(configObj, null, 2),
    );

    const funcConfig = {
      runtime: 'nodejs18.x',
      handler: 'index.js',
      launcherType: 'Nodejs',
    };
    fs.writeFileSync(
      path.join(vercelOut, 'functions', 'index.func', '.vc-config.json'),
      JSON.stringify(funcConfig, null, 2),
    );

    // Statically bind component payload routes to bypass runtime node traversal bugs on Vercel
    const scanner = new RouteScanner();
    const routes = scanner.scanPages();
    const middlewarePath = scanner.scanMiddleware();

    let routeRegistrations = '';
    let imports = `import { h } from 'preact';\n`;
    imports += `import renderToString from 'preact-render-to-string';\n`;

    if (middlewarePath) {
      imports += `import middleware from '${middlewarePath}';\n`;
    }

    routes.forEach((route, i) => {
      const tsxPath = route.filePathTsx
        ? route.filePathTsx.replace(/\\/g, '/')
        : '';
      const jsxPath = route.filePathJsx
        ? route.filePathJsx.replace(/\\/g, '/')
        : '';
      const targetPath = tsxPath || jsxPath;

      if (!targetPath) return;
      imports += `import * as Page${i} from '${targetPath}';\n`;

      routeRegistrations += `
         if (pathname === '${route.urlPath}') {
             const html = renderToString(h(Page${i}.default || Page${i}, {}));
             const headers = new Headers({ 'Content-Type': 'text/html; charset=utf-8' });
             for (const [key, value] of headers.entries()) {
               res.setHeader(key, value);
             }
             res.statusCode = 200;
             res.end(html);
             return;
         }
       `;
    });

    const serverCode = `
${imports}

export default async function handler(req, res) {
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const url = new URL(req.url, \`\${protocol}://\${req.headers.host}\`);
  const pathname = url.pathname;

  if (typeof middleware === 'function') {
    // Vercel Serverless environment: Wrap req/res if needed or use Request/Response
    const webRequest = new Request(url, {
      method: req.method,
      headers: req.headers
    });
    
    const mwResponse = await middleware(webRequest);
    if (mwResponse instanceof Response) {
      if (mwResponse.headers.get('x-jen-middleware') !== 'next') {
        res.statusCode = mwResponse.status;
        for (const [key, value] of mwResponse.headers.entries()) {
          res.setHeader(key, value);
        }
        res.end(await mwResponse.text());
        return;
      }
    }
  }

  ${routeRegistrations}


  res.statusCode = 404;
  res.end('Not Found');
}
    `;

    const entryPath = path.join(options.rootDir, '.jen', 'vercel-entry.js');
    fs.mkdirSync(path.dirname(entryPath), { recursive: true });
    fs.writeFileSync(entryPath, serverCode);

    const outfile = path.join(vercelOut, 'functions', 'index.func', 'index.js');

    // Vercel bundle via specialized Node hooks
    await build({
      entryPoints: [entryPath],
      outfile: outfile,
      bundle: true,
      platform: 'node',
      target: 'node18',
      format: 'esm',
      external: ['vite'],
    });

    // SWC Minification Core Engine pass
    const bundledCode = fs.readFileSync(outfile, 'utf-8');
    const minified = await minify(bundledCode, {
      module: true,
      compress: true,
      mangle: true,
    });
    fs.writeFileSync(outfile, minified.code);

    const pj = { type: 'module' };
    fs.writeFileSync(
      path.join(vercelOut, 'functions', 'index.func', 'package.json'),
      JSON.stringify(pj),
    );

    // Nest static files if basePath is provided
    if (basePath) {
      const targetStaticPath = path.join(
        vercelOut,
        'static',
        basePath.replace(/^\//, ''),
      );
      const defaultStaticSource = path.join(options.rootDir, 'dist/static');
      if (fs.existsSync(defaultStaticSource)) {
        fs.mkdirSync(targetStaticPath, { recursive: true });
        // NOTE: In a real app we would copy the contents, here we'll just log and assume symlink or copy
        fs.cpSync(defaultStaticSource, targetStaticPath, { recursive: true });
        // Can conditionally remove the dist/static if preferred: fs.rmSync(defaultStaticSource, { recursive: true, force: true });
      }
    }

    console.log(
      '\x1b[32m✓ Vercel adapter build complete in .vercel/output\x1b[0m',
    );
  }
}
