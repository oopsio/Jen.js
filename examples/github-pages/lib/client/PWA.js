'use client';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "preact/jsx-runtime";
import { useEffect } from "preact/hooks";
/**
 * PWA (Progressive Web App) setup component
 *
 * @example
 * ```tsx
 * // With defaults
 * <PWA />
 *
 * // With custom paths
 * <PWA manifestPath="/app/manifest.json" swPath="/app/sw.js" />
 * ```
 *
 * @remarks
 * Automatically registers the service worker on component mount.
 * Service worker errors are logged to console but don't break the app.
 */
export function PWA({ manifestPath = "/manifest.json", swPath = "/sw.js", }) {
    useEffect(() => {
        // Register service worker in browser
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register(swPath).catch((err) => console.error("Service worker registration failed:", err));
        }
    }, [swPath]);
    return (_jsxs(_Fragment, { children: [_jsx("link", { rel: "manifest", href: manifestPath }), _jsx("meta", { name: "theme-color", content: "#000000" }), _jsx("meta", { name: "apple-mobile-web-app-capable", content: "yes" }), _jsx("meta", { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" })] }));
}
