/*
 * Jen.js Public API - Minimal tree-shakeable barrel exports
 *
 * This file exports only the essential public API surface needed by applications.
 * All internal utilities, advanced features, and implementation details are intentionally
 * excluded to enable tree-shaking and keep bundle sizes minimal for typical use cases.
 *
 * Total exports: ~30 (core types, functions, and components)
 * Previous file: 217 lines exporting everything
 * This file: ~100 lines exporting only public API
 */
// ============================================================================
// ROUTING (4 exports)
// ============================================================================
// Core routing functions for matching routes and scanning file system
export { matchRoute } from "./core/routes/match.js";
export { scanRoutes } from "./core/routes/scan.js";
// ============================================================================
// SERVER / APPLICATION (1 export)
// ============================================================================
// Main application factory for creating the HTTP handler
export { createApp } from "./server/app.js";
// ============================================================================
// BUILD & STATIC GENERATION (1 export)
// ============================================================================
// Primary build function for static site generation
export { buildSite } from "./build/build.js";
// ============================================================================
// CLIENT COMPONENTS (5 exports + types)
// ============================================================================
// Reusable Preact components for common patterns
export { Image, Seo, PWA } from "./client/index.js";
export { useRouter, useNavigation } from "./client/index.js";
// ============================================================================
// MIDDLEWARE & REQUEST HANDLING (7 exports)
// ============================================================================
// Core middleware types and HTTP utilities for route handlers
// ============================================================================
// TYPED LOADERS (5 exports)
// ============================================================================
// Type-safe data loading with compile-time validation
export {
  defineLoader,
  defineMiddleware,
  validateLoaderData,
} from "./core/loader-schema.js";
export { parseCookies, headersToObject } from "./core/http.js";
// ============================================================================
// PLUGINS (3 exports)
// ============================================================================
// Plugin system for extending framework functionality
export {
  getPluginManager,
  resetPluginManager,
} from "./plugin/plugin-manager.js";
export { HookStage } from "./plugin/types.js";
// ============================================================================
// RUNTIME & ISLANDS (2 exports)
// ============================================================================
// Client-side hydration and island components for interactivity
export { Island } from "./runtime/islands.js";
// ============================================================================
// CLIENT ROUTING & STATE (8 exports + types)
// ============================================================================
// Minimal client-side router and signal-based reactive state
export {
  navigate,
  getCurrentRoute,
  onRouteChange,
  initRouter,
} from "./client-routing/router.js";
export {
  signal,
  computed,
  bindSignal,
  bindInput,
  batch,
  watch,
  createStore,
} from "./client-routing/signal.js";
export { Link } from "./client-routing/Link.js";
// ============================================================================
// UTILITIES (2 exports)
// ============================================================================
// Common utilities for logging and framework usage
export { log } from "./shared/log.js";
export { jenImport } from "./import/jen-import.js";
