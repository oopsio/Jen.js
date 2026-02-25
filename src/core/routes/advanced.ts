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

import type { RouteEntry } from "./scan.js";

/**
 * Middleware guard function for advanced routing.
 * Can prevent route execution, redirect, or mutate context.
 *
 * @param ctx Routing context with route info and request data
 * @returns Promise<true> to allow, Promise<false | RedirectResponse> to block/redirect
 *
 * @example
 * async (ctx) => {
 *   if (!ctx.user?.isAuthenticated) {
 *     return { status: 302, location: '/login' };
 *   }
 *   return true;
 * }
 */
export type RouteGuard = (ctx: RouteGuardContext) => Promise<
  true | RouteGuardResponse
>;

/**
 * Context passed to route guard functions
 */
export type RouteGuardContext = {
  route: RouteEntry;
  params: Record<string, string>;
  query: Record<string, string>;
  url: URL;
  headers: Record<string, string>;
  cookies: Record<string, string>;
  data?: Record<string, any>;
};

/**
 * Response returned by guard when blocking/redirecting
 */
export type RouteGuardResponse = {
  status: number;
  location?: string;
  body?: string;
};

/**
 * Advanced routing configuration attached to a route
 */
export type AdvancedRouteConfig = {
  /**
   * Guards that run before route rendering.
   * All guards must return true to proceed.
   * First guard returning false/redirect response blocks further execution.
   */
  guards?: RouteGuard[];

  /**
   * Redirect configuration: if set, this route redirects to the specified location
   */
  redirect?: {
    to: string | ((ctx: RouteGuardContext) => string);
    status?: number; // default 301
  };

  /**
   * Custom 404 handler for this route and its children
   */
  notFoundHandler?: () => any;

  /**
   * Catch-all fallback for unmatched sub-routes
   */
  fallback?: () => any;

  /**
   * Whether to cache this route's response (for ISR)
   */
  cache?: boolean;

  /**
   * Cache duration in seconds (overrides config default)
   */
  cacheSeconds?: number;

  /**
   * Enable query param validation
   */
  querySchema?: Record<string, QueryParamRule>;
};

/**
 * Validation rule for query parameters
 */
export type QueryParamRule = {
  type?: "string" | "number" | "boolean";
  required?: boolean;
  enum?: string[];
  default?: any;
};

/**
 * Cache for storing evaluated route configurations
 */
const advancedConfigCache = new Map<string, AdvancedRouteConfig>();

/**
 * Extract advanced routing config from a route module
 *
 * @param module Route module
 * @returns Advanced route configuration
 */
export function extractAdvancedConfig(
  module: any,
): AdvancedRouteConfig {
  return module?.routeConfig ?? {};
}

/**
 * Get advanced route config with caching
 *
 * @param filePath Route file path
 * @returns Cached or newly evaluated config
 */
export async function getAdvancedRouteConfig(
  filePath: string,
): Promise<AdvancedRouteConfig> {
  if (advancedConfigCache.has(filePath)) {
    return advancedConfigCache.get(filePath)!;
  }

  try {
    const module = await import(`file://${filePath}`);
    const config = extractAdvancedConfig(module);
    advancedConfigCache.set(filePath, config);
    return config;
  } catch {
    const config: AdvancedRouteConfig = {};
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
export function getAdvancedRouteConfigSync(
  filePath: string,
): AdvancedRouteConfig {
  if (advancedConfigCache.has(filePath)) {
    return advancedConfigCache.get(filePath)!;
  }

  const config: AdvancedRouteConfig = {};
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
export function validateQueryParams(
  query: Record<string, string>,
  schema: Record<string, QueryParamRule>,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

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
export function processQueryParams(
  query: Record<string, string>,
  schema: Record<string, QueryParamRule>,
): Record<string, any> {
  const processed: Record<string, any> = { ...query };

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
