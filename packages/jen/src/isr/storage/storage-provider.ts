/**
 * Abstract storage provider for cache management
 */
import type { CacheEntry, IStorageProvider } from '../types';

export abstract class StorageProvider implements IStorageProvider {
  abstract get(key: string): Promise<CacheEntry | null>;
  abstract set(key: string, entry: CacheEntry): Promise<void>;
  abstract delete(key: string): Promise<void>;
  abstract exists(key: string): Promise<boolean>;
}
