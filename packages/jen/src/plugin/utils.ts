/**
 * Plugin Utilities - Helper functions for plugin creation
 */

import type { MiddlewareHandler } from '../middleware/index.js';
import type { Plugin, PluginFactory } from './types.js';

/**
 * Create a simple plugin
 */
export function createPlugin(plugin: Plugin): Plugin {
  if (!plugin.name) {
    throw new Error('Plugin must have a name');
  }
  return plugin;
}

/**
 * Define a plugin with factory function
 * Rollup-style: plugins can be functions that return plugin objects
 */
export function definePlugin<
  T extends Record<string, unknown> = Record<string, unknown>,
>(factory: PluginFactory<T>): PluginFactory<T> {
  return factory;
}

/**
 * Compose multiple plugins into one
 * Useful for plugin combinations
 */
export function compose(...plugins: Plugin[]): Plugin {
  return {
    name: `@jen/composed-${Date.now()}`,
    description: `Composed plugin combining: ${plugins.map((p) => p.name).join(', ')}`,
    async init(context) {
      for (const plugin of plugins) {
        await plugin.init?.(context);
      }
    },
    async destroy() {
      for (let i = plugins.length - 1; i >= 0; i--) {
        await plugins[i].destroy?.();
      }
    },
  };
}

/**
 * Create a middleware plugin from a handler
 */
export function createMiddlewarePlugin(
  name: string,
  handler: MiddlewareHandler,
  options: Record<string, unknown> = {},
): Plugin {
  return createPlugin({
    name,
    description: `Middleware plugin: ${name}`,
    options,
    middleware() {
      return handler;
    },
  });
}

/**
 * Create a config-modifying plugin
 */
export function createConfigPlugin(
  name: string,
  modifier: (config: Record<string, unknown>) => Record<string, unknown>,
  options: Record<string, unknown> = {},
): Plugin {
  return createPlugin({
    name,
    description: `Config plugin: ${name}`,
    options,
    config: modifier,
  });
}

/**
 * Create a hook-based plugin
 */
export function createHookPlugin(
  name: string,
  hooks: Partial<Plugin>,
  options: Record<string, unknown> = {},
): Plugin {
  return createPlugin({
    name,
    options,
    ...hooks,
  });
}

/**
 * Conditionally apply plugins
 */
export function when(
  condition: boolean | (() => boolean),
  plugin: Plugin | PluginFactory,
): Plugin | null {
  const shouldApply = typeof condition === 'function' ? condition() : condition;

  if (!shouldApply) {
    return null;
  }

  return typeof plugin === 'function' ? plugin() : plugin;
}
