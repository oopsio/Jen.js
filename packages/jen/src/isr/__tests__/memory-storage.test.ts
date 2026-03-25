/**
 * Memory storage tests
 */
import { describe, it, expect, beforeEach } from 'bun:test';
import { MemoryStorage } from '../storage/memory-storage.js';
import type { CacheEntry } from '../types.js';

describe('MemoryStorage', () => {
  let storage: MemoryStorage;

  beforeEach(() => {
    storage = new MemoryStorage();
  });

  describe('Basic operations', () => {
    it('should store and retrieve entries', async () => {
      const entry: CacheEntry = {
        html: '<div>Test</div>',
        timestamp: Date.now(),
      };

      await storage.set('test', entry);
      const retrieved = await storage.get('test');

      expect(retrieved).not.toBeNull();
      expect(retrieved?.html).toBe('<div>Test</div>');
      expect(retrieved?.timestamp).toBe(entry.timestamp);
    });

    it('should return null for non-existent keys', async () => {
      const result = await storage.get('nonexistent');
      expect(result).toBeNull();
    });

    it('should check existence', async () => {
      const entry: CacheEntry = {
        html: '<div>Test</div>',
        timestamp: Date.now(),
      };

      await storage.set('test', entry);

      const exists = await storage.exists('test');
      expect(exists).toBe(true);

      const notExists = await storage.exists('nonexistent');
      expect(notExists).toBe(false);
    });

    it('should delete entries', async () => {
      const entry: CacheEntry = {
        html: '<div>Test</div>',
        timestamp: Date.now(),
      };

      await storage.set('test', entry);
      await storage.delete('test');

      const retrieved = await storage.get('test');
      expect(retrieved).toBeNull();
    });
  });

  describe('Multiple entries', () => {
    it('should handle multiple entries', async () => {
      const entries = ['test1', 'test2', 'test3'];

      for (const key of entries) {
        await storage.set(key, {
          html: `<div>${key}</div>`,
          timestamp: Date.now(),
        });
      }

      expect(storage.size()).toBe(3);
    });

    it('should clear all entries', async () => {
      await storage.set('test1', {
        html: '<div>1</div>',
        timestamp: Date.now(),
      });
      await storage.set('test2', {
        html: '<div>2</div>',
        timestamp: Date.now(),
      });

      await storage.clear();

      expect(storage.size()).toBe(0);
    });
  });

  describe('Overwrite behavior', () => {
    it('should overwrite existing entries', async () => {
      const entry1: CacheEntry = {
        html: '<div>Version 1</div>',
        timestamp: 1000,
      };

      const entry2: CacheEntry = {
        html: '<div>Version 2</div>',
        timestamp: 2000,
      };

      await storage.set('test', entry1);
      await storage.set('test', entry2);

      const retrieved = await storage.get('test');
      expect(retrieved?.html).toBe('<div>Version 2</div>');
      expect(retrieved?.timestamp).toBe(2000);
    });
  });
});
