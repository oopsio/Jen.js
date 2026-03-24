import fs from 'node:fs';
import path from 'node:path';
import { build } from 'esbuild';
import { minify } from '@swc/core';
import { RouteScanner } from '../core/scan';

export class CloudflareAdapter {
  public static async build(options: { outDir: string; rootDir: string }) {
    console.log('\x1b[36m→ Building Cloudflare Worker adapter...\x1b[0m');
    
    // Cloudflare isolates cannot use Node.js \`fs\`. 
    // We must pre-register all dynamic routes structurally.
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
       const tsxPath = route.filePathTsx ? route.filePathTsx.replace(/\\/g, '/') : '';
       const jsxPath = route.filePathJsx ? route.filePathJsx.replace(/\\/g, '/') : '';
       const targetPath = tsxPath || jsxPath;
       
       if (!targetPath) return;
       imports += `import * as Page${i} from '${targetPath}';\n`;
       
       routeRegistrations += `
         if (pathname === '${route.urlPath}') {
             const html = renderToString(h(Page${i}.default || Page${i}, {}));
             return new Response(typeof html === 'string' ? html : 'Render Error', { 
               status: 200, 
               headers: { 'Content-Type': 'text/html; charset=utf-8' } 
             });
         }
       `;
    });

    const workerCode = `
${imports}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    if (typeof middleware === 'function') {
      const mwResponse = await middleware(request);
      if (mwResponse instanceof Response) {
        if (mwResponse.headers.get('x-jen-middleware') !== 'next') {
          return mwResponse;
        }
      }
    }

    ${routeRegistrations}

    return new Response('Not Found', { status: 404 });
  }
};
    `;

    const tempEntry = path.join(options.rootDir, '.jen', 'cloudflare-entry.js');
    fs.mkdirSync(path.dirname(tempEntry), { recursive: true });
    fs.writeFileSync(tempEntry, workerCode);

    // 1. Bundle dependencies utilizing ESBuild
    const outfile = path.join(options.outDir, 'cloudflare-worker.js');
    await build({
      entryPoints: [tempEntry],
      outfile: outfile,
      bundle: true,
      format: 'esm',
      target: 'esnext',
      platform: 'browser',
    });

    // 2. Perform Native WASM Minification using SWC
    const bundledCode = fs.readFileSync(outfile, 'utf-8');
    const minified = await minify(bundledCode, {
      module: true,
      compress: true,
      mangle: true
    });
    fs.writeFileSync(outfile, minified.code);

    console.log('\x1b[32m✓ Cloudflare Worker deployed to ' + outfile + '\x1b[0m');
  }
}
