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

import type { FeatureName, ResolvedFeatures } from "./features.js";
import { isFeatureEnabled } from "./features.js";

/**
 * Feature guard errors provide helpful context when code tries to use disabled features.
 * Includes the feature name and guidance on how to enable it.
 */
export class FeatureDisabledError extends Error {
  constructor(
    public feature: FeatureName,
    context?: string,
  ) {
    const msg = `Feature "${feature}" is not enabled. ` +
      `Enable it in jen.config.ts with: features: { ${feature}: true }${context ? ` (${context})` : ""}`;
    super(msg);
    this.name = "FeatureDisabledError";
  }
}

/**
 * Feature configuration errors indicate invalid feature configuration.
 */
export class FeatureConfigError extends Error {
  constructor(public feature: FeatureName, details: string) {
    super(`Invalid configuration for feature "${feature}": ${details}`);
    this.name = "FeatureConfigError";
  }
}

/**
 * Validates that a feature is enabled before execution.
 * Throws helpful error if feature is disabled.
 *
 * Use in feature module entry points to prevent disabled features from running.
 *
 * @param features Resolved feature configuration
 * @param feature Feature name to validate
 * @param context Optional context (e.g., function name) for error message
 * @throws FeatureDisabledError if feature is not enabled
 *
 * @example
 * export function setupApiRoutes(features: ResolvedFeatures) {
 *   guardFeature(features, "api", "API route handling");
 *   // ... API setup code
 * }
 */
export function guardFeature(features: ResolvedFeatures, feature: FeatureName, context?: string): void {
  if (!isFeatureEnabled(features, feature)) {
    throw new FeatureDisabledError(feature, context);
  }
}

/**
 * Guards multiple features, throwing if any are disabled.
 * Useful for features that depend on other features.
 *
 * @example
 * export function setupAdvancedMiddleware(features: ResolvedFeatures) {
 *   guardFeatures(features, ["middleware", "cache"], "Advanced middleware");
 *   // ... code that uses both features
 * }
 */
export function guardFeatures(features: ResolvedFeatures, required: FeatureName[], context?: string): void {
  const missing = required.filter((f) => !isFeatureEnabled(features, f));
  if (missing.length > 0) {
    const list = missing.join(", ");
    throw new Error(
      `Features required: ${list}. ` +
      `Enable them in jen.config.ts${context ? ` (${context})` : ""}`,
    );
  }
}

/**
 * Type guard that narrows feature type based on enabled status.
 * Allows TypeScript to enforce feature availability at compile time.
 *
 * @example
 * if (isFeatureAvailable(features, "api")) {
 *   // TypeScript knows "api" is enabled here
 *   const result = handleApiRequest(...);
 * }
 */
export function isFeatureAvailable(features: ResolvedFeatures, feature: FeatureName): feature is FeatureName {
  return isFeatureEnabled(features, feature);
}

/**
 * Wraps a function to guard against disabled features.
 * Returns a function that checks feature before execution.
 *
 * @example
 * export const setupCache = guardedFunction("cache", (features) => {
 *   // This only runs if cache feature is enabled
 * });
 */
export function guardedFunction<T extends (...args: any[]) => any>(
  feature: FeatureName,
  fn: T,
  context?: string,
): (...args: Parameters<T>) => ReturnType<T> {
  return ((...args: Parameters<T>) => {
    const features = args[0];
    guardFeature(features, feature, context);
    return fn(...args);
  }) as T;
}

/**
 * Async version of guardedFunction for async handlers.
 */
export function guardedAsyncFunction<T extends (...args: any[]) => Promise<any>>(
  feature: FeatureName,
  fn: T,
  context?: string,
): (...args: Parameters<T>) => ReturnType<T> {
  return (async (...args: Parameters<T>) => {
    const features = args[0];
    guardFeature(features, feature, context);
    return fn(...args);
  }) as T;
}

/**
 * Creates a feature validation middleware.
 * Checks if required feature is enabled before processing request.
 *
 * @example
 * app.use(featureMiddleware("api", (ctx, next) => {
 *   // Only runs if api feature is enabled
 *   return handleApiRequest(ctx);
 * }));
 */
export function createFeatureMiddleware(feature: FeatureName, context?: string) {
  return (features: ResolvedFeatures) => {
    guardFeature(features, feature, context);
  };
}

/**
 * Configuration validator for feature-specific options.
 * Helps catch misconfiguration early.
 */
export interface FeatureConfigValidator {
  feature: FeatureName;
  validate(config: any): { valid: boolean; errors?: string[] };
}

/**
 * Validates feature configuration against a schema.
 */
export function validateFeatureConfig(feature: FeatureName, config: any, validator?: FeatureConfigValidator): void {
  if (!validator) return;

  const result = validator.validate(config);
  if (!result.valid) {
    throw new FeatureConfigError(feature, result.errors?.join("; ") || "Invalid configuration");
  }
}
