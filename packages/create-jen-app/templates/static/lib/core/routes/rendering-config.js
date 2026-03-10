/**
 * Route-level rendering configuration detection
 *
 * Allows routes to specify their rendering strategy via exported config:
 *
 * @example
 * // pages/(home).tsx
 * export const rendering = "ssg";
 * export const revalidate = 3600; // ISR revalidation in seconds
 *
 * export default function Home() { ... }
 */
/**
 * Extract rendering configuration from a route module.
 * Safely handles modules that don't specify rendering config.
 *
 * @param module Route module (imported component)
 * @param defaultMode Default rendering mode if not specified
 * @param defaultRevalidate Default revalidation seconds for ISR
 * @returns Route rendering configuration
 */
export function extractRenderingConfig(
  module,
  defaultMode = "ssg",
  defaultRevalidate = 3600,
) {
  const mode = module?.rendering || defaultMode;
  // Validate mode
  const validModes = ["ssg", "ssr", "isr", "ppr"];
  if (!validModes.includes(mode)) {
    console.warn(
      `Invalid rendering mode: ${mode}, defaulting to ${defaultMode}`,
    );
    return { mode: defaultMode, revalidateSeconds: defaultRevalidate };
  }
  // Extract revalidation time if mode is ISR
  let revalidateSeconds;
  if (mode === "isr") {
    revalidateSeconds =
      typeof module?.revalidate === "number"
        ? module.revalidate
        : defaultRevalidate;
  }
  return { mode, revalidateSeconds };
}
/**
 * Cached rendering configs to avoid repeated module evaluations.
 * Maps file path → rendering config.
 */
const configCache = new Map();
/**
 * Clear the rendering config cache.
 * Useful during development when routes change.
 */
export function clearRenderingConfigCache() {
  configCache.clear();
}
/**
 * Get rendering config for a route, with caching.
 * Attempts to dynamically import and evaluate the route module.
 *
 * In a production SSR environment, route modules are pre-compiled.
 * In a build environment, we need to safely evaluate modules.
 *
 * @param filePath Absolute path to route file
 * @param defaultMode Default rendering mode
 * @param defaultRevalidate Default revalidation seconds
 * @returns Rendering configuration promise
 */
export async function getRenderingConfig(
  filePath,
  defaultMode = "ssg",
  defaultRevalidate = 3600,
) {
  // Check cache first
  if (configCache.has(filePath)) {
    return configCache.get(filePath);
  }
  try {
    // Attempt to import the module
    // This works in ESM environments with proper module resolution
    const module = await import(`file://${filePath}`);
    const config = extractRenderingConfig(
      module,
      defaultMode,
      defaultRevalidate,
    );
    // Cache for future lookups
    configCache.set(filePath, config);
    return config;
  } catch (err) {
    // If import fails, return default config
    // This can happen if module has syntax errors or imports unavailable at build time
    const config = {
      mode: defaultMode,
      revalidateSeconds: defaultMode === "isr" ? defaultRevalidate : undefined,
    };
    configCache.set(filePath, config);
    return config;
  }
}
/**
 * Synchronously get rendering config (for build-time use).
 * Falls back to default if module can't be imported.
 *
 * Note: This uses a synchronous require-like approach and may not work
 * in all environments. Prefer async getRenderingConfig() when possible.
 *
 * @param filePath Absolute path to route file
 * @param defaultMode Default rendering mode
 * @param defaultRevalidate Default revalidation seconds
 * @returns Rendering configuration
 */
export function getRenderingConfigSync(
  filePath,
  defaultMode = "ssg",
  defaultRevalidate = 3600,
) {
  // Check cache first
  if (configCache.has(filePath)) {
    return configCache.get(filePath);
  }
  // In sync context, we can't dynamically import
  // Return default config
  const config = {
    mode: defaultMode,
    revalidateSeconds: defaultMode === "isr" ? defaultRevalidate : undefined,
  };
  configCache.set(filePath, config);
  return config;
}
