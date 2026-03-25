/**
 * Jen.js Plugin System - Type Definitions
 * Rollup-style plugin API: simple, elegant, powerful
 */

import type { MiddlewareHandler, MiddlewareContext } from '../middleware/index.js';

/**
 * Plugin context - passed to plugin hooks
 */
export interface PluginContext {
  /** Framework version */
  version: string;
  /** Environment (development, production, test) */
  env: 'development' | 'production' | 'test';
  /** Whether running in dev mode */
  isDev: boolean;
  /** Root directory */
  rootDir: string;
  /** Build directory */
  buildDir: string;
}

/**
 * Hook to modify resolved plugin options
 */
export type ResolveIdHook = (id: string) => string | null | undefined;

/**
 * Hook to load plugin-specific modules
 */
export type LoadHook = (id: string) => string | null | undefined;

/**
 * Hook to resolve page routes
 */
export type ResolveRouteHook = (
  filePath: string,
  urlPath: string,
) => { filePath?: string; urlPath?: string } | null | undefined;

/**
 * Hook to modify build configuration
 */
export type ConfigHook = (
  config: Record<string, unknown>,
) => Record<string, unknown> | undefined;

/**
 * Hook to transform middleware context
 */
export type TransformContextHook = (
  context: MiddlewareContext,
) => MiddlewareContext | Promise<MiddlewareContext>;

/**
 * Hook to add custom middleware
 */
export type MiddlewareHook = () => MiddlewareHandler | MiddlewareHandler[];

/**
 * Hook called when plugin is initialized
 */
export type InitHook = (context: PluginContext) => void | Promise<void>;

/**
 * Hook called when plugin is destroyed
 */
export type DestroyHook = () => void | Promise<void>;

/**
 * Hook for custom route handler wrapping
 */
export type WrapRouteHook = (
  handler: (...args: unknown[]) => unknown,
  routePath: string,
) => (...args: unknown[]) => unknown;

/**
 * Hook for build artifacts
 */
export type ResolveBuildHook = (
  id: string,
) => { code: string; map?: string } | null | undefined;

/**
 * Hook called after build completes
 */
export type BuildCompleteHook = (result: {
  outputDir: string;
  duration: number;
}) => void | Promise<void>;

/**
 * Generic plugin hook type for dynamic invocation
 */
export type PluginHook = (...args: unknown[]) => unknown;

/**
 * Core plugin interface - Rollup-style
 */
export interface Plugin {
  /** Plugin name (unique identifier) */
  name: string;

  /** Plugin version */
  version?: string;

  /** Plugin description */
  description?: string;

  /** Plugin options */
  options?: Record<string, unknown>;

  // Initialization
  /** Called when plugin is loaded */
  init?: InitHook;

  /** Called when plugin is destroyed */
  destroy?: DestroyHook;

  // Configuration
  /** Modify build config before build starts */
  config?: ConfigHook;

  // Resolution
  /** Resolve module IDs */
  resolveId?: ResolveIdHook;

  /** Load resolved modules */
  load?: LoadHook;

  /** Resolve and modify routes */
  resolveRoute?: ResolveRouteHook;

  // Transformation
  /** Transform middleware context */
  transformContext?: TransformContextHook;

  // Middleware
  /** Provide custom middleware */
  middleware?: MiddlewareHook;

  // Route handling
  /** Wrap route handlers */
  wrapRoute?: WrapRouteHook;

  // Build
  /** Resolve build artifacts */
  resolveBuild?: ResolveBuildHook;

  /** Called after build completes */
  buildComplete?: BuildCompleteHook;
}

/**
 * Plugin factory function signature
 */
export type PluginFactory<
  T extends Record<string, unknown> = Record<string, unknown>,
> = (options?: T) => Plugin;

/**
 * Plugin instance with normalized metadata
 */
export interface PluginInstance extends Plugin {
  __normalized: true;
  __index: number;
}
