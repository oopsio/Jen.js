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
 * Creates the destination directory structure as needed.
 *
 * @param src The source directory path.
 * @param dst The destination directory path.
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
 * Builds a static site by pre-rendering all routes to HTML files.
 * This is the core static site generation (SSG) function that runs at build time.
 * It performs the following steps:
 * 1. Clears the previous build output directory
 * 2. Discovers all route files in the configured site directory
 * 3. Renders each route to a static HTML file
 * 4. Copies static assets from the source directory
 * 5. Bundles Vue and Svelte components for client-side rehydration
 * 6. Compiles SCSS to CSS for the global stylesheet
 *
 * Routes are rendered with empty req/res objects (SSG mode) to avoid middleware execution.
 * This produces pure static HTML that can be served by any web server.
 * Hydration scripts are still injected if the route has hydrate:true, allowing for
 * optional client-side interactivity in otherwise static pages.
 *
 * @param opts Configuration object.
 * @param opts.config The Jen.js framework configuration.
 * @throws Logs warnings for missing assets or component bundling failures but does not stop the build.
 */
export async function buildSite(opts: { config: FrameworkConfig }) {
  const { config } = opts;

  // Inject fonts configuration into config.inject.head
  // This automatically adds Google Fonts links and local @font-face CSS
  injectFonts(config);

  // Clear and recreate the dist directory for a clean build.
  const dist = resolveDistPath(config);
  rmSync(dist, { recursive: true, force: true });
  mkdirSync(dist, { recursive: true });

  // Discover all routes and pre-render each to a static HTML file.
  const routes = scanRoutes(config);
  log.info(`Building SSG: ${routes.length} routes`);

  for (const r of routes) {
    // Create a synthetic URL for each route. Used as the request URL during rendering.
    const url = new URL("http://localhost" + r.urlPath);

    // Render the route to HTML. Empty req/res indicates SSG mode (no middleware execution).
    let html = await renderRouteToHtml({
      config,
      route: r,
      req: {} as any,
      res: {} as any,
      url,
      params: {},
      query: {},
      headers: {},
      cookies: {},
    });

    // Inject polyfills and Preact runtime script tags before closing body
    // This ensures backwards compatibility for IE11+ and provides client interactivity
    const polyfillsScript = `<script src="/polyfills.js"></script>`;
    const preactScript = `<script type="module" src="/preact-runtime.js"></script>`;
    const injectedScripts = `${polyfillsScript}${preactScript}`;
    
    // Insert before closing body tag if it exists, otherwise append to HTML
    if (html.includes("</body>")) {
      html = html.replace("</body>", `${injectedScripts}</body>`);
    } else {
      html = html + injectedScripts;
    }

    // Calculate output path. Root route goes to index.html, nested routes get their own directories.
    const outPath =
      r.urlPath === "/"
        ? join(dist, "index.html")
        : join(dist, r.urlPath.slice(1), "index.html");

    mkdirSync(join(outPath, ".."), { recursive: true });
    writeFileSync(outPath, html, "utf8");

    log.info(`SSG: ${r.urlPath} -> ${outPath}`);
  }

  // Copy static assets from the source assets directory to the built site.
  const assetsSrc = join(process.cwd(), config.siteDir, "assets");
  const assetsDst = join(dist, "assets");
  copyDir(assetsSrc, assetsDst);

  // Asset hashing with Rust utility if enabled
  if (config.build?.hashAssets) {
    log.info("Hashing assets with Rust...");
    const hashes = await AssetHasher.hashDirectory(assetsDst);
    log.info(`Hashed ${Object.keys(hashes).length} assets.`);

    if (config.build?.generateManifest) {
      writeFileSync(join(dist, "asset-manifest.json"), JSON.stringify(hashes, null, 2));
      log.info("Generated asset-manifest.json");
    }

    // Rename assets with their hashes
    for (const [relPath, hash] of Object.entries(hashes)) {
      const fullPath = join(assetsDst, relPath);
      const ext = extname(fullPath);
      const dir = dirname(fullPath);
      const name = basename(fullPath, ext);
      const newPath = join(dir, `${name}.${hash}${ext}`);
      
      if (existsSync(fullPath)) {
        try {
          renameSync(fullPath, newPath);
        } catch (err: any) {
          log.warn(`Failed to rename asset ${relPath}: ${err.message}`);
        }
      }
    }
  }

  // Bundle Vue and Svelte components found in the site directory.
  // These are transpiled to JavaScript modules for client-side use in interactive pages.
  if (config.features?.compilers !== false) {
    const siteSourceDir = join(process.cwd(), config.siteDir);
    const vueFiles = readdirSync(siteSourceDir, { recursive: true }).filter(
      (f) => String(f).endsWith(".vue") || String(f).endsWith(".svelte"),
    );

    if (vueFiles.length > 0) {
      log.info(`Found ${vueFiles.length} Vue/Svelte components, bundling...`);
      try {
        await esbuild.build({
          entryPoints: vueFiles.map((f) => join(siteSourceDir, String(f))),
          outdir: join(dist, "components"),
          format: "esm",
          target: "es2022",
          bundle: false,
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

  // Bundle polyfills for backwards compatibility (IE11, legacy browsers)
  // Try multiple paths: cwd, parent of cwd, framework root
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
    try {
      await esbuild.build({
        entryPoints: [polyfillsPath],
        outfile: join(dist, "polyfills.js"),
        format: "iife",
        target: "es2015",
        bundle: false,
        minify: true,
        sourcemap: false,
        logLevel: "info",
      });
      log.info("✅ Polyfills bundled: polyfills.js");
    } catch (err: any) {
      log.warn(`Failed to bundle polyfills: ${err.message}`);
    }
  }

  // Bundle Preact runtime and core dependencies into a single file
  // This ensures all client-side interactivity has Preact available
  const preactBundleEntry = join(
    process.cwd(),
    ".jen",
    "preact-runtime-entry.js"
  );
  mkdirSync(join(process.cwd(), ".jen"), { recursive: true });

  // Create temp entry point for Preact bundle
  writeFileSync(
    preactBundleEntry,
    `
  export * from 'preact';
  export * from 'preact/hooks';
  export * from 'preact/compat';

  // Polyfill exports
  if (typeof window !== 'undefined') {
  window.__PREACT_BUNDLE__ = true;
  }
  `
  );

  log.info("Bundling Preact runtime...");
  try {
    await esbuild.build({
      entryPoints: [preactBundleEntry],
      outfile: join(dist, "preact-runtime.js"),
      format: "esm",
      target: "es2015",
      bundle: true,
      minify: true,
      sourcemap: false,
      logLevel: "info",
    });
    log.info("✅ Preact runtime bundled: preact-runtime.js");
  } catch (err: any) {
    log.warn(`Failed to bundle Preact runtime: ${err.message}`);
  }

  // Compile the global SCSS file to CSS.
  // This stylesheet is injected into every page and contains framework-wide styles.
  // Minification is enabled for production builds.
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
