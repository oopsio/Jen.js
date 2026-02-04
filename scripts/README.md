# Jen.js Developer Scripts

Helper scripts to streamline development workflow for Jen.js framework contributors.

## Quick Start

### Linux / macOS

```bash
# Setup (run once)
bash scripts/setup.sh

# Development
bash scripts/dev.sh

# Build
bash scripts/build.sh
```

### Windows

```powershell
# Setup (run once)
PowerShell -ExecutionPolicy Bypass -File scripts/setup.ps1

# Development
PowerShell -ExecutionPolicy Bypass -File scripts/dev.ps1

# Build
PowerShell -ExecutionPolicy Bypass -File scripts/build.ps1
```

## Scripts

### `setup.sh` / `setup.ps1`

One-time setup script for new developers.

**Does:**
- ✓ Check Node.js and npm installation
- ✓ Install dependencies
- ✓ Run TypeScript type check
- ✓ Display next steps

**Run after:**
- Fresh clone of the repository
- After major dependency updates

### `dev.sh` / `dev.ps1`

Start development server and watch for changes.

**Does:**
- ✓ Install dependencies if missing
- ✓ Start framework dev server on http://localhost:3000
- ✓ Watch for file changes
- ✓ Live reload on changes

**Run for:**
- Daily development work
- Testing framework changes
- Working on example projects

### `build.sh` / `build.ps1`

Build framework and example for production.

**Does:**
- ✓ Type check code
- ✓ Build framework to `dist/`
- ✓ Build example project to `example/release-16/dist/`
- ✓ Show build output locations

**Run before:**
- Creating a release
- Deploying to production
- Testing production build

## Configuration

Edit `config.json` to customize for your environment:

```json
{
  "environments": {
    "linux": { ... },
    "macos": { ... },
    "windows": { ... }
  },
  "development": {
    "browser": "http://localhost:3000",
    "watchDirs": ["src", "site", "example"],
    "fileExtensions": [".ts", ".tsx", ".js", ".jsx", ".json", ".scss", ".css"]
  },
  "build": {
    "minify": true,
    "sourceMap": false,
    "target": "es2022",
    "platform": "node"
  }
}
```

## Manual Commands

If you prefer to run commands manually:

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Type check
npm run typecheck

# Clean build artifacts
npm run clean

# Run example
cd example/release-16
node server.js        # Dev server
node build.js         # Build
```

## Troubleshooting

### Script not found (Linux/macOS)
```bash
chmod +x scripts/setup.sh scripts/dev.sh scripts/build.sh
```

### PowerShell execution policy (Windows)
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Port 3000 already in use
Change port in `config.json`:
```json
"ports": {
  "dev": 3001
}
```

### Node modules corrupted
```bash
rm -rf node_modules
npm install
```

## Project Structure

```
Jen.js/
├── scripts/              # This directory
│   ├── setup.sh         # Setup script (Unix)
│   ├── setup.ps1        # Setup script (Windows)
│   ├── dev.sh           # Dev server (Unix)
│   ├── dev.ps1          # Dev server (Windows)
│   ├── build.sh         # Build script (Unix)
│   ├── build.ps1        # Build script (Windows)
│   ├── config.json      # Configuration
│   └── README.md        # This file
├── src/                 # Framework source
├── example/release-16/  # Example project
├── dist/                # Build output
├── package.json         # Dependencies
└── ...
```

## Contributing

When working on the framework:

1. **Setup**: Run `setup.sh` or `setup.ps1`
2. **Development**: Use `dev.sh` or `dev.ps1` to start dev server
3. **Testing**: Test changes in example project
4. **Build**: Run `build.sh` or `build.ps1` before committing
5. **Type checking**: All code must pass `npm run typecheck`

## Environment Variables

Optional environment variables:

```bash
# Force production build
export NODE_ENV=production

# Custom port
export PORT=3001

# Verbose logging
export DEBUG=jen:*
```

## Support

For issues with scripts:
1. Check that Node.js 18+ is installed
2. Run `npm install` to update dependencies
3. See troubleshooting section above
4. Open an issue on GitHub

---

**Happy coding! 🚀**
