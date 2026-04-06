# Jen.js (we-jenjs)

High-performance, feature-packed web framework for the modern web.

## Key Features

- **Streaming SSR**: Built-in streaming Server-Side Rendering with Preact.
- **ISR**: Native Incremental Static Regeneration with automated disk caching.
- **Routing**: Automatic file-based routing for both Pages (`/pages`) and APIs (`/api`).
- **i18n**: Native internationalization with locale-based routing.
- **Optimization**: Deeply integrated Font and Image optimization plugins.
- **Hardened**: NIST SP 800-44 and OWASP ASVS L1 security headers by default.

> [!NOTE]
> After building, you will need to rename the d.ts for jen_router.js to .d.cts and build the jen crate from crates/jen and copy the wasm binary to the dist/src/core directory.

## Quick Start

```bash
# Install dependencies
bun install

# Start development server
bun x jen dev

# Build for production
bun x jen build
```

## Project Structure

- `src/`: Framework core (Server, ISR, Plugin system).
- `pages/`: UI components (Preact/React).
- `api/`: API route handlers.
- `jen.config.mjs`: Core framework configuration.

## License

MIT
