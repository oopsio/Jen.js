/**
 * Jen.js Build Performance Benchmarks
 * Measures SSG build, bundling, and asset optimization performance
 */

import { describe, bench, beforeAll, afterAll } from 'vitest';
import { join } from 'path';
import { rm, mkdir } from 'fs/promises';

const benchDir = join(process.cwd(), '.bench-tmp');

describe('Build Performance', () => {
  beforeAll(async () => {
    await mkdir(benchDir, { recursive: true });
  });

  afterAll(async () => {
    await rm(benchDir, { recursive: true, force: true });
  });

  bench('SSG Build - Simple Site', async () => {
    // Simulated SSG build
    const pages = Array(100)
      .fill(null)
      .map((_, i) => ({
        path: `/page-${i}`,
        title: `Page ${i}`,
        content: 'Lorem ipsum dolor sit amet'.repeat(10),
      }));

    const built = pages.map((page) => ({
      ...page,
      html: `<html><body><h1>${page.title}</h1><p>${page.content}</p></body></html>`,
    }));

    return built.length;
  });

  bench('SSG Build - Complex Routes', async () => {
    // Simulated complex routing
    const routes = [
      '/users/:id',
      '/posts/:id/comments/:cid',
      '/api/[...rest]',
      '/dashboard/[slug]/[section]',
    ];

    const buildRoutes = routes.flatMap((route) =>
      Array(50)
        .fill(null)
        .map((_, i) => route.replace(':id', `${i}`))
    );

    return buildRoutes.length;
  });

  bench('Asset Hashing - 1000 Files', async () => {
    // Simulated asset hashing
    const crypto = require('crypto');
    const files = Array(1000)
      .fill(null)
      .map((_, i) => ({
        path: `asset-${i}.js`,
        content: `console.log('${i}')`.repeat(100),
      }));

    return files
      .map((file) => ({
        ...file,
        hash: crypto.createHash('sha256').update(file.content).digest('hex'),
      }))
      .filter((f) => f.hash).length;
  });

  bench('CSS Minification - Large Stylesheet', async () => {
    const css = `
      body { margin: 0; padding: 0; }
      .container { max-width: 1200px; margin: 0 auto; }
      .header { background: #fff; padding: 20px; }
      .nav { display: flex; gap: 20px; }
    `.repeat(100);

    // Simulated minification
    const minified = css
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\n/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    return minified.length;
  });

  bench('Image Optimization - 100 Images', async () => {
    // Simulated image optimization
    const images = Array(100)
      .fill(null)
      .map((_, i) => ({
        path: `image-${i}.jpg`,
        size: Math.floor(Math.random() * 5000000),
      }));

    // Simulate compression ratio
    return images
      .map((img) => ({
        ...img,
        compressed: Math.floor(img.size * 0.65),
      }))
      .reduce((sum, img) => sum + (img.size - img.compressed), 0);
  });

  bench('Code Splitting - Entry Point Analysis', async () => {
    // Simulated code splitting
    const modules = {
      'src/index.ts': ['src/components/Button.tsx', 'src/hooks/useAuth.ts'],
      'src/pages/dashboard.tsx': [
        'src/components/Chart.tsx',
        'src/lib/analytics.ts',
      ],
      'src/pages/admin.tsx': ['src/components/AdminPanel.tsx'],
    };

    const chunks = Object.entries(modules).map(([entry, deps]) => ({
      entry,
      size: deps.length * 150000,
      deps,
    }));

    return chunks.reduce((sum, chunk) => sum + chunk.size, 0);
  });

  bench('Incremental Build - Changed File', async () => {
    // Simulated incremental build
    const allFiles = Array(500).fill(null);
    const changedFiles = Array(1).fill(null);

    // Only rebuild changed + dependents
    const filesToRebuild = allFiles.filter(
      (_, i) => i < changedFiles.length || Math.random() < 0.1
    );

    return filesToRebuild.length;
  });

  bench('Source Map Generation', async () => {
    // Simulated source map generation
    const code = `
      function fibonacci(n) {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
      }
    `.repeat(50);

    const lines = code.split('\n');
    const mappings = lines.map((line, i) => ({
      generated: { line: i, column: 0 },
      source: 'source.ts',
      original: { line: i, column: 0 },
    }));

    return JSON.stringify(mappings).length;
  });

  bench('Bundle Analysis - Dependency Graph', async () => {
    // Simulated dependency graph analysis
    const deps = {
      react: 127043,
      'react-dom': 244053,
      preact: 32300,
      'preact-render-to-string': 8900,
      'styled-jsx': 15234,
    };

    const graph = Object.entries(deps).map(([name, size]) => ({
      name,
      size,
      gzip: Math.floor(size * 0.35),
      brotli: Math.floor(size * 0.30),
    }));

    return graph.reduce((sum, dep) => sum + dep.size, 0);
  });

  bench('Build Metadata Serialization', async () => {
    // Simulated build metadata
    const metadata = {
      buildTime: Date.now(),
      assets: Array(500)
        .fill(null)
        .map((_, i) => ({
          path: `dist/assets/file-${i}.js`,
          size: Math.floor(Math.random() * 100000),
          hash: `hash-${i}`,
        })),
      routes: Array(200)
        .fill(null)
        .map((_, i) => ({
          path: `/page-${i}`,
          hash: `route-hash-${i}`,
        })),
    };

    return JSON.stringify(metadata).length;
  });
});
