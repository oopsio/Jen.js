# Jen.js 15 – Release Notes

**Release Date:** 2026-02-01

## Overview

This release brings improvements to routing, plugins, dev server performance, and database support. Jen.js continues to focus on **TypeScript-first SSG and SSR with Preact**.

## Highlights

* Improved file-based routing for dynamic pages
* Plugin system now supports more lifecycle hooks
* Multi-driver database support optimized (SQLite, PostgreSQL, MySQL, jDB)
* Faster dev server startup and smoother HMR
* Updated examples and documentation

## Bug Fixes

* Fixed API route issues on SSR
* Corrected hydration inconsistencies
* Resolved TypeScript strict-mode errors

## Upgrade

No breaking changes. After upgrading, run:

```bash
npm install
npm run dev
npm run build
npm run typecheck
```

## Contributing

See `[CONTRIBUTING.md](https://github.com/oopsio/Jen.js/blob/main/CONTRIBUTING.md)` for guidelines.
