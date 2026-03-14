import { dirname, join, extname, basename } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import fs from "node:fs/promises";
import { readdirSync, statSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import esbuild from "esbuild";
import { minify } from "html-minifier-terser";

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

const server = createServer((req, res) => {
  const url = new URL(req.url, \`http://\${req.headers.host}\`);
  let filePath = join(__dirname, url.pathname);

  if (existsSync(filePath) && statSync(filePath).isDirectory()) {
    filePath = join(filePath, "index.html");
  }

  if (!existsSync(filePath)) {
    if (existsSync(filePath + ".html")) filePath += ".html";
    else if (existsSync(join(filePath, "index.html"))) filePath = join(filePath, "index.html");
  }

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

server.listen(PORT, () => {
  process.stdout.write("\\x1Bc");
  console.log(\` \\x1b[32m > Ready at \\x1b[36mhttp://localhost:3000 \${C.reset}\`);
});
`;

const __filename = fileURLToPath(import.meta.url);
const currentDir = dirname(__filename);
const rootDir = join(currentDir, ".");

// Hash file content (MD5, first 10 chars)
function hashFile(content) {
  return createHash("md5").update(content).digest("hex").slice(0, 10);
}

// Recursively find all files (with optional filter)
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

// Rename file with hash
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

// Remove framework scripts + minify
async function minifyHTMLFile(filePath) {
  let html = await fs.readFile(filePath, "utf-8");

  // Remove __FRAMEWORK_DATA__ JSON script if present
  html = html.replace(
    /<script id="__FRAMEWORK_DATA__" type="application\/json">[\s\S]*?<\/script>/g,
    "",
  );

  // Minify remaining HTML
  const minified = await minify(html, {
    collapseWhitespace: true,
    removeComments: true,
    removeRedundantAttributes: true,
    removeEmptyAttributes: true,
    removeOptionalTags: true,
    minifyCSS: true,
    minifyJS: true,
  });

  await fs.writeFile(filePath, minified, "utf-8");
}

async function main() {
  console.log("[BUILD] Starting build...");

  const configPath = join(currentDir, "jen.config.ts");
  const outdir = join(currentDir, ".esbuild");

  // Build the config first
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

  // Build the site
  await buildSite({ config });

  const distDir = join(process.cwd(), config.distDir || "dist");
  const manifest = {};
  const fileMap = {}; // Maps old base filenames to new hashed base filenames

  // Step 1: Hash CSS and JS files
  const assetFiles = getAllFiles(distDir, [".css", ".js"]);
  for (const filePath of assetFiles) {
    const content = await fs.readFile(filePath, "utf-8");
    const renamed = await renameWithHash(filePath, content);
    
    // Extract just the filename (e.g., "styles.css")
    const oldBase = basename(renamed.oldPath);
    const newBase = basename(renamed.newPath);

    manifest[renamed.oldPath] = {
      hash: renamed.hash,
      newPath: renamed.newPath,
    };
    
    // Store the base names for replacement
    fileMap[oldBase] = newBase;
    console.log(`[SUCCESS] Hashed Asset: ${renamed.newPath}`);
  }

  // Sort by length descending to prevent partial path replacements
  const sortedFileMap = Object.entries(fileMap).sort((a, b) => b[0].length - a[0].length);

  // Step 2: Minify, Update Paths, Inject Import Map & Rename HTML
  const htmlFiles = getAllFiles(distDir, [".html"]);
  for (const filePath of htmlFiles) {
    await minifyHTMLFile(filePath);
    let content = await fs.readFile(filePath, "utf-8");

    // 1. Calculate how deep this HTML file is relative to the dist directory
    const relDir = dirname(filePath).replace(distDir, "").replace(/\\/g, "/");
    const segments = relDir.split('/').filter(Boolean);
    const depth = segments.length;
    const rootPrefix = depth === 0 ? './' : '../'.repeat(depth);

    // 2. Convert absolute root paths (href="/...", src="/...") to relative paths
    content = content.replace(/(href|src)=["']\/([^\/][^"']*)?["']/g, (match, attr, path) => {
      const cleanPath = path || "";
      return `${attr}="${rootPrefix}${cleanPath}"`;
    });

    // 3. Convert absolute /__runtime/ module imports to relative paths
    content = content.replace(/from\s*["']\/__runtime\/([^"']+)["']/g, (match, filename) => {
      return `from "${rootPrefix}${filename}"`;
    });

    // 4. Intercept the dev server hydrate call and point it to the unhashed component name
    content = content.replace(/hydrateClient\s*\(\s*["']\/__hydrate\?file=([^"']+)["']\s*\)/g, (match, encodedFile) => {
      const decoded = decodeURIComponent(encodedFile);
      const componentName = basename(decoded, extname(decoded));
      return `hydrateClient("${rootPrefix}components/${componentName}.js")`;
    });

    // 5. Inject the Import Map for Preact
    const runtimeFile = fileMap["preact-runtime.js"] || "preact-runtime.js";
    const importMap = `<script type="importmap">
    {
      "imports": {
        "preact": "${rootPrefix}${runtimeFile}",
        "preact/hooks": "${rootPrefix}${runtimeFile}",
        "preact/compat": "${rootPrefix}${runtimeFile}",
        "preact/jsx-runtime": "${rootPrefix}${runtimeFile}"
      }
    }
    </script>`;

    if (content.includes("</head>")) {
      content = content.replace("</head>", `${importMap}\n</head>`);
    } else {
      content = importMap + content;
    }

    // 6. Run the hash replacements
    for (const [oldName, newName] of sortedFileMap) {
      content = content.split(oldName).join(newName);
    }
    
    // Save updated content before potential move
    await fs.writeFile(filePath, content, "utf-8");

    const dir = dirname(filePath);
    const oldName = basename(filePath);
    const newPath = join(dir, "index.html");

    if (oldName !== "index.html") {
      await fs.rename(filePath, newPath);
      console.log(`[SUCCESS] Renamed: ${oldName} -> index.html`);
    } else {
      console.log(`[SUCCESS] Minified: ${oldName}`);
    }

    manifest[filePath] = {
      hash: "none",
      newPath: newPath,
    };
  }

  // Write manifest
  const manifestPath = join(distDir, "asset-manifest.json");
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
  console.log(`[SUCCESS] Asset manifest written: ${manifestPath}`);

  console.log(
    "[SUCCESS] Site built: HTML is index.html and assets are hashed!"
  );
  const serverPath = join(distDir, "server.js");
  await fs.writeFile(serverPath, STANDALONE_SERVER_CODE, "utf-8");
  console.log(`[SUCCESS] Standalone server created: ${serverPath}`);
  
  console.log("[SUCCESS] Build complete! Run 'node dist/server.js' to start.");
}

main().catch(console.error);