// ============================================================================
// Barrel Export: Automatically exports everything from all nested modules
// ============================================================================

// API
export * from "./api/(hello).js";

// Auth
export * from "./auth/index.js";
export * from "./auth/jwt.js";
export * from "./auth/session.js";
export * from "./auth/cookie-utils.js";

// Build
export {
  buildSite as legacyBuildSite,
  type BuildOptions,
} from "./build-tools/build-site.js";
export * from "./build/build.js";
export {
  ProductionBuilder,
  type ProductionBuildConfig,
} from "./build/production-build.js";
export { SSGPipeline } from "./build/ssg-pipeline.js";
export * from "./build/island-hydration.js";
export { AssetManifest } from "./build/asset-manifest.js";
export { AssetHasher } from "./build/asset-hashing.js";
export { PageRenderer, type PageRenderContext } from "./build/page-renderer.js";
export { Minifier, type MinifyOptions } from "./build/minifier.js";
export type { Island, IslandRegistry } from "./build/island-hydration.js";
export {
  createIslandRegistry,
  markIsland,
  extractIslandsFromHtml,
  injectIslandScript,
} from "./build/island-hydration.js";

// Cache
export * from "./cache/index.js";
export * from "./cache/memory.js";
export * from "./cache/redis.js";

// CLI
export * from "./cli/templates/ssg/jen.config.js";
export * from "./cli/templates/ssr/jen.config.js";
export * from "./cli/banner.js";

// Compilers
export { createVueCompiler, type VueCompileOptions, type VueCompileResult } from "./compilers/vue.js";
export { createSvelteCompiler, type SvelteCompileOptions, type SvelteCompileResult } from "./compilers/svelte.js";
export {
  vueEsbuildPlugin,
  svelteEsbuildPlugin,
  invalidateVueCache,
  invalidateSvelteCache,
  clearAllCompilerCaches,
} from "./compilers/esbuild-plugins.js";

// Core
export * from "./core/config.js";
export * from "./core/http.js";
export * from "./core/paths.js";
export * from "./core/types.js";
export * from "./core/routes/match.js";
export * from "./core/routes/scan.js";
export * from "./core/middleware-hooks.js";

// CSS
export * from "./css/compiler.js";

// Database
export * from "./db/index.js";
export * from "./db/types.js";
export * from "./db/connector.js";
export * from "./db/drivers/sql.js";
export * from "./db/drivers/jdb.js";

// GraphQL
export * from "./graphql/index.js";
export * from "./graphql/schema.js";
export * from "./graphql/resolvers.js";

// i18n
export * from "./i18n/index.js";

// Import utilities
export { jenImport, clearImportCache, invalidateImportCache, jen } from "./import/jen-import.js";

// JDB
export * from "./jdb/index.js";
export * from "./jdb/engine.js";
export * from "./jdb/types.js";
export * from "./jdb/utils.js";

// Middleware
export * from "./middleware/types.js";
export * from "./middleware/context.js";
export * from "./middleware/response.js";
export * from "./middleware/pipeline.js";
export * from "./middleware/kernel.js";
export * from "./middleware/registry.js";
export * from "./middleware/decorators.js";
export * from "./middleware/builtins/logger.js";
export * from "./middleware/builtins/request-id.js";
export * from "./middleware/builtins/security-headers.js";
export * from "./middleware/builtins/cors.js";
export * from "./middleware/builtins/body-parser.js";
export * from "./middleware/builtins/rate-limit.js";
export * from "./middleware/errors/http-error.js";
export * from "./middleware/errors/handler.js";
export * from "./middleware/utils/matcher.js";

// Native
export * from "./native/index.js";
export * from "./native/bundle.js";
export * from "./native/dev-server.js";
export * from "./native/optimizer.js";
export * from "./native/style-compiler.js";

// Plugin
export * from "./plugin/loader.js";

// Runtime
export * from "./runtime/render.js";
export * from "./runtime/client-runtime.js";
export * from "./runtime/hydrate.js";
export * from "./runtime/hmr.js";
export * from "./runtime/islands.js";
export * from "./runtime/island-hydration-client.js";

// Server
export * from "./server/app.js";
// Use new api-routes.ts for HTTP method handlers (replaces old api.js behavior)
export { tryHandleApiRoute as tryHandleApiRoute_v2 } from "./server/api-routes.js";
export type {
  ApiHandler,
  ApiRouteContext,
  ApiRouteModule,
} from "./server/api-routes.js";
// Keep old api.js exports for backward compatibility
export { tryHandleApiRoute } from "./server/api.js";
export * from "./server/runtimeServe.js";

// Shared utilities
export * from "./shared/log.js";
