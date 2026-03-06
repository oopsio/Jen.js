/*
 * This file is part of Jen.js.
 * Copyright (C) 2026 oopsio
 */

import type { DevToolsConfig } from "./devtools.js";

const STORAGE_KEY = "__jen_devtools_config__";

export class PersistenceManager {
  loadConfig(): Partial<DevToolsConfig> {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  saveConfig(config: DevToolsConfig) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
      console.error("Failed to save DevTools config:", e);
    }
  }

  loadComponentState(componentId: string): any {
    try {
      const stored = localStorage.getItem(`__jen_component_${componentId}__`);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  saveComponentState(componentId: string, state: any) {
    try {
      localStorage.setItem(
        `__jen_component_${componentId}__`,
        JSON.stringify(state),
      );
    } catch (e) {
      console.error("Failed to save component state:", e);
    }
  }

  clearComponentState(componentId: string) {
    try {
      localStorage.removeItem(`__jen_component_${componentId}__`);
    } catch (e) {
      console.error("Failed to clear component state:", e);
    }
  }

  clearAll() {
    try {
      const keys = Object.keys(localStorage).filter((k) =>
        k.startsWith("__jen_"),
      );
      keys.forEach((key) => localStorage.removeItem(key));
    } catch (e) {
      console.error("Failed to clear storage:", e);
    }
  }
}
