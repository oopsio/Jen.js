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

import type { FrameworkConfig } from "@src/core/config.js";
import { logger } from "@src/shared/log.js";
import type {
  JenPlugin,
  PluginContext,
  PluginHookContext,
  PluginHookHandler,
  HookStage,
} from "./types.js";

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
  private plugins: JenPlugin[] = [];
  private hooks: Map<string, PluginHookHandler[]> = new Map();
  private config: FrameworkConfig;
  private mode: "development" | "production";
  private rootDir: string;
  private initialized = false;

  constructor(
    config: FrameworkConfig,
    rootDir: string,
    mode: "development" | "production" = "development"
  ) {
    this.config = config;
    this.rootDir = rootDir;
    this.mode = mode;
  }

  /**
   * Load plugins from configuration or explicit list.
   */
  async loadPlugins(plugins: (JenPlugin | string)[] = []): Promise<void> {
    try {
      for (const plugin of plugins) {
        const resolved =
          typeof plugin === "string" ? await this.resolvePlugin(plugin) : plugin;
        this.plugins.push(resolved);
        logger.debug(`[Plugin] Loaded: ${resolved.name}@${resolved.version}`);
      }
      this.initialized = true;
    } catch (error) {
      logger.error(`[Plugin] Failed to load plugins:`, error);
      throw error;
    }
  }

  /**
   * Resolve a plugin by name (from node_modules or path).
   */
  private async resolvePlugin(pluginName: string): Promise<JenPlugin> {
    try {
      // Try to import from node_modules
      const imported = await import(pluginName);
      return imported.default || imported;
    } catch {
      // Try to import from relative path
      const path = pluginName.startsWith("/") ? pluginName : `${this.rootDir}/${pluginName}`;
      const imported = await import(path);
      return imported.default || imported;
    }
  }

  /**
   * Initialize all loaded plugins.
   */
  async initialize(): Promise<void> {
    if (!this.initialized) {
      throw new Error("Plugins must be loaded before initialization");
    }

    const context: PluginContext = {
      config: this.config,
      rootDir: this.rootDir,
      mode: this.mode,
      onHook: (stage: string, handler: PluginHookHandler) =>
        this.registerHook(stage, handler),
      emitHook: (stage: string, context: PluginHookContext) =>
        this.emitHook(stage, context),
    };

    for (const plugin of this.plugins) {
      if (plugin.init) {
        try {
          await plugin.init(context);
          logger.debug(`[Plugin] Initialized: ${plugin.name}`);
        } catch (error) {
          logger.error(`[Plugin] Initialization failed for ${plugin.name}:`, error);
          throw error;
        }
      }

      // Register plugin hooks
      if (plugin.hooks) {
        for (const [stage, handler] of Object.entries(plugin.hooks)) {
          this.registerHook(stage, handler);
        }
      }
    }
  }

  /**
   * Register a hook handler for a specific stage.
   */
  private registerHook(stage: string, handler: PluginHookHandler): void {
    if (!this.hooks.has(stage)) {
      this.hooks.set(stage, []);
    }
    this.hooks.get(stage)!.push(handler);
  }

  /**
   * Emit a hook event, executing all registered handlers.
   */
  async emitHook(stage: string, context: PluginHookContext): Promise<void> {
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
          logger.error(`[Plugin Hook] Error in ${stage}:`, error);
          throw error;
        }
      }
    } catch (error) {
      logger.error(`[Plugin] Hook execution failed for stage: ${stage}`);
      throw error;
    }
  }

  /**
   * Get all registered plugins.
   */
  getPlugins(): JenPlugin[] {
    return [...this.plugins];
  }

  /**
   * Get handlers for a specific hook stage.
   */
  getHooks(stage: string): PluginHookHandler[] {
    return this.hooks.get(stage) || [];
  }

  /**
   * Check if a hook stage has handlers registered.
   */
  hasHook(stage: string): boolean {
    return this.hooks.has(stage) && this.hooks.get(stage)!.length > 0;
  }
}

/**
 * Global plugin manager instance (singleton).
 */
let globalPluginManager: PluginManager | null = null;

/**
 * Get or create the global plugin manager.
 */
export function getPluginManager(
  config?: FrameworkConfig,
  rootDir?: string,
  mode?: "development" | "production"
): PluginManager {
  if (!globalPluginManager) {
    if (!config || !rootDir) {
      throw new Error(
        "Plugin manager not initialized. Call getPluginManager with config and rootDir"
      );
    }
    globalPluginManager = new PluginManager(config, rootDir, mode);
  }
  return globalPluginManager;
}

/**
 * Reset the global plugin manager (for testing).
 */
export function resetPluginManager(): void {
  globalPluginManager = null;
}
