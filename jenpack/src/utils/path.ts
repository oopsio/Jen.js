import { resolve, relative, dirname, basename, extname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function normalizePath(path: string): string {
  return path.replace(/\\/g, '/');
}

export function resolveRoot(): string {
  return resolve(process.cwd());
}

export function getProjectRoot(): string {
  let current = process.cwd();
  while (current !== dirname(current)) {
    const pkgPath = resolve(current, 'package.json');
    try {
      require(pkgPath);
      return current;
    } catch {
      current = dirname(current);
    }
  }
  return process.cwd();
}

export function resolveModuleId(importPath: string, fromModule: string): string {
  const fromDir = dirname(fromModule);
  const resolved = resolve(fromDir, importPath);
  return normalizePath(resolved);
}

export function isRelativeImport(path: string): boolean {
  return path.startsWith('.');
}

export function isAbsoluteImport(path: string): boolean {
  return !isRelativeImport(path) && !path.startsWith('/');
}

export function getFileName(path: string): string {
  return basename(path);
}

export function getExt(path: string): string {
  return extname(path);
}

export function removeExt(path: string): string {
  return path.slice(0, -getExt(path).length);
}

export function isTypeScriptFile(path: string): boolean {
  const ext = getExt(path).toLowerCase();
  return ['.ts', '.tsx', '.mts', '.cts'].includes(ext);
}

export function isJavaScriptFile(path: string): boolean {
  const ext = getExt(path).toLowerCase();
  return ['.js', '.jsx', '.mjs', '.cjs'].includes(ext);
}

export function isJsonFile(path: string): boolean {
  return getExt(path).toLowerCase() === '.json';
}

export function isCssFile(path: string): boolean {
  return getExt(path).toLowerCase() === '.css';
}

export function isAssetFile(path: string): boolean {
  const ext = getExt(path).toLowerCase();
  const assetExts = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico', '.woff', '.woff2', '.ttf', '.eot'];
  return assetExts.includes(ext);
}

export function isCodeFile(path: string): boolean {
  return isTypeScriptFile(path) || isJavaScriptFile(path);
}

export function getRelativePath(from: string, to: string): string {
  return relative(dirname(from), to);
}
