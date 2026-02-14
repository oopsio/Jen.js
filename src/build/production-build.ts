import { FrameworkConfig } from '../core/config.js';
import { SSGPipeline } from './ssg-pipeline.js';
import { log } from '../shared/log.js';

export interface ProductionBuildConfig {
  config: FrameworkConfig;
}

export class ProductionBuilder {
  /**
   * Run the production build sequence
   */
  static async build(opts: ProductionBuildConfig) {
    log.info('--- PRODUCTION BUILD START ---');
    const pipeline = new SSGPipeline(opts.config);
    await pipeline.run();
    log.info('--- PRODUCTION BUILD COMPLETE ---');
  }
}
