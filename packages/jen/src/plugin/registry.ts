/**
 * Plugin Registry - Central plugin management
 */

import type {
  Plugin,
  PluginContext,
  PluginInstance,
  PluginHook,
} from './types';

/**
 * Central plugin registry and manager
 */
export class PluginRegistry {
  private static plugins: Map<string, PluginInstance> = new Map();
  private static initialized = false;
  private static context: PluginContext | null = null;

  /**
   * Initialize registry with context
   */
  static initialize(context: PluginContext): void {
    if (this.initialized) {
      return;
    }
    this.context = context;
    this.initialized = true;
  }

  /**
   * Register a plugin
   */
  static register(plugin: Plugin): void {
    if (!plugin.name) {
      throw new Error('Plugin must have a name');
    }

    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin "${plugin.name}" is already registered`);
    }

    const normalized: PluginInstance = {
      ...plugin,
      __normalized: true,
      __index: this.plugins.size,
    };

    this.plugins.set(plugin.name, normalized);
  }

  /**
   * Register multiple plugins at once
   */
  static registerBulk(plugins: Plugin[]): void {
    for (const plugin of plugins) {
      this.register(plugin);
    }
  }

  /**
   * Get plugin by name
   */
  static get(name: string): PluginInstance | undefined {
    return this.plugins.get(name);
  }

  /**
   * Get all plugins
   */
  static getAll(): PluginInstance[] {
    return Array.from(this.plugins.values()).sort(
      (a, b) => a.__index - b.__index,
    );
  }

  /**
   * Check if plugin exists
   */
  static has(name: string): boolean {
    return this.plugins.has(name);
  }

  /**
   * Unregister plugin
   */
  static unregister(name: string): boolean {
    return this.plugins.delete(name);
  }

  /**
   * Get all plugins with specific hook
   */
  static getWithHook<K extends keyof Plugin>(
    hookName: K,
  ): Array<[string, PluginInstance]> {
    return Array.from(this.plugins.entries()).filter(
      ([, plugin]) => plugin[hookName],
    );
  }

  /**
   * Call hook on all plugins (serial)
   */
  static async callHookSerial<K extends keyof Plugin>(
    hookName: K,
    ...args: unknown[]
  ): Promise<{ plugin: string; result: unknown }[]> {
    const results: { plugin: string; result: unknown }[] = [];
    for (const [name, plugin] of this.getWithHook(hookName)) {
      const hook = plugin[hookName] as PluginHook;
      try {
        const result = await hook.apply(plugin, args);
        results.push({ plugin: name, result });
      } catch (error) {
         const err = error instanceof Error ? error : new Error(String(error));
         const message = `Hook "${String(hookName)}" in plugin "${name}" failed: ${error}`;
         const newError = new Error(message);
         newError.cause = err;
         throw newError;
       }
    }
    return results;
  }

  /**
   * Call hook on all plugins (parallel)
   */
  static async callHookParallel<K extends keyof Plugin>(
    hookName: K,
    ...args: unknown[]
  ): Promise<unknown[]> {
    const promises = this.getWithHook(hookName).map(([name, plugin]) => {
      const hook = plugin[hookName] as unknown as ((...args: unknown[]) => Promise<unknown>);
      return hook.apply(plugin, args).catch((error: unknown) => {
        throw new Error(
          `Hook "${String(hookName)}" in plugin "${name}" failed: ${error}`,
        );
      });
    });

    return Promise.all(promises);
  }

  /**
   * Call hook and reduce results (left-to-right)
   */
  static async callHookReduce<K extends keyof Plugin, V>(
    hookName: K,
    initial: V,
    ...args: unknown[]
  ): Promise<V> {
    let value = initial;
    for (const [, plugin] of this.getWithHook(hookName)) {
      const hook = plugin[hookName] as PluginHook;
      value = (await hook.apply(plugin, [value, ...args])) as V;
    }
    return value;
  }

  /**
   * Call hook and chain (each plugin's output is next input)
   */
  static async callHookChain<K extends keyof Plugin>(
    hookName: K,
    initial: unknown,
    ...args: unknown[]
  ): Promise<unknown> {
    let value = initial;
    for (const [name, plugin] of this.getWithHook(hookName)) {
      const hook = plugin[hookName] as PluginHook;
      try {
        const result = await hook.apply(plugin, [value, ...args]);
        if (result !== undefined && result !== null) {
          value = result;
        }
      } catch (error) {
         const err = error instanceof Error ? error : new Error(String(error));
         const message = `Hook "${String(hookName)}" in plugin "${name}" failed: ${error}`;
         const newError = new Error(message);
         newError.cause = err;
         throw newError;
       }
      }
      return value;
      }

  /**
   * Initialize all plugins
   */
  static async initializeAll(): Promise<void> {
    if (!this.context) {
      throw new Error('Registry not initialized with context');
    }

    const results = await this.callHookSerial('init', this.context);

    console.log(
      `[Plugin] Initialized ${results.filter((r) => r).length} plugins`,
    );
  }

  /**
   * Destroy all plugins
   */
  static async destroyAll(): Promise<void> {
    const results = await this.callHookSerial('destroy');

    console.log(
      `[Plugin] Destroyed ${results.filter((r) => r).length} plugins`,
    );

    this.plugins.clear();
    this.initialized = false;
  }

  /**
   * Get plugin count
   */
  static count(): number {
    return this.plugins.size;
  }

  /**
   * Clear all plugins
   */
  static clear(): void {
    this.plugins.clear();
  }

  /**
   * Get context
   */
  static getContext(): PluginContext | null {
    return this.context;
  }
}
