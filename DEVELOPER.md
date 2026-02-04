# Jen.js Developer Guide

Complete guide for developers working on the Jen.js framework.

## Quick Start

### First Time Setup

**Linux / macOS:**
```bash
bash scripts/setup.sh
```

**Windows (PowerShell):**
```powershell
powershell -ExecutionPolicy Bypass -File scripts/setup.ps1
```

This will:
- ✓ Check Node.js and npm
- ✓ Install dependencies
- ✓ Run TypeScript checks
- ✓ Display next steps

### Start Development

**Linux / macOS:**
```bash
bash scripts/dev.sh
```

**Windows (PowerShell):**
```powershell
powershell -ExecutionPolicy Bypass -File scripts/dev.ps1
```

Or use npm:
```bash
npm run dev
```

Server starts on http://localhost:3000

### Build for Production

**Linux / macOS:**
```bash
bash scripts/build.sh
```

**Windows (PowerShell):**
```powershell
powershell -ExecutionPolicy Bypass -File scripts/build.ps1
```

Or use npm:
```bash
npm run build
```

## Project Structure

```
Jen.js/
├── scripts/                      # Developer scripts
│   ├── config.json              # OS-specific config
│   ├── setup.sh / setup.ps1     # Setup script
│   ├── dev.sh / dev.ps1         # Dev server
│   ├── build.sh / build.ps1     # Build script
│   └── README.md                # Script documentation
│
├── src/                          # Framework source code
│   ├── build/                   # SSG/build system
│   ├── server/                  # HTTP server
│   ├── runtime/                 # Client runtime
│   ├── core/                    # Core types & config
│   ├── middleware/              # Middleware system
│   ├── api/                     # API routing
│   ├── auth/                    # Auth utilities
│   ├── cache/                   # Caching layers
│   ├── css/                     # CSS/SCSS compiler
│   ├── db/                      # Database utilities
│   └── index.ts                 # Main export
│
├── example/release-16/          # Example project (Release 16)
│   ├── site/                    # Example routes
│   │   ├── (home).tsx          # Home page (islands)
│   │   ├── (about).tsx         # About page (zero-JS)
│   │   ├── (protected-dashboard).tsx  # Middleware example
│   │   ├── (interactive).tsx    # Multiple islands
│   │   ├── api/                # API endpoints
│   │   └── ...
│   ├── jen.config.ts           # Example config
│   ├── build.js                # Build entry
│   └── server.js               # Server entry
│
├── package.json                 # Dependencies & scripts
├── tsconfig.json                # TypeScript config
├── BUILD.md                     # Release 16 features
├── FEATURES.md                  # Detailed feature docs
├── QUICK_START.md               # Quick start guide
└── DEVELOPER.md                 # This file
```

## Development Workflow

### 1. Make Changes

Edit files in `src/` or `example/release-16/site/`:

```typescript
// src/runtime/islands.ts
export function Island<P>(Component: any, strategy: HydrationStrategy) {
  Component.__island = true;
  Component.__hydrationStrategy = strategy;
  return Component;
}
```

### 2. Type Check

```bash
npm run typecheck
```

Must pass before commit.

### 3. Test in Dev Server

```bash
npm run dev
```

Or start example:
```bash
cd example/release-16
node server.js
```

### 4. Build & Verify

```bash
npm run build
```

Check output in `dist/` and `example/release-16/dist/`.

### 5. Commit & Push

```bash
git add .
git commit -m "Feature: islands hydration"
git push
```

## Key Files

### Framework Entry Points

- `src/index.ts` - Main export file
- `server.ts` - HTTP server entry
- `build.ts` - SSG build entry

### Core Systems

- **Islands**: `src/runtime/islands.ts` + `src/runtime/island-hydration-client.ts`
- **Middleware**: `src/core/middleware-hooks.ts`
- **API Routes**: `src/server/api-routes.ts`
- **Routing**: `src/core/routes/scan.ts` + `src/core/routes/match.ts`
- **Rendering**: `src/runtime/render.ts`

### Example Project

- `example/release-16/site/(home).tsx` - Islands demo
- `example/release-16/site/(protected-dashboard).tsx` - Middleware demo
- `example/release-16/site/api/(hello).ts` - API routes demo

## Common Tasks

### Add a New Framework Feature

1. Create files in `src/`
2. Export from `src/index.ts`
3. Add example in `example/release-16/site/`
4. Document in `FEATURES.md`
5. Update example in `QUICK_START.md`

### Debug an Issue

```bash
# Start dev server with verbose logging
DEBUG=jen:* npm run dev

# Type check
npm run typecheck

# Check for build errors
npm run build

# Run example
cd example/release-16
node server.js
```

### Test API Routes

```bash
# Terminal 1: Start server
npm run dev

# Terminal 2: Test endpoint
curl http://localhost:3000/api/hello
curl http://localhost:3000/api/users
```

### Update Dependencies

```bash
npm install
npm run typecheck
npm run build
```

## Scripts Reference

### Setup Scripts

**First-time setup** - checks Node.js, npm, installs deps, runs type check

```bash
npm run setup              # Auto-detect OS
npm run setup:unix        # Linux/macOS
npm run setup:windows     # Windows
```

### Development Scripts

**Start dev server** - watches files, live reload

```bash
npm run dev               # Framework dev
npm run dev:unix          # Linux/macOS explicit
npm run dev:windows       # Windows explicit
```

**Also:**
```bash
cd example/release-16
node server.js            # Run example server
```

### Build Scripts

**Build for production** - type check, build, optimize

```bash
npm run build             # Framework build
npm run build:unix        # Linux/macOS explicit
npm run build:windows     # Windows explicit
```

### Other Scripts

```bash
npm run start             # Run production server
npm run typecheck         # Type check only
npm run clean             # Clean build artifacts
npm run bundle            # Bundle framework
```

## Environment Configuration

Edit `scripts/config.json` to customize:

```json
{
  "environments": {
    "linux": { "commands": {...}, "ports": {...} },
    "macos": { "commands": {...}, "ports": {...} },
    "windows": { "commands": {...}, "ports": {...} }
  },
  "development": {
    "browser": "http://localhost:3000",
    "watchDirs": ["src", "site", "example"],
    "fileExtensions": [".ts", ".tsx", ".js", ".json", ".scss"]
  }
}
```

## Troubleshooting

### Port Already in Use

```bash
# Change port in config.json
# Or kill process
lsof -ti:3000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :3000    # Windows
```

### Node Modules Issues

```bash
rm -rf node_modules pnpm-lock.yaml
npm install
```

### TypeScript Errors

```bash
npm run typecheck
```

Fix errors before committing.

### Build Failures

```bash
npm run clean
npm run build
```

Check `dist/` and `example/release-16/dist/` output.

## Release Workflow

### Pre-Release Checklist

- [ ] All tests pass
- [ ] TypeScript checks pass: `npm run typecheck`
- [ ] Build succeeds: `npm run build`
- [ ] Example works: `cd example/release-16 && node server.js`
- [ ] Docs updated
- [ ] CHANGELOG updated
- [ ] Version bumped in package.json

### Release Commands

```bash
# Build
npm run build

# Tag release
git tag -a v1.0.0 -m "Release version 1.0.0"

# Push
git push origin main --tags
```

## Performance Tips

- Use `npm run typecheck` regularly during development
- Keep build artifacts in `.esbuild/` and `dist/` out of git
- Run `npm run clean` if builds get slow
- Use watch mode during development: `npm run dev`

## Code Style

### TypeScript

```typescript
// Use path aliases
import { Island } from "@src/runtime/islands.js";

// Strict null checks enabled
const value: string | null = null;

// No implicit any
function process(data: any) { }  // ❌
function process(data: unknown) { }  // ✓
```

### Imports

```typescript
// Always use .js extension
import { foo } from "./module.js";

// Use @src alias for cross-module
import { config } from "@src/core/config.js";
```

### Async/Await

```typescript
// Always handle errors
try {
  await something();
} catch (err) {
  log.error("Failed:", err);
}
```

## Getting Help

1. **Framework issues**: Check `src/` and `FEATURES.md`
2. **Example issues**: Check `example/release-16/`
3. **Build issues**: Run `npm run clean && npm run build`
4. **Type errors**: Run `npm run typecheck`
5. **Runtime issues**: Add `DEBUG=jen:*` prefix

---

**Happy coding! 🚀**

For questions, check:
- [FEATURES.md](./FEATURES.md) - Feature documentation
- [QUICK_START.md](./QUICK_START.md) - Quick reference
- [scripts/README.md](./scripts/README.md) - Script details
