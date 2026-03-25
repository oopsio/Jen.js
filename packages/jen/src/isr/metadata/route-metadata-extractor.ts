/**
 * Extract route metadata from module exports and global config
 */
import type { RouteMetadata } from '../types.js';

/**
 * Route config export from pages
 */
export interface RouteExport {
  revalidate?: number;
  isDynamic?: boolean;
  [key: string]: unknown;
}

export class RouteMetadataExtractor {
  /**
   * Extract metadata from a route module
   */
  static async fromModule(
    _modulePath: string,
    urlPath: string,
    moduleExports: Record<string, unknown>,
  ): Promise<RouteMetadata> {
    const revalidate = this.extractRevalidate(moduleExports);
    const isDynamic = this.extractIsDynamic(moduleExports);

    return {
      path: urlPath,
      revalidate,
      isDynamic,
    };
  }

  /**
   * Extract revalidate value from exports
   * Supports: export const revalidate = 60
   */
  private static extractRevalidate(
    moduleExports: Record<string, unknown>,
  ): number | undefined {
    const revalidate = moduleExports.revalidate;

    if (revalidate === undefined) {
      return undefined;
    }

    if (typeof revalidate !== 'number') {
      console.warn(
        'Invalid revalidate export: must be a number (seconds)',
        revalidate,
      );
      return undefined;
    }

    if (revalidate < 0) {
      console.warn('Invalid revalidate: must be >= 0', revalidate);
      return undefined;
    }

    return revalidate;
  }

  /**
   * Extract isDynamic flag from exports
   * Supports: export const isDynamic = true
   */
  private static extractIsDynamic(
    moduleExports: Record<string, unknown>,
  ): boolean {
    const isDynamic = moduleExports.isDynamic;
    return isDynamic === true;
  }

  /**
   * Apply global ISR config fallback
   */
  static applyGlobalConfig(
    metadata: RouteMetadata,
    globalRevalidate?: number,
  ): RouteMetadata {
    return {
      ...metadata,
      // Use route-specific revalidate if defined, otherwise use global
      revalidate: metadata.revalidate ?? globalRevalidate,
    };
  }
}
