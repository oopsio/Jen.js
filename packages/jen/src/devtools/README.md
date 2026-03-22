# Jen.js DevTools

**Zero-Production-Cost Sidecar System** for deep visibility into Jen.js internals.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Development Only                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐        ┌──────────────────────────┐   │
│  │   Vite Plugin    │◄──────►│  Virtual Module System   │   │
│  │ (Injection Gate) │        │  (Tree-shaken in prod)   │   │
│  └──────────────────┘        └──────────────────────────┘   │
│                                         │                    │
│                ┌────────────────────────┼─────────────────┐  │
│                │                        │                 │  │
│         ┌──────▼────────┐     ┌─────────▼──────┐  ┌──────▼──┐ │
│         │ RouterBridge  │     │ SecurityAuditor│  │ SSR     │ │
│         │ (WASM trace)  │     │(OWASP ASVS)    │  │Detector │ │
│         └───────────────┘     └────────────────┘  └─────────┘ │
│                │                        │                 │  │
│         ┌──────────────────────────────────────────────────┐  │
│         │         DatabaseMonitor                          │  │
│         │      (Query interception & logging)              │  │
│         └──────────────────────────────────────────────────┘  │
│                │                        │                 │  │
│                └────────────────────────┼─────────────────┘  │
│                                         │                    │
│         ┌───────────────────────────────▼──────────────────┐  │
│         │      DevToolsClient (WebSocket)                  │  │
│         │   Communicates with DevServer sidecar            │  │
│         └───────────────────────────────────────────────────┘  │
│                        │                                      │
│         ┌──────────────▼─────────────────────────────────┐   │
│         │   DevToolsUI (Floating Overlay)                │   │
│         │   Old-School 2014-2018 Aesthetic              │   │
│         │   - Routes (Match traces)                     │   │
│         │   - Security (Header audit)                   │   │
│         │   - SSR (Hydration metrics)                   │   │
│         │   - DB (Query logs)                           │   │
│         └──────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Core Systems

### 1. Router Telemetry (`RouterBridge`)

Captures Rust WASM RouteMatcher output and formats it for analysis:

```typescript
import { RouterBridge } from '@jen/devtools';

// Captured automatically by middleware
RouterBridge.onTrace((trace) => {
  console.log(`Route: ${trace.pathname}`);
  console.log(`Match: ${trace.matchedPath}`);
  console.log(`Params: ${JSON.stringify(trace.params)}`);
  console.log(`Time: ${trace.executionTime}ms`);
});

// Analyze routing issues
const issues = RouterBridge.analyze(traces);
```

**Output**: Match traces, performance analysis, parameter extraction.

### 2. Security Auditing (`SecurityAuditor`)

Real-time OWASP ASVS Level 1 compliance checking:

```typescript
import { SecurityAuditor } from '@jen/devtools';

const result = SecurityAuditor.audit(
  'http://localhost:3000/',
  response.headers,
);

console.log(result.overallCompliant);
console.log(result.warnings);
```

**Checks**:
- Content-Security-Policy (CSP)
- Strict-Transport-Security (HSTS)
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection

### 3. SSR/Hydration Detection (`SSRHydrationDetector`)

Detects server<->client render mismatches:

```typescript
import { SSRHydrationDetector } from '@jen/devtools';

const mismatch = SSRHydrationDetector.detectMismatch(
  serverHtml,
  document.getElementById('jen-root'),
);

if (mismatch.mismatches.length > 0) {
  console.warn('Hydration mismatch detected!', mismatch);
}
```

**Detects**:
- Element count mismatches
- Missing/extra attributes
- Text content differences
- Performance bottlenecks

### 4. Database Monitoring (`DatabaseMonitor`)

Intercepts native driver queries:

```typescript
import { DatabaseMonitor } from '@jen/devtools';

DatabaseMonitor.logQuery(
  'SELECT * FROM users WHERE id = ?',
  23.5, // duration
  'postgres',
  { rows: 1 },
);

const report = DatabaseMonitor.generateReport();
const bottlenecks = DatabaseMonitor.analyzeBottlenecks();
```

**Analyzes**:
- Query execution time
- Slow query detection (>100ms)
- N+1 query patterns
- Error tracking

## Integration Points

### With Dev Server (`app.ts`)

```typescript
// In middleware chain
import { RouterBridge, SecurityAuditor } from '@jen/devtools';

server.middlewares.use(async (req, res, next) => {
  const startTime = performance.now();
  const match = routeMatcher.match(req.url);
  const duration = performance.now() - startTime;
  
  RouterBridge.captureMatch(req.url, match, duration);
  
  // Later, after response is ready
  const audit = SecurityAuditor.audit(req.url, res.getHeaders());
  // Send to DevTools
});
```

### With Vite Plugin

```typescript
// vite.config.ts
import { createDevToolsPlugin } from '@jen/devtools';

export default {
  plugins: [
    createDevToolsPlugin(),
    // ... other plugins
  ],
};
```

### Virtual Module Usage

```typescript
// In your app code - automatically gated behind NODE_ENV
import { 
  captureRouteTrace, 
  captureSecurityAudit,
  captureSSRMetrics,
} from 'virtual:jenjs-devtools';

// In production: all of these are no-ops
// In development: they send data to DevTools server
```

## Production Safety

### Tree-Shaking Guarantee

The Vite plugin ensures **zero bytes** of DevTools code ship to production:

1. **Virtual Module Injection**: Only in `serve` mode
2. **Environment Check**: Production builds get empty stubs
3. **Dead Code Elimination**: Unused imports removed by Vite

```typescript
// Production build receives this:
export const DevTools = null;
export const useDevTools = () => null;
export const captureRouteTrace = () => {};
```

### Security Posture

DevTools maintains NIST SP 800-44 compliance:

- **No sensitive data leaked**: Queries sanitized, PII masked
- **Secure WebSocket**: Use `wss://` in production
- **Local-only by default**: Binds to localhost:3001
- **Dev-only injection**: Zero attack surface in prod

## Usage Example

```typescript
// pages/app.tsx
import { useDevTools } from 'virtual:jenjs-devtools';

export default function App() {
  const devTools = useDevTools();

  useEffect(() => {
    // Send custom metrics
    devTools?.send('custom-metric', {
      name: 'page_load',
      duration: 123,
    });
  }, [devTools]);

  return <div>...</div>;
}
```

## DevTools UI

Floating overlay with old-school aesthetic:

```
╭─────────────────────────────────┐
│ Jen.js DevTools        [Routes] │
├─────────────────────────────────┤
│ ✓ /users/123                    │
│   {"id": "123"}                 │
│   12.34ms                       │
│                                 │
│ ✗ /api/data                     │
│   No match (404)                │
│   1.23ms                        │
│                                 │
│ [Security] [SSR] [DB]           │
└─────────────────────────────────┘
```

**Tabs**:
- **Routes**: Request traces, match analysis
- **Security**: OWASP compliance, header audit
- **SSR**: Render time, hydration status, mismatches
- **DB**: Query logs, performance bottlenecks

## Configuration

```typescript
// jen.config.ts
export default {
  devTools: {
    enabled: true,
    wsUrl: 'ws://localhost:3001',
    slowQueryThreshold: 100, // ms
    routeTraceHistory: 50,
    queryLogLimit: 100,
  },
};
```

## Performance Impact

- **Zero impact in production** (completely removed)
- **<100ms overhead in development** (WebSocket telemetry)
- **No blocking operations** (async message queue)
- **Automatic garbage collection** (ring buffer for logs)

---

**DevTools Philosophy**: *Radical transparency with zero production cost.*
