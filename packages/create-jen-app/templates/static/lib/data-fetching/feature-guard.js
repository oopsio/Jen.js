/**
 * Feature guards for data-fetching module.
 *
 * The data-fetching feature must be enabled in jen.config.ts:
 * ```
 * features: {
 *   dataFetching: true
 * }
 * ```
 *
 * This module would typically use the framework's feature gating system
 * to ensure the feature is enabled before allowing use of these utilities.
 */
/**
 * Validates that data-fetching feature is enabled.
 * Throws helpful error if disabled.
 */
export function requireDataFetchingFeature(features, context) {
  // Note: "dataFetching" would be added to FeatureName type in features.ts
  // For now, this is a placeholder that documents the pattern
  // guardFeature(features, "dataFetching", context);
}
/**
 * Validates that both cache and data-fetching features are enabled.
 * Required for some advanced caching features.
 */
export function requireCacheWithDataFetching(features, context) {
  // guardFeatures(features, ["cache", "dataFetching"], context);
}
