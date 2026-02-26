# AGENTS.md - Jen.js Framework Codebase

## 🚫 Documentation Rule (CRITICAL)

DO NOT create any `.md` or `.txt` files for documentation.

- Do NOT scaffold README files.
- Do NOT generate guides.
- Do NOT create markdown documentation.
- Do NOT output documentation files of any kind.
- Do NOT suggest creating documentation files.

The agent must respond ONLY in chat.

If documentation is needed, I will ask direct questions.
Answers should be conversational and inline — never as files.

---

## Build & Test Commands

- `npm run dev` - Start dev server (runs `node server.ts dev`)
- `npm run start` - Start production server (runs `node server.ts start`)
- `npm run build` - Build static site (runs `node build.js`, output to `dist/`)
- `npm run bundle` - Bundle framework artifacts (runs `node bundle.js`)
- `npm run clean` - Clean build artifacts
- `npm run typecheck` - Run TypeScript type checking
- `npm run setup` - Run platform-aware setup script (prefers `scripts/setup.sh`, falls back to `scripts/setup.ps1`)
- `npm run dev:unix` / `npm run dev:windows` - OS-specific dev scripts
- `npm run build:unix` / `npm run build:windows` - OS-specific build scripts
- `npm run test` - Run tests in watch mode (Vitest)
- `npm run test:run` - Run tests once (CI mode)
- `npm run test:ui` - Visual test dashboard
- `npm run test:run -- --coverage` - Tests with coverage report
- Linting available via `eslint.config.ts`; tests in `tests/` (30+ units)

## Architecture

**Jen.js** is a TypeScript-first framework for building static and server-rendered applications with Preact.

### Core modules (src/):

- `src/build/` - SSG pipeline, asset hashing, minification, islands hydration
- `src/server/` - HTTP server app, runtime serving, API routes
- `src/core/` - Config, routing, paths, types, middleware hooks
- `src/runtime/` - Preact SSR + client hydration/runtime
- `src/api/`, `src/auth/`, `src/db/`, `src/cache/` - Feature modules
- `src/graphql/`, `src/i18n/`, `src/jdb/` - GraphQL, localization, embedded DB helpers
- `src/css/` - SCSS/CSS compilation pipeline
- `src/middleware/` - Express-style middleware pipeline + built-ins
- `src/native/` - JS stubs for native dev-server/bundler/style-compiler/optimizer
- `src/build-tools/` and `src/python/` - Legacy build utilities
- `src/plugin/` - Plugin loader system
- `src/cli/` - CLI templates and banner output
- `src/shared/` - Shared logging utilities

### Key entry points

- `server.ts` (HTTP)
- `build.ts` (SSG)
- `bundle.js` (bundling)
- `jen.config.ts` (site config)
- `src/index.ts` (framework exports)

## Repository layout

- `packages/` - Monorepo packages (`create-jen-app`, `jenjs`, `jenjs-ghpackages`)
- `jenpack/` and `preactsc/` - Packaging/build tooling and examples
- `native/` - Rust/C++/stylepack native implementations
- `example/` and `website/` - Example versions and website assets

## Code Style

- **TypeScript** strict mode (ES2022 target/module, moduleResolution Bundler)
- **Preact** + JSX (via `preact` JSX runtime)
- **Path aliases:** `@src/*` maps to `src/*`, use for cross-module imports
- **Imports:** Relative imports use `.js` extensions for ESM output
- **JS + TS mix:** `allowJs` is enabled for shared JS/TS code
- **Error handling:** Try/catch in async handlers; log via `@src/shared/log`
- **File naming:** camelCase for exports, kebab-case for filenames
- **Native modules:** Stubs live in `src/native/`; production impls live under `native/`