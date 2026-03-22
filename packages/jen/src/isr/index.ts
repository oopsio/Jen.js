/**
 * Incremental Static Regeneration (ISR) System
 * High-performance stale-while-revalidate pattern for TypeScript web frameworks
 */

// Types
export type {
  RouteMetadata,
  CacheEntry,
  FreshnessResult,
  ISRResponse,
} from './types';
export type { ISRConfig, IStorageProvider, RenderFunction } from './types';

// Freshness checking
export { FreshnessChecker } from './freshness/freshness-checker';

// Cache management
export { CacheManager } from './cache/cache-manager';

// Storage providers
export { StorageProvider } from './storage/storage-provider';
export { MemoryStorage } from './storage/memory-storage';
export { FileStorage } from './storage/file-storage';

// Metadata extraction
export { RouteMetadataExtractor } from './metadata/route-metadata-extractor';
export type { RouteExport } from './metadata/route-metadata-extractor';

// Request handling
export { ISRRequestHandler } from './request/request-handler';

// Factory (main entry point)
export { ISRFactory } from './factory/isr-factory';
