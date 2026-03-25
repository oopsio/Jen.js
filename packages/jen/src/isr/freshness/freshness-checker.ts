/**
 * Cache freshness checking utility
 */
import type { FreshnessResult } from '../types.js';

export class FreshnessChecker {
  /**
   * Check if cached entry is fresh or stale
   * @param storedTimestamp Unix epoch in milliseconds when cache was created
   * @param revalidateSeconds Revalidation period in seconds (undefined = no expiration)
   * @returns Freshness result with isFresh, isStale, and age
   */
  static check(
    storedTimestamp: number,
    revalidateSeconds?: number,
  ): FreshnessResult {
    const now = Date.now();
    const age = now - storedTimestamp;

    // No revalidation setting means cache is always fresh
    if (revalidateSeconds === undefined || revalidateSeconds <= 0) {
      return {
        isFresh: true,
        isStale: false,
        age,
      };
    }

    const revalidateMs = revalidateSeconds * 1000;
    const isStale = age > revalidateMs;

    return {
      isFresh: !isStale,
      isStale,
      age,
    };
  }

  /**
   * Calculate seconds until cache becomes stale
   */
  static getTimeToStale(
    storedTimestamp: number,
    revalidateSeconds?: number,
  ): number | null {
    if (revalidateSeconds === undefined || revalidateSeconds <= 0) {
      return null; // Never stales
    }

    const now = Date.now();
    const age = now - storedTimestamp;
    const revalidateMs = revalidateSeconds * 1000;
    const timeToStale = Math.max(0, revalidateMs - age);

    return Math.ceil(timeToStale / 1000);
  }
}
