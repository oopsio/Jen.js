import { log } from "../shared/log.js";
/**
 * Central plugin manager for Jen.js framework.
 *
 * Manages plugin loading, hook registration, and execution.
 * Plugins can hook into any stage of the build, dev, or request lifecycle.
 * Supports sequential and parallel hook execution, plugin ordering, and detailed execution metrics.
 *
 * @example
 * ```typescript
 * const manager = new PluginManager(config, rootDir, "development");
 * await manager.loadPlugins([myPlugin]);
 * await manager.initialize();
 * await manager.emitHook("beforeBuild", { config, data: {} });
 * const stats = manager.getStats();
 * ```
 */
export class PluginManager {
    plugins = [];
    hooks = new Map();
    hookMetadata = new Map();
    config;
    mode;
    rootDir;
    initialized = false;
    executionHistory = [];
    disabled = new Set();
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
                const resolved = typeof plugin === "string"
                    ? await this.resolvePlugin(plugin)
                    : plugin;
                this.plugins.push(resolved);
                log.info(`[Plugin] Loaded: ${resolved.name}@${resolved.version}`);
            }
            this.initialized = true;
        }
        catch (error) {
            log.error(`[Plugin] Failed to load plugins: ${error instanceof Error ? error.message : String(error)}`);
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
        }
        catch {
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
                }
                catch (error) {
                    log.error(`[Plugin] Initialization failed for ${plugin.name}: ${error instanceof Error ? error.message : String(error)}`);
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
     * Emit a hook event, executing all registered handlers sequentially.
     * Supports parallel execution via hook metadata.
     *
     * @param stage Hook stage name.
     * @param context Hook context with config and data.
     * @param parallel Whether to execute handlers in parallel (default: sequential).
     * @throws Error if any handler fails.
     */
    async emitHook(stage, context, parallel = false) {
        const handlers = this.hooks.get(stage) || [];
        if (handlers.length === 0) {
            return;
        }
        try {
            const metadata = this.hookMetadata.get(stage) || new Map();
            if (parallel && metadata.get("parallel")) {
                // Execute hooks in parallel
                await Promise.all(handlers.map((handler, idx) => this.executeHandler(stage, handler, context, idx)));
            }
            else {
                // Execute hooks sequentially (default)
                for (let idx = 0; idx < handlers.length; idx++) {
                    await this.executeHandler(stage, handlers[idx], context, idx);
                }
            }
        }
        catch (error) {
            log.error(`[Plugin] Hook execution failed for stage: ${stage}`);
            throw error;
        }
    }
    /**
     * Execute a single hook handler with timing and error tracking.
     */
    async executeHandler(stage, handler, context, handlerIndex) {
        const plugin = this.plugins[handlerIndex];
        if (!plugin || this.disabled.has(plugin.name)) {
            return;
        }
        const startTime = Date.now();
        try {
            await handler(context);
            const duration = Date.now() - startTime;
            this.executionHistory.push({
                hookName: stage,
                pluginName: plugin.name,
                duration,
                timestamp: startTime,
            });
            log.info(`[Plugin Hook] ${stage} executed by ${plugin.name} (${duration}ms)`);
        }
        catch (error) {
            const duration = Date.now() - startTime;
            const err = error instanceof Error ? error : new Error(String(error));
            this.executionHistory.push({
                hookName: stage,
                pluginName: plugin.name,
                duration,
                error: err,
                timestamp: startTime,
            });
            log.error(`[Plugin Hook] Error in ${stage} (${plugin.name}): ${err.message}`);
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
    /**
     * Disable a plugin by name.
     * The plugin remains loaded but hooks are skipped.
     *
     * @param pluginName Name of plugin to disable.
     * @returns True if plugin was disabled, false if not found.
     */
    disablePlugin(pluginName) {
        const exists = this.plugins.some((p) => p.name === pluginName);
        if (exists) {
            this.disabled.add(pluginName);
            log.info(`[Plugin] Disabled: ${pluginName}`);
            return true;
        }
        return false;
    }
    /**
     * Enable a previously disabled plugin.
     *
     * @param pluginName Name of plugin to enable.
     * @returns True if plugin was enabled, false if not found.
     */
    enablePlugin(pluginName) {
        const exists = this.plugins.some((p) => p.name === pluginName);
        if (exists && this.disabled.has(pluginName)) {
            this.disabled.delete(pluginName);
            log.info(`[Plugin] Enabled: ${pluginName}`);
            return true;
        }
        return false;
    }
    /**
     * Check if a plugin is disabled.
     */
    isPluginDisabled(pluginName) {
        return this.disabled.has(pluginName);
    }
    /**
     * Get execution history for performance analysis.
     *
     * @param hookName Optional filter by hook name.
     * @param pluginName Optional filter by plugin name.
     * @returns Array of execution results.
     */
    getExecutionHistory(hookName, pluginName) {
        return this.executionHistory.filter((result) => {
            if (hookName && result.hookName !== hookName)
                return false;
            if (pluginName && result.pluginName !== pluginName)
                return false;
            return true;
        });
    }
    /**
     * Clear execution history.
     */
    clearExecutionHistory() {
        this.executionHistory = [];
        log.info("[Plugin] Execution history cleared");
    }
    /**
     * Get plugin statistics and metrics.
     *
     * @returns Object with plugin stats including execution times and error counts.
     */
    getStats() {
        const executions = this.executionHistory;
        let totalTime = 0;
        let errorCount = 0;
        const pluginTimes = new Map();
        for (const result of executions) {
            totalTime += result.duration;
            if (result.error)
                errorCount++;
            if (!pluginTimes.has(result.pluginName)) {
                pluginTimes.set(result.pluginName, { total: 0, count: 0 });
            }
            const stats = pluginTimes.get(result.pluginName);
            stats.total += result.duration;
            stats.count += 1;
        }
        let slowestPlugin = null;
        let maxAvgTime = 0;
        for (const [name, times] of pluginTimes.entries()) {
            const avgTime = times.total / times.count;
            if (avgTime > maxAvgTime) {
                maxAvgTime = avgTime;
                slowestPlugin = { name, avgTime };
            }
        }
        return {
            total: this.plugins.length,
            loaded: this.plugins.length,
            disabled: this.disabled.size,
            hooks: this.hooks.size,
            executionCount: executions.length,
            avgExecutionTime: executions.length > 0 ? totalTime / executions.length : 0,
            errorCount,
            slowestPlugin,
        };
    }
    /**
     * Set metadata for a hook (e.g., execution mode).
     *
     * @param hookName Hook name.
     * @param key Metadata key.
     * @param value Metadata value.
     */
    setHookMetadata(hookName, key, value) {
        if (!this.hookMetadata.has(hookName)) {
            this.hookMetadata.set(hookName, new Map());
        }
        this.hookMetadata.get(hookName).set(key, value);
    }
    /**
     * Get hook metadata.
     */
    getHookMetadata(hookName, key) {
        const metadata = this.hookMetadata.get(hookName);
        if (!metadata)
            return undefined;
        return key ? metadata.get(key) : Object.fromEntries(metadata);
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
            throw new Error("Plugin manager not initialized. Call getPluginManager with config and rootDir");
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
