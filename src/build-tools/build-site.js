// Site build utilities
// Migrated from Python src/python/build.py
import { copyFileSync, rmSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { log } from "../shared/log.js";
function copyDir(src, dst) {
  if (!readdirSync(src, { withFileTypes: true }).length) return;
  mkdirSync(dst, { recursive: true });
  for (const file of readdirSync(src, { withFileTypes: true })) {
    const srcPath = join(src, file.name);
    const dstPath = join(dst, file.name);
    if (file.isDirectory()) {
      copyDir(srcPath, dstPath);
    } else {
      copyFileSync(srcPath, dstPath);
    }
  }
}
export async function buildSite(opts = {}) {
  log.info("Building site...");
  const srcDir = "site";
  const distDir = "dist";
  // Clean dist
  try {
    rmSync(distDir, { recursive: true, force: true });
  } catch {}
  // Copy assets
  copyDir(srcDir, distDir);
  log.info(`Copied ${srcDir} → ${distDir}`);
  // Minify if requested
  if (opts.minify) {
    log.info("Minifying assets...");
    // Placeholder: integrate image/font minifiers
  }
  log.info("Build complete.");
}
