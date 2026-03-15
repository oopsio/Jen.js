# @jenjs/core-engine

High-performance Go/WebAssembly engine replacing heavy TypeScript logic in `src/core/`.

## Features

- **Route Scanning** (`scan.go`): Fast filesystem traversal with `filepath.WalkDir`, replaces `src/core/routes/scan.ts`
- **Route Matching** (`match.go`): Regex-based URL matching with parameter extraction and security validation, replaces `src/core/routes/match.ts`
- **HTTP Utilities** (`http.go`): Cookie parsing and header normalization, replaces `src/core/http.ts`
- **WebAssembly Export**: All functions exposed via `global.jenGo` object using `syscall/js`
- **Standard Library Only**: No external dependencies; optimized for minimal disk footprint

## Build Instructions

### Prerequisites
- Go 1.21+ installed
- Node.js environment for running build scripts

### Build WebAssembly

Unix/Linux/macOS:
```bash
npm run build:wasm:unix
# or
bash build.sh
```

Windows:
```bash
npm run build:wasm:windows
# or
powershell -Command .\build.ps1
```

Cross-platform:
```bash
npm run build:wasm
```

This generates `src/vendor/engine.wasm`.

## Usage

### TypeScript Integration

```typescript
import {
  initializeEngine,
  scanRoutes,
  matchRoute,
  parseCookies,
} from "@jenjs/core-engine";

// Initialize the WASM engine (must be called once)
await initializeEngine();

// Scan routes
const routes = scanRoutes(config, "./src/pages");

// Match a pathname
const result = matchRoute(routes, "/posts/42");
if (result) {
  console.log(result.route.urlPath); // "/posts/:id"
  console.log(result.params.id);     // "42"
}

// Parse cookies
const cookies = parseCookies("sessionId=abc123; theme=dark");
console.log(cookies); // { sessionId: "abc123", theme: "dark" }
```

## Go Module Structure

### `main.go`
- Wasm entry point
- Registers functions in `global.jenGo` object
- Provides FFI bindings via `syscall/js`

### `scan.go`
- `Walker` struct for filesystem traversal
- `Scan()` method replaces TypeScript `scanRoutes()`
- Pattern matching for route files
- Route sorting by specificity
- JSON-compatible RouteEntry output

### `match.go`
- `Matcher` struct for route matching
- Regex-based pathname matching
- Parameter extraction and URL decoding
- Security validation via `validateRouteParam()`
- Path traversal attack prevention

### `http.go`
- `CookieParser` for RFC 6265 cookie parsing
- Cookie header splitting and decoding
- Safe whitespace handling
- URL-decoding of cookie values

## Performance Considerations

1. **Filesystem Traversal**: Go's `filepath.WalkDir` is ~3-5x faster than recursive Node.js `fs` calls
2. **Regex Compilation**: Patterns compiled once per match; consider caching for high-traffic routes
3. **No Dependencies**: Standard library only keeps WASM binary small (~2-3MB uncompressed)
4. **Memory Efficiency**: Go's memory management optimal for route lookup operations

## Type Safety

All Go types are mirrored in `index.ts`:
- `RouteEntry` matches `src/core/routes/scan.ts`
- `MatchResult` matches `src/core/routes/match.ts`
- JSON serialization ensures type compatibility

## Security

- **Path Traversal Prevention**: `validateRouteParam()` blocks `..`, `/`, and `\` sequences
- **Null Byte Rejection**: Prevents null-byte injection attacks
- **URL Decoding**: Parameter values safely decoded before validation
- **Character Whitelisting**: Regular parameters limited to alphanumeric, `-`, `_`, `.`

## Constraints Met

✓ Standard library only (Go stdlib packages)
✓ Direct placement in `packages/jen-core/` root
✓ 100% JSON output compatibility with TypeScript types
✓ Optimized for low-disk systems (7-year-old PC compatibility)
✓ Global `jenGo` object via syscall/js
✓ Blocking channel keeps Go runtime alive
