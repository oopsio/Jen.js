/**
 * Environment Plugin
 * Handles environment-specific configurations
 */

import type { Plugin, PluginContext } from '../types';

export class EnvironmentPlugin implements Plugin {
  name = '@jen/environment';
  version = '1.0.0';
  description = 'Manages environment-specific behavior';

  private env: PluginContext | null = null;

  async init(context: PluginContext): Promise<void> {
    this.env = context;
    const envName = context.isDev ? 'Development' : 'Production';
    console.log(`[Plugin] Environment configured: ${envName}`);
  }

  config(config: any) {
    if (!this.env) return config;

    // Apply environment-specific settings
    if (this.env.isDev) {
      return {
        ...config,
        build: {
          ...config.build,
          sourcemap: true,
          minify: false,
        },
      };
    } else {
      return {
        ...config,
        build: {
          ...config.build,
          sourcemap: false,
          minify: 'esbuild',
        },
      };
    }
  }
}
