/**
 * Plugin System Types & Interfaces
 *
 * Defines the plugin architecture for Jen.js, allowing extensions at build,
 * dev, request, and rendering stages. Inspired by Vite and Rollup.
 */

/**
 * Available hook stages in the plugin lifecycle
 */
export enum HookStage {
  // Build lifecycle
  BEFORE_BUILD = "beforeBuild",
  BUILD_MODULES = "buildModules",
  BUILD_OPTIMIZE = "buildOptimize",
  AFTER_BUILD = "afterBuild",

  // Dev server lifecycle
  BEFORE_DEV = "beforeDev",
  DEV_HMR = "devHmr",
  AFTER_DEV = "afterDev",

  // Request/Server lifecycle
  REQUEST_INIT = "requestInit",
  REQUEST_MIDDLEWARE = "requestMiddleware",
  BEFORE_RENDER = "beforeRender",
  AFTER_RENDER = "afterRender",

  // Config resolution
  RESOLVE_CONFIG = "resolveConfig",

  // Transformation hooks
  TRANSFORM_CODE = "transformCode",
  RESOLVE_ID = "resolveId",
}

/**
 * Context passed to hook handlers
 */
export interface PluginHookContext {
  /** Current stage of execution */
  stage: HookStage;

  /** Request context (if applicable) */
  request?: {
    url: string;
    method: string;
    headers: Record<string, string>;
  };

  /** Build/render context */
  build?: {
    mode: "development" | "production";
    root: string;
    outDir: string;
  };

  /** Additional metadata */
  meta?: Record<string, any>;
}

/**
 * Handler function signature for hooks
 */
export type PluginHookHandler = (
  context: PluginHookContext,
  ...args: any[]
) => any | Promise<any>;

/**
 * Plugin hook definition
 */
export interface PluginHook {
  /** Hook identifier */
  name: HookStage;

  /** Handler function */
  handler: PluginHookHandler;

  /** Execution priority (higher = earlier) */
  priority?: number;

  /** Run in parallel with other hooks */
  parallel?: boolean;

  /** Enforce execution order (pre/post/normal) */
  enforce?: "pre" | "post" | "normal";
}

/**
 * Plugin context available to plugins
 */
export interface PluginContext {
  /** Framework version */
  version: string;

  /** Plugin name */
  name: string;

  /** Current working directory */
  cwd: string;

  /** Emit events */
  emitEvent(event: string, data?: any): void;

  /** Register middleware */
  useMiddleware(handler: (req: any, res: any, next: () => void) => void): void;

  /** Register a virtual module */
  virtual(id: string, code: string): void;

  /** Resolve a plugin resource */
  resolve(id: string): string;
}

/**
 * Plugin interface - the core plugin shape
 */
export interface JenPlugin {
  /** Plugin name (unique identifier) */
  name: string;

  /** Plugin version */
  version?: string;

  /** Plugin description */
  description?: string;

  /** Apply plugin (called during setup) */
  apply?: "build" | "serve" | ((config: any) => boolean);

  /** Enforce plugin order */
  enforce?: "pre" | "post";

  /** Plugin configuration schema (optional) */
  schema?: Record<string, any>;

  /** Register hooks with framework */
  hooks?: Record<HookStage, PluginHookHandler | PluginHook>;

  /** Setup hook (called after plugin is registered) */
  setup?(context: PluginContext): void | Promise<void>;

  /** Cleanup hook (called on shutdown) */
  cleanup?(context: PluginContext): void | Promise<void>;
}

/**
 * Plugin configuration
 */
export interface PluginConfig {
  /** Array of plugins to load */
  plugins: (JenPlugin | string)[];

  /** Global hook configuration */
  hooks?: {
    /** Run hooks in parallel */
    parallel?: boolean;

    /** Hook timeout in ms */
    timeout?: number;

    /** Log hook execution */
    verbose?: boolean;

    /** Skip errors in hooks */
    silent?: boolean;
  };
}

/**
 * Plugin registry entry
 */
export interface PluginEntry {
  plugin: JenPlugin;
  config?: Record<string, any>;
  priority: number;
}

/**
 * Hook execution result
 */
export interface HookExecutionResult {
  stage: HookStage;
  results: any[];
  duration: number;
  errors?: Error[];
}
