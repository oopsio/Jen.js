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

import type { SecurityConfig } from "./security-config.js";
import { DEFAULT_SECURITY_CONFIG } from "./security-config.js";
import { log } from "../shared/log.js";
import type { IncomingMessage, ServerResponse } from "http";

/**
 * Security headers middleware for Jen.js.
 *
 * Applies security HTTP headers to responses based on configuration.
 * Includes CSP, HSTS, CORS, and other protection headers.
 *
 * @example
 * ```typescript
 * import { securityHeadersMiddleware } from "jenjs";
 *
 * // Use in middleware pipeline
 * app.use(securityHeadersMiddleware(securityConfig));
 * ```
 */
export function securityHeadersMiddleware(config?: Partial<SecurityConfig>) {
  const mergedConfig: SecurityConfig = {
    ...DEFAULT_SECURITY_CONFIG,
    ...config,
    headers: {
      ...DEFAULT_SECURITY_CONFIG.headers,
      ...config?.headers,
    },
  };

  return async (context: { req: IncomingMessage; res: ServerResponse }) => {
    const headers = mergedConfig.headers || {};

    // Content Security Policy
    if (headers.csp?.enabled) {
      const cspValue = buildCSPHeader(headers.csp);
      const headerName = headers.csp.reportOnly ? "Content-Security-Policy-Report-Only" : "Content-Security-Policy";
      context.res.setHeader(headerName, cspValue);
    }

    // HTTP Strict Transport Security
    if (headers.hsts?.enabled) {
      const hstsValue = buildHSTSHeader(headers.hsts);
      context.res.setHeader("Strict-Transport-Security", hstsValue);
    }

    // X-Frame-Options
    if (headers.frameOptions?.enabled) {
      const frameValue =
        headers.frameOptions.value === "ALLOW-FROM"
          ? `${headers.frameOptions.value} ${headers.frameOptions.uri}`
          : headers.frameOptions.value || "SAMEORIGIN";
      context.res.setHeader("X-Frame-Options", frameValue);
    }

    // X-Content-Type-Options
    if (headers.contentTypeOptions) {
      context.res.setHeader("X-Content-Type-Options", "nosniff");
    }

    // Referrer-Policy
    if (headers.referrerPolicy) {
      context.res.setHeader("Referrer-Policy", headers.referrerPolicy);
    }

    // Permissions-Policy
    if (headers.permissionsPolicy?.enabled) {
      const policyValue = buildPermissionsPolicyHeader(headers.permissionsPolicy);
      if (policyValue) {
        context.res.setHeader("Permissions-Policy", policyValue);
      }
    }

    // CORS Headers
    if (headers.cors?.enabled) {
      applyCORSHeaders(context, headers.cors);
    }
  };
}

/**
 * Build Content Security Policy header value.
 */
function buildCSPHeader(config: { directives?: Record<string, string[]> }): string {
  if (!config.directives) {
    return "";
  }

  return Object.entries(config.directives)
    .map(([key, values]) => `${key} ${values.join(" ")}`)
    .join("; ");
}

/**
 * Build Strict-Transport-Security header value.
 */
function buildHSTSHeader(config: {
  maxAge?: number;
  includeSubDomains?: boolean;
  preload?: boolean;
}): string {
  const parts: string[] = [];

  if (config.maxAge) {
    parts.push(`max-age=${config.maxAge}`);
  }

  if (config.includeSubDomains) {
    parts.push("includeSubDomains");
  }

  if (config.preload) {
    parts.push("preload");
  }

  return parts.join("; ");
}

/**
 * Build Permissions-Policy header value.
 */
function buildPermissionsPolicyHeader(config: {
  directives?: Record<string, string | string[]>;
}): string {
  if (!config.directives) {
    return "";
  }

  return Object.entries(config.directives)
    .map(([key, value]) => {
      if (typeof value === "string") {
        return `${key}=(${value})`;
      }
      return `${key}=(${value.join(" ")})`;
    })
    .join(", ");
}

/**
 * Apply CORS headers to response.
 */
function applyCORSHeaders(
  context: { req: IncomingMessage; res: ServerResponse },
  config: {
    origins?: string | string[];
    methods?: string[];
    allowedHeaders?: string[];
    exposedHeaders?: string[];
    credentials?: boolean;
    maxAge?: number;
  }
) {
  const origin = context.req.headers.origin || "";
  const allowedOrigins = Array.isArray(config.origins) ? config.origins : [config.origins || "*"];

  if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
    context.res.setHeader("Access-Control-Allow-Origin", origin || "*");
  }

  if (config.credentials) {
    context.res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  if (config.methods) {
    context.res.setHeader("Access-Control-Allow-Methods", config.methods.join(", "));
  }

  if (config.allowedHeaders) {
    context.res.setHeader("Access-Control-Allow-Headers", config.allowedHeaders.join(", "));
  }

  if (config.exposedHeaders) {
    context.res.setHeader("Access-Control-Expose-Headers", config.exposedHeaders.join(", "));
  }

  if (config.maxAge) {
    context.res.setHeader("Access-Control-Max-Age", config.maxAge.toString());
  }

  // Handle preflight requests
  if (context.req.method === "OPTIONS") {
    context.res.writeHead(204);
    context.res.end();
  }
}

/**
 * CSRF token generation and validation middleware.
 *
 * @example
 * ```typescript
 * const csrfMiddleware = createCSRFMiddleware();
 * app.use(csrfMiddleware);
 * ```
 */
export function createCSRFMiddleware(config?: { cookieName?: string; headerName?: string }) {
  const cookieName = config?.cookieName || "__jen_csrf";
  const headerName = config?.headerName || "X-CSRF-Token";

  return async (context: { req: IncomingMessage & { csrfToken?: string; headers: Record<string, any>; method?: string }; res: ServerResponse }) => {
    // Generate CSRF token if not present
    const existingToken = context.req.headers.cookie
      ?.split(";")
      .find((c) => c.trim().startsWith(`${cookieName}=`));

    if (!existingToken) {
      const token = generateCSRFToken();
      context.res.setHeader("Set-Cookie", `${cookieName}=${token}; HttpOnly; Path=/; SameSite=Strict`);
      context.req.csrfToken = token;
    }

    // Validate CSRF token on state-changing requests
    if (["POST", "PUT", "DELETE", "PATCH"].includes(context.req.method || "")) {
      const tokenFromHeader = context.req.headers[headerName.toLowerCase()];
      const tokenFromCookie = getCookieValue(context.req.headers.cookie, cookieName);

      if (tokenFromHeader && tokenFromCookie && tokenFromHeader === tokenFromCookie) {
        // Token is valid, continue
        return;
      }

      // Token is missing or invalid
      context.res.writeHead(403, { "Content-Type": "application/json" });
      context.res.end(JSON.stringify({ error: "CSRF token validation failed" }));
    }
  };
}

/**
 * Generate a random CSRF token.
 */
function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  if (typeof globalThis !== "undefined" && globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(array);
  } else {
    // Fallback for environments without crypto
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * Extract cookie value by name.
 */
function getCookieValue(cookieHeader: string | undefined, name: string): string | undefined {
  if (!cookieHeader) return undefined;
  const cookie = cookieHeader.split(";").find((c) => c.trim().startsWith(`${name}=`));
  return cookie ? cookie.trim().substring(name.length + 1) : undefined;
}
