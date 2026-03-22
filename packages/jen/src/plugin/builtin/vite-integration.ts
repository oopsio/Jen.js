/**
 * Vite Integration Plugin
 * Manages Vite-specific configurations and hooks
 */

import type { Plugin, PluginContext } from '../types';

export class ViteIntegrationPlugin implements Plugin {
  name = '@jen/vite-integration';
  version = '1.0.0';
  description = 'Integrates Vite build tooling with Jen.js';

  async init(context: PluginContext): Promise<void> {
    if (context.isDev) {
      console.log('[Plugin] Vite Integration initialized in development mode');
    }
  }

  config(config: Record<string, unknown>) {
    // Ensure Vite-specific settings
    const buildConfig = config.build as Record<string, unknown> ?? {};
    return {
      ...config,
      build: {
        ...buildConfig,
        target: 'esnext',
        minify: 'esbuild',
      },
    };
  }

  resolveId(id: string) {
    // Handle virtual modules
    if (id.startsWith('\0')) {
      return id;
    }
    return null;
  }

  load(id: string) {
    // Load virtual modules
    if (id === '\0jen:virtual-routes') {
      return `export const routes = {};`;
    }
    return null;
  }
}
