# Jen.js Benchmarks

Complete performance benchmarking suite for the Jen.js framework.

## 📁 Structure

```
bench/
├── build.bench.ts          # Build & bundling benchmarks
├── routing.bench.ts        # Routing & middleware benchmarks
├── ssr.bench.ts            # Server-side rendering benchmarks
├── middleware.bench.ts     # Middleware execution benchmarks
├── config.bench.ts         # Configuration loading benchmarks
├── compare.js              # Comparison against baseline
├── regression.js           # Regression detection
├── baseline.json           # Performance baseline
├── package.json            # Benchmark metadata
├── .gitignore              # Git ignore rules
└── README.md               # Benchmark documentation
```

## 🚀 Quick Start

### Run All Benchmarks
```bash
npm run bench
npm run perf:bench
```

### Run Specific Category
```bash
npm run bench -- build.bench
npm run bench -- routing.bench
npm run bench -- ssr.bench
npm run bench -- middleware.bench
npm run bench -- config.bench
```

### Compare Results
```bash
npm run bench:compare
```

### Detect Regressions
```bash
npm run bench:regression
```

## 📊 Benchmark Categories

### 1. Build Performance (10 benchmarks)
Tests SSG build pipeline, asset optimization, and bundling:
- SSG builds (simple & complex routes)
- Asset hashing (1000 files)
- CSS minification
- Image optimization
- Code splitting analysis
- Incremental builds
- Source map generation
- Bundle dependency analysis
- Build metadata serialization

**Target:** <100ms for 100-page sites

### 2. Routing Performance (15 benchmarks)
Tests route matching, parameter extraction, middleware:
- Static route matching
- Dynamic routes (single & multiple params)
- Catch-all routes ([...rest])
- Parameter extraction
- Complex pattern matching
- Route priority handling
- Middleware chain execution (5-50 middlewares)
- Route guards
- Nested route resolution
- Query string parsing
- Route caching (10K lookups)
- Link generation

**Target:** <1ms for route matching

### 3. Server-Side Rendering (15 benchmarks)
Tests SSR, hydration, and streaming:
- Simple component rendering
- Complex component trees (100-1000 nodes)
- List rendering (1000+ items)
- Props passing (500+ components)
- Conditional content
- HTML escaping
- Hydration markers
- Streaming responses
- Response compression
- Meta tags generation
- Head injection (Open Graph)
- Lazy loading markers
- Error boundaries
- Asset preloading

**Target:** <50ms for 1000 nodes

### 4. Middleware Performance (15 benchmarks)
Tests middleware execution and request handling:
- Single middleware
- Middleware chains (5-20 middlewares)
- Request logging
- Authentication validation
- CORS header setup
- Rate limiting (1000 requests)
- Response compression
- JSON parsing (100KB)
- Error handling
- Security headers
- Session management (500 sessions)
- Cache hit/miss
- Request validation
- Request cloning

**Target:** <5ms for 20-middleware chain

### 5. Configuration Performance (20 benchmarks)
Tests config loading and initialization:
- JSON config parsing (1000+ lines)
- Environment variables (100 vars)
- Config schema validation
- Plugin initialization (20 plugins)
- Middleware stack loading
- Route map building (500+ routes)
- Asset manifest compilation
- CSS pipeline initialization
- TypeScript configuration
- ESLint configuration
- Database connection pooling
- Cache configuration
- Logging system setup
- Security configuration
- Feature flag resolution
- Environment detection
- Plugin hooks initialization
- Dependency validation

**Target:** <50ms for complete initialization

## 📈 Performance Targets

| Component | Operation | Target | Notes |
|-----------|-----------|--------|-------|
| Build | SSG (100 pages) | <100ms | Incremental |
| Build | Asset hashing (1K files) | <500ms | Parallelizable |
| Routing | Match (100 routes) | <1ms | O(n) worst case |
| Routing | Middleware chain (20) | <5ms | Per request |
| SSR | Render (1K nodes) | <50ms | Per route |
| Middleware | Chain execution (20) | <5ms | Per request |
| Config | Initialization | <50ms | One-time |

## 🔧 Usage Examples

### Running Benchmarks with Options
```bash
# With warmup iterations
npm run bench -- --warmup=100

# With custom iteration count
npm run bench -- --iterations=1000

# With time budget
npm run bench -- --time=5000

# Verbose output
npm run bench -- --reporter=verbose
```

### CI/CD Integration
```bash
# Run benchmarks and check regressions
npm run bench && npm run bench:regression

# Generate report
npm run bench:report
```

### Profiling
```bash
# CPU profiling
NODE_OPTIONS=--prof npm run bench

# Memory profiling
node --inspect-brk node_modules/vitest/vitest.mjs run bench/
# Open chrome://inspect
```

## 📝 Creating New Benchmarks

1. Create benchmark file in `bench/` directory
2. Use `.bench.ts` extension
3. Follow structure:

```typescript
import { describe, bench } from 'vitest';

describe('Feature Name', () => {
  bench('Operation description', () => {
    // Setup
    const data = setupTestData();
    
    // Benchmark (avoid optimization)
    const result = performOperation(data);
    
    // Return to prevent optimization
    return result;
  });
});
```

4. Run: `npm run bench -- feature.bench`

## 🎯 Performance Goals for v1.0

| Metric | Goal | Current | Status |
|--------|------|---------|--------|
| SSG Build Time | <100ms | TBD | 🔄 |
| Route Matching | <1ms | TBD | 🔄 |
| SSR Render | <50ms | TBD | 🔄 |
| Middleware Overhead | <5ms | TBD | 🔄 |
| Config Load | <50ms | TBD | 🔄 |
| Bundle Size | <100KB (gzip) | TBD | 🔄 |
| Time to Interactive | <2s | TBD | 🔄 |

## 📊 Baseline Establishment

Initial baselines were established on:
- **Node.js:** v18.0.0+
- **OS:** Linux/macOS/Windows
- **System:** Standard development machine
- **Date:** Feb 11, 2026

Update baseline after significant changes:
```bash
npm run bench
cp bench/results.json bench/baseline.json
```

## 🔍 Regression Detection

Automatic detection of performance regressions:

```bash
npm run bench:regression
```

Thresholds:
- **Regression:** >5% slower
- **Warning:** >3% slower
- **Improvement:** >10% faster

## 📊 Reports

Benchmark results are saved to:
- `bench/results.json` - Raw results
- `bench/report.html` - HTML report
- `bench/comparison.md` - Markdown comparison

View HTML report:
```bash
open bench/report.html
# or in browser: file:///path/to/Jen.js/bench/report.html
```

## 🛠️ Troubleshooting

### High Variance
- Increase iteration count: `--iterations=10000`
- Close other applications
- Use isolated environment

### Unexpected Results
- Check Node.js version
- Profile with: `NODE_OPTIONS=--prof`
- Use memory profiler: `--inspect-brk`

### Regressions
- Compare against baseline
- Check recent commits
- Profile hot paths
- Use flamegraph analysis

## 📚 Related Documentation

- [SCRIPTS.md](./SCRIPTS.md) - Available npm scripts
- [AGENTS.md](./AGENTS.md) - Framework architecture
- [README.md](./README.md) - Project overview
- [TESTING.md](./TESTING.md) - Testing guide

## 🔗 Resources

- [Vitest Benchmarking](https://vitest.dev/guide/benchmark)
- [Web Vitals](https://web.dev/vitals/)
- [Node.js Performance](https://nodejs.org/en/docs/guides/simple-profiling/)
- [V8 Profiling](https://v8.dev/docs)

## 📈 Continuous Performance Monitoring

Benchmarks run in CI/CD to track performance over time:

```yaml
# GitHub Actions example
- name: Run benchmarks
  run: npm run bench
  
- name: Check regressions
  run: npm run bench:regression
  
- name: Upload results
  uses: actions/upload-artifact@v3
  with:
    name: benchmark-results
    path: bench/results.json
```

## 🎓 Best Practices

1. **Consistent Test Data**
   - Use same dataset sizes
   - Normalize results

2. **Warmup Iterations**
   - Run before measuring
   - Allow JIT compilation

3. **Isolation**
   - Run in isolated process
   - Minimal background tasks

4. **Tracking**
   - Compare against baseline
   - Track over time
   - Correlate with changes

5. **Optimization**
   - Profile hot paths
   - Use flamegraphs
   - Measure real-world scenarios

---

**Total Benchmarks:** 75+
**Last Updated:** Feb 11, 2026
**Framework:** Jen.js v1.0.0
**Status:** ✅ Ready for production
