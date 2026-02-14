import { mkdirSync, rmSync, writeFileSync, existsSync, copyFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { FrameworkConfig } from '../core/config.js';
import { scanRoutes } from '../core/routes/scan.js';
import { resolveDistPath } from '../core/paths.js';
import { log } from '../shared/log.js';
import { PageRenderer } from './page-renderer.js';
import { AssetHasher } from './asset-hashing.js';
import { createScssCompiler } from '../css/compiler.js';
import { Minifier } from './minifier.js';

export class SSGPipeline {
  private config: FrameworkConfig;
  private dist: string;

  constructor(config: FrameworkConfig) {
    this.config = config;
    this.dist = resolveDistPath(config);
  }

  /**
   * Run the full SSG Pipeline
   */
  async run() {
    log.info('Starting SSG Pipeline (Enterprise Build)');

    // 1. Prepare dist
    this.prepareDist();

    // 2. Process Assets
    await this.processAssets();

    // 3. Compile Styles
    const cssPath = await this.compileStyles();

    // 4. Render Pages
    await this.renderPages();

    log.info('Pipeline complete.');
  }

  private prepareDist() {
    rmSync(this.dist, { recursive: true, force: true });
    mkdirSync(this.dist, { recursive: true });
  }

  private async processAssets() {
    const assetDir = join(process.cwd(), this.config.siteDir, 'assets');
    const targetDir = join(this.dist, 'assets');

    if (existsSync(assetDir)) {
      this.copyRecursive(assetDir, targetDir);
      log.info('Assets copied to dist');
    }
  }

  private async compileStyles(): Promise<string | null> {
    const scssPath = join(process.cwd(), this.config.css.globalScss);
    if (!existsSync(scssPath)) return null;

    const compiler = createScssCompiler();
    const result = compiler.compile({
      inputPath: scssPath,
      minified: true
    });

    if (result.error) {
      log.error(`SCSS Failed: ${result.error}`);
      return null;
    }

    const cssFile = join(this.dist, 'styles.css');
    writeFileSync(cssFile, result.css);

    // Hash the CSS
    const hashedName = AssetHasher.hashFile(cssFile);
    log.info(`Styles compiled and hashed: ${hashedName}`);
    return hashedName;
  }

  private async renderPages() {
    const routes = scanRoutes(this.config);

    for (const r of routes) {
      try {
        const url = new URL('http://localhost' + r.urlPath);

        const html = await PageRenderer.render({
          config: this.config,
          route: r,
          url,
          params: {},
          query: {},
          headers: {},
          cookies: {}
        }, true);

        const outDir = join(this.dist, r.urlPath === '/' ? '' : r.urlPath.slice(1));
        mkdirSync(outDir, { recursive: true });
        writeFileSync(join(outDir, 'index.html'), html);

        log.info(`Rendered ${r.urlPath}`);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        log.error(`Failed to render ${r.urlPath}: ${errorMsg}`);
        throw err;
      }
    }
  }

  private copyRecursive(src: string, dst: string) {
    mkdirSync(dst, { recursive: true });
    for (const name of readdirSync(src)) {
      const sp = join(src, name);
      const dp = join(dst, name);
      if (statSync(sp).isDirectory()) {
        this.copyRecursive(sp, dp);
      } else {
        copyFileSync(sp, dp);
      }
    }
  }
}
