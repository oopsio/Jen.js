/*
 * This file is part of Jen.js.
 * Copyright (C) 2026 oopsio
 */

export interface EventBus {
  on(event: string, callback: (...args: any[]) => void): void;
  off(event: string, callback: (...args: any[]) => void): void;
  emit(event: string, ...args: any[]): void;
}

export function createEventBus(): EventBus {
  const listeners: Record<string, ((...args: any[]) => void)[]> = {};

  return {
    on(event: string, callback: (...args: any[]) => void) {
      if (!listeners[event]) {
        listeners[event] = [];
      }
      listeners[event].push(callback);
    },

    off(event: string, callback: (...args: any[]) => void) {
      if (!listeners[event]) return;
      listeners[event] = listeners[event].filter((cb) => cb !== callback);
    },

    emit(event: string, ...args: any[]) {
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
