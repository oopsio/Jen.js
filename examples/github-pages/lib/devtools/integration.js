/*
 * This file is part of Jen.js.
 * Copyright (C) 2026 oopsio
 */
import { injectStyles } from "./ui.js";
/**
 * Enhanced component wrapper that automatically registers with DevTools
 */
export function withDevTools(Component, devtools) {
    return function WrappedComponent(props) {
        const id = `${Component.name}-${Math.random().toString(36).substr(2, 9)}`;
        // Get the rendered element ref
        let el = null;
        // Register component with DevTools
        setTimeout(() => {
            const element = document.querySelector(`[data-component-id="${id}"]`);
            if (element) {
                el = element;
                devtools.registerComponent(id, Component.name || "Anonymous", el, props, {});
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
export function useDevToolsIntegration(componentName, devtools) {
    const id = `${componentName}-${Math.random().toString(36).substr(2, 9)}`;
    return {
        componentId: id,
        trackState: (state) => {
            devtools.updateComponentState(id, state);
        },
        trackEvent: (eventName, data) => {
            devtools.logEvent(id, eventName, data);
        },
    };
}
/**
 * Auto-initialize DevTools on the page
 */
export function autoInitDevTools(options) {
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
export function createMonitoredListener(devtools, componentId, eventName, handler) {
    return (event) => {
        devtools.logEvent(componentId, eventName, {
            type: event.type,
            target: event.target?.tagName,
            timestamp: Date.now(),
        });
        handler(event);
    };
}
/**
 * Monitor DOM mutations for a component
 */
export function monitorDOMChanges(devtools, componentId, element) {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            devtools.logEvent(componentId, "dom-mutation", {
                type: mutation.type,
                target: mutation.target instanceof HTMLElement
                    ? mutation.target.tagName
                    : "unknown",
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
export function createLogger(devtools, componentId) {
    return {
        log: (...args) => {
            console.log(...args);
            devtools.logEvent(componentId, "console:log", args);
        },
        error: (...args) => {
            console.error(...args);
            devtools.logEvent(componentId, "console:error", args);
        },
        warn: (...args) => {
            console.warn(...args);
            devtools.logEvent(componentId, "console:warn", args);
        },
        debug: (...args) => {
            console.debug?.(...args);
            devtools.logEvent(componentId, "console:debug", args);
        },
        info: (...args) => {
            console.info?.(...args);
            devtools.logEvent(componentId, "console:info", args);
        },
    };
}
/**
 * Monitor performance of a component render
 */
export function measureComponentRender(devtools, componentName, renderFn) {
    const start = performance.now();
    const result = renderFn();
    const duration = performance.now() - start;
    devtools.logEvent(componentName, "render", {
        duration,
        timestamp: Date.now(),
    });
    return result;
}
