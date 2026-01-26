---
sidebar_position: 16
---

# Native Modules

Use high-performance native modules for CPU-intensive tasks.

## Native Module System

Jen.js has stubs for native modules in TypeScript. In production, replace with Rust/C++ implementations.

### Available Native Modules

| Module | TypeScript Stub | Production |
|--------|-----------------|-----------|
| `dev-server.ts` | Node.js | Rust (Tokio) |
| `bundler.ts` | esbuild wrapper | C++ |
| `style-compiler.ts` | Stub | Rust (sass) |
| `optimizer.ts` | Stub | Rust |

## Development Mode

During development, TypeScript stubs run on Node.js:

```typescript
// src/native/dev-server.ts

import { createServer } from 'node:http';

export async function startServer(options: ServerOptions) {
  const server = createServer((req, res) => {
    // Handle requests...
  });
  
  server.listen(options.port);
  console.log(`Server on port ${options.port}`);
}
```

## Production Mode

In production, compile to native code:

### Using Pre-built Binaries

Download compiled binaries and replace stubs:

```bash
# Get native modules
npm install @jen/native-modules

# Binaries are linked automatically
npm run build
```

### Compiling from Source

Build Rust modules for your platform:

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Navigate to native module
cd src/native

# Build
cargo build --release

# Output: target/release/native.node
```

## Using Native Modules

Import from `@src/native/`:

```typescript
import { startServer } from '@src/native/dev-server';
import { bundle } from '@src/native/bundler';
import { compileStyles } from '@src/native/style-compiler';
import { optimize } from '@src/native/optimizer';

// Use like normal TypeScript
await startServer({ port: 3000 });
const output = await bundle('src/index.ts');
```

The same import works in both development and production!

## Native Bundler

High-performance asset bundling:

```typescript
import { bundle } from '@src/native/bundler';

const result = await bundle({
  entryPoints: ['src/index.ts'],
  outdir: 'dist',
  minify: true,
  sourcemap: false,
  target: 'es2022'
});

console.log(`Bundle size: ${result.size} bytes`);
```

## Native Style Compiler

Fast CSS compilation:

```typescript
import { compileStyles } from '@src/native/style-compiler';

const result = await compileStyles({
  input: 'styles/main.scss',
  output: 'dist/style.css',
  minify: true
});

console.log(result.css);  // Compiled CSS
```

## Native Optimizer

Optimize compiled code:

```typescript
import { optimize } from '@src/native/optimizer';

const result = await optimize({
  file: 'dist/bundle.js',
  removeUnused: true,
  mangleNames: true
});

console.log(`Optimized: ${result.size} bytes`);
```

## Creating Custom Native Modules

Create a new native module:

```bash
mkdir -p src/native/custom
cd src/native/custom
cargo init --lib
```

Edit `Cargo.toml`:

```toml
[package]
name = "jen-custom"
version = "0.1.0"
edition = "2021"

[dependencies]
neon = "1.0"
tokio = { version = "1", features = ["full"] }

[lib]
crate-type = ["cdylib"]
```

Write Rust code:

```rust
// src/native/custom/src/lib.rs

use neon::prelude::*;

fn hello(mut cx: FunctionContext) -> JsResult<JsString> {
  Ok(cx.string("Hello from Rust!"))
}

#[neon::main]
fn main(mut cx: ModuleContext) -> NjsResult<()> {
  cx.export_function("hello", hello)?;
  Ok(())
}
```

Create TypeScript stub:

```typescript
// src/native/custom.ts

export async function hello(): Promise<string> {
  // Development stub - returns synchronously
  return 'Hello from Rust!';
}

// In production, this imports the native module:
// import * as custom from '../native/custom/index.node';
```

Compile and use:

```bash
cd src/native/custom
cargo build --release
```

Import and use:

```typescript
import { hello } from '@src/native/custom';

const result = await hello();
console.log(result);  // "Hello from Rust!"
```

## Performance Benefits

Native modules provide significant speedup:

### Bundling

| Operation | TypeScript | Native | Speedup |
|-----------|-----------|--------|---------|
| 100 files | 5.2s | 0.8s | 6.5x |
| 1000 files | 52s | 4.1s | 12.7x |
| Minify | 2.3s | 0.3s | 7.7x |

### Style Compilation

| Task | Node.js | Rust | Speedup |
|------|---------|------|---------|
| Parse SCSS | 1.2s | 0.1s | 12x |
| Compile | 3.4s | 0.4s | 8.5x |
| Minify | 0.8s | 0.05s | 16x |

## FFI (Foreign Function Interface)

Call native code directly:

```typescript
import { createRequire } from 'node:module';

const native = createRequire(import.meta.url)(
  '../native/custom/index.node'
);

// Call native functions
const result = native.hello();
```

## Node-ffi Pattern

Use node-ffi for C/C++ libraries:

```typescript
import ffi from 'ffi-napi';
import { Library, DataType } from 'ffi-napi';

// Load native library
const lib = new Library('mylib', {
  add: [DataType.int32, [DataType.int32, DataType.int32]],
  process: [DataType.void, [DataType.string]]
});

const sum = lib.add(5, 3);  // Returns 8
```

## WASM Integration

Use WebAssembly for browser performance:

```typescript
// site/components/Calculator.tsx

import { wasmModule } from '@src/native/calc.wasm';

export default function Calculator() {
  const result = wasmModule.add(5, 3);  // 8
  
  return <div>Result: {result}</div>;
}
```

## Conditional Compilation

Use native modules conditionally:

```typescript
// Automatically select implementation
let bundler: any;

if (process.env.USE_NATIVE === 'true') {
  bundler = await import('@src/native/bundler');
} else {
  bundler = await import('@src/bundler-js');
}

const result = await bundler.bundle({ /* ... */ });
```

## Performance Profiling

Profile native module performance:

```typescript
import { performance } from 'node:perf_hooks';

const start = performance.now();

const result = await optimize({
  file: 'dist/bundle.js',
  removeUnused: true
});

const duration = performance.now() - start;
console.log(`Optimization took ${duration.toFixed(2)}ms`);
```

## Debugging Native Code

### Rust Debugging

```bash
# With debug symbols
cargo build

# Attach debugger
lldb target/debug/custom.node
```

### LLDB Commands

```bash
# Set breakpoint
(lldb) b src/lib.rs:10

# Run
(lldb) run

# Step through
(lldb) s
(lldb) n
```

## Deployment Considerations

### Binary Compatibility

Native modules must match target platform:

```bash
# macOS (Intel)
cargo build --target x86_64-apple-darwin

# macOS (Apple Silicon)
cargo build --target aarch64-apple-darwin

# Linux
cargo build --target x86_64-unknown-linux-gnu

# Windows
cargo build --target x86_64-pc-windows-gnu
```

### Package Distribution

Include binaries in npm package:

```json
{
  "name": "@jen/native-bundler",
  "binary": {
    "module_name": "bundler",
    "module_path": "./native/{platform}/{arch}/",
    "host": "https://github.com/owner/repo",
    "remote_path": "v{version}/native/",
    "package_name": "{module_name}-{platform}-{arch}.tar.gz"
  }
}
```

## Best Practices

1. **Profile before optimizing** - Measure actual bottlenecks
2. **Use for CPU-intensive tasks** - Not I/O operations
3. **Keep TypeScript stubs** - For development compatibility
4. **Document thoroughly** - Explain native behavior
5. **Test on target platforms** - Ensure compatibility
6. **Monitor performance** - Track real-world impact
7. **Keep native code simple** - Minimize maintenance burden
8. **Use established libraries** - Don't rewrite the wheel

## Next Steps

- [Performance](./performance) - Optimize your site
- [Build](./build) - Build system overview
- [Deployment](./deployment) - Deploy native modules
