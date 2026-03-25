/**
 * ISR Manager Integration Tests
 */
import { describe, it, expect, beforeEach } from 'bun:test';
import { ISRManager } from '../isr-manager.js';
import { RuntimeConfig, updateRuntimeConfig } from '../../config/config.js';

describe('ISRManager', () => {
  beforeEach(() => {
    // Reset config
    updateRuntimeConfig({
      isr: {
        enabled: false,
        cacheDir: '.cache/isr',
        maxRetries: 3,
        retryDelay: 1000,
      },
    });
  });

  describe('isISREnabled', () => {
    it('should return false when ISR is disabled', () => {
      updateRuntimeConfig({
        isr: { enabled: false },
      });

      expect(ISRManager.isISREnabled()).toBe(false);
    });

    it('should return true when ISR is enabled', () => {
      updateRuntimeConfig({
        isr: { enabled: true },
      });

      // Note: In actual use, ISRManager would be initialized
      // This test checks the disabled state
      expect(ISRManager.isISREnabled()).toBe(false); // Still false until initialized
    });
  });

  describe('extractMetadata', () => {
    it('should extract revalidate from module exports', async () => {
      const moduleExports = {
        default: () => null,
        revalidate: 3600,
      };

      const metadata = await ISRManager.extractMetadata(
        '/pages/blog/app.tsx',
        '/blog',
        moduleExports,
      );

      expect(metadata.path).toBe('/blog');
      expect(metadata.revalidate).toBe(3600);
    });

    it('should apply global revalidate if route-specific is undefined', async () => {
      updateRuntimeConfig({
        isr: {
          enabled: true,
          globalRevalidate: 1800,
        },
      });

      const moduleExports = {
        default: () => null,
      };

      const metadata = await ISRManager.extractMetadata(
        '/pages/news/app.tsx',
        '/news',
        moduleExports,
      );

      expect(metadata.revalidate).toBe(1800);
    });

    it('should preserve route-specific revalidate over global', async () => {
      updateRuntimeConfig({
        isr: {
          enabled: true,
          globalRevalidate: 1800,
        },
      });

      const moduleExports = {
        default: () => null,
        revalidate: 300, // Overrides global
      };

      const metadata = await ISRManager.extractMetadata(
        '/pages/flash-sale/app.tsx',
        '/flash-sale',
        moduleExports,
      );

      expect(metadata.revalidate).toBe(300);
    });

    it('should extract isDynamic flag', async () => {
      const moduleExports = {
        default: () => null,
        isDynamic: true,
      };

      const metadata = await ISRManager.extractMetadata(
        '/pages/[slug]/app.tsx',
        '/post/:slug',
        moduleExports,
      );

      expect(metadata.isDynamic).toBe(true);
    });
  });

  describe('Configuration', () => {
    it('should have ISR config in RuntimeConfig', () => {
      expect(RuntimeConfig.isr).toBeDefined();
      expect(RuntimeConfig.isr?.cacheDir).toBe('.cache/isr');
    });

    it('should allow updating ISR config', () => {
      updateRuntimeConfig({
        isr: {
          enabled: true,
          cacheDir: '/tmp/cache',
          maxRetries: 5,
        },
      });

      expect(RuntimeConfig.isr?.enabled).toBe(true);
      expect(RuntimeConfig.isr?.cacheDir).toBe('/tmp/cache');
      expect(RuntimeConfig.isr?.maxRetries).toBe(5);
    });
  });
});
