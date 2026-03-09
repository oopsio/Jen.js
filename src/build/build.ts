import {
  mkdirSync,
  rmSync,
  writeFileSync,
  existsSync,
  copyFileSync,
  readdirSync,
  statSync,
  readFileSync,
  renameSync,
} from "node:fs";
import { join, dirname, basename, extname } from "node:path";
import { fileURLToPath } from "node:url";
import esbuild from "esbuild";
import { createScssCompiler } from "../css/compiler.js";
import {
  vueEsbuildPlugin,
  svelteEsbuildPlugin,
} from "../compilers/esbuild-plugins.js";

import type { FrameworkConfig } from "../core/config.js";
import { scanRoutes } from "../core/routes/scan.js";
import { resolveDistPath } from "../core/paths.js";
import { log } from "../shared/log.js";
import { renderRouteToHtml } from "../runtime/render.js";
import { injectFonts } from "../fonts/inject.js";
import { AssetHasher } from "./asset-hashing.js";

// Get __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Recursively copies a directory and all its contents.
 * Used to copy static assets from the source directory to the build output.
 */
function copyDir(src: string, dst: string) {
  if (!existsSync(src)) return;
  mkdirSync(dst, { recursive: true });

  for (const name of readdirSync(src)) {
    const sp = join(src, name);
    const dp = join(dst, name);
    const st = statSync(sp);

    if (st.isDirectory()) copyDir(sp, dp);
    else copyFileSync(sp, dp);
  }
}

/**
 * FIXED: Mock Response/Request to prevent crashes during SSG
 * when components or middleware call res.setHeader()
 */
function createSsgMocks() {
  return {
    req: {
      headers: {},
      method: "GET",
      url: "/",
      cookies: {},
    } as any,
    res: {
      setHeader: () => {},
      getHeader: () => {},
      getHeaders: () => ({}),
      removeHeader: () => {},
      writeHead: () => ({}),
      end: () => {},
      statusCode: 200,
    } as any,
  };
}

/**
 * Builds a static site by pre-rendering all routes to HTML files.
 */
export async function buildSite(opts: { config: FrameworkConfig }) {
  const { config } = opts;
  const { req, res } = createSsgMocks();

  // Inject fonts configuration into config.inject.head
  injectFonts(config);

  // Clear and recreate the dist directory for a clean build.
  const dist = resolveDistPath(config);
  rmSync(dist, { recursive: true, force: true });
  mkdirSync(dist, { recursive: true });

  // Discover all routes and pre-render each to a static HTML file.
  const routes = scanRoutes(config);
  log.info(`Building SSG: ${routes.length} routes`);

  for (const r of routes) {
    // Create a synthetic URL for each route.
    const url = new URL("http://localhost" + r.urlPath);

    // Render the route to HTML.
    let html = await renderRouteToHtml({
      config,
      route: r,
      req, // Using fixed mocks
      res, // Using fixed mocks
      url,
      params: {},
      query: {},
      headers: {},
      cookies: {},
    });

    // Inject polyfills and Preact runtime script tags
    const polyfillsScript = `<script src="/polyfills.js"></script>`;
    const preactScript = `<script type="module" src="/preact-runtime.js"></script>`;
    const injectedScripts = `${polyfillsScript}${preactScript}`;
    
    // FIXED: Case-insensitive injection for </body>
    const bodyRegex = /<\/body>/i;
    if (bodyRegex.test(html)) {
      html = html.replace(bodyRegex, (match) => `${injectedScripts}${match}`);
    } else {
      html = html + injectedScripts;
    }

    // Calculate output path. 
    const outPath =
      r.urlPath === "/"
        ? join(dist, "index.html")
        : join(dist, r.urlPath.replace(/\/$/, ""), "index.html");

    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, html, "utf8");

    log.info(`SSG: ${r.urlPath} -> ${outPath}`);
  }

  // Copy static assets
  const assetsSrc = join(process.cwd(), config.siteDir, "assets");
  const assetsDst = join(dist, "assets");
  copyDir(assetsSrc, assetsDst);

  // Asset hashing with Rust utility if enabled
  if (config.build?.hashAssets) {
    log.info("Hashing assets with Rust...");
    const hashes = await AssetHasher.hashDirectory(assetsDst);
    log.info(`Hashed ${Object.keys(hashes).length} assets.`);

    const manifest: Record<string, string> = {};

    // Rename assets with their hashes and build manifest for HTML updating
    for (const [relPath, hash] of Object.entries(hashes)) {
      const fullPath = join(assetsDst, relPath);
      const ext = extname(fullPath);
      const dir = dirname(fullPath);
      const name = basename(fullPath, ext);
      const newFileName = `${name}.${hash}${ext}`;
      const newPath = join(dir, newFileName);
      
      // Store the mapping for HTML link replacement (normalized for web)
      const oldPublicPath = `/assets/${relPath}`.replace(/\\/g, '/');
      const newPublicPath = `/assets/${join(dirname(relPath), newFileName)}`.replace(/\\/g, '/');
      manifest[oldPublicPath] = newPublicPath;
      
      if (existsSync(fullPath)) {
        try {
          renameSync(fullPath, newPath);
        } catch (err: any) {
          log.warn(`Failed to rename asset ${relPath}: ${err.message}`);
        }
      }
    }

    // FIXED: Update HTML files with new hashed paths so assets don't 404
    const htmlFiles = readdirSync(dist, { recursive: true })
      .filter(f => String(f).endsWith(".html"))
      .map(f => join(dist, String(f)));

    for (const file of htmlFiles) {
      let content = readFileSync(file, "utf8");
      let changed = false;
      for (const [oldPath, newPath] of Object.entries(manifest)) {
        if (content.includes(oldPath)) {
          content = content.split(oldPath).join(newPath);
          changed = true;
        }
      }
      if (changed) writeFileSync(file, content);
    }

    if (config.build?.generateManifest) {
      writeFileSync(join(dist, "asset-manifest.json"), JSON.stringify(hashes, null, 2));
      log.info("Generated asset-manifest.json");
    }
  }

  // Bundle Vue and Svelte components
  if (config.features?.compilers !== false) {
    const siteSourceDir = join(process.cwd(), config.siteDir);
    const componentFiles = readdirSync(siteSourceDir, { recursive: true }).filter(
      (f) => /\.(vue|svelte)$/.test(String(f)),
    );

    if (componentFiles.length > 0) {
      log.info(`Found ${componentFiles.length} Vue/Svelte components, bundling...`);
      try {
        await esbuild.build({
          entryPoints: componentFiles.map((f) => join(siteSourceDir, String(f))),
          outdir: join(dist, "components"),
          format: "esm",
          target: "es2022",
          bundle: true, // Increased to true to resolve internal deps
          plugins: [vueEsbuildPlugin(), svelteEsbuildPlugin()],
          external: ["preact", "vue", "svelte"],
          logLevel: "info",
        });
        log.info("Vue/Svelte components bundled successfully.");
      } catch (err: any) {
        log.warn(`Failed to bundle Vue/Svelte components: ${err.message}`);
      }
    }
  }

  // Bundle polyfills
  const polyfillsPaths = [
    join(process.cwd(), "src/runtime/polyfills.js"),
    join(process.cwd(), "../src/runtime/polyfills.js"),
    join(process.cwd(), "../../src/runtime/polyfills.js"),
  ];
  
  let polyfillsPath: string | null = null;
  for (const path of polyfillsPaths) {
    if (existsSync(path)) {
      polyfillsPath = path;
      break;
    }
  }

  if (polyfillsPath) {
    log.info("Bundling polyfills for backwards compatibility...");
    const polyfillsMetaPath = join(dist, "polyfills-meta.json");
    try {
      const polyfillsMeta = await esbuild.build({
        entryPoints: [polyfillsPath],
        outfile: join(dist, "polyfills.js"),
        format: "iife",
        target: "es2015",
        bundle: true,
        minify: true,
        sourcemap: false,
        logLevel: "info",
        metafile: true,
      });
      if (polyfillsMeta.metafile) {
        writeFileSync(polyfillsMetaPath, JSON.stringify(polyfillsMeta.metafile, null, 2));
      }
      log.info("✅ Polyfills bundled: polyfills.js");
    } catch (err: any) {
      log.warn(`Failed to bundle polyfills: ${err.message}`);
    }
  }

  // Bundle Preact runtime
  const preactBundleEntry = join(process.cwd(), ".jen", "preact-runtime-entry.js");
  mkdirSync(dirname(preactBundleEntry), { recursive: true });

  writeFileSync(
    preactBundleEntry,
    `export * from 'preact'; export * from 'preact/hooks'; export * from 'preact/compat';
    if (typeof window !== 'undefined') { window.__PREACT_BUNDLE__ = true; }`
  );

  log.info("Bundling Preact runtime...");
  const preactMetaPath = join(dist, "preact-runtime-meta.json");
  try {
    const preactMeta = await esbuild.build({
      entryPoints: [preactBundleEntry],
      outfile: join(dist, "preact-runtime.js"),
      format: "esm",
      target: "es2015",
      bundle: true,
      minify: true,
      sourcemap: false,
      logLevel: "info",
      metafile: true,
    });
    if (preactMeta.metafile) {
      writeFileSync(preactMetaPath, JSON.stringify(preactMeta.metafile, null, 2));
    }
    log.info("Preact runtime bundled: preact-runtime.js");
  } catch (err: any) {
    log.warn(`Failed to bundle Preact runtime: ${err.message}`);
  }

  // Compile global SCSS
  const scssPath = join(process.cwd(), config.css.globalScss);
  if (existsSync(scssPath)) {
    const compiler = createScssCompiler();
    const result = compiler.compile({
      inputPath: scssPath,
      minified: true,
    });

    if (result.error) {
      log.error(`SCSS Compilation Failed: ${result.error}`);
      writeFileSync(join(dist, "styles.css"), "/* SCSS Compilation Failed */");
    } else {
      writeFileSync(join(dist, "styles.css"), result.css);
      log.info(`Compiled global SCSS: ${config.css.globalScss}`);
    }
  } else {
    log.warn(`Global SCSS file not found: ${scssPath}`);
    writeFileSync(join(dist, "styles.css"), "/* No global SCSS found */");
  }

  log.info("Build complete.");
}