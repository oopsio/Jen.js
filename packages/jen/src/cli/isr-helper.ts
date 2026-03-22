/**
 * ISR Helper - Utility for CLI to set up ISR
 */
import { updateRuntimeConfig } from '../config/config';

export class ISRHelper {
  /**
   * Enable ISR with given configuration
   */
  static enableISR(
    options: {
      cacheDir?: string;
      globalRevalidate?: number;
      maxRetries?: number;
      retryDelay?: number;
    } = {},
  ): void {
    updateRuntimeConfig({
      isr: {
        enabled: true,
        cacheDir: options.cacheDir || '.cache/isr',
        globalRevalidate: options.globalRevalidate,
        maxRetries: options.maxRetries || 5,
        retryDelay: options.retryDelay || 2000,
      },
    });

    console.log('✓ ISR enabled with config:');
    console.log(`  Cache directory: ${options.cacheDir || '.cache/isr'}`);
    console.log(`  Global revalidate: ${options.globalRevalidate || 'none'}`);
    console.log(`  Max retries: ${options.maxRetries || 5}`);
  }

  /**
   * Disable ISR
   */
  static disableISR(): void {
    updateRuntimeConfig({
      isr: {
        enabled: false,
      },
    });

    console.log('✓ ISR disabled');
  }

  /**
   * Get ISR status
   */
  static printStatus(): void {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { RuntimeConfig } = require('../config/config');
    const isr = RuntimeConfig.isr;

    console.log('\nISR Status:');
    console.log(`  Enabled: ${isr?.enabled ? 'Yes' : 'No'}`);
    if (isr?.enabled) {
      console.log(`  Cache directory: ${isr.cacheDir}`);
      console.log(`  Global revalidate: ${isr.globalRevalidate || 'none'}`);
      console.log(`  Max retries: ${isr.maxRetries}`);
      console.log(`  Retry delay: ${isr.retryDelay}ms`);
    }
  }
}
