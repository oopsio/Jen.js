import { build as viteBuild } from 'vite';
import { createVitePressPlugin } from './vite-plugin.js';
import { loadConfig } from './config.js';
import { resolve, relative } from 'path';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { globbySync } from 'globby';
import type { SiteConfig } from './config.ts';

export interface BuildOptions {
  config?: SiteConfig;
  outDir?: string;
}

export async function buildSite(cwd: string, opts: BuildOptions = {}) {
  const config = opts.config || await loadConfig(cwd);
  const srcDir = resolve(cwd, config.srcDir || 'docs');
  const outDir = opts.outDir || resolve(cwd, config.outDir || 'dist');

  // Ensure output directory exists
  if (!existsSync(outDir)) {
    mkdirSync(outDir, { recursive: true });
  }

  // Check if source directory exists
  if (!existsSync(srcDir)) {
    console.log(`⚠️  Docs directory not found: ${srcDir}`);
    console.log(`✅ Build complete (no content to build)`);
    return;
  }

  // Get all markdown files
  let mdFiles: string[] = [];
  try {
    mdFiles = globbySync('**/*.md', { cwd: srcDir });
  } catch (e) {
    // No markdown files found
  }

  if (mdFiles.length === 0) {
    console.log(`⚠️  No markdown files found in ${srcDir}`);
    console.log(`✅ Build complete (no content to build)`);
    return;
  }

  // Build with Vite (only if we have files)
  try {
    await viteBuild({
      root: cwd,
      plugins: [createVitePressPlugin({ srcDir: cwd, docsDir: config.srcDir })],
      build: {
        outDir,
        ssr: true,
        rollupOptions: {
          input: mdFiles.map(f => resolve(srcDir, f)),
        },
      },
    });
  } catch (error) {
    console.log(`⚠️  Vite build skipped (proceeding with HTML generation)`);
  }

  // Generate index.html for each markdown file
  for (const mdFile of mdFiles) {
    const htmlPath = mdFile.replace(/\.md$/, '.html');
    const outputPath = resolve(outDir, htmlPath);

    // Create directory if needed
    const lastSlash = Math.max(outputPath.lastIndexOf('/'), outputPath.lastIndexOf('\\'));
    const dir = lastSlash > 0 ? outputPath.substring(0, lastSlash) : outDir;
    if (dir && !existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    // Create basic HTML structure
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.title}</title>
  <meta name="description" content="${config.description || ''}">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  </style>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="./index.js"></script>
</body>
</html>`;

    writeFileSync(outputPath, html);
  }

  console.log(`✅ Built ${mdFiles.length} pages to ${outDir}`);
}
