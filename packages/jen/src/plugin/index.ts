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
} from './types';

// Core
export { PluginRegistry } from './registry';
export { PluginSystem } from './system';

// Utilities
export { createPlugin, definePlugin } from './utils';
export { PluginError } from './errors';

// Built-in plugins
export * from './builtin';
