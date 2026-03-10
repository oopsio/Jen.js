/**
 * Cache for storing evaluated route configurations
 */
const advancedConfigCache = new Map();
/**
 * Extract advanced routing config from a route module
 *
 * @param module Route module
 * @returns Advanced route configuration
 */
export function extractAdvancedConfig(module) {
  return module?.routeConfig ?? {};
}
/**
 * Get advanced route config with caching
 *
 * @param filePath Route file path
 * @returns Cached or newly evaluated config
 */
export async function getAdvancedRouteConfig(filePath) {
  if (advancedConfigCache.has(filePath)) {
    return advancedConfigCache.get(filePath);
  }
  try {
    const module = await import(`file://${filePath}`);
    const config = extractAdvancedConfig(module);
    advancedConfigCache.set(filePath, config);
    return config;
  } catch {
    const config = {};
    advancedConfigCache.set(filePath, config);
    return config;
  }
}
/**
 * Synchronously get advanced route config
 *
 * @param filePath Route file path
 * @returns Configuration (empty if unavailable)
 */
export function getAdvancedRouteConfigSync(filePath) {
  if (advancedConfigCache.has(filePath)) {
    return advancedConfigCache.get(filePath);
  }
  const config = {};
  advancedConfigCache.set(filePath, config);
  return config;
}
/**
 * Clear the advanced config cache
 */
export function clearAdvancedConfigCache() {
  advancedConfigCache.clear();
}
/**
 * Validate query parameters against a schema
 *
 * @param query Parsed query parameters
 * @param schema Validation rules
 * @returns { valid: boolean; errors: string[] }
 */
export function validateQueryParams(query, schema) {
  const errors = [];
  for (const [key, rule] of Object.entries(schema)) {
    const value = query[key];
    // Check required
    if (rule.required && !value) {
      errors.push(`Query parameter '${key}' is required`);
      continue;
    }
    if (!value) continue;
    // Check type
    if (rule.type === "number" && isNaN(Number(value))) {
      errors.push(`Query parameter '${key}' must be a number`);
    }
    if (rule.type === "boolean" && !["true", "false"].includes(value)) {
      errors.push(`Query parameter '${key}' must be 'true' or 'false'`);
    }
    // Check enum
    if (rule.enum && !rule.enum.includes(value)) {
      errors.push(
        `Query parameter '${key}' must be one of: ${rule.enum.join(", ")}`,
      );
    }
  }
  return { valid: errors.length === 0, errors };
}
/**
 * Apply defaults and coerce query parameters
 *
 * @param query Raw query parameters
 * @param schema Validation schema
 * @returns Processed query parameters
 */
export function processQueryParams(query, schema) {
  const processed = { ...query };
  for (const [key, rule] of Object.entries(schema)) {
    let value = processed[key];
    // Apply default
    if (!value && rule.default !== undefined) {
      value = rule.default;
      processed[key] = value;
    }
    // Coerce type
    if (value) {
      if (rule.type === "number") {
        processed[key] = Number(value);
      } else if (rule.type === "boolean") {
        processed[key] = value === "true";
      }
    }
  }
  return processed;
}
