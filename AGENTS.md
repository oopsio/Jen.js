# AGENTS.md - Jen.js Framework Codebase

## Build & Test Commands
- `npm run build` – Build static site (SSG) to `dist/`
- `npm run dev` – Start dev server on http://0.0.0.0:3000
- `npm run start` – Start production server
- `npm run typecheck` – Run TypeScript type checking
- `npm run clean` – Clean build artifacts
- No test suite configured; linting can be added via `eslint`

## Architecture
**Jen.js** is a TypeScript-first framework for building static-generated and server-rendered sites with Preact.

**Core modules (src/):**
- `src/build/` – Static site generation (SSG) logic
- `src/server/` – HTTP server & request handling
- `src/core/` – Config, routing, paths, types
- `src/runtime/` – Route rendering (Preact SSR + hydration)
- `src/api/`, `src/auth/`, `src/db/`, `src/cache/` – Feature modules
- `src/middleware/` – Express-style middleware system
- `src/native/` – Native module stubs (dev-server, bundler, style-compiler, optimizer)
- `src/build-tools/` – Build utilities (previously Python)
- `src/plugin/` – Plugin system with loader
- `src/cli/` – CLI with templates
- `site/` – Example site (config: `jen.config.ts`)

**Key entry points:** `server.ts` (HTTP), `build.ts` (SSG), `jen.config.ts` (site config)

## Code Style
- **TypeScript** strict mode (ES2022 target)
- **Preact** + JSX (via `preact/jsx-runtime`)
- **Path aliases:** `@src/*` maps to `src/*`, use for cross-module imports
- **Imports:** All relative imports use `.js` extension (transpiled by esbuild)
- **Type safety:** `allowImportingTsExtensions` enabled for `.ts` imports in source
- **Error handling:** Try-catch in async handlers; log via `@src/shared/log`
- **File naming:** CamelCase for exports, kebab-case for files
- **Native modules:** All stubs in TypeScript (Rust/C++ implementations for production)
