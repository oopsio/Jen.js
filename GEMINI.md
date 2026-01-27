# Jen.js - Gemini Agent Context

## Project Overview
**Jen.js** is a high-performance, TypeScript-first web framework supporting Static Site Generation (SSG) and Server-Side Rendering (SSR). It is designed with a hybrid architecture that allows core heavy-lifting tasks (bundling, dev-server) to be offloaded to native modules (Rust/C++) while maintaining a flexible TypeScript API.

## Repository Structure

### Core Framework (`/`)
The root directory acts as the main workspace for developing the framework itself.
- **`src/`**: The source code for the framework.
  - **`core/`**: Fundamental types, configuration, and path management.
  - **`build/`**: The SSG build pipeline, asset hashing, and minification logic.
  - **`server/`**: HTTP server implementation and request handling.
  - **`runtime/`**: Client-side runtime, hydration logic, and Preact integration.
  - **`native/`**: TypeScript interface for native modules. Currently implements stubs that act as placeholders for the Rust/C++ implementations.
  - **`cli/`**: Command-line interface logic.
- **`native/`**: Source code for native extensions.
  - **`rust/`**: Rust modules (e.g., `devserver`, `stylepack`).
  - **`cpp/`**: C++ modules (e.g., `bundler`).
- **`packages/jenjs/`**: The distributable NPM package. Contains the bundled version of the framework.

### Documentation & Examples
- **`example/`**: Sample projects demonstrating framework usage.
  - **`blog/`**: A blog implementation using Jen.js.
  - **`boilerplate/`**: A starter template.
- **`website/`**: The official documentation site (Docusaurus-based).

## Architecture & Key Concepts

### 1. Hybrid Native/JS Architecture
Jen.js is built to optionally use native code for performance.
- **Current State:** The framework primarily uses TypeScript implementations located in `src/`.
- **Native Interface:** `src/native/` contains the API definitions. In the future, these will bind to the compiled binaries from `native/`.

### 2. Build Pipeline (`src/build/`)
The build process is centered around `esbuild` for transpilation and bundling.
- **SSG:** Generates static HTML by rendering Preact components to strings.
- **Hydration:** Generates client-side bundles to "hydrate" the static HTML into interactive apps.
- **Asset Management:** Handles hashing and manifest generation for cache busting.

### 3. Server (`src/server/`)
- A custom HTTP server that serves the generated static content and handles API requests.
- Supports "islands" architecture concepts via partial hydration.

## Development Workflow

### Prerequisites
- Node.js (v20+ recommended)
- pnpm (managed via `corepack` or `npm`)
- Rust/Cargo (if working on `native/rust`)
- C++ Compiler (if working on `native/cpp`)

### Common Commands
Run these from the project root:

- **Start Dev Server:**
  ```bash
  npm run dev
  ```
  Starts the framework's development server on `http://localhost:3000`.

- **Build Framework (SSG):**
  ```bash
  npm run build
  ```
  Builds the static site artifacts to `dist/`.

- **Bundle for Distribution:**
  ```bash
  npm run bundle
  ```
  Bundles the `src/` code into `packages/jenjs/`.

- **Clean Artifacts:**
  ```bash
  npm run clean
  ```

- **Typecheck:**
  ```bash
  npm run typecheck
  ```

### Working with Examples
To test changes against an example project:
1. Navigate to the example: `cd example/blog`
2. Install dependencies: `npm install`
3. Run the project's dev script (which should link back to the root framework): `npm run dev`

## Coding Conventions
- **TypeScript First:** All framework code is TypeScript.
- **ESM Only:** The project is pure ESM (`type: "module"` in package.json).
- **Import Extensions:** Relative imports MUST include the `.js` extension (e.g., `import { foo } from './foo.js';`) to satisfy native ESM and esbuild requirements, even for `.ts` source files.
- **Path Aliases:** Use `@src/` to import from the `src` root.
- **React/Preact:** The framework uses Preact aliased as React. Use `preact/jsx-runtime`.

## Native Module Development
- **Rust:** Located in `native/rust`. Use standard `cargo` commands within that directory.
- **C++:** Located in `native/cpp`.

