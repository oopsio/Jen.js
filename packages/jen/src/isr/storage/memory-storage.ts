/**
 * In-memory storage provider for development
 */
import type { CacheEntry } from '../types';
import { StorageProvider } from './storage-provider';

export class MemoryStorage extends StorageProvider {
  private cache: Map<string, CacheEntry> = new Map();

  async get(key: string): Promise<CacheEntry | null> {
    return this.cache.get(key) ?? null;
  }

  async set(key: string, entry: CacheEntry): Promise<void> {
    this.cache.set(key, entry);
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    return this.cache.has(key);
  }

  /**
   * Clear all cache entries (useful for testing)
   */
  async clear(): Promise<void> {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }
}
