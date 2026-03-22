/**
 * Factory for creating ISR system with dependency injection
 */
import type {
  ISRConfig,
  IStorageProvider,
  RenderFunction,
} from '../types';
import { CacheManager } from '../cache/cache-manager';
import { ISRRequestHandler } from '../request/request-handler';
import { MemoryStorage } from '../storage/memory-storage';
import { FileStorage } from '../storage/file-storage';

export class ISRFactory {
  /**
   * Create ISR system with memory storage (development)
   */
  static createDev(
    render: RenderFunction,
    overrideConfig?: Partial<ISRConfig>,
  ): ISRRequestHandler {
    const config: ISRConfig = {
      cacheDir: '.cache/isr',
      maxRetries: 3,
      retryDelay: 1000,
      ...overrideConfig,
    };

    const storage = new MemoryStorage();
    const cacheManager = new CacheManager(storage, config);
    return new ISRRequestHandler(cacheManager, render);
  }

  /**
   * Create ISR system with file storage (production)
   */
  static createProd(
    render: RenderFunction,
    cacheDir: string = '.cache/isr',
    overrideConfig?: Partial<ISRConfig>,
  ): ISRRequestHandler {
    const config: ISRConfig = {
      cacheDir,
      maxRetries: 5,
      retryDelay: 2000,
      ...overrideConfig,
    };

    const storage = new FileStorage(config.cacheDir);
    const cacheManager = new CacheManager(storage, config);
    return new ISRRequestHandler(cacheManager, render);
  }

  /**
   * Create ISR system with custom storage provider
   */
  static createCustom(
    render: RenderFunction,
    storage: IStorageProvider,
    config: ISRConfig,
  ): ISRRequestHandler {
    const cacheManager = new CacheManager(storage, config);
    return new ISRRequestHandler(cacheManager, render);
  }

  /**
   * Get cache manager directly (for advanced usage)
   */
  static createCacheManager(
    storage: IStorageProvider,
    config: ISRConfig,
  ): CacheManager {
    return new CacheManager(storage, config);
  }
}
