/*
 * This file is part of Jen.js.
 * Copyright (C) 2026 oopsio
 */
const STORAGE_KEY = "__jen_devtools_config__";
export class PersistenceManager {
  loadConfig() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }
  saveConfig(config) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
      console.error("Failed to save DevTools config:", e);
    }
  }
  loadComponentState(componentId) {
    try {
      const stored = localStorage.getItem(`__jen_component_${componentId}__`);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }
  saveComponentState(componentId, state) {
    try {
      localStorage.setItem(
        `__jen_component_${componentId}__`,
        JSON.stringify(state),
      );
    } catch (e) {
      console.error("Failed to save component state:", e);
    }
  }
  clearComponentState(componentId) {
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
