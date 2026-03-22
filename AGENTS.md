# Jen.js Developer Guide

## Build & Test Commands

- **Install:** `bun install`
- **Build TS:** `bun run build` (root/packages)
- **Build Rust:** `cargo build --all`
- **Test All:** `bun test`
- **Single Test:** `bun test packages/jen/src/server/__tests__/isr-manager.test.ts`
- **Format:** `bun x prettier --write .`

## Architecture

- **packages/jen:** Main framework (Vite-based, Preact for SSR/ISR).
  - **src/fonts:** Font optimization module (`GoogleFont`).
- **crates/:** Core logic in Rust (WASM targets like `jen-router`).
- **Core components:** `RouteScanner`, `RouterMap`, `ISRManager`, `SsrEngine`, `jenFontPlugin`.

## Code Style

- **TypeScript:** Strict typing, `PascalCase` for classes, `camelCase` for methods/vars.
- **Fonts:** Use `GoogleFont` from `packages/jen/src/fonts` for automatic optimization and SSR head injection.
- **Rust:** PascalCase traits/structs, snake_case functions/modules, `//!` doc comments.
- **Imports:** Grouped, prefer `node:` prefix for built-ins.
- **Error Handling:** `try-catch` with color-coded terminal output in TS; `Result/JenError` in Rust.
- **Security:** Strict adherence to NIST SP 800-44 and OWASP ASVS L1 headers.
