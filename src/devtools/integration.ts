/*
 * This file is part of Jen.js.
 * Copyright (C) 2026 oopsio
 */

/**
 * Integration helpers for connecting Jen.js components to DevTools
 * Use these helpers in your application to automatically register components
 */

import type { DevTools } from "./devtools.js";
import { injectStyles } from "./ui.js";

/**
 * Enhanced component wrapper that automatically registers with DevTools
 */
export function withDevTools<P extends Record<string, any>>(
  Component: (props: P) => any,
  devtools: DevTools
) {
  return function WrappedComponent(props: P) {
    const id = `${Component.name}-${Math.random().toString(36).substr(2, 9)}`;

    // Get the rendered element ref
    let el: HTMLElement | null = null;

    // Register component with DevTools
    setTimeout(() => {
      const element = document.querySelector(`[data-component-id="${id}"]`);
      if (element) {
        el = element as HTMLElement;
        devtools.registerComponent(
          id,
          Component.name || "Anonymous",
          el,
          props,
          {}
        );
      }
    }, 0);

    // Render original component with tracking div
    return {
      vnode: Component(props),
      wrapper: id,
    };
  };
}

/**
 * Hook for tracking state updates in components
 */
export function useDevToolsIntegration(
  componentName: string,
  devtools: DevTools
) {
  const id = `${componentName}-${Math.random().toString(36).substr(2, 9)}`;

  return {
    componentId: id,
    trackState: (state: Record<string, any>) => {
      devtools.updateComponentState(id, state);
    },
    trackEvent: (eventName: string, data?: any) => {
      devtools.logEvent(id, eventName, data);
    },
  };
}

/**
 * Auto-initialize DevTools on the page
 */
export function autoInitDevTools(options?: {
  enabled?: boolean;
  injectInto?: Element;
}) {
  // Only enable in development
  if (typeof process !== "undefined" && process.env.NODE_ENV === "production") {
    return null;
  }

  // Inject styles
  injectStyles();

  // Dynamic import to avoid circular dependencies
  return import("./devtools.js").then(({ initDevTools }) => {
    return initDevTools({
      enabled: options?.enabled ?? true,
    });
  });
}

/**
 * Create a monitored event listener
 */
export function createMonitoredListener(
  devtools: DevTools,
  componentId: string,
  eventName: string,
  handler: (event: Event) => void
) {
  return (event: Event) => {
    devtools.logEvent(componentId, eventName, {
      type: event.type,
      target: (event.target as HTMLElement)?.tagName,
      timestamp: Date.now(),
    });
    handler(event);
  };
}

/**
 * Monitor DOM mutations for a component
 */
export function monitorDOMChanges(
  devtools: DevTools,
  componentId: string,
  element: HTMLElement
) {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      devtools.logEvent(componentId, "dom-mutation", {
        type: mutation.type,
        target: mutation.target instanceof HTMLElement ? mutation.target.tagName : "unknown",
        addedNodes: mutation.addedNodes.length,
        removedNodes: mutation.removedNodes.length,
      });
    });
  });

  observer.observe(element, {
    attributes: true,
    childList: true,
    subtree: true,
    characterData: true,
  });

  return observer;
}

/**
 * Create a devtools-aware logging function
 */
export function createLogger(devtools: DevTools, componentId: string) {
  return {
    log: (...args: any[]) => {
      console.log(...args);
      devtools.logEvent(componentId, "console:log", args);
    },
    error: (...args: any[]) => {
      console.error(...args);
      devtools.logEvent(componentId, "console:error", args);
    },
    warn: (...args: any[]) => {
      console.warn(...args);
      devtools.logEvent(componentId, "console:warn", args);
    },
    debug: (...args: any[]) => {
      console.debug?.(...args);
      devtools.logEvent(componentId, "console:debug", args);
    },
    info: (...args: any[]) => {
      console.info?.(...args);
      devtools.logEvent(componentId, "console:info", args);
    },
  };
}

/**
 * Monitor performance of a component render
 */
export function measureComponentRender(
  devtools: DevTools,
  componentName: string,
  renderFn: () => any
) {
  const start = performance.now();
  const result = renderFn();
  const duration = performance.now() - start;

  devtools.logEvent(
    componentName,
    "render",
    {
      duration,
      timestamp: Date.now(),
    }
  );

  return result;
}
