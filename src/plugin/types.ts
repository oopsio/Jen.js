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

import type { FrameworkConfig } from "@src/core/config.js";
import type { MiddlewareContext } from "@src/middleware/context.js";

/**
 * Plugin lifecycle and hook system.
 * Plugins hook into key stages of build, dev, and request handling.
 */

/**
 * Hookable stages available to plugins.
 */
export enum HookStage {
  // Build lifecycle
  BEFORE_BUILD = "beforeBuild",
  AFTER_BUILD = "afterBuild",
  BEFORE_ASSET_OPTIMIZE = "beforeAssetOptimize",
  AFTER_ASSET_OPTIMIZE = "afterAssetOptimize",
  BEFORE_RENDER = "beforeRender",
  AFTER_RENDER = "afterRender",

  // Request lifecycle
  BEFORE_REQUEST = "beforeRequest",
  AFTER_REQUEST = "afterRequest",

  // Response generation
  BEFORE_RESPONSE = "beforeResponse",
  AFTER_RESPONSE = "afterResponse",

  // Cache operations
  BEFORE_CACHE = "beforeCache",
  AFTER_CACHE = "afterCache",

  // Custom stage (plugins can register their own)
  CUSTOM = "custom",
}

/**
 * Plugin definition and metadata.
 */
export interface JenPlugin {
  /** Unique plugin identifier */
  name: string;
  /** Plugin version */
  version: string;
  /** Plugin description */
  description?: string;
  /** Plugin author */
  author?: string;
  /** Plugin hooks and handlers */
  hooks?: Partial<Record<HookStage | string, PluginHookHandler>>;
  /** Plugin configuration schema */
  configSchema?: Record<string, unknown>;
  /** Plugin initialization */
  init?: (config: PluginContext) => Promise<void> | void;
}

/**
 * Hook handler function signature.
 */
export type PluginHookHandler = (context: PluginHookContext) => Promise<void> | void;

/**
 * Context passed to plugin hooks.
 */
export interface PluginHookContext {
  /** The hook stage being executed */
  stage: HookStage | string;
  /** Framework configuration */
  config: FrameworkConfig;
  /** Request context (if applicable) */
  request?: MiddlewareContext;
  /** Hook-specific data */
  data?: Record<string, unknown>;
  /** Plugin can modify this data and it will be passed forward */
  mutate?: (key: string, value: unknown) => void;
}

/**
 * Plugin system context and manager.
 */
export interface PluginContext {
  /** Framework configuration */
  config: FrameworkConfig;
  /** Root directory */
  rootDir: string;
  /** Build mode (dev or production) */
  mode: "development" | "production";
  /** Register a new hook handler */
  onHook: (stage: string, handler: PluginHookHandler) => void;
  /** Emit a hook event to all registered handlers */
  emitHook: (stage: string, context: PluginHookContext) => Promise<void>;
}

/**
 * Plugin configuration in jen.config.ts
 */
export interface PluginConfig {
  /** List of plugins to load */
  plugins?: (JenPlugin | string)[];
  /** Hook ordering and execution control */
  hooks?: {
    /** Parallel vs sequential execution */
    parallel?: boolean;
    /** Timeout for hook execution in ms */
    timeout?: number;
    /** Catch and log errors instead of throwing */
    silent?: boolean;
  };
}
