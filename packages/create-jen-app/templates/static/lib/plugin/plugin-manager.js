import { log } from "../shared/log.js";
/**
 * Central plugin manager for Jen.js framework.
 *
 * Manages plugin loading, hook registration, and execution.
 * Plugins can hook into any stage of the build, dev, or request lifecycle.
 *
 * @example
 * ```typescript
 * const manager = new PluginManager(config, "development");
 * await manager.loadPlugins([myPlugin]);
 * await manager.emitHook("beforeBuild", { config, data: {} });
 * ```
 */
export class PluginManager {
  plugins = [];
  hooks = new Map();
  config;
  mode;
  rootDir;
  initialized = false;
  constructor(config, rootDir, mode = "development") {
    this.config = config;
    this.rootDir = rootDir;
    this.mode = mode;
  }
  /**
   * Load plugins from configuration or explicit list.
   */
  async loadPlugins(plugins = []) {
    try {
      for (const plugin of plugins) {
        const resolved =
          typeof plugin === "string"
            ? await this.resolvePlugin(plugin)
            : plugin;
        this.plugins.push(resolved);
        log.info(`[Plugin] Loaded: ${resolved.name}@${resolved.version}`);
      }
      this.initialized = true;
    } catch (error) {
      log.error(
        `[Plugin] Failed to load plugins: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }
  /**
   * Resolve a plugin by name (from node_modules or path).
   */
  async resolvePlugin(pluginName) {
    try {
      // Try to import from node_modules
      const imported = await import(pluginName);
      return imported.default || imported;
    } catch {
      // Try to import from relative path
      const path = pluginName.startsWith("/")
        ? pluginName
        : `${this.rootDir}/${pluginName}`;
      const imported = await import(path);
      return imported.default || imported;
    }
  }
  /**
   * Initialize all loaded plugins.
   */
  async initialize() {
    if (!this.initialized) {
      throw new Error("Plugins must be loaded before initialization");
    }
    const context = {
      config: this.config,
      rootDir: this.rootDir,
      mode: this.mode,
      onHook: (stage, handler) => this.registerHook(stage, handler),
      emitHook: (stage, context) => this.emitHook(stage, context),
    };
    for (const plugin of this.plugins) {
      if (plugin.init) {
        try {
          await plugin.init(context);
          log.info(`[Plugin] Initialized: ${plugin.name}`);
        } catch (error) {
          log.error(
            `[Plugin] Initialization failed for ${plugin.name}: ${error instanceof Error ? error.message : String(error)}`,
          );
          throw error;
        }
      }
      // Register plugin hooks
      if (plugin.hooks) {
        for (const [stage, handler] of Object.entries(plugin.hooks)) {
          if (handler) {
            this.registerHook(stage, handler);
          }
        }
      }
    }
  }
  /**
   * Register a hook handler for a specific stage.
   */
  registerHook(stage, handler) {
    if (!this.hooks.has(stage)) {
      this.hooks.set(stage, []);
    }
    this.hooks.get(stage).push(handler);
  }
  /**
   * Emit a hook event, executing all registered handlers.
   */
  async emitHook(stage, context) {
    const handlers = this.hooks.get(stage) || [];
    if (handlers.length === 0) {
      return;
    }
    try {
      // Execute hooks sequentially by default
      for (const handler of handlers) {
        try {
          await handler(context);
        } catch (error) {
          log.error(
            `[Plugin Hook] Error in ${stage}: ${error instanceof Error ? error.message : String(error)}`,
          );
          throw error;
        }
      }
    } catch (error) {
      log.error(`[Plugin] Hook execution failed for stage: ${stage}`);
      throw error;
    }
  }
  /**
   * Get all registered plugins.
   */
  getPlugins() {
    return [...this.plugins];
  }
  /**
   * Get handlers for a specific hook stage.
   */
  getHooks(stage) {
    return this.hooks.get(stage) || [];
  }
  /**
   * Check if a hook stage has handlers registered.
   */
  hasHook(stage) {
    return this.hooks.has(stage) && this.hooks.get(stage).length > 0;
  }
}
/**
 * Global plugin manager instance (singleton).
 */
let globalPluginManager = null;
/**
 * Get or create the global plugin manager.
 */
export function getPluginManager(config, rootDir, mode) {
  if (!globalPluginManager) {
    if (!config || !rootDir) {
      throw new Error(
        "Plugin manager not initialized. Call getPluginManager with config and rootDir",
      );
    }
    globalPluginManager = new PluginManager(config, rootDir, mode);
  }
  return globalPluginManager;
}
/**
 * Reset the global plugin manager (for testing).
 */
export function resetPluginManager() {
  globalPluginManager = null;
}
