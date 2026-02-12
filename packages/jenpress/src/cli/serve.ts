import { createServer } from 'http';
import { createReadStream, statSync, readdirSync } from 'fs';
import { join, extname } from 'path';
import { loadConfig } from '../node/config.ts';

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

export async function serveSite(cwd: string, args: string[]) {
  const config = await loadConfig(cwd);
  const distDir = join(cwd, config.outDir || 'dist');
  const port = parseInt(args[0] || '4173', 10);

  const server = createServer((req, res) => {
    let filePath = join(distDir, req.url!);

    // Handle directory index
    if (req.url?.endsWith('/')) {
      filePath = join(filePath, 'index.html');
    }

    try {
      const stat = statSync(filePath);
      
      if (stat.isDirectory()) {
        filePath = join(filePath, 'index.html');
      }

      const ext = extname(filePath);
      const mimeType = MIME_TYPES[ext] || 'application/octet-stream';
      
      res.writeHead(200, { 'Content-Type': mimeType });
      createReadStream(filePath).pipe(res);
    } catch (error) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 Not Found</h1>');
    }
  });

  server.listen(port, () => {
    console.log(`\n📚 JenPress Server`);
    console.log(`📖 Serving: ${config.outDir || 'dist'}`);
    console.log(`🚀 Local: http://localhost:${port}\n`);
  });
}
