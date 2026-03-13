import {
  copyFileSync,
  rmSync,
  mkdirSync,
  readdirSync,
  statSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { join, extname } from "node:path";
import { log } from "../shared/log.js";

/**
 * Build options for site generation.
 */
export interface BuildOptions {
  minify?: boolean;
  sourcemap?: boolean;
  optimize?: boolean;
  compressImages?: boolean;
  compressFonts?: boolean;
}

/**
 * Build statistics.
 */
export interface BuildStats {
  startTime: number;
  endTime: number;
  duration: number;
  filesCopied: number;
  bytesOriginal: number;
  bytesOptimized: number;
  compression: number;
}

let buildStats: BuildStats | null = null;

/**
 * Copy directory recursively with file count tracking.
 */
function copyDir(src: string, dst: string): number {
  const files = readdirSync(src, { withFileTypes: true });
  if (!files.length) return 0;

  mkdirSync(dst, { recursive: true });
  let count = 0;

  for (const file of files) {
    const srcPath = join(src, file.name);
    const dstPath = join(dst, file.name);

    if (file.isDirectory()) {
      count += copyDir(srcPath, dstPath);
    } else {
      copyFileSync(srcPath, dstPath);
      count++;
    }
  }

  return count;
}

/**
 * Compress images (placeholder for actual compression).
 * In production, integrate with sharp or imagemin.
 */
function compressImages(dir: string): number {
  let count = 0;
  const files = readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const path = join(dir, file.name);

    if (file.isDirectory()) {
      count += compressImages(path);
    } else {
      const ext = extname(file.name).toLowerCase();
      if ([".png", ".jpg", ".jpeg", ".webp", ".svg"].includes(ext)) {
        log.info(`[build-site] Would compress: ${file.name}`);
        count++;
      }
    }
  }

  return count;
}

/**
 * Compress fonts (placeholder for actual compression).
 * In production, integrate with fonttools or similar.
 */
function compressFonts(dir: string): number {
  let count = 0;
  const files = readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const path = join(dir, file.name);

    if (file.isDirectory()) {
      count += compressFonts(path);
    } else {
      const ext = extname(file.name).toLowerCase();
      if ([".woff", ".woff2", ".ttf", ".otf"].includes(ext)) {
        log.info(`[build-site] Would compress: ${file.name}`);
        count++;
      }
    }
  }

  return count;
}

/**
 * Calculate total size of directory.
 */
function calculateDirSize(dir: string): number {
  let total = 0;
  const files = readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const path = join(dir, file.name);

    if (file.isDirectory()) {
      total += calculateDirSize(path);
    } else {
      const stat = statSync(path);
      total += stat.size;
    }
  }

  return total;
}

/**
 * Build site with asset optimization.
 *
 * Features:
 * - Copy all assets from site directory
 * - Minify CSS/JS (placeholder)
 * - Compress images (placeholder)
 * - Compress fonts (placeholder)
 * - Generate build statistics
 *
 * @param opts Build options.
 * @returns Build statistics.
 */
export async function buildSite(opts: BuildOptions = {}): Promise<BuildStats> {
  const startTime = Date.now();
  const srcDir = "site";
  const distDir = "dist";

  try {
    log.info("[build-site] Starting build...");

    // Clean dist
    try {
      rmSync(distDir, { recursive: true, force: true });
      log.info("[build-site] Cleaned dist directory");
    } catch {}

    // Copy assets
    const filesCopied = copyDir(srcDir, distDir);
    log.info(`[build-site] Copied ${filesCopied} files`);

    let bytesOptimized = calculateDirSize(distDir);
    const bytesOriginal = bytesOptimized;

    // Optimize if requested
    if (opts.compressImages) {
      const imageCount = compressImages(distDir);
      log.info(`[build-site] Identified ${imageCount} images for compression`);
    }

    if (opts.compressFonts) {
      const fontCount = compressFonts(distDir);
      log.info(`[build-site] Identified ${fontCount} fonts for compression`);
    }

    const endTime = Date.now();
    const duration = endTime - startTime;
    const compression = ((1 - bytesOptimized / bytesOriginal) * 100).toFixed(2);

    buildStats = {
      startTime,
      endTime,
      duration,
      filesCopied,
      bytesOriginal,
      bytesOptimized,
      compression: parseFloat(compression),
    };

    log.info(
      `[build-site] Build complete in ${duration}ms (${bytesOriginal} → ${bytesOptimized} bytes)`,
    );

    return buildStats;
  } catch (error) {
    log.error(
      `[build-site] Build failed: ${error instanceof Error ? error.message : String(error)}`,
    );
    throw error;
  }
}

/**
 * Get last build statistics.
 */
export function getBuildStats(): BuildStats | null {
  return buildStats;
}
