---
sidebar_position: 1
---

# Getting Started

Welcome to Jen.js! A modern TypeScript-first framework for building static-generated (SSG) and server-rendered (SSR) web applications with Preact.

## What is Jen.js?

Jen.js is a lightweight, production-ready framework that combines:

- **TypeScript-first** - Full type safety with strict mode
- **SSG & SSR** - Choose static generation or on-demand rendering
- **Preact-powered** - 3KB lightweight alternative to React
- **Zero-config routing** - File-based routing out of the box
- **Production-ready** - Optimized build pipeline

## Key Features

✨ **TypeScript Support** - Strict type checking built in

⚡ **Fast** - Preact (3KB) instead of React, optimized builds

📁 **File-based Routing** - Routes auto-discovered from file structure

🔌 **Plugin System** - Extend functionality with TypeScript plugins

💾 **Multi-database Support** - SQLite, PostgreSQL, MySQL, MongoDB

🔐 **Built-in Auth** - JWT authentication included

🎨 **Styling** - CSS, Tailwind, or any CSS framework

🚀 **Native Ready** - Stubs ready for Rust/C++ compilation

## Quick Start

### 1. Prerequisites

- Node.js 18+ 
- npm or pnpm

### 2. Installation

```bash
npm install
npm run dev
```

This starts a development server on http://localhost:3000 with SSR.

### 3. Your First Route

Create `site/(hello).tsx`:

```typescript
export default function Hello() {
  return <h1>Hello, World!</h1>;
}
```

Visit http://localhost:3000/hello - it's live!

### 4. Building for Production

```bash
npm run build          # Build static site (SSG)
npm run typecheck      # Type checking
npm run start          # Serve production build
```

## Project Structure

```
jen.js/
├── src/               # Framework source code
├── site/              # Your routes & pages
├── dist/              # Build output
├── jen.config.ts      # Framework configuration
├── build.ts           # Build entry point
└── server.ts          # Server entry point
```

## Next Steps

- [Routing Guide](./routing) - Understand file-based routing
- [SSG vs SSR](./ssg-ssr) - Choose your rendering mode
- [Components & Data](./components) - Build interactive pages
- [Database](./database) - Connect to your database
- [API Routes](./api) - Build REST endpoints
