import { dirname, join, extname, basename } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import fs from "node:fs/promises";
import { readdirSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import esbuild from "esbuild";
import swcHtml from "@swc/html";

// Detect our high-speed runtimes
const isBun = typeof Bun !== "undefined";
const isDeno = typeof Deno !== "undefined";

// The high-speed memory bank
const fileCache = new Map();

// Automatically clear the Map when the script finishes or is closed
process.on("exit", () => {
  fileCache.clear();
  console.log("[MEMORY] Cache cleared and memory freed.");
});

// Catch Ctrl+C to ensure the exit event fires
process.on("SIGINT", () => {
  process.exit(0);
});

// The Universal I/O Wrapper with Branchless Execution and Caching
const io = {
  hash: isBun 
    ? (content) => new Bun.CryptoHasher("md5").update(content).digest("hex").slice(0, 10)
    // Deno natively polyfills node:crypto perfectly, so we keep this sync for both Deno and Node
    : (content) => createHash("md5").update(content).digest("hex").slice(0, 10),
    
  read: async (path) => {
    // If we already read this file, grab it from RAM instantly
    if (fileCache.has(path)) {
      return fileCache.get(path);
    }
    
    let content;
    if (isBun) {
      content = await Bun.file(path).text();
    } else if (isDeno) {
      content = await Deno.readTextFile(path);
    } else {
      content = await fs.readFile(path, "utf-8");
    }
    
    fileCache.set(path, content); // Save it for later
    return content;
  },
  
  write: async (path, content) => {
    // Update the cache so the newest version is always in memory
    fileCache.set(path, content);
    
    if (isBun) return await Bun.write(path, content);
    if (isDeno) return await Deno.writeTextFile(path, content);
    return await fs.writeFile(path, content, "utf-8");
  }
};

const STANDALONE_SERVER_CODE = `
import { createServer } from "node:http";
import { join, extname } from "node:path";
import { readFileSync, existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";

const PORT = 3000;
const __dirname = join(fileURLToPath(import.meta.url), "..");

const C = {
  reset: "\\x1b[0m",
  bold: "\\x1b[1m",
  green: "\\x1b[32m",
  cyan: "\\x1b[36m",
  dim: "\\x1b[2m",
};

const MIME_TYPES = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

const isBun = typeof Bun !== "undefined";
const isDeno = typeof Deno !== "undefined";

function getFilePath(urlPath) {
  let filePath = join(__dirname, urlPath);
  if (existsSync(filePath) && statSync(filePath).isDirectory()) {
    filePath = join(filePath, "index.html");
  }
  if (!existsSync(filePath)) {
    if (existsSync(filePath + ".html")) filePath += ".html";
    else if (existsSync(join(filePath, "index.html"))) filePath = join(filePath, "index.html");
  }
  return filePath;
}

function printReady(runtime) {
  if (typeof process !== "undefined" && process.stdout) {
    process.stdout.write("\\x1Bc");
  }
  console.log(\` \\x1b[32m > Jen.js (\${runtime}) Server Ready at \\x1b[36mhttp://localhost:\${PORT} \${C.reset}\`);
}

if (isBun) {
  // Native Bun Server
  Bun.serve({
    port: PORT,
    fetch(req) {
      const url = new URL(req.url);
      const filePath = getFilePath(url.pathname);
      
      if (existsSync(filePath) && !statSync(filePath).isDirectory()) {
        return new Response(Bun.file(filePath));
      }
      return new Response("404 Not Found", { status: 404 });
    }
  });
  printReady("Bun");

} else if (isDeno) {
  // Native Deno Server
  Deno.serve({ port: PORT }, async (req) => {
    const url = new URL(req.url);
    const filePath = getFilePath(url.pathname);
    
    if (existsSync(filePath) && !statSync(filePath).isDirectory()) {
      const ext = extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || "application/octet-stream";
      const file = await Deno.readFile(filePath);
      return new Response(file, { headers: { "Content-Type": contentType } });
    }
    return new Response("404 Not Found", { status: 404 });
  });
  printReady("Deno");

} else {
  // Fallback Node.js Server
  const server = createServer((req, res) => {
    const url = new URL(req.url, \`http://\${req.headers.host}\`);
    const filePath = getFilePath(url.pathname);

    if (existsSync(filePath) && !statSync(filePath).isDirectory()) {
      const ext = extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || "application/octet-stream";
      res.writeHead(200, { "Content-Type": contentType });
      res.end(readFileSync(filePath));
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 Not Found");
    }
  });

  server.listen(PORT, () => printReady("Node.js"));
}
`;

const __filename = fileURLToPath(import.meta.url);
const currentDir = dirname(__filename);
const rootDir = join(currentDir, ".");

function hashFile(content) {
  return io.hash(content);
}

function getAllFiles(dir, extensions = null) {
  let files = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory())
      files = files.concat(getAllFiles(fullPath, extensions));
    else if (stat.isFile()) {
      if (!extensions || extensions.some((ext) => fullPath.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }
  return files;
}

async function renameWithHash(filePath, content) {
  const hash = hashFile(content);
  const ext = extname(filePath);
  const name = basename(filePath, ext);
  const dir = dirname(filePath);
  const newPath = join(dir, `${name}.${hash}${ext}`);

  if (newPath !== filePath) {
    await fs.rename(filePath, newPath);
    return { oldPath: filePath, newPath, hash };
  }
  return { oldPath: filePath, newPath: filePath, hash };
}

async function minifyHTMLFile(filePath) {
  let html = await io.read(filePath);

  // Remove __FRAMEWORK_DATA__ JSON script if present
  html = html.replace(
    /<script id="__FRAMEWORK_DATA__" type="application\/json">[\s\S]*?<\/script>/g,
    "",
  );

  // Minify using SWC
  const { code } = await swcHtml.minify(Buffer.from(html), {
    collapseWhitespaces: "all",
    removeComments: true,
    minifyJs: true,
    minifyCss: true,
  });

  await io.write(filePath, code);
}

async function main() {
  const runtimeName = isBun ? "Bun" : isDeno ? "Deno" : "Node.js";
  console.log(`[BUILD] Starting hybrid build on ${runtimeName}...`);

  const configPath = join(currentDir, "jen.config.ts");
  const outdir = join(currentDir, ".esbuild");

  await esbuild.build({
    entryPoints: [configPath],
    outdir,
    format: "esm",
    platform: "node",
    target: "es2022",
    bundle: true,
    loader: { ".ts": "ts" },
    logLevel: "silent",
  });

  const configFile = join(outdir, "jen.config.js");
  const config = (await import(pathToFileURL(configFile).href)).default;

  const buildPath = pathToFileURL(join(rootDir, "lib/build/build.js")).href;
  const { buildSite } = await import(buildPath);

  await buildSite({ config });

  const distDir = join(process.cwd(), config.distDir || "dist");
  const manifest = {};
  const fileMap = {};

  // Step 1: Hash assets in parallel
  const assetFiles = getAllFiles(distDir, [".css", ".js"]);
  await Promise.all(assetFiles.map(async (filePath) => {
    const content = await io.read(filePath);
    const renamed = await renameWithHash(filePath, content);
    
    const oldBase = basename(renamed.oldPath);
    const newBase = basename(renamed.newPath);

    manifest[renamed.oldPath] = {
      hash: renamed.hash,
      newPath: renamed.newPath,
    };
    
    fileMap[oldBase] = newBase;
    console.log(`[SUCCESS] Hashed Asset: ${newBase}`);
  }));

  const sortedFileMap = Object.entries(fileMap).sort((a, b) => b[0].length - a[0].length);

  // Step 2: Minify and update HTML in parallel
  const htmlFiles = getAllFiles(distDir, [".html"]);
  await Promise.all(htmlFiles.map(async (filePath) => {
    // 1. Minify with SWC first
    await minifyHTMLFile(filePath);
    let content = await io.read(filePath);

    // 2. Relative Path Logic
    const relDir = dirname(filePath).replace(distDir, "").replace(/\\/g, "/");
    const segments = relDir.split('/').filter(Boolean);
    const depth = segments.length;
    const rootPrefix = depth === 0 ? './' : '../'.repeat(depth);

    content = content.replace(/(href|src)=["']\/([^\/][^"']*)?["']/g, (match, attr, path) => {
      const cleanPath = path || "";
      return `${attr}="${rootPrefix}${cleanPath}"`;
    });

    content = content.replace(/from\s*["']\/__runtime\/([^"']+)["']/g, (match, filename) => {
      return `from "${rootPrefix}${filename}"`;
    });

    content = content.replace(/hydrateClient\s*\(\s*["']\/__hydrate\?file=([^"']+)["']\s*\)/g, (match, encodedFile) => {
      const decoded = decodeURIComponent(encodedFile);
      const componentName = basename(decoded, extname(decoded));
      return `hydrateClient("${rootPrefix}components/${componentName}.js")`;
    });

    // 3. Import Map Injection
    const runtimeFile = fileMap["preact-runtime.js"] || "preact-runtime.js";
    const importMap = `<script type="importmap">{"imports":{"preact":"${rootPrefix}${runtimeFile}","preact/hooks":"${rootPrefix}${runtimeFile}","preact/compat":"${rootPrefix}${runtimeFile}","preact/jsx-runtime":"${rootPrefix}${runtimeFile}"}}</script>`;

    if (content.includes("</head>")) {
      content = content.replace("</head>", `${importMap}</head>`);
    } else {
      content = importMap + content;
    }

    // 4. Hash Replacements
    for (const [oldName, newName] of sortedFileMap) {
      content = content.split(oldName).join(newName);
    }
    
    await io.write(filePath, content);

    const dir = dirname(filePath);
    const oldName = basename(filePath);
    const newPath = join(dir, "index.html");

    if (oldName !== "index.html") {
      await fs.rename(filePath, newPath);
    }

    manifest[filePath] = { hash: "none", newPath: newPath };
  }));

  const manifestPath = join(distDir, "asset-manifest.json");
  await io.write(manifestPath, JSON.stringify(manifest, null, 2));

  const serverPath = join(distDir, "server.js");
  await io.write(serverPath, STANDALONE_SERVER_CODE);
  
  console.log(`[SUCCESS] Build complete! SWC minification and asset hashing finished at warp speed.`);
}

main().catch(console.error);