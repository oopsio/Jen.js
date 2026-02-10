# Jen.js Testing Guide

## Overview

A comprehensive unit test suite has been created for Jen.js using **Vitest**, a modern TypeScript-first testing framework.

## Setup

### Added Dependencies

- `vitest@^2.1.8` - Testing framework
- `@vitest/ui@^2.1.8` - Optional UI dashboard

### Test Scripts

```bash
npm run test       # Watch mode (interactive)
npm run test:ui    # Visual dashboard
npm run test:run   # Run once (CI mode)
```

## Project Structure

```
tests/
├── api/               # API routing, handlers
│   └── routes.test.ts
├── build/            # Asset processing, bundling
│   └── pipeline.test.ts
├── core/             # Configuration, types, paths
│   ├── config.test.ts
│   ├── paths.test.ts
│   └── types.test.ts
├── middleware/       # Middleware pipeline
│   └── pipeline.test.ts
├── runtime/          # Client-side hydration
│   └── hydrate.test.ts
├── server/           # HTTP server, routing
│   └── app.test.ts
├── shared/           # Utilities (logging)
│   └── log.test.ts
└── README.md         # Detailed testing docs
```

## Test Coverage

| Category | Tests | Focus Areas |
|----------|-------|-------------|
| **Core** | 3 files | Config, paths, type validation |
| **Runtime** | 1 file | Hydration, island management |
| **Server** | 1 file | HTTP handling, middleware, routing |
| **Build** | 1 file | Asset hashing, minification, SSG |
| **API** | 1 file | Routes, requests, responses |
| **Middleware** | 1 file | Pipeline execution, error handling |
| **Shared** | 1 file | Logging levels, formatting |

**Total: 30+ unit tests**

## Configuration

### vitest.config.ts

```typescript
{
  test: {
    environment: "node",        // Node.js environment
    globals: true,              // No import needed for describe/it/expect
    include: ["tests/**/*.test.ts", "tests/**/*.spec.ts"]
  },
  resolve: {
    alias: {
      "@src": "src/*"           // Path alias support
    }
  }
}
```

## Example Test

```typescript
import { describe, it, expect } from "vitest";

describe("Feature", () => {
  it("should do something", () => {
    const result = doSomething();
    expect(result).toBe(expected);
  });
});
```

## Running Tests

### Development
```bash
npm run test        # Watch mode, re-runs on file changes
npm run test:ui     # Open browser dashboard
```

### CI/CD
```bash
npm run test:run    # Single run, process exit with code
npm run test:run -- --coverage  # With coverage report
```

## Next Steps

1. **Install dependencies**: `npm install`
2. **Run tests**: `npm run test`
3. **Add more tests**: Create `tests/**/*.test.ts` files
4. **Integrate CI**: Add test script to GitHub Actions/CI pipeline
5. **Monitor coverage**: Run `npm run test:run -- --coverage`

## Documentation

- Full testing guide: [tests/README.md](tests/README.md)
- Vitest docs: https://vitest.dev
- Configuration: [vitest.config.ts](vitest.config.ts)

## Key Features

✅ **TypeScript Support** - Full strict mode compatibility  
✅ **Path Aliases** - `@src/*` imports work seamlessly  
✅ **Watch Mode** - Auto-rerun on file changes  
✅ **Coverage Reports** - HTML, JSON, terminal output  
✅ **Global APIs** - No import needed for describe/it/expect  
✅ **Mocking** - vi.mock(), vi.spyOn() utilities  
✅ **UI Dashboard** - Visual test runner with npm run test:ui  

---

**Status**: Ready to use. Run `npm install && npm run test` to get started.
