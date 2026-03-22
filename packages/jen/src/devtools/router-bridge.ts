/**
 * Router Telemetry Bridge
 * Captures Rust RouteMatcher output and formats for DevTools
 */

import type { RouteMatchTrace } from './types';

/**
 * Result from Rust WASM RouteMatcher
 */
interface WasmRouteMatch {
  found: boolean;
  pathname: string;
  filePathTsx: string;
  filePathJsx: string;
  params: string; // JSON string
}

export class RouterBridge {
  private static traceCallback: ((trace: RouteMatchTrace) => void) | null =
    null;

  /**
   * Register callback for route traces
   */
  public static onTrace(callback: (trace: RouteMatchTrace) => void): void {
    this.traceCallback = callback;
  }

  /**
   * Capture route match from WASM matcher
   * Called immediately after RouterMap.resolveRequest()
   */
  public static captureMatch(
    pathname: string,
    wasmMatch: WasmRouteMatch | null,
    executionTime: number,
  ): RouteMatchTrace {
    const params = wasmMatch?.params ? JSON.parse(wasmMatch.params) : {};

    const trace: RouteMatchTrace = {
      pathname,
      matched: wasmMatch?.found ?? false,
      matchedPath: wasmMatch?.pathname ?? '',
      params,
      executionTime,
      wasmCallCount: 1,
    };

    if (this.traceCallback) {
      this.traceCallback(trace);
    }

    return trace;
  }

  /**
   * Format trace for DevTools UI
   */
  public static formatTraceForUI(trace: RouteMatchTrace): string {
    if (!trace.matched) {
      return `❌ NO MATCH: ${trace.pathname}`;
    }

    const paramStr =
      Object.keys(trace.params).length > 0
        ? ` → ${JSON.stringify(trace.params)}`
        : '';

    return `✓ ${trace.matchedPath}${paramStr} (${trace.executionTime.toFixed(2)}ms)`;
  }

  /**
   * Analyze potential routing issues
   */
  public static analyze(traces: RouteMatchTrace[]): string[] {
    const issues: string[] = [];

    // Check for high execution times
    const slowTraces = traces.filter((t) => t.executionTime > 10);
    if (slowTraces.length > 0) {
      issues.push(
        `⚠️ ${slowTraces.length} slow route matches (>10ms detected)`,
      );
    }

    // Check for repeated 404s
    const notFoundTraces = traces.filter((t) => !t.matched);
    if (notFoundTraces.length > traces.length * 0.3) {
      issues.push(
        `⚠️ High 404 rate: ${notFoundTraces.length}/${traces.length}`,
      );
    }

    // Check for parameter parsing issues
    const complexParams = traces.filter(
      (t) => Object.keys(t.params).length > 3,
    );
    if (complexParams.length > 0) {
      issues.push(`ℹ️ ${complexParams.length} routes with multiple parameters`);
    }

    return issues;
  }
}
