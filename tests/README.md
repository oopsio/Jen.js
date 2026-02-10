# Jen.js Unit Tests

Comprehensive unit test suite for the Jen.js framework using Vitest.

## Running Tests

```bash
# Run tests in watch mode
npm run test

# Run tests with UI
npm run test:ui

# Run tests once (CI mode)
npm run test:run
```

## Test Structure

```
tests/
├── api/              # API routes and handlers
├── build/            # Build pipeline and asset handling
├── core/             # Core framework (config, types, paths)
├── middleware/       # Middleware pipeline
├── runtime/          # Client hydration and rendering
├── server/           # HTTP server and routing
├── shared/           # Shared utilities (logging)
└── README.md
```

## Test Categories

### Core Tests (`tests/core/`)
- **config.test.ts**: Configuration loading, merging, validation
- **paths.test.ts**: Path resolution, aliases, relative/absolute paths
- **types.test.ts**: Type validation, component props, routes, middleware

### Runtime Tests (`tests/runtime/`)
- **hydrate.test.ts**: Island hydration, state preservation, error handling

### Server Tests (`tests/server/`)
- **app.test.ts**: HTTP server, routing, middleware pipeline, responses

### Build Tests (`tests/build/`)
- **pipeline.test.ts**: Asset hashing, minification, islands extraction, output

### API Tests (`tests/api/`)
- **routes.test.ts**: Route registration, request/response handling, validation

### Middleware Tests (`tests/middleware/`)
- **pipeline.test.ts**: Middleware execution, built-in middleware, error handling

### Shared Tests (`tests/shared/`)
- **log.test.ts**: Logging levels, formatting, output, filtering

## Writing New Tests

### Example Test File

```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";

describe("Feature Name", () => {
  beforeEach(() => {
    // Setup code runs before each test
  });

  it("should do something specific", () => {
    // Test implementation
    expect(value).toBe(expected);
  });

  it("should handle edge cases", () => {
    expect(() => {
      // Code that might throw
    }).toThrow();
  });
});
```

### Common Assertions

```typescript
expect(value).toBe(expected);           // Strict equality
expect(value).toEqual(expected);        // Deep equality
expect(value).toContain(item);          // Array/string contains
expect(value).toMatch(/pattern/);       // Regex match
expect(fn).toThrow();                   // Function throws
expect(value).toBeDefined();            // Not undefined
expect(value).toBeNull();               // Null value
expect(value).toBeTruthy();             // Truthy value
expect(array).toHaveLength(n);          // Array length
```

## Coverage

Run tests with coverage:

```bash
npm run test:run -- --coverage
```

Coverage reports are generated in:
- Terminal output
- `coverage/index.html` (HTML report)
- `coverage/coverage-final.json` (JSON report)

## Best Practices

1. **One assertion per test** - Keep tests focused
2. **Descriptive names** - Use clear, specific test descriptions
3. **Setup/Teardown** - Use `beforeEach`/`afterEach` for fixtures
4. **Mock external dependencies** - Use `vi.mock()` and `vi.spyOn()`
5. **Test behavior, not implementation** - Focus on what the code does
6. **Keep tests isolated** - No dependencies between tests

## Mocking

```typescript
import { vi } from "vitest";

// Mock a module
vi.mock("@src/module", () => ({
  default: vi.fn(),
}));

// Spy on a function
const spy = vi.spyOn(obj, "method");
expect(spy).toHaveBeenCalled();

// Mock implementation
spy.mockImplementation(() => "mocked");
```

## Configuration

Vitest config: `vitest.config.ts`

Key settings:
- **environment**: Node.js (for testing server code)
- **globals**: True (no need to import describe/it/expect)
- **include**: Tests in `tests/**/*.test.ts` or `tests/**/*.spec.ts`
- **coverage**: V8 provider with HTML reports

## CI/CD Integration

Tests run automatically on:
- Local development (`npm run test`)
- Pre-commit hooks (recommended)
- CI pipelines (use `npm run test:run`)

### GitHub Actions Example

```yaml
- name: Run tests
  run: npm run test:run

- name: Upload coverage
  uses: codecov/codecov-action@v3
```

## Troubleshooting

### Tests not found
- Check file naming: `*.test.ts` or `*.spec.ts`
- Verify `vitest.config.ts` includes pattern

### TypeScript errors
- Ensure `tsconfig.json` includes test files
- Check path aliases are configured correctly

### Import resolution
- Use `@src/*` for framework imports
- Use relative imports for local modules

## Contributing

When adding features:
1. Write tests first (TDD approach)
2. Implement feature
3. Verify all tests pass
4. Update this README if adding new test categories

---

For more info: [Vitest Documentation](https://vitest.dev)
