/*
 * This file is part of Jen.js.
 * Copyright (C) 2026 oopsio
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * Jen.js Framework Type Definitions
 * A TypeScript-first framework for building static and server-rendered applications with Preact
 */

// ============================================================================
// Core Configuration Types
// ============================================================================

export type RenderMode = "ssr" | "ssg" | "isr" | "ppr";

export interface FrameworkConfig {
  siteDir: string;
  distDir: string;

  routes: {
    fileExtensions: string[];
    routeFilePattern: RegExp;
    enableIndexFallback: boolean;
  };

  rendering: {
    defaultMode: RenderMode;
    defaultRevalidateSeconds: number;
  };

  inject: {
    head: string[];
    bodyEnd: string[];
  };

  css: {
    globalScss: string;
    criticalBudget?: number;
    extractCritical?: boolean;
  };

  assets: {
    publicDir: string;
    cacheControl: string;
    hashLength?: number;
  };

  server: {
    port: number;
    hostname: string;
  };

  build?: {
    minifyHtml?: boolean;
    minifyCss?: boolean;
    minifyJs?: boolean;
    hashAssets?: boolean;
    generateManifest?: boolean;
    generateSitemap?: boolean;
    cacheDir?: string;
    incrementalBuild?: boolean;
    sourceMap?: boolean;
  };

  dev?: {
    enableSSR?: boolean;
    liveReload?: boolean;
    port?: number;
  };

  seo?: {
    generateRobotsTxt?: boolean;
    generateSitemap?: boolean;
    sitemapBaseUrl?: string;
  };
}

// ============================================================================
// Route Types
// ============================================================================

export interface LoaderContext {
  url: URL;
  params: Record<string, string>;
  query: Record<string, string>;
  headers: Record<string, string>;
  cookies: Record<string, string>;
  data?: Record<string, unknown>;
}

export interface RouteModule {
  mode?: RenderMode;
  revalidateSeconds?: number;
  hydrate?: boolean;
  middleware?: unknown;

  loader?: (ctx: LoaderContext) => Promise<unknown> | unknown;

  Head?: (props: unknown) => unknown;
  default: (props: unknown) => unknown;
}

export interface RouteEntry {
  filePath: string;
  urlPath: string;
  isDynamic: boolean;
}

// ============================================================================
// Middleware Types
// ============================================================================

export interface MiddlewareContext {
  req: unknown;
  res: unknown;
  url: URL;
  params: Record<string, string>;
  query: Record<string, string>;
  headers: Record<string, string>;
  cookies: Record<string, string>;
  data: Record<string, unknown>;
}

export interface RouteMiddleware {
  (ctx: MiddlewareContext): Promise<void> | void;
}

export type Middleware = (
  ctx: unknown,
  next: () => Promise<void>,
) => Promise<void>;

// ============================================================================
// API Route Types
// ============================================================================

export interface ApiRouteContext {
  req: unknown;
  res: unknown;
  url: URL;
  method: string;
  query: Record<string, string>;
  body: unknown;
  params: Record<string, string>;
}

export type ApiHandler = (
  ctx: ApiRouteContext,
) =>
  | Promise<Response | string | Record<string, unknown> | null>
  | Response
  | string
  | Record<string, unknown>
  | null;

export interface ApiRouteModule {
  GET?: ApiHandler;
  POST?: ApiHandler;
  PUT?: ApiHandler;
  DELETE?: ApiHandler;
  PATCH?: ApiHandler;
  HEAD?: ApiHandler;
  OPTIONS?: ApiHandler;
}

// ============================================================================
// Build System Types
// ============================================================================

export interface BuildOptions {
  config: FrameworkConfig;
}

export interface ProductionBuildConfig extends FrameworkConfig {
  mode: "production";
}

export interface MinifyOptions {
  minifyHtml?: boolean;
  minifyCss?: boolean;
  minifyJs?: boolean;
  sourceMap?: boolean;
}

export interface PageRenderContext {
  config: FrameworkConfig;
  route: RouteEntry;
  url: URL;
  params: Record<string, string>;
  query: Record<string, string>;
  headers: Record<string, string>;
  cookies: Record<string, string>;
  req?: unknown;
  res?: unknown;
}

export interface IslandRegistry {
  register(id: string, component: unknown): void;
  get(id: string): unknown;
  has(id: string): boolean;
}

export interface Island {
  id: string;
  component: unknown;
  props?: Record<string, unknown>;
  strategy?: "load" | "idle" | "visible";
}

export interface AssetManifestData {
  [key: string]: string;
}

export interface CompileResult {
  css?: string;
  js?: string;
  error?: string;
}

export interface ScssCompileOptions {
  inputPath: string;
  minified?: boolean;
  sourceMap?: boolean;
}

export interface AssetHasherOptions {
  hashLength?: number;
  algorithm?: string;
}

// ============================================================================
// CSS Compiler Types
// ============================================================================

export interface StyleCompilerOptions {
  inputPath: string;
  outputPath?: string;
  minified?: boolean;
  sourceMap?: boolean;
}

export interface StyleCompileResult {
  css: string;
  sourceMap?: string;
  error?: string;
}

// ============================================================================
// Runtime Types
// ============================================================================

export interface HydrationData {
  data?: Record<string, unknown>;
  params?: Record<string, string>;
  query?: Record<string, string>;
}

export interface ClientRuntimeConfig {
  baseUrl?: string;
  hydration?: boolean;
  hmr?: boolean;
  islands?: Island[];
}

// ============================================================================
// Authentication Types
// ============================================================================

export interface AuthConfig {
  jwtSecret?: string;
  sessionSecret?: string;
  expiresIn?: string;
}

export interface AuthToken {
  payload: Record<string, any>;
  expiresIn?: string;
}

export interface Session {
  id: string;
  userId?: string;
  data: Record<string, any>;
  expiresAt?: Date;
}

// ============================================================================
// Database Types
// ============================================================================

export type DBType = "jdb" | "sqlite" | "mysql" | "postgres";

export interface DBConfig {
  type: DBType;
  connection?: any;
  jdb?: {
    root: string;
    inMemory?: boolean;
  };
}

export type Filter<T = unknown> = Record<string, unknown>;
export type Update<T = unknown> = Record<string, unknown>;

export interface QueryOptions {
  limit?: number;
  skip?: number;
  sort?: Record<string, 1 | -1>;
}

export interface FindQuery<T = unknown> {
  find: string;
  where?: Filter<T>;
  options?: QueryOptions;
}

export interface SQLQuery {
  sql: string;
  params?: unknown[];
}

export type UnifiedQuery<T = unknown> = FindQuery<T> | SQLQuery | string;

export interface DBDriver {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  query<T = unknown>(q: UnifiedQuery<T>): Promise<T[]>;
  create<T = unknown>(collection: string, data: unknown): Promise<T>;
  update<T = unknown>(
    collection: string,
    filter: Filter<T>,
    update: Update<T>,
  ): Promise<number>;
  delete<T = unknown>(collection: string, filter: Filter<T>): Promise<number>;
  count<T = unknown>(collection: string, filter: Filter<T>): Promise<number>;
}

// ============================================================================
// Cache Types
// ============================================================================

export interface CacheStore {
  get<T = unknown>(key: string): Promise<T | null>;
  set<T = unknown>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  has(key: string): Promise<boolean>;
}

export interface MemoryCacheOptions {
  maxSize?: number;
  ttl?: number;
}

export interface RedisCacheOptions {
  host?: string;
  port?: number;
  db?: number;
  password?: string;
  ttl?: number;
}

// ============================================================================
// GraphQL Types
// ============================================================================

export interface GraphQLSchema {
  query: unknown;
  mutation?: unknown;
  subscription?: unknown;
}

export interface GraphQLResolverMap {
  [key: string]: {
    [field: string]: (parent: unknown, args: unknown, context: unknown) => unknown;
  };
}

// ============================================================================
// i18n Types
// ============================================================================

export type Locale = string;

export interface I18nConfig {
  defaultLocale?: Locale;
  fallbackLocale?: Locale;
  locales?: Locale[];
  messages?: Record<Locale, Record<string, string>>;
}

// ============================================================================
// Plugin Types
// ============================================================================

export interface Plugin {
  name: string;
  version?: string;
  onBuild?: () => void | Promise<void>;
  onServe?: () => void | Promise<void>;
  onDeploy?: () => void | Promise<void>;
}

export interface PluginContext {
  config: FrameworkConfig;
  event: "build" | "serve" | "deploy";
}

// ============================================================================
// HTTP Types
// ============================================================================

export interface HttpRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: unknown;
}

export interface HttpResponse {
  status: number;
  headers: Record<string, string>;
  body?: unknown;
}

export interface HttpError extends Error {
  status: number;
  message: string;
}

// ============================================================================
// Utility Types
// ============================================================================

export interface Logger {
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
  debug(message: string): void;
}

export interface PathResolver {
  resolveDistPath(config: FrameworkConfig): string;
  resolveSitePath(config: FrameworkConfig): string;
}

export interface RouteScanner {
  scanRoutes(config: FrameworkConfig): RouteEntry[];
}

export interface RouteMatcher {
  matchRoute(
    routes: RouteEntry[],
    pathname: string,
  ): { route: RouteEntry; params: Record<string, string> } | null;
}

// ============================================================================
// App Types
// ============================================================================

export type AppMode = "dev" | "prod";

export interface AppOptions {
  config: FrameworkConfig;
  mode: AppMode;
}

export interface App {
  handle(req: any, res: any): Promise<void>;
}

// ============================================================================
// Build Tool Types
// ============================================================================

export class SSGPipeline {
  build(config: FrameworkConfig): Promise<void>;
}

export class ProductionBuilder {
  build(config: ProductionBuildConfig): Promise<void>;
}

export class PageRenderer {
  render(ctx: PageRenderContext): Promise<string>;
}

export class Minifier {
  minify(input: string, options: MinifyOptions): string;
}

export class AssetManifest {
  get(key: string): string | undefined;
  set(key: string, value: string): void;
  toJSON(): AssetManifestData;
}

export class AssetHasher {
  hash(content: string, options?: AssetHasherOptions): string;
  hashFile(filePath: string, options?: AssetHasherOptions): string;
}

// ============================================================================
// Export Functions
// ============================================================================

export function createApp(opts: AppOptions): Promise<App>;
export function buildSite(opts: BuildOptions): Promise<void>;
export function scanRoutes(config: FrameworkConfig): RouteEntry[];
export function matchRoute(
  routes: RouteEntry[],
  pathname: string,
): { route: RouteEntry; params: Record<string, string> } | null;

export function renderRouteToHtml(opts: PageRenderContext): Promise<string>;

export function createIslandRegistry(): IslandRegistry;
export function markIsland(component: any, strategy?: string): void;
export function extractIslandsFromHtml(html: string): Island[];
export function injectIslandScript(html: string, islands: Island[]): string;

export function createMemoryCache(options?: MemoryCacheOptions): CacheStore;
export function createRedisCache(options?: RedisCacheOptions): CacheStore;

export function signToken(payload: object, expiresIn?: string): string;
export function verifyToken(token: string): any;

// ============================================================================
// Preact Integration
// ============================================================================


// ============================================================================
// Node.js Integration
// ============================================================================

export type IncomingMessage = any;
export type ServerResponse = any;
