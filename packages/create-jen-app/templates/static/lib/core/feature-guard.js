import { isFeatureEnabled } from "./features.js";
/**
 * Feature guard errors provide helpful context when code tries to use disabled features.
 * Includes the feature name and guidance on how to enable it.
 */
export class FeatureDisabledError extends Error {
    feature;
    constructor(feature, context) {
        const msg = `Feature "${feature}" is not enabled. ` +
            `Enable it in jen.config.ts with: features: { ${feature}: true }${context ? ` (${context})` : ""}`;
        super(msg);
        this.feature = feature;
        this.name = "FeatureDisabledError";
    }
}
/**
 * Feature configuration errors indicate invalid feature configuration.
 */
export class FeatureConfigError extends Error {
    feature;
    constructor(feature, details) {
        super(`Invalid configuration for feature "${feature}": ${details}`);
        this.feature = feature;
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
export function guardFeature(features, feature, context) {
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
export function guardFeatures(features, required, context) {
    const missing = required.filter((f) => !isFeatureEnabled(features, f));
    if (missing.length > 0) {
        const list = missing.join(", ");
        throw new Error(`Features required: ${list}. ` +
            `Enable them in jen.config.ts${context ? ` (${context})` : ""}`);
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
export function isFeatureAvailable(features, feature) {
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
export function guardedFunction(feature, fn, context) {
    return ((...args) => {
        const features = args[0];
        guardFeature(features, feature, context);
        return fn(...args);
    });
}
/**
 * Async version of guardedFunction for async handlers.
 */
export function guardedAsyncFunction(feature, fn, context) {
    return (async (...args) => {
        const features = args[0];
        guardFeature(features, feature, context);
        return fn(...args);
    });
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
export function createFeatureMiddleware(feature, context) {
    return (features) => {
        guardFeature(features, feature, context);
    };
}
/**
 * Validates feature configuration against a schema.
 */
export function validateFeatureConfig(feature, config, validator) {
    if (!validator)
        return;
    const result = validator.validate(config);
    if (!result.valid) {
        throw new FeatureConfigError(feature, result.errors?.join("; ") || "Invalid configuration");
    }
}
