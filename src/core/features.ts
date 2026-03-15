/**
 * Feature System for Jen.js
 *
 * Allows optional features to be enabled/disabled at build time.
 * Disabled features are completely tree-shaken, adding zero runtime overhead.
 *
 * Features are configured in jen.config.ts and enabled/disabled individually.
 * Each feature must be explicitly enabled for its code to be included in the bundle.
 */

/**
 * All available features that can be toggled.
 * Each feature corresponds to a capability in the framework.
 */
export type FeatureName =
  | "api" // HTTP API route handlers (GET, POST, PUT, DELETE, etc.)
  | "middleware" // Express-style middleware pipeline and decorators
  | "markdown" // Markdown file compilation to HTML
  | "imageOpt" // Image optimization and serving
  | "env" // Environment variable validation and loading
  | "cache" // Response caching (memory and Redis)
  | "streaming" // Streaming SSR for faster TTFB
  | "auth" // Authentication helpers and guards
  | "graphql" // GraphQL schema and resolver support
  | "db" // Database drivers (SQL, MongoDB)
  | "i18n" // Internationalization and language routing
  | "jdb" // Embedded JSON database engine
  | "compilers" // Custom compilers (Svelte, Vue)
  | "import"; // Custom import system (jen-import)

/**
 * Feature configuration that users provide in jen.config.ts.
 * Each feature can be:
 * - `true` - Enabled with default options
 * - `false` - Disabled, excluded from bundle
 * - Object - Enabled with custom configuration options
 */
export type FeatureConfig = Partial<
  Record<FeatureName, boolean | Record<string, any>>
>;

/**
 * Resolved feature state after validation.
 * All features present with explicit true/false status.
 */
export type ResolvedFeatures = Record<FeatureName, boolean>;

/**
 * Default features enabled when none specified.
 * Minimal set to maintain backward compatibility.
 * Users should explicitly enable features they use.
 */
export const DEFAULT_FEATURES: ResolvedFeatures = {
  api: false,
  middleware: false,
  markdown: false,
  imageOpt: false,
  env: true, // Environment variables needed by default
  cache: false,
  streaming: false,
  auth: false,
  graphql: false,
  db: false,
  i18n: false,
  jdb: false,
  compilers: false,
  import: false,
};

/**
 * Validates and normalizes user feature configuration.
 * Ensures all features have explicit enabled/disabled status.
 *
 * @param userConfig User-provided feature config from jen.config.ts
 * @returns Resolved features with all present and validated
 */
export function resolveFeatures(userConfig?: FeatureConfig): ResolvedFeatures {
  const resolved = { ...DEFAULT_FEATURES };

  if (!userConfig) return resolved;

  for (const [key, value] of Object.entries(userConfig)) {
    if (!(key in DEFAULT_FEATURES)) {
      console.warn(
        `️  Unknown feature: "${key}". Valid features are: ${Object.keys(DEFAULT_FEATURES).join(", ")}`,
      );
      continue;
    }

    // Support boolean shorthand and object with enabled property
    const isEnabled =
      typeof value === "boolean" ? value : value?.enabled !== false;
    resolved[key as FeatureName] = isEnabled;
  }

  return resolved;
}

/**
 * Returns list of enabled feature names.
 */
export function getEnabledFeatures(resolved: ResolvedFeatures): FeatureName[] {
  return Object.entries(resolved)
    .filter(([, enabled]) => enabled)
    .map(([name]) => name as FeatureName);
}

/**
 * Returns list of disabled feature names.
 */
export function getDisabledFeatures(resolved: ResolvedFeatures): FeatureName[] {
  return Object.entries(resolved)
    .filter(([, enabled]) => !enabled)
    .map(([name]) => name as FeatureName);
}

/**
 * Checks if a specific feature is enabled.
 */
export function isFeatureEnabled(
  resolved: ResolvedFeatures,
  feature: FeatureName,
): boolean {
  return resolved[feature] ?? false;
}

/**
 * Runtime assertion that a feature is enabled.
 * Throws helpful error if feature is disabled.
 */
export function requireFeature(
  resolved: ResolvedFeatures,
  feature: FeatureName,
  context?: string,
): void {
  if (!isFeatureEnabled(resolved, feature)) {
    const msg =
      `Feature "${feature}" is not enabled. ` +
      `Enable it in jen.config.ts: features: { ${feature}: true }${context ? ` (${context})` : ""}`;
    throw new Error(msg);
  }
}

/**
 * Build-time metadata about enabled features.
 * Generated during build and included in output.
 */
export interface FeatureBuildMetadata {
  buildTime: string;
  enabledFeatures: FeatureName[];
  disabledFeatures: FeatureName[];
  config: FeatureConfig | undefined;
}

/**
 * Creates build metadata for introspection and debugging.
 */
export function createBuildMetadata(
  resolved: ResolvedFeatures,
  config?: FeatureConfig,
): FeatureBuildMetadata {
  return {
    buildTime: new Date().toISOString(),
    enabledFeatures: getEnabledFeatures(resolved),
    disabledFeatures: getDisabledFeatures(resolved),
    config,
  };
}
