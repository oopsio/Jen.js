/**
 * Metrics Plugin
 * Tracks performance metrics and timing
 */

import type { Plugin, PluginContext } from '../types';

interface MetricsData {
  buildTime: number;
  pluginInitTime: number;
  hookTimings: Record<string, number[]>;
}

export class MetricsPlugin implements Plugin {
  name = '@jen/metrics';
  version = '1.0.0';
  description = 'Collects and reports performance metrics';

  private metrics: MetricsData = {
    buildTime: 0,
    pluginInitTime: 0,
    hookTimings: {},
  };

  private startTime = 0;

  async init(context: PluginContext): Promise<void> {
    this.startTime = Date.now();
    if (context.isDev) {
      console.log('[Plugin] Metrics tracking enabled');
    }
  }

  async buildComplete(result: { outputDir: string; duration: number }): Promise<void> {
    this.metrics.buildTime = result.duration;

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Plugin] Build completed in ${result.duration}ms`);
      console.log(`[Plugin] Output: ${result.outputDir}`);
    }
  }

  /**
   * Get collected metrics
   */
  getMetrics(): MetricsData {
    return this.metrics;
  }
}
