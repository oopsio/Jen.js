/**
 * Built-in Plugins for Jen.js
 */

import { ViteIntegrationPlugin } from './vite-integration';
import { EnvironmentPlugin } from './environment';
import { MetricsPlugin } from './metrics';
import { CachePlugin } from './cache';

export { ViteIntegrationPlugin } from './vite-integration';
export { EnvironmentPlugin } from './environment';
export { MetricsPlugin } from './metrics';
export { CachePlugin } from './cache';

/**
 * Load all built-in plugins
 */
export function loadBuiltinPlugins() {
  return [
    new ViteIntegrationPlugin(),
    new EnvironmentPlugin(),
    new MetricsPlugin(),
    new CachePlugin(),
  ];
}
