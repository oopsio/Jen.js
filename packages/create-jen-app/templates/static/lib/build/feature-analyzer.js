import {
  resolveFeatures,
  getEnabledFeatures,
  createBuildMetadata,
} from "../core/features.js";
/**
 * Build-time feature analyzer.
 * Determines which features are enabled and generates metadata.
 * Used to inform bundling decisions and eliminate unused code.
 */
export class FeatureAnalyzer {
  config;
  resolved;
  metadata;
  constructor(config) {
    this.config = config;
    this.resolved = resolveFeatures(config.features);
    this.metadata = createBuildMetadata(this.resolved, config.features);
  }
  /**
   * Returns resolved feature configuration.
   */
  getResolved() {
    return this.resolved;
  }
  /**
   * Returns build metadata for debugging/introspection.
   */
  getMetadata() {
    return this.metadata;
  }
  /**
   * Checks if a feature is enabled.
   */
  isEnabled(feature) {
    return this.resolved[feature] ?? false;
  }
  /**
   * Gets list of enabled features.
   */
  getEnabled() {
    return getEnabledFeatures(this.resolved);
  }
  /**
   * Generates feature metadata JSON string.
   */
  generateMetadataJson() {
    return JSON.stringify(this.metadata, null, 2);
  }
  /**
   * Generates a feature flag constant object for runtime checks.
   * Can be tree-shaken by bundler for disabled features.
   *
   * @example
   * ```typescript
   * export const FEATURES = {
   *   api: true,
   *   middleware: true,
   *   cache: false,
   *   // ... rest
   * } as const;
   * ```
   */
  generateFeatureFlagsCode() {
    const features = this.resolved;
    const lines = Object.entries(features).map(
      ([name, enabled]) => `  ${name}: ${enabled},`,
    );
    return `
/**
 * Build-time feature flags.
 * Disabled features are tree-shaken by the bundler.
 */
export const FEATURES = {
${lines.join("\n")}
} as const;

export type EnabledFeatures = {
  ${getEnabledFeatures(this.resolved)
    .map((f) => `${f}: typeof FEATURES.${f}`)
    .join(";\n  ")};
};
`;
  }
  /**
   * Generates TypeScript definitions for feature-gated code.
   * Enables type-safe access to enabled features only.
   */
  generateTypeDefinitions() {
    const enabled = getEnabledFeatures(this.resolved);
    return `
/**
 * Auto-generated feature type definitions
 * Features not listed here are disabled and not available at runtime
 */

declare global {
  interface FeatureFlags {
    ${enabled.map((f) => `${f}: true;`).join("\n    ")}
  }
}

export {};
`;
  }
  /**
   * Generates a dynamic import guard for feature modules.
   * Prevents importing disabled feature modules.
   */
  generateFeatureGuard(feature) {
    const isEnabled = this.isEnabled(feature);
    return `
if (!${isEnabled}) {
  throw new Error(
    'Feature "${feature}" is not enabled. ' +
    'Enable it in jen.config.ts: features: { ${feature}: true }'
  );
}
`;
  }
  /**
   * Generates code to conditionally include feature handlers.
   * Used in server request handlers.
   */
  generateConditionalHandlers() {
    const enabled = getEnabledFeatures(this.resolved);
    let code = `
// Auto-generated feature handlers
// Only enabled features are included

`;
    if (enabled.includes("api")) {
      code += `
// API Routes Handler
import { tryHandleApiRoute } from "../server/api-routes.js";
`;
    }
    if (enabled.includes("middleware")) {
      code += `
// Middleware Handler
import { Kernel } from "../middleware/kernel.js";
`;
    }
    if (enabled.includes("cache")) {
      code += `
// Cache Handler
import { MemoryCache } from "../cache/memory.js";
`;
    }
    if (enabled.includes("streaming")) {
      code += `
// Streaming Handler
import renderToString from "preact-render-to-string";
`;
    }
    if (enabled.includes("auth")) {
      code += `
// Auth Handler
// (to be implemented in future release)
`;
    }
    return code;
  }
  /**
   * Generates summary report of feature configuration.
   */
  generateReport() {
    const enabled = getEnabledFeatures(this.resolved);
    const disabled = Object.entries(this.resolved)
      .filter(([, e]) => !e)
      .map(([name]) => name);
    return `
Feature Configuration Report
=============================

Build Time: ${this.metadata.buildTime}

Enabled (${enabled.length}):
${enabled.length > 0 ? enabled.map((f) => `  âœ“ ${f}`).join("\n") : "  (none - core only)"}

Disabled (${disabled.length}):
${disabled.length > 0 ? disabled.map((f) => `  âœ— ${f}`).join("\n") : "  (all features enabled)"}

Bundle Impact:
  Core modules: Always included
  Enabled features: Included in bundle
  Disabled features: Completely removed (tree-shaken)
`;
  }
}
