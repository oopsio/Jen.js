# AGENTS.md - Jen.js Framework Codebase

## Documentation Rule - CRITICAL

DO NOT create any `.md` or `.txt` files for documentation.

- Do NOT scaffold README files.
- Do NOT generate guides.
- Do NOT create markdown documentation.
- Do NOT output documentation files of any kind.
- Do NOT suggest creating documentation files.

The agent must respond ONLY in chat.

If documentation is needed, I will ask direct questions.
Answers should be conversational and inline — never as files.

## Critical Runtime & Package Management Rule

**Rule:** All agents must adhere to the following runtime and package manager configuration:

1. **Primary Runtime:** Node.js — used for all standard execution tasks.
2. **Fast/Heavy Tasks Runtime:** Bun — used exclusively for computationally intensive or hard tasks to maximize performance.
3. **Package Manager:** Bun (`bun install`) — must be used for all dependency management; no other package managers (npm, yarn, pnpm) are allowed.

**Enforcement Notes:**

- Agents should automatically detect hard tasks and switch execution to Bun runtime.
- Any deviation from this rule is considered critical and must be logged.

> Hard tasks are defined as any task flagged by computational cost, runtime duration, or explicit "heavy" designation. Agents must switch to Bun automatically in these cases.

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
- `src/plugin/` - Advanced plugin system with hooks (build, dev, request, render stages)
- `src/api/`, `src/auth/`, `src/db/`, `src/cache/` - Feature modules
- `src/graphql/`, `src/i18n/`, `src/jdb/` - GraphQL, localization, embedded DB helpers
- `src/css/` - SCSS/CSS compilation pipeline
- `src/middleware/` - Express-style middleware pipeline + built-ins
- `src/build-tools/` - Legacy build utilities
- `src/cli/` - CLI templates and banner output
- `src/shared/` - Shared logging utilities

### Key entry points

- `server.ts` (HTTP)
- `build.ts` (SSG)
- `bundle.js` (bundling)
- `jen.config.ts` (site config)
- `src/index.ts` (framework exports)

## Repository layout

- `packages/` - Monorepo packages (10 packages: CLI, core, create-jen-app, jenjs, mcp, etc.)
- `src/` - Core framework source (30+ modules)
- `tests/` - Test suite with fixtures, integration tests, and benchmarks
- `apps/`, `examples/`, `bench/` - Example applications and benchmarks
- `scripts/`, `site/` - Build scripts and framework website

## Monorepo Structure Overview

```
jen.js/
├── .agents/                      # Agent skills and workflows
├── .cargo/                       # Rust/Cargo build artifacts
├── .devcontainer/                # VS Code devcontainer config
├── .esbuild/                     # ESBuild configuration/cache
├── .git/                         # Git repository metadata
├── .githooks/                    # Custom git hooks
├── .github/                      # GitHub Actions workflows & templates
├── .husky/                       # Husky git hooks config
├── .jen/                         # Framework-specific cache/build artifacts
├── .turbo/                       # Turbo build cache
├── .vscode/                      # VS Code workspace settings
│
├── src/                          # Core framework source
│   ├── api/                      # API route handlers
│   ├── assets/                   # Static assets (fonts, images, etc)
│   ├── auth/                     # Authentication module
│   ├── build/                    # SSG pipeline, asset hashing
│   ├── build-tools/              # Legacy build utilities
│   ├── cache/                    # Caching layer
│   ├── cli/                      # CLI templates and banner output
│   ├── client/                   # Client-side runtime and utilities
│   ├── client-routing/           # Client-side routing module
│   ├── compilers/                # Language and format compilers
│   ├── core/                     # Config, routing, paths, types, middleware hooks
│   ├── css/                      # SCSS/CSS compilation pipeline
│   ├── data-fetching/            # Data fetching utilities
│   ├── db/                       # Database integrations
│   ├── devtools/                 # Development tools and debugging
│   ├── fonts/                    # Font management and optimization
│   ├── graphql/                  # GraphQL utilities
│   ├── i18n/                     # Internationalization
│   ├── import/                   # Module import handling
│   ├── jdb/                      # Embedded DB helpers
│   ├── middleware/               # Express-style middleware pipeline + built-ins
│   ├── plugin/                   # Advanced plugin system with hooks (Vite/Rollup-like)
│   ├── runtime/                  # Preact SSR + client hydration/runtime
│   ├── security/                 # Security utilities and handlers
│   ├── server/                   # HTTP server app, runtime serving
│   ├── server-actions/           # Server action handlers
│   ├── shared/                   # Shared logging utilities
│   ├── telemetry/                # Telemetry and analytics
│   ├── vendor/                   # Vendored dependencies
│   └── index.ts                  # Framework entry point
│
├── packages/                     # Published npm packages (monorepo)
│   ├── cli/                      # CLI utilities
│   ├── cli-npm/                  # NPM CLI integration
│   ├── create-jen-app/           # CLI scaffolder
│   ├── eslint-config-jen/        # ESLint configuration
│   ├── jen-core/                 # Core framework exports
│   ├── jenjs/                    # Main framework package
│   ├── jenjs-ghpackages/         # GitHub packages integration
│   ├── mcp/                      # MCP Server + CLI
│   ├── third-parties-embeds/     # Third-party components (YouTube/Maps)
│   └── types/                    # TypeScript definitions
│
├── tests/                        # Test suite
│   ├── api/                      # API route tests
│   ├── auth/                     # Auth tests
│   ├── benchmarks/               # Benchmark tests
│   ├── build/                    # Build pipeline tests
│   ├── cache/                    # Cache tests
│   ├── client-routing/           # Client routing tests
│   ├── core/                     # Core functionality tests
│   ├── data-fetching/            # Data fetching tests
│   ├── db/                       # Database tests
│   ├── fixtures/                 # Test fixtures and mocks
│   ├── fonts/                    # Font tests
│   ├── i18n/                     # Internationalization tests
│   ├── integration/              # Integration tests
│   ├── middleware/               # Middleware tests
│   ├── packages/                 # Package-specific tests
│   ├── runtime/                  # Runtime tests
│   ├── security/                 # Security tests
│   ├── server/                   # Server tests
│   ├── shared/                   # Shared utilities tests
│   ├── devtools.test.ts          # Devtools tests
│   ├── layouts.test.ts           # Layout tests
│   ├── lifecycle.test.ts         # Lifecycle tests
│   ├── render-security.test.ts   # Render security tests
│   ├── script-optimizer.test.ts  # Script optimizer tests
│   ├── server-actions.test.ts    # Server actions tests
│   └── README.md                 # Test documentation
│
├── apps/                         # Application examples
├── bench/                        # Benchmark suites
├── dist/                         # Build output directory
├── examples/                     # Example projects
├── scripts/                      # Build and setup scripts
├── site/                         # Framework website/documentation
├── node_modules/                 # Dependencies (generated by bun install)
│
├── .commitlintrc.json            # Commit linting rules
├── .czrc                         # Commitizen config
├── .env.example                  # Environment variables template
├── .gitattributes                # Git attributes config
├── .gitignore                    # Git ignore rules
├── .npmignore                    # NPM publish ignore rules
├── .npmrc                        # NPM configuration
├── .nvmrc                        # Node version specifier
├── .prettierignore               # Prettier format ignore
├── .rustfmt.toml                 # Rust formatting config
├── .typos.toml                   # Typo checker config
├── AGENTS.md                     # Agent instructions (THIS FILE)
├── build.js                      # Build script entry (JS)
├── build.ts                      # Build pipeline entry (TypeScript)
├── bun.lock                      # Bun lock file
├── bundle.js                     # Bundling script
├── CLAUDE.md                     # Claude-specific guidelines
├── CODE_OF_CONDUCT.md            # Community code of conduct
├── CONTRIBUTING.md               # Contribution guidelines
├── eslint.config.ts              # ESLint configuration
├── GEMINI.md                     # Gemini-specific guidelines
├── jen.config.ts                 # Framework configuration
├── jsdoc.config.json             # JSDoc generator config
├── lerna.json                    # Lerna monorepo config
├── LICENSE                       # License file
├── package.json                  # Root package manifest
├── README.md                     # Project readme
├── SECURITY.md                   # Security policy
├── server.ts                     # HTTP server entry point
├── TESTING.md                    # Testing guidelines
├── tsconfig.json                 # TypeScript configuration
├── turbo.json                    # Turbo build orchestration config
└── vitest.config.ts              # Vitest test runner config
```

## Key Packages Breakdown

| Package                       | Purpose                 | Status |
| ----------------------------- | ----------------------- | ------ |
| `jenjs`                       | Main framework core     | Active |
| `create-jen-app`              | Project scaffolder      | Active |
| `@types/jenjs__master`        | TypeScript definitions  | Active |
| `eslint-config-jen`           | ESLint configuration    | NEW    |
| `@jenjs/third-parties-embeds` | YouTube/Maps components | NEW    |
| `@jenjs/mcp`                  | MCP Server + CLI        | NEW    |

## Build System

- **Root-level scripts** run via `npm run` (defined in `package.json`)
- **Turbo** orchestrates builds across monorepo with `turbo.json` config
- **TypeScript** strict mode enforced across all packages
- **Vitest** runs tests in watch mode from `tests/` directory
- **ESLint** configured in root `eslint.config.ts`

## Plugin System

Jen.js includes a powerful, Vite/Rollup-inspired plugin system that allows extending the framework at multiple lifecycle stages.

### Plugin Architecture

**Core Components:**
- `PluginManager` - Orchestrates plugin lifecycle and hook execution
- `HookStage` - Enumerated hook stages for plugin integration
- `JenPlugin` interface - Standard plugin shape

**Hook Stages:**

```typescript
// Build lifecycle
HookStage.BEFORE_BUILD      // Before build starts
HookStage.BUILD_MODULES     // During module compilation
HookStage.BUILD_OPTIMIZE    // Optimization phase
HookStage.AFTER_BUILD       // After build completes

// Dev server lifecycle
HookStage.BEFORE_DEV        // Before dev server starts
HookStage.DEV_HMR           // Hot module replacement
HookStage.AFTER_DEV         // After dev server stops

// Request/Server lifecycle
HookStage.REQUEST_INIT      // On incoming request
HookStage.REQUEST_MIDDLEWARE // During middleware phase
HookStage.BEFORE_RENDER     // Before page render
HookStage.AFTER_RENDER      // After page render

// Transformation
HookStage.TRANSFORM_CODE    // Code transformation hook
HookStage.RESOLVE_ID        // Module resolution hook
HookStage.RESOLVE_CONFIG    // Config resolution hook
```

### Creating a Plugin

```typescript
import type { JenPlugin, PluginContext, PluginHookContext } from "jenjs";
import { HookStage } from "jenjs";

export default {
  name: "my-plugin",
  version: "1.0.0",
  description: "My custom plugin",
  
  // Apply only during build
  apply: "build",
  
  // Run before other plugins
  enforce: "pre",
  
  // Setup hook (called during initialization)
  async setup(context: PluginContext) {
    console.log("Plugin setup:", context.name);
    
    // Register virtual module
    context.virtual("virtual:my-module", "export default 'Hello';");
    
    // Add middleware
    context.useMiddleware((req, res, next) => {
      console.log("Request:", req.url);
      next();
    });
  },
  
  // Define hooks
  hooks: {
    [HookStage.BEFORE_BUILD]: async (context: PluginHookContext) => {
      console.log("Before build:", context.build?.mode);
    },
    
    [HookStage.TRANSFORM_CODE]: async (context: PluginHookContext, code: string) => {
      // Transform code
      return code.replace(/foo/g, "bar");
    },
    
    [HookStage.REQUEST_INIT]: {
      handler: async (context: PluginHookContext) => {
        context.meta ??= {};
        context.meta.pluginData = "injected";
      },
      priority: 100,  // Higher priority = earlier execution
      enforce: "pre"  // Run before normal hooks
    }
  },
  
  // Cleanup hook (called on shutdown)
  async cleanup(context: PluginContext) {
    console.log("Plugin cleanup");
  }
} satisfies JenPlugin;
```

### Plugin Configuration

In `jen.config.ts`:

```typescript
import myPlugin from "./plugins/my-plugin.ts";
import anotherPlugin from "./plugins/another-plugin.ts";

export default {
  plugins: {
    plugins: [
      myPlugin,
      "path/to/plugin.ts", // Can load from string paths
      anotherPlugin
    ],
    hooks: {
      parallel: true,      // Run hooks in parallel
      timeout: 30000,      // 30s timeout per hook
      verbose: false,      // Log hook execution
      silent: false        // Don't throw on errors
    }
  }
} satisfies FrameworkConfig;
```

### Using the Plugin Manager

```typescript
import { getPluginManager } from "jenjs";

const manager = getPluginManager();

// Execute hooks at any stage
const result = await manager.executeHooks("beforeBuild", {
  build: {
    mode: "production",
    root: process.cwd(),
    outDir: "dist"
  }
});

console.log("Hook results:", result.results);
console.log("Execution time:", result.duration + "ms");

// Check if plugin is loaded
if (manager.hasPlugin("my-plugin")) {
  console.log("Plugin is loaded");
}

// Listen to plugin events
manager.on("build:complete", (data) => {
  console.log("Build completed", data);
});

// Get virtual module
const code = manager.getVirtualModule("virtual:my-module");
```

### Plugin Best Practices

1. **Always name your plugin** - Use reverse domain notation: `com.example.plugin-name`
2. **Specify apply** - Declare when plugin should run: `"build" | "serve" | function`
3. **Use enforce** - Order plugins with `"pre" | "post"` for critical plugins
4. **Handle errors** - Plugins should not crash the build
5. **Cleanup resources** - Implement cleanup hook for long-running operations
6. **Emit events** - Use `context.emitEvent()` for async notifications
7. **Register middleware** - Add request handlers via `context.useMiddleware()`
8. **Use virtual modules** - Create in-memory modules with `context.virtual()`

---

## Code Style

- **TypeScript** strict mode (ES2022 target/module, moduleResolution Bundler)
- **Preact** + JSX (via `preact` JSX runtime)
- **Path aliases:** `@src/*` maps to `src/*`, use for cross-module imports
- **Imports:** Relative imports use `.js` extensions for ESM output
- **JS + TS mix:** `allowJs` is enabled for shared JS/TS code
- **Error handling:** Try/catch in async handlers; log via `@src/shared/log`
- **File naming:** camelCase for exports, kebab-case for filenames
- **Native modules:** Stubs live in `src/native/`; production impls live under `native/`

### Class & Method Patterns

**Class Structure** (see `src/server/app.ts` for reference):

- Private fields with null initializers for optional state: `private watcher: FSWatcher | null = null`
- Simple getter/setter methods for state management
- Private cleanup methods for resource management
- Clear separation between state (properties) and behavior (methods)

**Documentation:**

- Block comments with `/** ... */` for class and public method documentation
- Inline comments with `//` for implementation details
- Keep documentation concise and focused on intent

**Method Patterns:**

- Single responsibility per method
- Return types explicitly declared
- Async methods for I/O operations
- Cleanup methods use async/await with proper resource handling
- Guard clauses for null checks: `if (condition) { ... }`

**Example Pattern:**

```typescript
class Lifecycle {
  private resource: Resource | null = null;

  setResource(r: Resource) {
    this.resource = r;
  }

  getResource() {
    return this.resource;
  }

  /** Properly closes all resources. Called on shutdown. */
  async close() {
    if (this.resource) {
      // cleanup logic
      this.resource = null;
    }
  }
}
```

### Type & Interface Patterns

- Type aliases for function signatures (e.g., `type Middleware = ...`)
- Interfaces for class contracts
- Extend types with union types when needed
- Use `Omit<>`, `Pick<>` for type composition
- Discriminated unions for complex state

### Constants & Config

- Use named exports for config objects
- Group related constants together
- Use `as const` for literal types
- Avoid magic numbers/strings—use named constants

### Emoji usage

Do not use emojis in the codebase, even if the scenario is perfect, speak in a professional tone.

### Documentation Code Blocks

- When adding `highlight={...}` attributes to code blocks, carefully count the actual line numbers within the code block
- Account for empty lines, import statements, and type imports that shift line numbers
- Highlights should point to the actual relevant code, not unrelated lines like `return (` or framework boilerplate
- Double-check highlights by counting lines from 1 within each code block

## Commit and PR Style

- Do NOT add "Generated with AmpCode" or co-author footers to commits or PRs
- Keep commit messages concise and descriptive
- Format: `<type>: <description>` or `<type>: <description>\n\n<details>`
- Types: `feat`, `fix`, `refactor`, `test`, `perf`, `docs`, `chore`
- Example: `feat: add YouTube embed component` or `fix: resolve HMR connection leak in app.ts`

## Development Workflow

### When Creating New Features

1. Create feature branch: `git checkout -b feat/feature-name`
2. Implement with tests in `tests/` directory
3. Run `npm run typecheck` to verify types
4. Run `npm run test:run` to ensure all tests pass
5. Commit with descriptive message
6. Tests must pass before merge

### When Fixing Bugs

1. Locate bug with `finder` or `Grep` tools
2. Create minimal test case that reproduces bug
3. Fix in source code
4. Verify test passes
5. Check for related issues elsewhere with `Grep`
6. Commit with `fix:` prefix

### When Refactoring

1. Run full test suite before starting
2. Make changes incrementally with commits at logical points
3. Run `npm run typecheck` frequently
4. Verify tests still pass after each major change
5. Use `refactor:` commit prefix
6. Do not combine refactoring with feature changes

## Testing Guidelines

### Test File Organization

- Tests live in `tests/` directory mirroring `src/` structure
- Test files named: `{module-name}.test.ts`
- Package tests in `tests/packages/`
- Each test file focuses on one module/component

### Test Writing Patterns

```typescript
import { describe, it, expect } from "vitest";

describe("ModuleName", () => {
  describe("Feature", () => {
    it("should do something", () => {
      // Arrange
      const input = {
        /* ... */
      };

      // Act
      const result = someFunction(input);

      // Assert
      expect(result).toEqual(expected);
    });
  });
});
```

### Running Tests

- `npm run test` - Watch mode for active development
- `npm run test:run` - Single run (for CI)
- `npm run test:ui` - Visual dashboard
- `npm run test:run -- --coverage` - Coverage report

### Test Coverage Expectations

- Core utilities: 90%+ coverage
- Server/runtime: 80%+ coverage
- UI components: 70%+ coverage
- Integration tests for critical paths

## Import/Export Patterns

### Correct Patterns

```typescript
// Use relative imports with .js extension
import { helper } from "../helpers/index.js";
import { config } from "@src/core/config.js";

// Named exports for multiple items
export { Component, useHook };
export type { ComponentProps };

// Default export for classes
export default class App {}

// Type imports separate
export type { Config, Options };
import type { Request } from "node:http";
```

### Avoid

```typescript
// Don't use bare imports without .js
import { helper } from "../helpers";

// Don't mix default and named confusingly
export default function foo() {}
export function bar() {} // confusing together

// Don't use * imports
import * as helpers from "../helpers"; // use named imports
```

## Error Handling Patterns

### Async Functions

```typescript
// Recommended
async function fetchData(url: string): Promise<Data> {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  } catch (error) {
    log.error(`Failed to fetch ${url}:`, error);
    throw error; // Re-throw after logging
  }
}

// API handlers
export async function handler(req: Request): Promise<Response> {
  try {
    const data = await processRequest(req);
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    log.error("Handler error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}
```

### Class Cleanup

```typescript
class Resource {
  private handle: Handle | null = null;

  async initialize() {
    this.handle = await openHandle();
  }

  async close() {
    if (this.handle) {
      try {
        await this.handle.close();
      } finally {
        this.handle = null;
      }
    }
  }
}
```

## Performance Considerations

### Build Optimization

- Keep module size under 500KB (warn at 300KB)
- Use tree-shaking friendly exports
- Lazy load heavy dependencies
- Use async imports for runtime features

### Runtime Performance

- Cache computed values with memoization
- Debounce file watchers (default: 300ms)
- Use pools for concurrent operations
- Profile with `npm run test:run -- --coverage`

### Memory Management

- Clean up listeners in `close()` methods
- Clear collections when no longer needed
- Close file handles explicitly
- Use weak references for caches if appropriate

## Common Module Patterns

### Server/Middleware Modules

```typescript
// Pattern: state + getters/setters + cleanup
class Middleware {
  private state: State | null = null;

  setState(s: State): void {
    this.state = s;
  }

  getState(): State | null {
    return this.state;
  }

  /** Cleanup resources. Called on shutdown. */
  async close(): Promise<void> {
    if (this.state) {
      // cleanup
      this.state = null;
    }
  }
}
```

### Utility Modules

```typescript
// Export as named functions with clear intent
export function parseConfig(data: unknown): Config {
  // validation + parsing
}

export function validateInput(input: unknown): void {
  // throws on invalid
}

export type { Config, Options };
```

### Feature Modules

```typescript
// src/feature/index.ts
export { Feature } from "./class.js";
export { useFeature } from "./hooks.js";
export type { FeatureConfig, FeatureOptions } from "./types.js";

// src/feature/types.ts
export type FeatureConfig = {
  /* ... */
};

// src/feature/class.ts - one feature per file
export class Feature {
  /* ... */
}
```

## Debugging Tips

### Enable Debug Logging

```bash
# View all logs
NODE_DEBUG=* npm run dev

# View specific module logs
NODE_DEBUG=server npm run dev
```

### Use TypeScript Strict Mode

All files must pass strict TypeScript. Use:

- Explicit return types
- No implicit `any`
- Check for nullability
- `npm run typecheck` before commit

### Common Issues

1. **Import path errors** - Ensure `.js` extensions on relative imports
2. **Type errors** - Check `tsconfig.json` paths config
3. **Test failures** - Run single test with `npm run test -- <file>`
4. **Build errors** - Clean with `npm run clean` then rebuild

## Code Review Checklist

Before committing code:

- [ ] TypeScript strict check passes: `npm run typecheck`
- [ ] No console.log left behind (use log from shared)
- [ ] All public methods have JSDoc comments
- [ ] Tests written for new functionality
- [ ] No magic numbers/strings (use named constants)
- [ ] Error handling with proper logging
- [ ] No commented-out code
- [ ] File naming follows kebab-case
- [ ] Imports use relative paths with `.js` extension

## Secrets and Env Safety

Always treat environment variable values as sensitive unless they are known test-mode flags.

- Never print or paste secret values (tokens, API keys, cookies) in chat responses, commits, or shared logs.
- Mirror CI env **names and modes** exactly, but do not inline literal secret values in commands.
- If a required secret is missing locally, stop and ask the user rather than inventing placeholder credentials.
- Never commit local secret files; if documenting env setup, use placeholder-only examples.
- When sharing command output, summarize and redact sensitive-looking values.
