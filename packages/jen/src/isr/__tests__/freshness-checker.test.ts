/**
 * Freshness checker tests
 */
import { describe, it, expect } from 'bun:test';
import { FreshnessChecker } from '../freshness/freshness-checker.js';

describe('FreshnessChecker', () => {
  describe('check', () => {
    it('should report fresh when age < revalidate', () => {
      const timestamp = Date.now() - 10 * 1000; // 10 seconds old
      const result = FreshnessChecker.check(timestamp, 60); // 60 second revalidate

      expect(result.isFresh).toBe(true);
      expect(result.isStale).toBe(false);
      expect(result.age >= 10000).toBe(true);
    });

    it('should report stale when age > revalidate', () => {
      const timestamp = Date.now() - 70 * 1000; // 70 seconds old
      const result = FreshnessChecker.check(timestamp, 60); // 60 second revalidate

      expect(result.isFresh).toBe(false);
      expect(result.isStale).toBe(true);
      expect(result.age >= 70000).toBe(true);
    });

    it('should always be fresh when revalidate is undefined', () => {
      const timestamp = Date.now() - 1000 * 60 * 60; // 1 hour old
      const result = FreshnessChecker.check(timestamp, undefined);

      expect(result.isFresh).toBe(true);
      expect(result.isStale).toBe(false);
    });

    it('should always be fresh when revalidate is 0', () => {
      const timestamp = Date.now() - 10 * 1000;
      const result = FreshnessChecker.check(timestamp, 0);

      expect(result.isFresh).toBe(true);
      expect(result.isStale).toBe(false);
    });

    it('should report stale when age exceeds revalidate', () => {
      const timestamp = Date.now() - 61 * 1000; // 61 seconds old
      const result = FreshnessChecker.check(timestamp, 60); // 60 second revalidate

      expect(result.isStale).toBe(true);
    });
  });

  describe('getTimeToStale', () => {
    it('should calculate seconds until stale', () => {
      const timestamp = Date.now() - 30 * 1000; // 30 seconds old
      const timeToStale = FreshnessChecker.getTimeToStale(timestamp, 60);

      expect(timeToStale).toBeDefined();
      expect(timeToStale! <= 30).toBe(true);
      expect(timeToStale! > 25).toBe(true);
    });

    it('should return 0 when already stale', () => {
      const timestamp = Date.now() - 70 * 1000; // 70 seconds old
      const timeToStale = FreshnessChecker.getTimeToStale(timestamp, 60);

      expect(timeToStale).toBe(0);
    });

    it('should return null when revalidate is undefined', () => {
      const timestamp = Date.now();
      const timeToStale = FreshnessChecker.getTimeToStale(timestamp, undefined);

      expect(timeToStale).toBeNull();
    });

    it('should return null when revalidate is 0', () => {
      const timestamp = Date.now();
      const timeToStale = FreshnessChecker.getTimeToStale(timestamp, 0);

      expect(timeToStale).toBeNull();
    });
  });
});
