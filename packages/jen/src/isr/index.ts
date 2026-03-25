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
} from './types.js';
export type { ISRConfig, IStorageProvider, RenderFunction } from './types.js';

// Freshness checking
export { FreshnessChecker } from './freshness/freshness-checker.js';

// Cache management
export { CacheManager } from './cache/cache-manager.js';

// Storage providers
export { StorageProvider } from './storage/storage-provider.js';
export { MemoryStorage } from './storage/memory-storage.js';
export { FileStorage } from './storage/file-storage.js';

// Metadata extraction
export { RouteMetadataExtractor } from './metadata/route-metadata-extractor.js';
export type { RouteExport } from './metadata/route-metadata-extractor.js';

// Request handling
export { ISRRequestHandler } from './request/request-handler.js';

// Factory (main entry point)
export { ISRFactory } from './factory/isr-factory.js';
