# Native Modules

Jen.js supports native modules written in Rust/C++ for high-performance operations.

## Current Status

TypeScript stubs currently in `src/native/`:

| Module | Current | Production |
|--------|---------|-----------|
| dev-server.ts | Node.js | Rust (Tokio) |
| bundler.ts | esbuild wrapper | C++ |
| style-compiler.ts | Stub | Rust |
| optimizer.ts | Stub | Rust |

## Using Native Modules

Native modules are compatible with TypeScript. Use them like any other module:

```typescript
import { bundler } from '@src/native/bundler';

const output = await bundler.build({
  entry: 'src/index.ts',
  output: 'dist/bundle.js'
});
```

## Building Native Modules

### Rust Example

`native/bundler/src/lib.rs`

```rust
#[napi]
pub fn bundle(entry: String) -> napi::Result<String> {
  // Bundle implementation
  Ok(format!("Bundled {}", entry))
}
```

### C++ Example

`native/optimizer/index.cpp`

```cpp
#include <node.h>

void Optimize(const v8::FunctionCallbackInfo<v8::Value>& args) {
  // Optimization logic
}

NODE_SET_METHOD(exports, "optimize", Optimize);
```

## Development vs Production

Development uses TypeScript stubs for fast iteration:

```bash
npm run dev  # Uses stub implementations
```

Production uses native bindings:

```bash
npm run build  # Uses native modules
```

## Performance Benefits

Native modules improve:
- Build time (10-50x faster bundling)
- Runtime performance (3-5x faster optimization)
- Memory efficiency
- Startup time

## Custom Native Modules

Create your own native module:

1. Write Rust/C++ implementation
2. Create TypeScript wrapper
3. Register in `src/native/`
4. Use in your code

```typescript
import { customModule } from '@src/native/custom';

const result = await customModule.process(data);
```

## Building Native Bindings

```bash
# Setup build environment
npm install

# Build native modules
cargo build --release

# Copy to dist
cp -r native/target/release/*.node dist/
```

## Next Steps

- Explore existing native modules
- Consider native optimization for your needs
- Contribute native implementations
