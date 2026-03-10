'use client';

import { h, type VNode } from "preact";
import { useEffect } from "preact/hooks";

export interface PWAProps {
  /** Path to web app manifest (default: '/manifest.json') */
  manifestPath?: string;
  /** Path to service worker file (default: '/sw.js') */
  swPath?: string;
}

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
export function PWA({
  manifestPath = "/manifest.json",
  swPath = "/sw.js",
}: PWAProps): VNode {
  useEffect(() => {
    // Register service worker in browser
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register(swPath).catch((err) =>
        console.error("Service worker registration failed:", err),
      );
    }
  }, [swPath]);

  return (
    <>
      <link rel="manifest" href={manifestPath} />
      <meta name="theme-color" content="#000000" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta
        name="apple-mobile-web-app-status-bar-style"
        content="black-translucent"
      />
    </>
  );
}
