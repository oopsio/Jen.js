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

// Native dev server (Rust stub)
// Provides high-performance development server
// Currently: TypeScript implementation (use Bun or esbuild-serve in production)
import { createServer } from "node:http";
export async function startDevServer(opts = {}) {
  const port = opts.port || 5173;
  const hostname = opts.hostname || "0.0.0.0";
  const root = opts.root || process.cwd();
  const server = createServer((req, res) => {
    res.writeHead(200, { "content-type": "text/plain" });
    res.end(
      "TypeScript dev server stub (replace with Rust native build in production)\n",
    );
  });
  server.listen(port, hostname, () => {
    console.log(`[DEV SERVER] Listening on http://${hostname}:${port}`);
  });
  return server;
}
// Export default for direct execution
if (import.meta.url === `file://${process.argv[1]}`) {
  startDevServer();
}
