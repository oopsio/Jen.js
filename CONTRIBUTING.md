# Contributing to Jen.js

First of all, thank you for considering contributing to Jen.js! It's people like you who make the web a better place.

## Development Setup

Jen.js is a monorepo consisting of TypeScript packages (Vite/Preact) and Rust crates (WASM/Core logic).

### Prerequisites

- [Bun](https://bun.sh) (v1.1+ recommended)
- [Rust](https://rustup.rs) (stable)
- [Node.js](https://nodejs.org) (for compatibility testing)

### Installation

```bash
# Clone the repository
git clone https://github.com/oopsio/Jen.js.git
cd Jen.js

# Install dependencies
bun install
```

## Build & Test Commands

### Build

```bash
# Build TypeScript packages
bun run build

# Build Rust crates (all targets)
cargo build --all
```

### Test

```bash
# Run all tests
bun test

# Run a specific test file
bun test packages/jen/src/server/__tests__/isr-manager.test.ts
```

### Lint & Format

```bash
# Format codebase with Prettier
bun x prettier --write .
```

## How to Contribute

1. **Find an Issue**: Search for open issues or create a new one to discuss your idea.
2. **Fork & Branch**: Fork the repo and create a branch for your feature/fix.
3. **Write Code**: Ensure your code follows the existing style and architectural patterns (see `AGENTS.md` for details).
4. **Add Tests**: All new features or bug fixes should include relevant tests.
5. **Lint & Format**: Run `bun x prettier --write .` before committing.
6. **Submit PR**: Open a Pull Request with a clear description of your changes.

## Code Style

- **TypeScript**: Strict typing, `PascalCase` for classes, `camelCase` for methods/variables.
- **Rust**: `PascalCase` for traits/structs, `snake_case` for functions/modules.
- **Imports**: Grouped imports, prefer `node:` prefix for built-ins.

---

Thank you for your contribution!
