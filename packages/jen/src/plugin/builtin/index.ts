/**
 * Built-in Plugins for Jen.js
 */

import { ViteIntegrationPlugin } from './vite-integration.js';
import { EnvironmentPlugin } from './environment.js';
import { MetricsPlugin } from './metrics.js';
import { CachePlugin } from './cache.js';

export { ViteIntegrationPlugin } from './vite-integration.js';
export { EnvironmentPlugin } from './environment.js';
export { MetricsPlugin } from './metrics.js';
export { CachePlugin } from './cache.js';

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
