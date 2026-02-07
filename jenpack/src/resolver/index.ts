import { resolve, dirname, join } from 'path';
import { existsSync, statSync, readFileSync } from 'fs';
import { normalizePath, isTypeScriptFile, isJavaScriptFile, isJsonFile, isCssFile, isAssetFile, removeExt } from '../utils/path.js';
import type { ResolveOptions } from '../types.js';

const BUILTIN_MODULES = new Set(['fs', 'path', 'url', 'stream', 'util', 'events', 'crypto']);

export class Resolver {
  private alias: Record<string, string> = {};
  private external: Set<string> = new Set();
  private moduleCache: Map<string, string> = new Map();
  private root: string;

  constructor(root: string, options: ResolveOptions = { alias: {}, external: [] }) {
    this.root = root;
    this.alias = options.alias;
    this.external = new Set(options.external);
  }

  resolve(
    specifier: string,
    referrer: string,
  ): string | null {
    // Check cache
    const cacheKey = `${referrer}::${specifier}`;
    if (this.moduleCache.has(cacheKey)) {
      return this.moduleCache.get(cacheKey)!;
    }

    let resolved: string | null = null;

    if (specifier.startsWith('.')) {
      // Relative import
      resolved = this.resolveRelative(specifier, referrer);
    } else if (this.isBuiltinModule(specifier)) {
      // Builtin module
      return null;
    } else if (this.isExternalModule(specifier)) {
      // External module
      return null;
    } else {
      // Node modules import
      resolved = this.resolveNodeModule(specifier, referrer);
    }

    if (resolved) {
      this.moduleCache.set(cacheKey, resolved);
    }

    return resolved;
  }

  private resolveRelative(specifier: string, referrer: string): string | null {
    const referrerDir = dirname(referrer);
    const resolved = resolve(referrerDir, specifier);

    return this.tryResolveFile(resolved);
  }

  private resolveNodeModule(specifier: string, referrer: string): string | null {
    // Check aliases first
    for (const [alias, target] of Object.entries(this.alias)) {
      if (specifier === alias || specifier.startsWith(alias + '/')) {
        const remaining = specifier.slice(alias.length);
        const resolved = resolve(this.root, target + remaining);
        const result = this.tryResolveFile(resolved);
        if (result) return result;
      }
    }

    // Walk up the directory tree looking for node_modules
    let current = dirname(referrer);
    const root = this.root;

    while (current.length > root.length) {
      const nodeModulesPath = join(current, 'node_modules', specifier);
      const result = this.tryResolveNodeModule(nodeModulesPath);
      if (result) return result;

      current = dirname(current);
    }

    // Try root node_modules
    const rootNodeModules = join(root, 'node_modules', specifier);
    return this.tryResolveNodeModule(rootNodeModules);
  }

  private tryResolveNodeModule(packagePath: string): string | null {
    if (!existsSync(packagePath)) {
      return null;
    }

    const stat = statSync(packagePath);
    if (!stat.isDirectory()) {
      return null;
    }

    // Try package.json exports field
    const pkgJsonPath = join(packagePath, 'package.json');
    if (existsSync(pkgJsonPath)) {
      try {
        const pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf8'));
        if (pkgJson.exports) {
          const exportTarget = pkgJson.exports['.'];
          if (exportTarget && typeof exportTarget === 'string') {
            const resolved = join(packagePath, exportTarget);
            return this.tryResolveFile(resolved);
          }
          if (exportTarget && typeof exportTarget === 'object') {
            const importTarget = exportTarget.import || exportTarget.default;
            if (importTarget) {
              const resolved = join(packagePath, importTarget);
              return this.tryResolveFile(resolved);
            }
          }
        }

        // Fallback to module/main
        const moduleField = pkgJson.module || pkgJson.main;
        if (moduleField) {
          const resolved = join(packagePath, moduleField);
          return this.tryResolveFile(resolved);
        }
      } catch {
        // Ignore package.json parse errors
      }
    }

    // Try index files
    return this.tryResolveFile(join(packagePath, 'index'));
  }

  private tryResolveFile(basePath: string): string | null {
    // Direct file exists
    if (existsSync(basePath) && statSync(basePath).isFile()) {
      return normalizePath(basePath);
    }

    // Try extensions in order
    const extensions = ['.ts', '.tsx', '.js', '.jsx', '.json', '.css'];
    for (const ext of extensions) {
      const withExt = basePath + ext;
      if (existsSync(withExt)) {
        return normalizePath(withExt);
      }
    }

    // Try directory with index
    if (existsSync(basePath) && statSync(basePath).isDirectory()) {
      for (const ext of extensions) {
        const indexPath = join(basePath, 'index' + ext);
        if (existsSync(indexPath)) {
          return normalizePath(indexPath);
        }
      }
    }

    return null;
  }

  private isBuiltinModule(specifier: string): boolean {
    const name = specifier.split('/')[0];
    return BUILTIN_MODULES.has(name) || name === 'node:' + name.slice(5);
  }

  private isExternalModule(specifier: string): boolean {
    const name = specifier.split('/')[0];
    return this.external.has(name);
  }

  getType(filePath: string): 'esm' | 'json' | 'css' | 'asset' {
    if (isJsonFile(filePath)) return 'json';
    if (isCssFile(filePath)) return 'css';
    if (isAssetFile(filePath)) return 'asset';
    return 'esm';
  }

  clearCache(): void {
    this.moduleCache.clear();
  }
}

export function createResolver(root: string, options?: ResolveOptions): Resolver {
  return new Resolver(root, options);
}
