/*
 * This file is part of Jen.js.
 * Copyright (C) 2026 oopsio
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

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
