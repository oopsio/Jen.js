# Jenpack

A modern SWC-based bundler and dev server for the Jen.js ecosystem.

## Features

- ⚡️ Fast bundling powered by SWC
- 🔥 Hot module reloading (WebSocket-based)
- 📦 Smart code splitting and chunking
- 🗺️ Source maps for debugging
- 🎯 TypeScript & JSX/TSX support out of the box
- 🎨 CSS and static asset handling
- 📊 Build analysis and visualization
- 💾 Intelligent caching system
- 🚀 Production-grade minification

## Installation

```bash
npm install @jen/jenpack
```

## CLI Usage

### Development Server

Start a dev server with hot reload:

```bash
jenpack dev src/index.tsx
```

Options:
- `--port <port>` - Server port (default: 3000)
- `--host <host>` - Server host (default: 0.0.0.0)

### Build

Create a production bundle:

```bash
jenpack build src/index.tsx --out dist
```

Options:
- `--out <dir>` - Output directory (default: dist)
- `--minify` - Enable minification (default: true)
- `--sourcemap` - Generate source maps (default: true)

### Analyze

Inspect your bundle:

```bash
jenpack analyze src/index.tsx
```

Shows:
- Module dependency tree
- Bundle sizes
- Dependency counts per module

### Clean

Remove cache and build artifacts:

```bash
jenpack clean
```

## Configuration

Create a `jenpack.config.ts` file in your project root:

```typescript
import { defineConfig } from '@jen/jenpack';

export default defineConfig({
  entry: 'src/index.tsx',
  outDir: 'dist',
  publicDir: 'public',
  jsxImportSource: 'preact',
  minify: true,
  sourcemap: true,
  define: {
    __DEV__: 'process.env.NODE_ENV === "development"',
  },
  alias: {
    '@': './src',
  },
  external: ['preact', 'preact/hooks'],
});
```

### Configuration Options

- `entry`: Entry point file (required for dev/build)
- `outDir`: Output directory for builds (default: dist)
- `publicDir`: Static assets directory (default: public)
- `jsxImportSource`: JSX runtime source (default: preact)
- `minify`: Enable production minification (default: true)
- `sourcemap`: Generate source maps (default: true)
- `define`: Environment variables to define
- `alias`: Path aliases (e.g., @ -> ./src)
- `external`: Packages to exclude from bundle

## Development

```bash
npm run build    # Build TypeScript
npm run dev      # Watch TypeScript
npm test         # Run tests
```

## Architecture

```
src/
  cli/           # CLI commands
  core/          # Core bundler logic
  resolver/      # Module resolution
  server/        # Dev server
  cache/         # Caching system
  swc/           # SWC integration
  types/         # TypeScript type definitions
  utils/         # Utilities
```

## Supported File Types

- **JavaScript**: .js, .mjs, .cjs
- **TypeScript**: .ts, .mts, .cts
- **JSX/TSX**: .jsx, .tsx
- **CSS**: .css
- **JSON**: .json
- **Static Assets**: .png, .jpg, .jpeg, .gif, .svg, .webp, .ico, .woff, .woff2, .ttf, .eot

## License

MIT
