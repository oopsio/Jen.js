import { readFileSync } from "fs";
import { extname } from "path";
import type { Module, ModuleGraph } from "../types.js";
import { Resolver } from "../resolver/index.js";
import { computeHash } from "../utils/hash.js";
import { parseFile, extractImports } from "../swc/transform.js";
import {
  normalizePath,
  isCssFile,
  isJsonFile,
  isAssetFile,
} from "../utils/path.js";
import { warn } from "../utils/log.js";

export class ModuleGraphBuilder {
  private resolver: Resolver;
  private graph: ModuleGraph = { modules: new Map(), entry: "" };
  private visited: Set<string> = new Set();
  private resolving: Set<string> = new Set();

  constructor(resolver: Resolver) {
    this.resolver = resolver;
  }

  async build(entryPath: string): Promise<ModuleGraph> {
    this.graph = { modules: new Map(), entry: normalizePath(entryPath) };
    this.visited.clear();
    this.resolving.clear();

    const entryModule = await this.loadModule(normalizePath(entryPath));
    this.graph.entryModule = entryModule;

    return this.graph;
  }

  private async loadModule(modulePath: string): Promise<Module> {
    if (this.visited.has(modulePath)) {
      return this.graph.modules.get(modulePath)!;
    }

    if (this.resolving.has(modulePath)) {
      // Circular dependency
      return this.createModule(modulePath, "", []);
    }

    this.visited.add(modulePath);
    this.resolving.add(modulePath);

    try {
      const source = readFileSync(modulePath, "utf8");
      const type = this.resolver.getType(modulePath);
      const dependencies = new Map<string, string>();
      const imports: string[] = [];

      if (type === "esm") {
        try {
          const ast = await parseFile(source, modulePath);
          const extractedImports = extractImports(ast);

          for (const importInfo of extractedImports) {
            const resolved = this.resolver.resolve(
              importInfo.source,
              modulePath,
            );
            if (resolved) {
              dependencies.set(importInfo.source, resolved);
              imports.push(resolved);

              // Recursively load dependencies
              await this.loadModule(resolved);
            }
          }
        } catch (error) {
          warn(`Failed to parse imports from ${modulePath}`);
        }
      } else if (type === "json") {
        // JSON files have no dependencies
      } else if (type === "css") {
        // CSS can import other CSS files
        const cssImports = this.extractCssImports(source);
        for (const cssImport of cssImports) {
          const resolved = this.resolver.resolve(cssImport, modulePath);
          if (resolved) {
            dependencies.set(cssImport, resolved);
            imports.push(resolved);
            await this.loadModule(resolved);
          }
        }
      }

      const module = this.createModule(
        modulePath,
        source,
        imports,
        dependencies,
      );
      this.graph.modules.set(modulePath, module);

      this.resolving.delete(modulePath);
      return module;
    } catch (error) {
      warn(`Failed to load module ${modulePath}: ${(error as Error).message}`);
      this.resolving.delete(modulePath);
      return this.createModule(modulePath, "", []);
    }
  }

  private createModule(
    path: string,
    source: string,
    imports: string[],
    dependencies: Map<string, string> = new Map(),
  ): Module {
    return {
      id: normalizePath(path),
      path: normalizePath(path),
      source,
      type: this.resolver.getType(path) as any,
      dependencies,
      imports,
      exports: [],
      hash: computeHash(source),
    };
  }

  private extractCssImports(source: string): string[] {
    const imports: string[] = [];
    const importRegex = /@import\s+['"]([^'"]+)['"]/g;
    let match;

    while ((match = importRegex.exec(source)) !== null) {
      imports.push(match[1]);
    }

    return imports;
  }

  getGraph(): ModuleGraph {
    return this.graph;
  }

  getModule(id: string): Module | undefined {
    return this.graph.modules.get(id);
  }

  getModules(): Module[] {
    return Array.from(this.graph.modules.values());
  }
}

export function createModuleGraphBuilder(
  resolver: Resolver,
): ModuleGraphBuilder {
  return new ModuleGraphBuilder(resolver);
}
