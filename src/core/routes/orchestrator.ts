import type { IncomingMessage, ServerResponse } from "node:http";
import type { FrameworkConfig } from "../config.js";
import type { RouteEntry } from "./scan.js";
import { matchRoute } from "./match.js";
import {
  type RouteGuardContext,
  getAdvancedRouteConfig,
  validateQueryParams,
  processQueryParams,
} from "./advanced.js";
import {
  getRedirect,
  getNotFoundHandler,
  send404,
  sendRedirect,
  createDefault404Html,
} from "./handlers.js";
import { log } from "../../shared/log.js";

/**
 * Result of route resolution
 */
export type RouteResolutionResult =
  | {
      type: "matched";
      route: RouteEntry;
      params: Record<string, string>;
      query: Record<string, string>;
    }
  | {
      type: "redirect";
      location: string;
      status: number;
    }
  | {
      type: "not_found";
      pathname: string;
    };

/**
 * Advanced routing orchestrator that handles:
 * - Dynamic route matching with parameter extraction
 * - Query parameter parsing and validation
 * - Catch-all routes
 * - Middleware guards
 * - Redirects (app-level and route-level)
 * - 404 handling
 */
export class AdvancedRouter {
  private routes: RouteEntry[];
  private config: FrameworkConfig;

  constructor(routes: RouteEntry[], config: FrameworkConfig) {
    this.routes = routes;
    this.config = config;
  }

  /**
   * Resolve a request pathname to a route match, redirect, or 404
   *
   * @param pathname URL pathname
   * @param url Full URL object
   * @param headers Request headers
   * @param cookies Parsed cookies
   * @returns Route resolution result
   */
  async resolve(
    pathname: string,
    url: URL,
    headers: Record<string, string>,
    cookies: Record<string, string>,
  ): Promise<RouteResolutionResult> {
    log.info(`[Router] Resolving: ${pathname}`);

    // Step 1: Check application-level redirects
    if (this.config.redirects) {
      const redirect = getRedirect(pathname, this.config.redirects);
      if (redirect) {
        log.info(`[Router] Redirect: ${pathname} -> ${redirect.to}`);
        return {
          type: "redirect",
          location: redirect.to,
          status: redirect.status,
        };
      }
    }

    // Step 2: Match against routes
    const match = matchRoute(this.routes, pathname);
    if (!match) {
      log.info(`[Router] No route match for: ${pathname}`);
      return { type: "not_found", pathname };
    }

    // Parse query parameters
    const query: Record<string, string> = {};
    for (const [k, v] of url.searchParams.entries()) query[k] = v;

    // Step 3: Load advanced route config
    const advancedConfig = await getAdvancedRouteConfig(match.route.filePath);

    // Step 4: Handle route-level redirects
    if (advancedConfig.redirect) {
      const guardCtx: RouteGuardContext = {
        route: match.route,
        params: match.params,
        query,
        url,
        headers,
        cookies,
      };

      const target =
        typeof advancedConfig.redirect.to === "function"
          ? advancedConfig.redirect.to(guardCtx)
          : advancedConfig.redirect.to;

      const status = advancedConfig.redirect.status ?? 301;
      log.info(`[Router] Route redirect: ${pathname} -> ${target} (${status})`);
      return {
        type: "redirect",
        location: target,
        status,
      };
    }

    // Step 5: Validate query parameters
    if (advancedConfig.querySchema) {
      const validation = validateQueryParams(query, advancedConfig.querySchema);
      if (!validation.valid) {
        log.warn(
          `[Router] Query validation failed: ${validation.errors.join(", ")}`,
        );
        // For now, log but don't block. In strict mode, this could return 400.
      }

      // Apply defaults and type coercion
      const processed = processQueryParams(query, advancedConfig.querySchema);
      Object.assign(query, processed);
    }

    // Step 6: Run middleware guards
    if (advancedConfig.guards && advancedConfig.guards.length > 0) {
      const guardCtx: RouteGuardContext = {
        route: match.route,
        params: match.params,
        query,
        url,
        headers,
        cookies,
      };

      for (const guard of advancedConfig.guards) {
        const result = await guard(guardCtx);
        if (result !== true) {
          // Guard blocked or redirected
          log.info(
            `[Router] Guard blocked: ${pathname} (status: ${result.status})`,
          );
          return {
            type: "redirect",
            location: result.location || "/",
            status: result.status,
          };
        }
      }
    }

    log.info(`[Router] Matched: ${pathname} -> ${match.route.urlPath}`);
    return {
      type: "matched",
      route: match.route,
      params: match.params,
      query,
    };
  }

  /**
   * Handle a 404 response
   *
   * @param res ServerResponse object
   * @param pathname Path that was not found
   */
  async handle404(res: ServerResponse, pathname: string): Promise<void> {
    const notFoundConfig = getNotFoundHandler(this.config, pathname);

    if (notFoundConfig) {
      log.info(`[Router] Using custom 404 handler for: ${pathname}`);
      send404(res, notFoundConfig, pathname);
    } else {
      log.info(`[Router] Using default 404 handler for: ${pathname}`);
      const html = createDefault404Html(pathname);
      send404(res, { html }, pathname);
    }
  }

  /**
   * Handle a redirect response
   *
   * @param res ServerResponse object
   * @param location Target URL
   * @param status HTTP status code
   */
  handleRedirect(res: ServerResponse, location: string, status: number): void {
    log.info(`[Router] Sending redirect: ${location} (${status})`);
    sendRedirect(res, location, status);
  }
}

/**
 * Create an advanced router from framework config and routes
 *
 * @param routes Scanned route entries
 * @param config Framework configuration
 * @returns AdvancedRouter instance
 */
export function createAdvancedRouter(
  routes: RouteEntry[],
  config: FrameworkConfig,
): AdvancedRouter {
  return new AdvancedRouter(routes, config);
}
