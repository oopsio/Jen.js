/*
 * This file is part of Jen.js.
 * Copyright (C) 2026 oopsio
 */
export class PluginSystem {
  plugins = new Map();
  factories = new Map();
  eventBus;
  constructor(eventBus) {
    this.eventBus = eventBus;
  }
  register(name, factory) {
    if (this.plugins.has(name)) {
      console.warn(`Plugin "${name}" is already registered`);
      return;
    }
    this.factories.set(name, factory);
    this.eventBus.emit("plugin:registered", { name });
  }
  load(name, devtools) {
    if (this.plugins.has(name)) {
      console.warn(`Plugin "${name}" is already loaded`);
      return false;
    }
    const factory = this.factories.get(name);
    if (!factory) {
      console.error(`Plugin "${name}" not found`);
      return false;
    }
    try {
      const plugin = factory(devtools);
      plugin.setup();
      this.plugins.set(name, plugin);
      this.eventBus.emit("plugin:loaded", { name });
      return true;
    } catch (e) {
      console.error(`Failed to load plugin "${name}":`, e);
      return false;
    }
  }
  unload(name) {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      console.warn(`Plugin "${name}" is not loaded`);
      return false;
    }
    try {
      if (plugin.teardown) {
        plugin.teardown();
      }
      this.plugins.delete(name);
      this.eventBus.emit("plugin:unloaded", { name });
      return true;
    } catch (e) {
      console.error(`Failed to unload plugin "${name}":`, e);
      return false;
    }
  }
  get(name) {
    return this.plugins.get(name);
  }
  getAll() {
    return Array.from(this.plugins.values());
  }
  getRegistered() {
    return Array.from(this.factories.keys());
  }
  loadAll(devtools) {
    let allSuccess = true;
    for (const name of this.factories.keys()) {
      if (!this.load(name, devtools)) {
        allSuccess = false;
      }
    }
    return allSuccess;
  }
  unloadAll() {
    let allSuccess = true;
    for (const name of Array.from(this.plugins.keys())) {
      if (!this.unload(name)) {
        allSuccess = false;
      }
    }
    return allSuccess;
  }
}
/**
 * Create a custom plugin easily
 */
export function createPlugin(config) {
  return () => ({
    name: config.name,
    version: config.version,
    setup: config.setup,
    teardown: config.teardown,
  });
}
