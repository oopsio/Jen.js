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
 * Default features enabled when none specified.
 * Minimal set to maintain backward compatibility.
 * Users should explicitly enable features they use.
 */
export const DEFAULT_FEATURES = {
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
export function resolveFeatures(userConfig) {
    const resolved = { ...DEFAULT_FEATURES };
    if (!userConfig)
        return resolved;
    for (const [key, value] of Object.entries(userConfig)) {
        if (!(key in DEFAULT_FEATURES)) {
            console.warn(`️  Unknown feature: "${key}". Valid features are: ${Object.keys(DEFAULT_FEATURES).join(", ")}`);
            continue;
        }
        // Support boolean shorthand and object with enabled property
        const isEnabled = typeof value === "boolean" ? value : value?.enabled !== false;
        resolved[key] = isEnabled;
    }
    return resolved;
}
/**
 * Returns list of enabled feature names.
 */
export function getEnabledFeatures(resolved) {
    return Object.entries(resolved)
        .filter(([, enabled]) => enabled)
        .map(([name]) => name);
}
/**
 * Returns list of disabled feature names.
 */
export function getDisabledFeatures(resolved) {
    return Object.entries(resolved)
        .filter(([, enabled]) => !enabled)
        .map(([name]) => name);
}
/**
 * Checks if a specific feature is enabled.
 */
export function isFeatureEnabled(resolved, feature) {
    return resolved[feature] ?? false;
}
/**
 * Runtime assertion that a feature is enabled.
 * Throws helpful error if feature is disabled.
 */
export function requireFeature(resolved, feature, context) {
    if (!isFeatureEnabled(resolved, feature)) {
        const msg = `Feature "${feature}" is not enabled. ` +
            `Enable it in jen.config.ts: features: { ${feature}: true }${context ? ` (${context})` : ""}`;
        throw new Error(msg);
    }
}
/**
 * Creates build metadata for introspection and debugging.
 */
export function createBuildMetadata(resolved, config) {
    return {
        buildTime: new Date().toISOString(),
        enabledFeatures: getEnabledFeatures(resolved),
        disabledFeatures: getDisabledFeatures(resolved),
        config,
    };
}
