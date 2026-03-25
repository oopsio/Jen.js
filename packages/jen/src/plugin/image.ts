import type { Plugin, ViteDevServer } from 'vite';
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Jen.js Image Optimizer Plugin
 * Intercepts assets at build time, and dev requests at runtime, applying Sharp WebP compression.
 */
export function jenImageOptimizerPlugin(): Plugin {
  return {
    name: 'jen-image-optimizer',
    enforce: 'post',

    // 1. Build Time Optimization
    async generateBundle(options, bundle) {
      const imageExts = /\.(png|jpe?g|webp|avif)$/i;

      // Scan through all emitted assets in the build
      for (const [fileName, asset] of Object.entries(bundle)) {
        if (
          asset.type === 'asset' &&
          imageExts.test(fileName) &&
          asset.source instanceof Uint8Array
        ) {
          try {
            console.log(
              `\x1b[33m[Jen.js Image]\x1b[0m Optimizing ${fileName}...`,
            );
            // Compress the image with Sharp to WebP format
            const optimized = await sharp(asset.source)
              .webp({ quality: 80, effort: 4 })
              .toBuffer();

            // Override the original output buffering with the smaller, optimized blob.
            // (We keep the original file name/extension so references in HTML/JS don't break,
            // while serving highly compressed WebP bytes invisibly).
            asset.source = optimized;
          } catch (e) {
            console.error(
              `\x1b[31m[Jen.js Image]\x1b[0m Failed to optimize build asset ${fileName}`,
              e,
            );
          }
        }
      }
    },

    // 2. Dev Time Middleware (On-the-fly resizing)
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.includes('jen-img=1')) {
          return next();
        }

        try {
          const urlObj = new URL(req.url, `http://${req.headers.host}`);
          const rawPath = urlObj.pathname;
          const w = urlObj.searchParams.get('w');
          const q = urlObj.searchParams.get('q');

          // Resolve absolute path in development root
          let filePath = path.join(process.cwd(), 'public', rawPath);
          if (!fs.existsSync(filePath)) {
            filePath = path.join(process.cwd(), rawPath);
          }

          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            const width = w ? parseInt(w, 10) : undefined;
            const quality = q ? parseInt(q, 10) : 80;

            console.log(
              `\x1b[36m[Jen.js Image]\x1b[0m Dev optimizing: ${rawPath}`,
            );
            const buffer = fs.readFileSync(filePath);

            let transformer = sharp(buffer);
            if (width) {
              transformer = transformer.resize({
                width,
                withoutEnlargement: true,
              });
            }

            const optimizedBuffer = await transformer
              .webp({ quality })
              .toBuffer();

            res.setHeader('Content-Type', 'image/webp');
            res.setHeader(
              'Cache-Control',
              'public, max-age=31536000, immutable',
            );
            res.end(optimizedBuffer);
            return;
          }
        } catch (e) {
          console.error(
            `\x1b[31m[Jen.js Image]\x1b[0m Dev failing fallback`,
            e,
          );
        }

        next();
      });
    },
  };
}
