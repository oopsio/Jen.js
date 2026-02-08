export interface JenpackConfig {
  entry?: string;
  outDir?: string;
  publicDir?: string;
  jsxImportSource?: string;
  minify?: boolean;
  sourcemap?: boolean;
  define?: Record<string, string>;
  alias?: Record<string, string>;
  external?: string[];
}

export interface ResolvedConfig extends Required<JenpackConfig> {
  root: string;
}

export interface Module {
  id: string;
  path: string;
  source: string;
  type: "esm" | "json" | "asset";
  dependencies: Map<string, string>;
  imports: string[];
  exports: string[];
  hash: string;
  transformed?: string;
  sourceMap?: string;
}

export interface ModuleGraph {
  modules: Map<string, Module>;
  entry: string;
  entryModule?: Module;
}

export interface Chunk {
  id: string;
  name: string;
  modules: Module[];
  imports: string[];
  code: string;
  sourceMap?: string;
  hash: string;
}

export interface BuildResult {
  chunks: Chunk[];
  assets: Map<string, string>;
  manifest: BuildManifest;
  errors: BuildError[];
  duration: number;
}

export interface BuildManifest {
  version: string;
  timestamp: number;
  chunks: Record<string, ChunkManifestEntry>;
  assets: Record<string, string>;
  modules: Record<string, ModuleManifestEntry>;
}

export interface ChunkManifestEntry {
  file: string;
  name: string;
  modules: string[];
  imports: string[];
  hash: string;
  size: number;
}

export interface ModuleManifestEntry {
  id: string;
  path: string;
  chunk: string;
  dependencies: string[];
  size: number;
  hash: string;
}

export interface BuildError {
  file?: string;
  line?: number;
  column?: number;
  message: string;
  code?: string;
  original?: Error;
}

export interface TransformOptions {
  filename: string;
  isModule: boolean;
  jsxImportSource: string;
  minify: boolean;
  sourcemap: boolean;
  define?: Record<string, string>;
}

export interface ResolveOptions {
  alias: Record<string, string>;
  external: string[];
}

export interface DevServerOptions {
  port?: number;
  host?: string;
  config: ResolvedConfig;
}

export interface WatcherConfig {
  root: string;
  ignored?: string[];
  ignoreInitial?: boolean;
}
