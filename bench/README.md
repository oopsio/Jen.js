# Jen.js Benchmarks

Comprehensive performance benchmarks for the Jen.js framework using Vitest's built-in benchmarking capabilities.

## Overview

This directory contains performance benchmarks for key Jen.js subsystems:

- **build.bench.ts** - SSG build, bundling, asset optimization
- **routing.bench.ts** - Route matching, parameter extraction, middleware chains
- **ssr.bench.ts** - Server-side rendering, hydration, streaming
- **middleware.bench.ts** - Middleware execution, request/response handling
- **config.bench.ts** - Configuration loading, initialization, startup

## Running Benchmarks

### Run All Benchmarks
```bash
npm run bench
npm run perf:bench
```

### Run Specific Benchmark
```bash
# Build benchmarks
npm run bench -- build.bench

# Routing benchmarks
npm run bench -- routing.bench

# SSR benchmarks
npm run bench -- ssr.bench

# Middleware benchmarks
npm run bench -- middleware.bench

# Configuration benchmarks
npm run bench -- config.bench
```

### Run with Options
```bash
# Run with warmup iterations
npm run bench -- --warmup=100

# Run with specific number of iterations
npm run bench -- --iterations=1000

# Run with time budget (milliseconds)
npm run bench -- --time=5000

# Show detailed output
npm run bench -- --reporter=verbose
```

### Compare Against Baseline
```bash
npm run bench:compare
```

### Check for Performance Regressions
```bash
npm run bench:regression
```

## Benchmark Structure

Each benchmark file follows this pattern:

```typescript
import { describe, bench } from 'vitest';

describe('Feature Name', () => {
  bench('Operation Description', () => {
    // Setup
    const data = setupTestData();
    
    // The operation being benchmarked
    const result = performOperation(data);
    
    // Return a value to prevent optimization
    return result;
  });
});
```

## Interpreting Results

Vitest benchmarks output:

```
✓ Build Performance
  ✓ SSG Build - Simple Site (100 iterations, 1.23ms / iter)
  ✓ SSG Build - Complex Routes (100 iterations, 5.67ms / iter)
  ✓ Asset Hashing - 1000 Files (100 iterations, 12.34ms / iter)
```

Lower numbers = better performance.

## Performance Goals

Target performance metrics for Jen.js:

| Operation | Target | Notes |
|-----------|--------|-------|
| Route matching (100 routes) | <1ms | O(n) worst case |
| SSG build (100 pages) | <100ms | Incremental capable |
| Middleware chain (20 middlewares) | <5ms | Per request |
| Config loading | <50ms | One-time |
| Asset hashing (1000 files) | <500ms | Parallelizable |
| SSR render (1000 nodes) | <50ms | Per route |

## Benchmark Categories

### Build Performance (build.bench.ts)
- SSG building (simple and complex routes)
- Asset hashing and optimization
- CSS minification
- Image optimization
- Code splitting analysis
- Incremental builds
- Source map generation
- Bundle analysis

### Routing (routing.bench.ts)
- Static route matching
- Dynamic route matching (single & multiple params)
- Catch-all routes
- Parameter extraction
- Complex pattern matching
- Route priority
- Middleware chain execution
- Route guards
- Nested route resolution
- Query string parsing
- Route caching (10K lookups)
- Link generation

### Server-Side Rendering (ssr.bench.ts)
- Component rendering (simple and complex trees)
- List rendering (1000+ items)
- Props passing (500+ components)
- Conditional content rendering
- HTML escaping and safety
- Hydration markers
- Streaming response generation
- Response compression
- Inline styles vs CSS classes
- Meta tags and head injection
- Lazy loading markers
- Template interpolation
- Fragment rendering
- Error boundary rendering

### Middleware (middleware.bench.ts)
- Middleware chain execution (5-20 middlewares)
- Request logging
- Authentication (token validation)
- CORS headers setup
- Rate limiting (1000 requests)
- Response compression
- JSON parsing (100KB body)
- Error handling
- Security headers
- Session management (500 sessions)
- Cache hit/miss
- Request validation
- Request cloning

### Configuration (config.bench.ts)
- JSON config parsing (1000+ lines)
- Environment variables (100 variables)
- Config schema validation (50 routes)
- Plugin system initialization (20 plugins)
- Middleware stack loading
- Route map building (500+ routes)
- Asset manifest compilation (1000 assets)
- CSS pipeline initialization
- JavaScript bundler initialization
- TypeScript configuration loading
- ESLint configuration parsing
- Database connection pooling
- Cache configuration loading
- Logging system initialization
- Security configuration setup
- Feature flag resolution
- Runtime environment detection
- Plugin hooks initialization
- Build output configuration

## CI/CD Integration

### GitHub Actions
```yaml
- name: Run benchmarks
  run: npm run bench

- name: Check regressions
  run: npm run bench:regression
```

### Performance Reports
Benchmarks generate reports in:
- `bench/results.json` - Raw results
- `bench/report.html` - HTML report (viewable in browser)
- `bench/comparison.md` - Markdown comparison

## Optimization Tips

### For Build Performance
- Use incremental builds
- Enable asset hashing
- Optimize images before build
- Use code splitting strategically
- Generate source maps only in dev

### For Routing Performance
- Pre-compile route patterns
- Use route caching
- Batch parameter extraction
- Optimize middleware chain order

### For SSR Performance
- Minimize component tree depth
- Use lazy loading strategically
- Batch DOM operations
- Compress responses with gzip/brotli

### For Middleware Performance
- Order middlewares by frequency
- Cache expensive operations
- Use connection pooling
- Avoid synchronous operations

### For Config Performance
- Cache parsed configs
- Lazy load plugins
- Validate once at startup
- Use feature flags efficiently

## Profiling

### CPU Profiling
```bash
NODE_OPTIONS=--prof npm run bench
node --prof-process isolate-*.log > profile.txt
```

### Memory Profiling
```bash
node --inspect-brk node_modules/vitest/vitest.mjs run bench/
# Open chrome://inspect
```

### Flamegraph
```bash
npm run bench -- --reporter=verbose > bench.log
# Use online flamegraph tools
```

## Best Practices

1. **Consistent Test Data**
   - Use same dataset sizes across runs
   - Normalize results for meaningful comparison

2. **Warmup Iterations**
   - JIT compilation needs warmup
   - Always run warmup before measuring

3. **Isolation**
   - Run benchmarks in isolated process
   - Avoid other workloads during testing

4. **Regression Detection**
   - Compare against baseline regularly
   - Set thresholds (e.g., 5% regression)

5. **Documentation**
   - Document expected performance
   - Track performance over time
   - Correlate with code changes

## Troubleshooting

### High Variance in Results
- Increase iteration count
- Close other applications
- Use isolated environment

### Outliers in Results
- Check for GC pauses
- Monitor CPU throttling
- Use `--isolate-gc` flag

### Unexpected Slowdowns
- Check Node.js version
- Verify dependencies haven't changed
- Profile with CPU/memory profilers

## Further Reading

- [Vitest Benchmarking](https://vitest.dev/guide/benchmark)
- [Web Vitals](https://web.dev/vitals/)
- [Node.js Profiling](https://nodejs.org/en/docs/guides/simple-profiling/)
- [Performance Optimization](https://developer.mozilla.org/en-US/docs/Web/Performance)

---

**Last Updated:** Feb 11, 2026
**Framework:** Jen.js v1.0.0
**Node Version:** >=18.0.0
