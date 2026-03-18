import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { createServer } from "vite";
import { createServer as createHttpServer } from "node:http";

// Silence the noise
process.removeAllListeners('warning');

const C = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  red: "\x1b[31m",
  dim: "\x1b[2m",
};

function log(status, message, color = C.green) {
  const paddedStatus = status.padStart(12);
  console.log(`${C.bold}${color}${paddedStatus}${C.reset} ${message}`);
}

async function main() {
  const startTime = performance.now();

  const isBun = !!process.versions.bun;
  const runner = isBun ? "bun" : "npm";
  
  log("Using", runner, C.cyan);
  log("Building", "jen.js project...");

  const build = spawnSync(runner, ["run", "build"], { 
    stdio: "pipe", 
    shell: true,
    encoding: "utf-8",
    env: { ...process.env, NODE_NO_WARNINGS: "1" } 
  });

  if (build.status !== 0) {
    log("Error", "Build failed", C.red);
    console.log("\n" + "-".repeat(40));
    console.log(C.red + (build.stderr || build.stdout || "Check build script") + C.reset);
    console.log("-".repeat(40) + "\n");
    process.exit(1);
  }

  const httpServer = createHttpServer((req, res) => {
    if (req.url?.startsWith("/__hydrate")) {
      const url = new URL(req.url, `http://localhost:3000`);
      const file = url.searchParams.get("file");
      if (!file) {
        res.statusCode = 400;
        res.end("missing file");
        return;
      }
      res.statusCode = 200;
      res.setHeader("content-type", "application/javascript; charset=utf-8");
      res.setHeader("cache-control", "no-store");
      res.end("export default function Page() { return null; }");
      return;
    }

    // Try to serve static file from dist
    try {
      const filePath = `./dist${decodeURIComponent(new URL(req.url, `http://localhost:3000`).pathname)}`;
      const cleanPath = filePath.replace(/\.\.\//g, "");
      if (existsSync(cleanPath)) {
        const content = readFileSync(cleanPath);
        const ext = cleanPath.split(".").pop();
        const types = { js: "application/javascript", json: "application/json", html: "text/html", css: "text/css", png: "image/png", jpg: "image/jpeg", svg: "image/svg+xml" };
        res.setHeader("content-type", types[ext] || "application/octet-stream");
        res.end(content);
        return;
      }
    } catch (e) {}

    res.statusCode = 404;
    res.end("not found");
  });

  httpServer.listen(3000, "localhost");

  const startupTime = (performance.now() - startTime).toFixed(0);
  
  
  // Clear a line for breathing room
  console.log(); 

  console.log(`  ${C.bold}JEN.JS v20.1.2${C.reset}  ${C.dim}ready in ${startupTime} ms${C.reset}\n`);

  // Fixed indentation: 2 spaces, then the arrow, then 2 spaces
  console.log(`  ${C.green}${C.reset}  ${C.bold}Local:${C.reset}   ${C.cyan}http://localhost:3000/${C.reset}`);
  
  // These use 5 spaces to align perfectly under the word "Local"
  console.log(`  ${C.dim}${C.reset}  ${C.dim}Network: use --host to expose${C.reset}`);
  console.log(`  ${C.dim}${C.reset}  ${C.dim}press h + enter to show help${C.reset}\n`);
}

main().catch(console.error);
