// ============================================================================
// Jen.js Framework - Master Index
// Complete export of all modules, features, and utilities
// ============================================================================

// ============================================================================
// API Module
// ============================================================================
export * from './api/(hello).js';

// ============================================================================
// Auth Module
// ============================================================================
export * from './auth/index.js';
export * from './auth/jwt.js';
export * from './auth/session.js';

// ============================================================================
// Build Module - SSG Pipeline & Utilities
// ============================================================================
export { buildSite as legacyBuildSite, type BuildOptions } from './build-tools/build-site.js';
export * from './build/build.js';
export { ProductionBuilder, type ProductionBuildConfig } from './build/production-build.js';
export * from './build/ssg-build.js';
export * from './build/ssg-pipeline.js';
export * from './build/corrected-pipeline.js';
export * from './build/island-hydration.js';
export * from './build/hydration-islands.js';
export * from './build/asset-manifest.js';
export * from './build/asset-hashing.js';
export * from './build/page-renderer.js';
export * from './build/minifier.js';
export * from './build/critical-css.js';
export * from './build/ssg-runtime.js';
export * from './build/deterministic.js';
export * from './build/build-invariants.js';
export * from './build/build-cache.js';
export type { Island, IslandRegistry } from './build/island-hydration.js';
export {
  createIslandRegistry,
  markIsland,
  extractIslandsFromHtml,
  injectIslandScript,
  injectFrameworkData,
} from './build/island-hydration.js';

// ============================================================================
// Cache Module
// ============================================================================
export * from './cache/index.js';
export * from './cache/memory.js';
export * from './cache/redis.js';

// ============================================================================
// CLI Module - Templates
// ============================================================================
export * from './cli/templates/ssg/jen.config.js';
export * from './cli/templates/ssr/jen.config.js';
export * from './cli/banner.js';

// ============================================================================
// Core Module
// ============================================================================
export * from './core/config.js';
export * from './core/http.js';
export * from './core/paths.js';
export * from './core/types.js';
export * from './core/routes/match.js';
export * from './core/routes/scan.js';

// ============================================================================
// CSS Module
// ============================================================================
export * from './css/compiler.js';

// ============================================================================
// Database Module
// ============================================================================
export * from './db/index.js';
export * from './db/types.js';
export * from './db/schema.js';
export * from './db/migrations.js';
export * from './db/luaHooks.js';
export * from './db/drivers/sqlite.js';
export * from './db/drivers/postgres.js';
export * from './db/drivers/mysql.js';
export * from './db/drivers/mongo.js';

// ============================================================================
// GraphQL Module
// ============================================================================
export * from './graphql/index.js';
export * from './graphql/schema.js';
export * from './graphql/resolvers.js';

// ============================================================================
// i18n Module (Internationalization)
// ============================================================================
export * from './i18n/index.js';

// ============================================================================
// Middleware Module
// ============================================================================
export * from './middleware/types.js';
export * from './middleware/runner.js';

// ============================================================================
// Native Module (Stubs)
// ============================================================================
export * from './native/index.js';
export * from './native/bundle.js';
export * from './native/dev-server.js';
export * from './native/optimizer.js';
export * from './native/style-compiler.js';

// ============================================================================
// Plugin Module
// ============================================================================
export * from './plugin/loader.js';

// ============================================================================
// Python Module (if exists)
// ============================================================================
// Note: python module exists but has no .ts files yet

// ============================================================================
// Runtime Module
// ============================================================================
export * from './runtime/render.js';
export * from './runtime/client-runtime.js';
export * from './runtime/hydrate.js';
export * from './runtime/hmr.js';

// ============================================================================
// Server Module
// ============================================================================
export * from './server/app.js';
export * from './server/api.js';
export * from './server/runtimeServe.js';

// ============================================================================
// Shared Module
// ============================================================================
export * from './shared/log.js';
