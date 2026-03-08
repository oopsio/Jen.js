import { createServer } from "http";
import { readFileSync, existsSync, realpathSync } from "fs";
import { join, extname } from "path";
import { WebSocketServer } from "ws";
import type { IncomingMessage, ServerResponse } from "http";
import type { DevServerOptions, ModuleGraph } from "../types.js";
import { info, success, error as logError } from "../utils/log.js";
import { getFileName } from "../utils/path.js";
import { parse as parseUrl } from "url";

interface ClientMessage {
  type: "ping" | "ready";
}

export class DevServer {
  private httpServer: any;
  private wsServer: WebSocketServer;
  private port: number;
  private host: string;
  private root: string;
  private clients: Set<any> = new Set();
  private bundleCode: string = "";
  private moduleGraph: ModuleGraph | null = null;

  constructor(options: DevServerOptions) {
    this.port = options.port || 3000;
    this.host = options.host || "0.0.0.0";
    this.root = options.config.root || process.cwd();

    this.httpServer = createServer((req, res) => this.handleRequest(req, res));
    this.wsServer = new WebSocketServer({ server: this.httpServer });
    this.setupWebSocket();
  }

  private setupWebSocket(): void {
    this.wsServer.on("connection", (ws) => {
      this.clients.add(ws);

      ws.on("message", (message) => {
        try {
          const data = JSON.parse(message.toString());
          if (data.type === "ready") {
            ws.send(JSON.stringify({ type: "reload" }));
          }
        } catch {
          // Ignore parse errors
        }
      });

      ws.on("close", () => {
        this.clients.delete(ws);
      });

      ws.on("error", () => {
        this.clients.delete(ws);
      });
    });
  }

  private handleRequest(req: IncomingMessage, res: ServerResponse): void {
    const parsed = parseUrl(req.url || "/");
    let pathname = parsed.pathname || "/";
    // Ensure pathname starts with a leading slash
    if (!pathname.startsWith("/")) {
      pathname = "/" + pathname;
    }

    try {
      pathname = decodeURIComponent(pathname);
    } catch {
      res.writeHead(400, { "Content-Type": "text/plain" });
      res.end("Bad Request");
      return;
    }

    // WebSocket endpoint
    if (pathname === "/__jenpack_ws") {
      return;
    }

    // Jenpack client
    if (pathname === "/__jenpack_client.js") {
      return this.sendJenpackClient(res);
    }

    // Serve bundled module
    if (pathname.startsWith("/__modules/")) {
      return this.serveModule(pathname, res);
    }

    // Serve static files from project root
    const publicDir = join(this.root, "public");
    if (extname(pathname) === "" && pathname !== "/") {
      const candidate = join(this.root, pathname);
      let resolved: string;
      try {
        resolved = realpathSync(candidate);
      } catch {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not Found");
        return;
      }
      if (!resolved.startsWith(this.root)) {
        res.writeHead(403, { "Content-Type": "text/plain" });
        res.end("Forbidden");
        return;
      }
      return this.serveFile(resolved, res);
    }

    // Try to serve from public directory
    const requestedPath = pathname === "/" ? "index.html" : pathname;
    const publicCandidate = join(publicDir, requestedPath);
    if (existsSync(publicCandidate)) {
      let resolvedPublic: string;
      try {
        resolvedPublic = realpathSync(publicCandidate);
      } catch {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not Found");
        return;
      }
      if (!resolvedPublic.startsWith(publicDir)) {
        res.writeHead(403, { "Content-Type": "text/plain" });
        res.end("Forbidden");
        return;
      }
      return this.serveFile(resolvedPublic, res);
    }

    // Serve HTML for entry point
    if (pathname === "/") {
      return this.serveIndex(res);
    }

    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }

  private sendJenpackClient(res: ServerResponse): void {
    const client = `
(async () => {
  const ws = new WebSocket('ws://' + location.host + '/__jenpack_ws');
  
  ws.onopen = () => {
    ws.send(JSON.stringify({ type: 'ready' }));
  };
  
  ws.onmessage = (e) => {
    const data = JSON.parse(e.data);
    if (data.type === 'reload') {
      console.log('[jenpack] Reloading...');
      location.reload();
    }
  };
  
  ws.onerror = () => {
    console.error('[jenpack] WebSocket error');
  };
})();
`;
    res.writeHead(200, { "Content-Type": "application/javascript" });
    res.end(client);
  }

  private serveModule(url: string, res: ServerResponse): void {
    res.writeHead(200, { "Content-Type": "application/javascript" });
    res.end(this.bundleCode);
  }

  private serveIndex(res: ServerResponse): void {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Jenpack Dev</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/__modules/entry.js"></script>
  <script src="/__jenpack_client.js"><\/script>
</body>
</html>
`;
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(html);
  }

  private serveFile(filePath: string, res: ServerResponse): void {
    try {
      const content = readFileSync(filePath, "utf8");
      const ext = extname(filePath);
      const contentType = this.getContentType(ext);
      res.writeHead(200, { "Content-Type": contentType });
      res.end(content);
    } catch {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
    }
  }

  private getContentType(ext: string): string {
    const types: Record<string, string> = {
      ".html": "text/html",
      ".css": "text/css",
      ".js": "application/javascript",
      ".json": "application/json",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".svg": "image/svg+xml",
    };
    return types[ext] || "application/octet-stream";
  }

  setBundleCode(code: string): void {
    this.bundleCode = code;
    this.broadcastReload();
  }

  setModuleGraph(graph: ModuleGraph): void {
    this.moduleGraph = graph;
  }

  broadcastReload(): void {
    const message = JSON.stringify({ type: "reload" });
    for (const client of this.clients) {
      if (client.readyState === 1) {
        // WebSocket OPEN
        client.send(message);
      }
    }
  }

  async listen(): Promise<void> {
    return new Promise((resolve) => {
      this.httpServer.listen(this.port, this.host, () => {
        success(`Dev server running at http://${this.host}:${this.port}`);
        resolve();
      });
    });
  }

  close(): Promise<void> {
    return new Promise((resolve) => {
      // Close all WebSocket connections
      for (const client of this.clients) {
        client.close();
      }
      this.wsServer.close();
      this.httpServer.close(() => resolve());
    });
  }
}

export function createDevServer(options: DevServerOptions): DevServer {
  return new DevServer(options);
}
