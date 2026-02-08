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
