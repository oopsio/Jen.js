/**
 * Route metadata extractor tests
 */
import { describe, it, expect } from 'bun:test';
import { RouteMetadataExtractor } from '../metadata/route-metadata-extractor';

describe('RouteMetadataExtractor', () => {
  describe('fromModule', () => {
    it('should extract revalidate from module exports', async () => {
      const moduleExports = {
        default: () => '<div>Test</div>',
        revalidate: 60,
      };

      const metadata = await RouteMetadataExtractor.fromModule(
        '/pages/test.tsx',
        '/test',
        moduleExports,
      );

      expect(metadata.path).toBe('/test');
      expect(metadata.revalidate).toBe(60);
    });

    it('should handle missing revalidate', async () => {
      const moduleExports = {
        default: () => '<div>Test</div>',
      };

      const metadata = await RouteMetadataExtractor.fromModule(
        '/pages/test.tsx',
        '/test',
        moduleExports,
      );

      expect(metadata.path).toBe('/test');
      expect(metadata.revalidate).toBeUndefined();
    });

    it('should extract isDynamic flag', async () => {
      const moduleExports = {
        default: () => '<div>Test</div>',
        isDynamic: true,
      };

      const metadata = await RouteMetadataExtractor.fromModule(
        '/pages/[id].tsx',
        '/items/:id',
        moduleExports,
      );

      expect(metadata.isDynamic).toBe(true);
    });

    it('should default isDynamic to false', async () => {
      const moduleExports = {
        default: () => '<div>Test</div>',
      };

      const metadata = await RouteMetadataExtractor.fromModule(
        '/pages/test.tsx',
        '/test',
        moduleExports,
      );

      expect(metadata.isDynamic).toBe(false);
    });

    it('should warn on invalid revalidate type', async () => {
      const moduleExports = {
        default: () => '<div>Test</div>',
        revalidate: 'invalid',
      };

      const metadata = await RouteMetadataExtractor.fromModule(
        '/pages/test.tsx',
        '/test',
        moduleExports,
      );

      expect(metadata.revalidate).toBeUndefined();
    });

    it('should warn on negative revalidate', async () => {
      const moduleExports = {
        default: () => '<div>Test</div>',
        revalidate: -1,
      };

      const metadata = await RouteMetadataExtractor.fromModule(
        '/pages/test.tsx',
        '/test',
        moduleExports,
      );

      expect(metadata.revalidate).toBeUndefined();
    });
  });

  describe('applyGlobalConfig', () => {
    it('should use route-specific revalidate if defined', () => {
      const metadata = {
        path: '/test',
        revalidate: 60,
      };

      const result = RouteMetadataExtractor.applyGlobalConfig(metadata, 120);

      expect(result.revalidate).toBe(60);
    });

    it('should use global revalidate if route-specific is undefined', () => {
      const metadata = {
        path: '/test',
      };

      const result = RouteMetadataExtractor.applyGlobalConfig(metadata, 120);

      expect(result.revalidate).toBe(120);
    });

    it('should preserve route-specific revalidate even if 0', () => {
      const metadata = {
        path: '/test',
        revalidate: 0,
      };

      const result = RouteMetadataExtractor.applyGlobalConfig(metadata, 120);

      expect(result.revalidate).toBe(0);
    });
  });
});
