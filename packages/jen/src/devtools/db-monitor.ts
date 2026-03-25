/**
 * Database Driver Monitoring
 * Intercepts and logs queries from native drivers
 */

import type { QueryLog, DriverMetrics } from './types.js';

export class DatabaseMonitor {
  private static slowQueryThreshold = 100; // ms
  private static queryLogs: QueryLog[] = [];
  private static driverMetrics = new Map<string, DriverMetrics>();
  private static onQueryCallback: ((log: QueryLog) => void) | null = null;

  /**
   * Register callback for query logs
   */
  public static onQuery(callback: (log: QueryLog) => void): void {
    this.onQueryCallback = callback;
  }

  /**
   * Log a database query execution
   */
  public static logQuery(
    query: string,
    durationMs: number,
    driver: string = 'default',
    options?: {
      error?: string;
      rows?: number;
    },
  ): QueryLog {
    const isSlow = durationMs > this.slowQueryThreshold;
    const isError = !!options?.error;

    const log: QueryLog = {
      id: `query-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      query: this.sanitizeQuery(query),
      duration: durationMs,
      timestamp: Date.now(),
      driver,
      status: isError ? 'error' : isSlow ? 'slow' : 'success',
      error: options?.error,
      rows: options?.rows,
    };

    this.queryLogs.push(log);

    // Update driver metrics
    this.updateMetrics(driver, log);

    // Invoke callback
    if (this.onQueryCallback) {
      this.onQueryCallback(log);
    }

    return log;
  }

  /**
   * Update driver metrics
   */
  private static updateMetrics(driver: string, log: QueryLog): void {
    let metrics = this.driverMetrics.get(driver);

    if (!metrics) {
      metrics = {
        totalQueries: 0,
        totalTime: 0,
        slowQueries: [],
        avgQueryTime: 0,
        lastQuery: null,
      };
      this.driverMetrics.set(driver, metrics);
    }

    metrics.totalQueries++;
    metrics.totalTime += log.duration;
    metrics.avgQueryTime = metrics.totalTime / metrics.totalQueries;
    metrics.lastQuery = log;

    if (log.status === 'slow') {
      metrics.slowQueries.push(log);
      if (metrics.slowQueries.length > 50) {
        metrics.slowQueries.shift(); // Keep last 50
      }
    }
  }

  /**
   * Sanitize query to hide sensitive data
   */
  private static sanitizeQuery(query: string): string {
    return query
      .replace(/('.*?')/g, "'***'") // Hide string literals
      .replace(/(\d{8,})/g, '***') // Hide long numbers (potential PII)
      .substring(0, 200); // Truncate to 200 chars
  }

  /**
   * Get metrics for a driver
   */
  public static getMetrics(driver: string): DriverMetrics | null {
    return this.driverMetrics.get(driver) || null;
  }

  /**
   * Get all query logs
   */
  public static getQueryLogs(filter?: {
    driver?: string;
    status?: 'success' | 'slow' | 'error';
    limit?: number;
  }): QueryLog[] {
    let logs = [...this.queryLogs];

    if (filter?.driver) {
      logs = logs.filter((l) => l.driver === filter.driver);
    }

    if (filter?.status) {
      logs = logs.filter((l) => l.status === filter.status);
    }

    if (filter?.limit) {
      logs = logs.slice(-filter.limit);
    }

    return logs;
  }

  /**
   * Generate query performance report
   */
  public static generateReport(): {
    totalQueries: number;
    totalTime: number;
    avgQueryTime: number;
    slowCount: number;
    errorCount: number;
    drivers: Record<string, DriverMetrics>;
  } {
    const drivers: Record<string, DriverMetrics> = {};
    let totalQueries = 0;
    let totalTime = 0;
    let slowCount = 0;

    for (const [driverName, metrics] of this.driverMetrics) {
      drivers[driverName] = metrics;
      totalQueries += metrics.totalQueries;
      totalTime += metrics.totalTime;
      slowCount += metrics.slowQueries.length;
    }

    const errorCount = this.queryLogs.filter(
      (l) => l.status === 'error',
    ).length;

    return {
      totalQueries,
      totalTime,
      avgQueryTime: totalQueries > 0 ? totalTime / totalQueries : 0,
      slowCount,
      errorCount,
      drivers,
    };
  }

  /**
   * Identify bottlenecks
   */
  public static analyzeBottlenecks(): string[] {
    const issues: string[] = [];

    for (const [driver, metrics] of this.driverMetrics) {
      if (metrics.totalQueries > 100) {
        issues.push(
          `⚠️ ${driver}: ${metrics.totalQueries} total queries (${metrics.totalTime.toFixed(0)}ms)`,
        );
      }

      if (metrics.avgQueryTime > 50) {
        issues.push(
          `⚠️ ${driver}: High average query time (${metrics.avgQueryTime.toFixed(2)}ms)`,
        );
      }

      if (metrics.slowQueries.length > 10) {
        issues.push(
          `❌ ${driver}: ${metrics.slowQueries.length} slow queries detected`,
        );
      }
    }

    // Identify N+1 query patterns
    const queryPatterns = new Map<string, number>();
    this.queryLogs.forEach((log) => {
      const pattern = log.query.substring(0, 50);
      queryPatterns.set(pattern, (queryPatterns.get(pattern) || 0) + 1);
    });

    for (const [pattern, count] of queryPatterns) {
      if (count > 20) {
        issues.push(
          `❌ Potential N+1 pattern: "${pattern}..." executed ${count} times`,
        );
      }
    }

    return issues;
  }

  /**
   * Clear logs (for testing)
   */
  public static clear(): void {
    this.queryLogs = [];
    this.driverMetrics.clear();
  }
}
