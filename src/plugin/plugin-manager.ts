/**
 * Plugin Manager - Core plugin system implementation
 *
 * Handles plugin registration, lifecycle management, and hook execution.
 * Inspired by Vite's plugin architecture with execution control.
 */

import { log } from "@src/shared/log.js";
import type {
  JenPlugin,
  PluginConfig,
  PluginContext,
  PluginEntry,
  PluginHook,
  PluginHookContext,
  HookStage,
  HookExecutionResult,
} from "./types.js";
import { HookStage } from "./types.js";

/**
 * Global plugin manager singleton
 */
let globalManager: PluginManager | null = null;

/**
 * Get or create the global plugin manager
 */
export function getPluginManager(): PluginManager {
  if (!globalManager) {
    globalManager = new PluginManager();
  }
  return globalManager;
}

/**
 * Reset the global plugin manager
 */
export function resetPluginManager(): void {
  if (globalManager) {
    globalManager.destroy();
  }
  globalManager = null;
}

/**
 * Plugin Manager - orchestrates plugin lifecycle and hook execution
 */
export class PluginManager {
  private plugins: PluginEntry[] = [];
  private hookHandlers: Map<HookStage, PluginHook[]> = new Map();
  private virtualModules: Map<string, string> = new Map();
  private middleware: Array<(req: any, res: any, next: () => void) => void> =
    [];
  private eventListeners: Map<string, Set<(data: any) => void>> = new Map();
  private config: Partial<PluginConfig> = {};
  private initialized = false;

  /**
   * Initialize the plugin manager with plugins
   */
  async init(config: PluginConfig): Promise<void> {
    this.config = config;

    try {
      // Load and register plugins
      for (const plugin of config.plugins) {
        await this.register(plugin);
      }

      // Sort hooks by priority and enforce order
      this.sortHooks();

      // Call setup hooks
      for (const entry of this.plugins) {
        if (entry.plugin.setup) {
          await entry.plugin.setup(this.createPluginContext(entry.plugin));
        }
      }

      this.initialized = true;
      log.info(`Loaded ${this.plugins.length} plugins`);
    } catch (error) {
      log.error("Failed to initialize plugins:", error);
      if (!config.hooks?.silent) {
        throw error;
      }
    }
  }

  /**
   * Register a plugin (string path or object)
   */
  private async register(pluginOrPath: JenPlugin | string): Promise<void> {
    try {
      let plugin: JenPlugin;

      if (typeof pluginOrPath === "string") {
        // Dynamic import if string path
        const imported = await import(pluginOrPath);
        plugin = imported.default || imported;
      } else {
        plugin = pluginOrPath;
      }

      // Validate plugin
      if (!plugin.name) {
        throw new Error("Plugin must have a name");
      }

      // Check duplicate
      if (this.plugins.some((p) => p.plugin.name === plugin.name)) {
        log.warn(`Plugin "${plugin.name}" already registered`);
        return;
      }

      // Determine priority based on enforce
      const priority = plugin.enforce === "pre" ? 100 : plugin.enforce === "post" ? -100 : 0;

      const entry: PluginEntry = {
        plugin,
        priority,
      };

      this.plugins.push(entry);

      // Register hooks
      if (plugin.hooks) {
        for (const [stage, handler] of Object.entries(plugin.hooks)) {
          this.registerHook(stage as HookStage, handler, plugin.name, priority);
        }
      }

      log.debug(`Registered plugin: ${plugin.name}`);
    } catch (error) {
      log.error(`Failed to register plugin:`, error);
      if (!this.config.hooks?.silent) {
        throw error;
      }
    }
  }

  /**
   * Register a hook handler
   */
  private registerHook(
    stage: HookStage,
    handler: any,
    pluginName: string,
    priority: number
  ): void {
    if (!this.hookHandlers.has(stage)) {
      this.hookHandlers.set(stage, []);
    }

    const hook: PluginHook = {
      name: stage,
      handler: typeof handler === "function" ? handler : handler.handler,
      priority: handler.priority ?? priority,
      parallel: handler.parallel ?? false,
      enforce: handler.enforce ?? "normal",
    };

    this.hookHandlers.get(stage)!.push(hook);
  }

  /**
   * Sort hooks by priority and enforce order
   */
  private sortHooks(): void {
    for (const hooks of this.hookHandlers.values()) {
      // Sort: pre > normal > post, then by priority
      hooks.sort((a, b) => {
        const enforceOrder = { pre: 3, normal: 2, post: 1 };
        const orderDiff = (enforceOrder[b.enforce!] || 0) - (enforceOrder[a.enforce!] || 0);
        if (orderDiff !== 0) return orderDiff;
        return (b.priority || 0) - (a.priority || 0);
      });
    }
  }

  /**
   * Execute hooks for a given stage
   */
  async executeHooks(
    stage: HookStage,
    context: Partial<PluginHookContext> = {}
  ): Promise<HookExecutionResult> {
    const startTime = performance.now();
    const hooks = this.hookHandlers.get(stage) || [];
    const results: any[] = [];
    const errors: Error[] = [];

    const fullContext: PluginHookContext = {
      stage,
      ...context,
    } as PluginHookContext;

    if (this.config.hooks?.verbose) {
      log.debug(`Executing ${hooks.length} hooks for stage: ${stage}`);
    }

    try {
      if (this.config.hooks?.parallel && hooks.some((h) => h.parallel)) {
        // Parallel execution with timeout
        const timeout = this.config.hooks?.timeout || 30000;
        const promises = hooks.map((hook) =>
          this.executeHook(hook, fullContext, timeout).catch((err) => {
            errors.push(err);
            return undefined;
          })
        );

        const hookResults = await Promise.all(promises);
        results.push(...hookResults.filter((r) => r !== undefined));
      } else {
        // Sequential execution
        for (const hook of hooks) {
          try {
            const result = await this.executeHook(hook, fullContext);
            results.push(result);
          } catch (error) {
            errors.push(error as Error);
            if (!this.config.hooks?.silent) {
              throw error;
            }
          }
        }
      }
    } catch (error) {
      log.error(`Error executing hooks for ${stage}:`, error);
    }

    const duration = performance.now() - startTime;

    return {
      stage,
      results,
      duration,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Execute a single hook with timeout
   */
  private async executeHook(
    hook: PluginHook,
    context: PluginHookContext,
    timeout?: number
  ): Promise<any> {
    const promise = Promise.resolve(hook.handler(context));

    if (!timeout) {
      return promise;
    }

    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error(`Hook timeout: ${hook.name}`)),
          timeout
        )
      ),
    ]);
  }

  /**
   * Create plugin context
   */
  private createPluginContext(plugin: JenPlugin): PluginContext {
    return {
      version: "1.0.0",
      name: plugin.name,
      cwd: process.cwd(),
      emitEvent: (event, data) => this.emitEvent(event, data),
      useMiddleware: (handler) => this.middleware.push(handler),
      virtual: (id, code) => this.virtualModules.set(id, code),
      resolve: (id) => this.virtualModules.get(id) || id,
    };
  }

  /**
   * Emit an event to all listeners
   */
  emitEvent(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      for (const listener of listeners) {
        listener(data);
      }
    }
  }

  /**
   * Listen to plugin events
   */
  on(event: string, listener: (data: any) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener);
  }

  /**
   * Get registered middleware
   */
  getMiddleware(): Array<(req: any, res: any, next: () => void) => void> {
    return this.middleware;
  }

  /**
   * Get virtual module code
   */
  getVirtualModule(id: string): string | undefined {
    return this.virtualModules.get(id);
  }

  /**
   * Get all plugins
   */
  getPlugins(): JenPlugin[] {
    return this.plugins.map((p) => p.plugin);
  }

  /**
   * Check if plugin is loaded
   */
  hasPlugin(name: string): boolean {
    return this.plugins.some((p) => p.plugin.name === name);
  }

  /**
   * Cleanup and destroy
   */
  async destroy(): Promise<void> {
    for (const entry of this.plugins) {
      if (entry.plugin.cleanup) {
        try {
          await entry.plugin.cleanup(this.createPluginContext(entry.plugin));
        } catch (error) {
          log.error(`Error cleaning up plugin ${entry.plugin.name}:`, error);
        }
      }
    }

    this.plugins = [];
    this.hookHandlers.clear();
    this.virtualModules.clear();
    this.middleware = [];
    this.eventListeners.clear();
    this.initialized = false;
  }
}
