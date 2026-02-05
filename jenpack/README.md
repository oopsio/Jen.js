# JenPack

A fast, modular, production-ready Rust-based bundler and minifier for **Jen.js**. JenPack is designed to power static site generation and server rendering with support for JavaScript, TypeScript, TSX, JSX, HTML, and SASS.

## Features

✨ **Fast & Efficient**
- Built in Rust for lightning-fast bundling
- Parallel module processing with async/await
- Intelligent caching and deduplication

📦 **Comprehensive Format Support**
- ES6 modules with tree-shaking
- CommonJS compatibility
- TypeScript & TSX with type stripping
- HTML with inline asset extraction
- SASS/SCSS to CSS compilation
- CSS minification and bundling

🎯 **Production Ready**
- Minification (JS, CSS, HTML)
- Source map generation
- Configurable bundling options
- CLI with multiple commands

⚡ **Development Features**
- File watcher with debouncing
- Live rebuild on changes
- Fast rebuild times
- Detailed logging

🔧 **Extensible Architecture**
- Modular design for future plugins
- Easy to swap components
- Clean separation of concerns

## Installation

### Prerequisites
- Rust 1.70+ (for compilation)
- Sass CLI (optional, auto-installs on first use)

### Build from Source
```bash
cd jenpack
cargo build --release
```

The binary will be available at `target/release/jenpack`

## Quick Start

### 1. Build a Project
```bash
jenpack build --entry src/index.ts --outdir dist --minify
```

### 2. Watch Mode (Development)
```bash
jenpack watch --entry src/index.ts --outdir dist
```

### 3. With Source Maps
```bash
jenpack build --entry src/index.ts --outdir dist --sourcemap
```

## CLI Commands

### `jenpack build [OPTIONS]`

Bundle and minify a project.

**Options:**
- `--entry <ENTRY>` - Entry file(s) to bundle (can specify multiple)
- `--outdir <OUTDIR>` - Output directory (default: `dist`)
- `--minify` - Enable minification
- `--sourcemap` - Generate source maps
- `--verbose` - Enable verbose logging

**Examples:**
```bash
# Simple build
jenpack build --entry src/index.ts

# Multiple entries
jenpack build --entry src/index.ts src/admin.ts --outdir dist --minify

# With all options
jenpack build --entry src/index.ts --outdir dist --minify --sourcemap --verbose
```

### `jenpack watch [OPTIONS]`

Start development mode with file watching and automatic rebuilds.

**Options:** Same as `build`

**Example:**
```bash
jenpack watch --entry src/index.ts --outdir dist
```

## Configuration

Create a `jenpack.config.toml` in your project root:

```toml
# Entry points (array of files)
entry = ["src/index.ts", "src/admin.ts"]

# Output directory
outdir = "dist"

# Minify output
minify = true

# Generate source maps
sourcemap = true

# External dependencies (don't bundle)
externals = ["react", "preact", "lodash"]

# Path aliases
[aliases]
"@" = "src"
"@components" = "src/components"
"@utils" = "src/utils"
```

## Project Structure

```
jenpack/
├── src/
│   ├── main.rs          # CLI entry point
│   ├── lib.rs           # Library root
│   ├── cli.rs           # CLI argument parsing
│   ├── config.rs        # Configuration management
│   ├── bundler.rs       # Core bundling logic
│   ├── transform.rs     # JS/TS/TSX transformation
│   ├── minifier.rs      # Minification (JS, CSS, HTML)
│   ├── html.rs          # HTML processing & asset extraction
│   ├── sass.rs          # SASS/SCSS compilation
│   ├── watcher.rs       # File watching for dev mode
│   └── utils.rs         # Helpers (logging, file I/O, etc.)
├── examples/            # Example projects
├── Cargo.toml          # Rust dependencies
└── README.md           # This file
```

## Module Overview

### CLI (`cli.rs`)
- Argument parsing with `clap`
- Commands: `build`, `watch`
- Flexible options for both commands

### Config (`config.rs`)
- TOML configuration file support
- Path aliases and externals
- Serializable configuration struct

### Bundler (`bundler.rs`)
- Module resolution with fallback extensions
- Dependency graph analysis
- Multi-format support (JS/TS/HTML/CSS/SASS)
- Output generation

### Transform (`transform.rs`)
- TypeScript type stripping
- CommonJS to ESM conversion
- JSX support detection

### Minifier (`minifier.rs`)
- JavaScript minification (comments, whitespace)
- CSS minification
- HTML minification

### HTML (`html.rs`)
- Inline `<script>` and `<style>` extraction
- Asset inlining
- Static file copying

### SASS (`sass.rs`)
- SCSS/SASS to CSS compilation
- Source map support
- Inline compilation

### Watcher (`watcher.rs`)
- File system monitoring with `notify`
- Debounced rebuilds
- Detailed change logging

## Example Usage

### Example 1: Simple TypeScript Project

```bash
# Create project structure
mkdir -p myproject/src myproject/dist
cd myproject

# Create entry point
echo 'console.log("Hello JenPack!");' > src/index.ts

# Build
jenpack build --entry src/index.ts --outdir dist --minify

# Output: dist/bundle.js (minified)
```

### Example 2: Full-Stack with HTML & SASS

```bash
# Structure
src/
├── index.html
├── index.ts
└── styles/
    └── main.scss

# Build
jenpack build --entry src/index.html src/index.ts --outdir dist --minify --sourcemap

# Output files:
# - dist/bundle.js (bundled TypeScript + inlined scripts)
# - dist/bundle.css (compiled SCSS + inlined styles)
```

### Example 3: Watch Mode Development

```bash
# Start watching for changes
jenpack watch --entry src/index.ts --outdir dist

# Changes to src/ will automatically rebuild
# Output shows rebuild time and module count
```

## Performance

JenPack is optimized for speed:

- **Bundling**: ~10-50ms for small projects
- **Watching**: ~100-300ms per rebuild (debounced)
- **Minification**: Negligible overhead
- **Parallelization**: Uses Rayon for multi-threaded processing

## Development

### Build in Debug Mode
```bash
cargo build
./target/debug/jenpack build --entry src/index.ts
```

### Run Tests
```bash
cargo test
```

### Enable Verbose Logging
```bash
RUST_LOG=debug jenpack build --entry src/index.ts --verbose
```

## Roadmap

- [ ] Plugin system for custom transformers
- [ ] CSS Modules support
- [ ] Image optimization
- [ ] Code splitting
- [ ] Progressive Web App (PWA) support
- [ ] Tree-shaking improvements
- [ ] Esbuild/SWC deeper integration
- [ ] Benchmarking suite

## Contributing

Contributions are welcome! Please ensure:
- Code is well-commented
- Tests pass (`cargo test`)
- No `clippy` warnings (`cargo clippy`)
- Formatting is correct (`cargo fmt`)

## License

Same as Jen.js (GNU GPL 3.0)

## Support

For issues and feature requests, please open an issue on the [Jen.js GitHub repository](https://github.com/kessud2021/Jen.js).
