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

import type { FrameworkConfig } from "../core/config.js";
import type { ResolvedFeatures } from "../core/features.js";
import { resolveFeatures, getEnabledFeatures } from "../core/features.js";

/**
 * Feature gate compiler that generates optimized request handlers based on enabled features.
 * Statically analyzes feature configuration at build time and generates only the necessary code.
 *
 * This approach ensures:
 * 1. Unused features are completely tree-shaken from the bundle
 * 2. No runtime feature detection overhead
 * 3. Type-safe access to enabled features
 * 4. Build-time validation of feature compatibility
 */
export class FeatureGateCompiler {
  private resolved: ResolvedFeatures;
  private config: FrameworkConfig;

  constructor(config: FrameworkConfig) {
    this.config = config;
    this.resolved = resolveFeatures(config.features);
  }

  /**
   * Generates a TypeScript handler file that includes only enabled features.
   * This file is generated at build time and imported by the request handler.
   *
   * @returns Generated TypeScript code as string
   */
  generateHandlerCode(): string {
    const enabled = getEnabledFeatures(this.resolved);
    const imports = this.generateImports(enabled);
    const middleware = this.generateMiddlewareChain(enabled);
    const handlers = this.generateHandlers(enabled);

    return `
/*
 * AUTO-GENERATED: This file is generated at build time based on enabled features.
 * DO NOT EDIT MANUALLY - your changes will be overwritten on next build.
 * 
 * Enabled features: ${enabled.join(", ") || "none (core only)"}
 */

${imports}

/**
 * Build-time compiled request handler with only enabled features.
 * Each feature is statically included or excluded based on configuration.
 */
export async function handleRequest(req: any, res: any, context: any) {
  ${middleware}
  ${handlers}
}

/**
 * Feature flags for runtime checks (constant-folded at build time).
 * TypeScript will eliminate dead code paths for disabled features.
 */
export const FEATURES = {
  ${enabled.map((f) => `${f}: true`).join(",\n  ")},
  ${Object.entries(this.resolved)
    .filter(([, enabled]) => !enabled)
    .map(([name]) => `${name}: false`)
    .join(",\n  ")},
} as const;
`;
  }

  /**
   * Generates import statements only for enabled features.
   *
   * @param enabled List of enabled feature names
   * @returns Import statement code
   */
  private generateImports(enabled: string[]): string {
    const imports: string[] = [];

    if (enabled.includes("api")) {
      imports.push('import { handleApiRoutes } from "../features/api/handler.js";');
    }

    if (enabled.includes("middleware")) {
      imports.push('import { compiledMiddlewareChain } from "../features/middleware/compiled.js";');
    }

    if (enabled.includes("cache")) {
      imports.push('import { getCachedResponse, setCachedResponse } from "../features/cache/handler.js";');
    }

    if (enabled.includes("streaming")) {
      imports.push('import { StreamingRenderer } from "../features/streaming/renderer.js";');
    }

    if (enabled.includes("auth")) {
      imports.push('import { authMiddleware } from "../features/auth/middleware.js";');
    }

    // Always import core
    imports.unshift('import type { RouteHandler } from "../core/types.js";');

    return imports.join("\n");
  }

  /**
   * Generates middleware chain initialization code.
   *
   * @param enabled List of enabled feature names
   * @returns Middleware setup code
   */
  private generateMiddlewareChain(enabled: string[]): string {
    if (!enabled.includes("middleware")) {
      return "// Middleware disabled";
    }

    return `
    // Apply compiled middleware chain (pre-resolved at build time)
    const middlewareResult = await compiledMiddlewareChain(req, res, context);
    if (middlewareResult.handled) return;
    context.middleware = middlewareResult.data;
    `;
  }

  /**
   * Generates request handler logic for enabled features.
   *
   * @param enabled List of enabled feature names
   * @returns Handler code
   */
  private generateHandlers(enabled: string[]): string {
    const handlers: string[] = [];

    // Always handle core routing
    handlers.push(`
    // Core routing
    const route = context.routes.get(req.url);
    if (!route) {
      res.statusCode = 404;
      res.end("Not Found");
      return;
    }
    `);

    // API routes
    if (enabled.includes("api")) {
      handlers.push(`
    // Try API routes first
    const apiResult = await handleApiRoutes(req, res, route, context);
    if (apiResult.handled) return;
    `);
    }

    // Caching
    if (enabled.includes("cache")) {
      handlers.push(`
    // Check response cache
    const cached = await getCachedResponse(route, context);
    if (cached) {
      res.setHeader("X-Cache", "HIT");
      res.end(cached);
      return;
    }
    `);
    }

    // SSR rendering
    handlers.push(`
    // Render route
    const component = await import(route.moduleId);
    const data = await component.loader?.(context) ?? {};
    const html = await renderToString(component.default, { data });
    `);

    // Cache response
    if (enabled.includes("cache")) {
      handlers.push(`
    await setCachedResponse(route, html, context);
    `);
    }

    // Stream or buffered response
    if (enabled.includes("streaming")) {
      handlers.push(`
    // Stream response
    const renderer = new StreamingRenderer(res);
    await renderer.sendHead(route.head);
    await renderer.sendBody(html);
    await renderer.sendFooter();
    `);
    } else {
      handlers.push(`
    // Send buffered response
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.end(html);
    `);
    }

    return handlers.join("\n");
  }

  /**
   * Generates type definitions for enabled features.
   * Ensures TypeScript knows about enabled/disabled features.
   *
   * @returns TypeScript type definition code
   */
  generateTypeDefinitions(): string {
    const enabled = getEnabledFeatures(this.resolved);

    return `
// Auto-generated feature type definitions
declare global {
  interface FeatureContext {
    api: ${enabled.includes("api") ? "ApiFeature" : "never"};
    middleware: ${enabled.includes("middleware") ? "MiddlewareFeature" : "never"};
    cache: ${enabled.includes("cache") ? "CacheFeature" : "never"};
    streaming: ${enabled.includes("streaming") ? "StreamingFeature" : "never"};
    auth: ${enabled.includes("auth") ? "AuthFeature" : "never"};
  }
}

export {};
`;
  }

  /**
   * Generates build metadata for debugging and introspection.
   *
   * @returns Metadata as JSON string
   */
  generateMetadata(): string {
    return JSON.stringify(
      {
        buildTime: new Date().toISOString(),
        enabledFeatures: getEnabledFeatures(this.resolved),
        disabledFeatures: Object.entries(this.resolved)
          .filter(([, enabled]) => !enabled)
          .map(([name]) => name),
        config: this.config.features,
      },
      null,
      2,
    );
  }
}

/**
 * Creates an esbuild plugin that generates feature-gated code during build.
 *
 * @param config Framework configuration
 * @returns esbuild plugin object
 */
export function featureGatePlugin(config: FrameworkConfig): any {
  const compiler = new FeatureGateCompiler(config);

  return {
    name: "feature-gate",
    resolveId(id: string) {
      if (id === "virtual-feature-handler") {
        return id;
      }
      if (id === "virtual-feature-metadata") {
        return id;
      }
      return null;
    },
    load(id: string) {
      if (id === "virtual-feature-handler") {
        return compiler.generateHandlerCode();
      }
      if (id === "virtual-feature-metadata") {
        return `export default ${compiler.generateMetadata()}`;
      }
      return null;
    },
  };
}

