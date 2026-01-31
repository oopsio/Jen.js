# Jen.js Documentation

Welcome to **Jen.js** — a modern TypeScript-first framework for building static-generated (SSG) and server-rendered (SSR) web applications with Preact.

## Key Features

- **TypeScript-first**: Full TypeScript support with strict type checking
- **Dual rendering modes**: Static Site Generation (SSG) and Server-Side Rendering (SSR)
- **Preact-powered**: Use the lightweight 3KB alternative to React
- **Zero-config routing**: Automatic file-based routing based on your file structure
- **Native module stubs**: Ready for high-performance native compilation (Rust/C++)
- **Plugin system**: Extensible architecture via TypeScript plugins
- **Multi-database support**: SQLite, PostgreSQL, MySQL, MongoDB, and jDB
- **Built-in middleware**: Express-style middleware system for request handling
- **Production-ready**: Optimized build pipeline with automatic optimization

## Quick Commands

```bash
# Install dependencies
npm install

# Development server (SSR)
npm run dev

# Build static site (SSG)
npm run build

# Type checking
npm run typecheck

# Start production server
npm run start

# Clean build artifacts
npm run clean
```

## Documentation Structure

- **Getting Started** — Introduction, installation, and quick start
- **Core Concepts** — Routing, configuration, and project structure
- **Features** — SSG/SSR, databases, auth, caching, and more
- **Advanced Topics** — Build system, native modules, performance
- **API Reference** — Complete API documentation
- **Guides** — Practical examples and tutorials
- **FAQ** — Common questions and answers

## Architecture Overview

```
Request/Build
    |
File-based Routing (site/)
    |
Config & Middleware
    |
Component Rendering (Preact SSR)
    |
Static Output (dist/) OR Dynamic Response
```

## What's Included

- **Build System**: esbuild-powered asset bundling and optimization
- **Server**: High-performance Node.js server with middleware support
- **Runtime**: Preact SSR rendering with client-side hydration
- **Database**: Multi-driver abstraction layer
- **Authentication**: JWT-based auth utilities
- **Caching**: Built-in caching layer with Redis support
- **Plugins**: Plugin system for extending framework capabilities

## Use Cases

- **Static websites** — Blogs, documentation, marketing sites
- **Server-rendered apps** — Dynamic content with SEO
- **Hybrid applications** — Mix SSG and SSR on the same site
- **Real-time applications** — WebSocket support with middleware
- **REST APIs** — API-first architecture with automatic routes

## Next Steps

1. Install Jen.js and set up your first project
2. Learn the basics with routing and configuration
3. Create your first page with Preact
4. Explore features like databases and authentication
5. Deploy to production with best practices
