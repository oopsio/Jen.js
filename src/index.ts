/*
 * This file is part of Jen.js.
 * Copyright (C) 2026 oopsio
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

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
// CORE TYPES & CONFIGURATION (5 exports)
// ============================================================================
// Essential types for framework configuration and route modules

export type { FrameworkConfig, RenderMode } from "./core/config.js";

export type { RouteModule, LoaderContext } from "./core/types.js";

// ============================================================================
// ROUTING (4 exports)
// ============================================================================
// Core routing functions for matching routes and scanning file system

export { matchRoute, type MatchResult } from "./core/routes/match.js";

export { scanRoutes, type RouteEntry } from "./core/routes/scan.js";

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
// UI COMPONENTS (3 exports + types)
// ============================================================================
// Reusable Preact components for common patterns

export { Image, Seo, PWA } from "./components.js";

export type { ImageProps, SeoProps, PWAProps } from "./components.js";

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

export type {
  TypedPageProps,
  ComposeDataSchemas,
} from "./core/loader-schema.js";

export type {
  AdvancedRouteConfig,
  RouteGuard,
  RouteGuardContext,
} from "./core/routes/advanced.js";

export { parseCookies, headersToObject } from "./core/http.js";

// ============================================================================
// PLUGINS (3 exports)
// ============================================================================
// Plugin system for extending framework functionality

export {
  getPluginManager,
  resetPluginManager,
} from "./plugin/plugin-manager.js";

export type {
  PluginConfig,
  JenPlugin,
  PluginHookHandler,
  PluginHookContext,
  PluginContext,
} from "./plugin/types.js";

export { HookStage } from "./plugin/types.js";

// ============================================================================
// RUNTIME & ISLANDS (2 exports)
// ============================================================================
// Client-side hydration and island components for interactivity

export {
  Island,
  type HydrationStrategy,
  type IslandProps,
} from "./runtime/islands.js";

// ============================================================================
// CLIENT ROUTING & STATE (8 exports + types)
// ============================================================================
// Minimal client-side router and signal-based reactive state

export {
  navigate,
  getCurrentRoute,
  onRouteChange,
  initRouter,
  type RouteChangeEvent,
  type RouteChangeListener,
} from "./client-routing/router.js";

export {
  signal,
  computed,
  bindSignal,
  bindInput,
  batch,
  watch,
  createStore,
  type Signal,
  type Subscriber,
} from "./client-routing/signal.js";

export { Link, type LinkProps } from "./client-routing/Link.js";

// ============================================================================
// UTILITIES (2 exports)
// ============================================================================
// Common utilities for logging and framework usage

export { log } from "./shared/log.js";

export { jenImport } from "./import/jen-import.js";
