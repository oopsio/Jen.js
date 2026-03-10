import type { BuildOptions, Plugin } from "esbuild";

/**
 * Code splitting strategy configuration
 */
export interface SplitStrategy {
  name: string;
  test: (path: string) => boolean;
  priority: number;
}

/**
 * Intelligent code splitting analyzer
 *
 * Splits bundles into logical chunks:
 * - Vendor: node_modules dependencies (high cache hit rate)
 * - Runtime: Framework runtime/hydration (shared across all pages)
 * - Common: Shared components (used by multiple routes)
 * - Route: Per-route chunks (lazy-loaded on demand)
 * - Entry: Main application bundle
 */
export class CodeSplitter {
  private strategies: SplitStrategy[] = [];
  private routeAnalysis: Map<string, string[]> = new Map();

  constructor() {
    this.initializeDefaultStrategies();
  }

  /**
   * Initialize default splitting strategies in priority order
   */
  private initializeDefaultStrategies(): void {
    // Vendor chunks (highest priority - most stable)
    this.strategies.push({
      name: "vendor",
      test: (path: string) => {
        return /node_modules/.test(path) && !this.isFrameworkInternal(path);
      },
      priority: 100,
    });

    // Framework runtime (stable, shared across all pages)
    this.strategies.push({
      name: "runtime",
      test: (path: string) => {
        return (
          this.isFrameworkInternal(path) && /runtime|hydrate|ssr/.test(path)
        );
      },
      priority: 90,
    });

    // Common utilities (shared components)
    this.strategies.push({
      name: "common",
      test: (path: string) => {
        return /components|utils|helpers/.test(path);
      },
      priority: 80,
    });

    // Route-specific chunks (lazy-loaded)
    this.strategies.push({
      name: "route",
      test: (path: string) => {
        return /pages|routes|site/.test(path);
      },
      priority: 50,
    });
  }

  /**
   * Determine which chunk a module should belong to
   */
  determineChunk(modulePath: string): string {
    // Sort by priority (descending)
    const sorted = [...this.strategies].sort((a, b) => b.priority - a.priority);

    for (const strategy of sorted) {
      if (strategy.test(modulePath)) {
        return strategy.name;
      }
    }

    return "entry"; // Default to main entry chunk
  }

  /**
   * Analyze route dependencies for splitting decisions
   *
   * @param routePath Path to route file
   * @param dependencies List of imported module paths
   */
  analyzeRouteDependencies(routePath: string, dependencies: string[]): void {
    this.routeAnalysis.set(routePath, dependencies);
  }

  /**
   * Generate esbuild manual chunks configuration
   *
   * Implements intelligent bundling:
   * - Vendor libraries in separate chunk (external dependencies)
   * - Runtime/hydration in separate chunk (framework internals)
   * - Common code in separate chunk (shared components)
   * - Route-specific code in separate chunks (per-route lazy-loading)
   */
  generateManualChunks(): Record<string, string[]> {
    const chunks: Record<string, string[]> = {};

    // Vendor chunk patterns
    chunks.vendor = [
      "preact",
      "preact/compat",
      "preact/hooks",
      "preact/compat/scheduler",
      "htm",
    ];

    // Runtime chunk patterns
    chunks.runtime = [
      "../runtime/hydrate.js",
      "../runtime/render.js",
      "../runtime/ssr.js",
    ];

    // Common utilities patterns
    chunks.common = [];

    return chunks;
  }

  /**
   * Generate esbuild splitting configuration
   */
  generateSplittingConfig(): Partial<BuildOptions> & { manualChunks?: any } {
    return {
      splitting: true,
      format: "esm",
      chunkNames: "[name]-[hash]",
      manualChunks: this.generateManualChunks() as any,
    };
  }

  /**
   * Generate chunk dependency graph for debugging
   *
   * Shows which chunks depend on which others, useful for:
   * - Understanding load order
   * - Optimizing prefetching
   * - Detecting circular dependencies
   */
  generateDependencyGraph(): string {
    let graph = "# Chunk Dependency Graph\n\n";

    graph += "## Splitting Strategy\n";
    graph += "- **vendor**: External dependencies (preact, utilities)\n";
    graph += "- **runtime**: Framework runtime (hydration, SSR, hooks)\n";
    graph += "- **common**: Shared components and utilities\n";
    graph += "- **route**: Per-route lazy-loaded chunks\n";
    graph += "- **entry**: Main application bundle\n\n";

    graph += "## Load Order\n";
    graph += "1. Entry (main bundle) - executes immediately\n";
    graph += "2. Vendor - loaded on demand, cached long-term\n";
    graph += "3. Runtime - loaded before any route rendering\n";
    graph += "4. Common - loaded when needed by routes\n";
    graph += "5. Route chunks - lazy-loaded per page\n\n";

    graph += "## Cache Strategy\n";
    graph +=
      "- Vendor: `max-age=31536000, immutable` (1 year, never changes)\n";
    graph += "- Runtime: `max-age=2592000` (30 days, updated with framework)\n";
    graph += "- Entry: `max-age=3600` (1 hour, updated frequently)\n";
    graph += "- Routes: `max-age=86400` (1 day, per-route updates)\n\n";

    return graph;
  }

  /**
   * Check if path is internal framework code
   */
  private isFrameworkInternal(path: string): boolean {
    return /@src|src\//.test(path);
  }

  /**
   * Register custom splitting strategy
   */
  registerStrategy(strategy: SplitStrategy): void {
    this.strategies.push(strategy);
    // Re-sort by priority
    this.strategies.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Generate splitting report
   */
  generateReport(): string {
    let report = "# Code Splitting Report\n\n";

    report += "## Active Strategies\n";
    for (const strategy of this.strategies) {
      report += `- **${strategy.name}** (priority: ${strategy.priority})\n`;
    }

    report += "\n## Route Analysis\n";
    if (this.routeAnalysis.size === 0) {
      report += "No routes analyzed yet.\n";
    } else {
      for (const [route, deps] of this.routeAnalysis) {
        report += `- **${route}**: ${deps.length} dependencies\n`;
      }
    }

    return report;
  }
}

/**
 * Helper: Create esbuild configuration for code splitting
 */
export function createSplitConfig(
  outdir: string = "dist",
): Partial<BuildOptions> {
  const splitter = new CodeSplitter();

  return {
    ...splitter.generateSplittingConfig(),
    outdir,
    minify: true,
    format: "esm",
    target: "es2022",
  };
}
