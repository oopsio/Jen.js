/**
 * Plugin System - Main plugin orchestration
 */

import type { Plugin, PluginContext } from './types.js';
import { PluginRegistry } from './registry.js';
import type { MiddlewareHandler, MiddlewareContext } from '../middleware/index.js';

type RouteHandler = (...args: unknown[]) => unknown;

/**
 * Plugin system entry point and orchestrator
 */
export class PluginSystem {
  private static registered = false;

  /**
   * Setup plugin system with configuration
   */
  static setup(plugins: Plugin[], context: PluginContext): void {
    if (this.registered) {
      throw new Error('Plugin system already set up');
    }

    PluginRegistry.initialize(context);

    for (const plugin of plugins) {
      PluginRegistry.register(plugin);
    }

    this.registered = true;
  }

  /**
   * Initialize all registered plugins
   */
  static async initialize(): Promise<void> {
    await PluginRegistry.initializeAll();
  }

  /**
   * Get all registered plugins
   */
  static getPlugins() {
    return PluginRegistry.getAll();
  }

  /**
   * Collect middleware from all plugins
   */
  static async collectMiddleware(): Promise<MiddlewareHandler[]> {
    const handlers: MiddlewareHandler[] = [];

    for (const [name, plugin] of PluginRegistry.getWithHook('middleware')) {
      if (!plugin.middleware) continue;

      try {
        const result = plugin.middleware();
        if (Array.isArray(result)) {
          handlers.push(...result);
        } else if (result) {
          handlers.push(result);
        }
      } catch (error) {
        console.error(
          `[Plugin] Failed to collect middleware from "${name}":`,
          error,
        );
      }
    }

    return handlers;
  }

  /**
   * Transform middleware context through plugins
   */
  static async transformContext(
    context: MiddlewareContext,
  ): Promise<MiddlewareContext> {
    const result = await PluginRegistry.callHookChain(
      'transformContext',
      context,
    );
    return result as MiddlewareContext;
  }

  /**
   * Resolve route through plugins
   */
  static async resolveRoute(filePath: string, urlPath: string) {
    return PluginRegistry.callHookChain(
      'resolveRoute',
      null,
      filePath,
      urlPath,
    );
  }

  /**
   * Resolve module ID through plugins
   */
  static resolveId(id: string): string | null {
    for (const [, plugin] of PluginRegistry.getWithHook('resolveId')) {
      if (!plugin.resolveId) continue;
      const result = plugin.resolveId(id);
      if (result) {
        return result;
      }
    }
    return null;
  }

  /**
   * Load resolved module through plugins
   */
  static load(id: string): string | null {
    for (const [, plugin] of PluginRegistry.getWithHook('load')) {
      if (!plugin.load) continue;
      const result = plugin.load(id);
      if (result) {
        return result;
      }
    }
    return null;
  }

  /**
   * Wrap route handler through plugins
   */
  static wrapRoute(handler: RouteHandler, routePath: string): RouteHandler {
    let wrapped: RouteHandler = handler;

    for (const [, plugin] of PluginRegistry.getWithHook('wrapRoute')) {
      if (!plugin.wrapRoute) continue;
      wrapped = plugin.wrapRoute(wrapped, routePath) || wrapped;
    }

    return wrapped;
  }

  /**
   * Modify configuration through plugins
   */
  static async modifyConfig(
    config: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    return PluginRegistry.callHookReduce('config', config) as Promise<
      Record<string, unknown>
    >;
  }

  /**
   * Notify plugins of build completion
   */
  static async notifyBuildComplete(result: {
    outputDir: string;
    duration: number;
  }): Promise<void> {
    await PluginRegistry.callHookParallel('buildComplete', result);
  }

  /**
   * Destroy all plugins
   */
  static async destroy(): Promise<void> {
    await PluginRegistry.destroyAll();
    this.registered = false;
  }

  /**
   * Check if setup has been called
   */
  static isSetup(): boolean {
    return this.registered;
  }

  /**
   * Get plugin count
   */
  static count(): number {
    return PluginRegistry.count();
  }

  /**
   * Get specific plugin
   */
  static getPlugin(name: string) {
    return PluginRegistry.get(name);
  }
}
