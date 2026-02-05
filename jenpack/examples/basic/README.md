# JenPack Basic Example

A complete example demonstrating JenPack bundling capabilities with:
- **TypeScript** files with type annotations
- **HTML** page with inline styles and scripts
- **SASS/SCSS** for styling
- **Module imports** and dependencies

## Project Structure

```
basic/
├── src/
│   ├── index.html      # HTML entry point
│   ├── main.ts         # TypeScript main module
│   ├── utils.ts        # Utility functions
│   └── styles.scss     # SASS/SCSS styles
├── dist/               # Bundled output (created by JenPack)
│   ├── bundle.js       # Bundled JavaScript
│   └── bundle.css      # Compiled CSS
├── jenpack.config.toml # JenPack configuration
└── README.md           # This file
```

## Building

### Build once
```bash
# From jenpack root directory
cargo run --release -- build --entry examples/basic/src/index.html --outdir examples/basic/dist --minify
```

Or if JenPack is installed globally:
```bash
cd examples/basic
jenpack build --minify
```

### Watch mode (with auto-rebuild)
```bash
cd examples/basic
jenpack watch
```

## Features Demonstrated

### 1. TypeScript Support
- `main.ts` uses TypeScript interfaces and type annotations
- `utils.ts` exports typed functions
- JenPack strips types and generates clean JavaScript

### 2. HTML Processing
- `index.html` contains inline `<script>` and `<style>` tags
- Scripts are extracted and bundled with JavaScript modules
- Styles are extracted and compiled with SASS

### 3. SASS/SCSS Compilation
- `styles.scss` uses:
  - Variables (`$primary-color`)
  - Mixins (`@mixin flex-center`)
  - Nesting
  - Media queries
- Compiled to standard CSS and minified

### 4. Module Bundling
- Modules are discovered via import statements
- Dependencies are resolved and included
- Output is concatenated with module comments

## Output

After building, check the generated files:

```bash
# JavaScript bundle (minified)
cat dist/bundle.js

# CSS bundle (compiled from SCSS + minified)
cat dist/bundle.css
```

## Configuration

Edit `jenpack.config.toml` to customize:
- Entry points
- Output directory
- Minification
- Source maps
- Path aliases

## Next Steps

1. Modify files in `src/` and watch them rebuild
2. Add new `.ts`, `.tsx`, `.html`, or `.scss` files
3. Experiment with different bundling options
4. Check console output for build times and module counts

## Troubleshooting

### Build fails with "file not found"
- Ensure all import paths in `.ts` files match actual file locations
- Check that external dependencies are listed in `externals` in config

### Sass compilation fails
- Ensure `sass` CLI is installed: `npm install -g sass`
- Check SCSS syntax is valid

### Source maps not generated
- Pass `--sourcemap` flag to `jenpack build`
- Or set `sourcemap = true` in `jenpack.config.toml`
