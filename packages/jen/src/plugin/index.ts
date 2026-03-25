/**
 * Jen.js Plugin System API
 * Rollup-style, simple, elegant, and powerful
 */

// Types
export type {
  Plugin,
  PluginFactory,
  PluginContext,
  PluginInstance,
  ResolveIdHook,
  LoadHook,
  ResolveRouteHook,
  ConfigHook,
  TransformContextHook,
  MiddlewareHook,
  InitHook,
  DestroyHook,
  WrapRouteHook,
  ResolveBuildHook,
  BuildCompleteHook,
} from './types.js';

// Core
export { PluginRegistry } from './registry.js';
export { PluginSystem } from './system.js';

// Utilities
export { createPlugin, definePlugin } from './utils.js';
export { PluginError } from './errors.js';

// Built-in plugins
export * from './builtin/index.js';
