/*
 * This file is part of Jen.js.
 * Copyright (C) 2026 oopsio
 */
export function createEventBus() {
  const listeners = {};
  return {
    on(event, callback) {
      if (!listeners[event]) {
        listeners[event] = [];
      }
      listeners[event].push(callback);
    },
    off(event, callback) {
      if (!listeners[event]) return;
      listeners[event] = listeners[event].filter((cb) => cb !== callback);
    },
    emit(event, ...args) {
      if (!listeners[event]) return;
      listeners[event].forEach((callback) => {
        try {
          callback(...args);
        } catch (e) {
          console.error(`Error in event listener for ${event}:`, e);
        }
      });
    },
  };
}
