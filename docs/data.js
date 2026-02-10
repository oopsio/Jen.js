export const docsData = {
  // =========================================================================
  // 1. INTRODUCTION
  // =========================================================================
  "introduction": {
    title: "Introduction",
    category: "Introduction",
    content: `
# Introduction to Jen.js

Jen.js is a TypeScript-first web framework designed for building static and server-rendered applications using Preact. It focuses on performance, strict typing, and a unified development experience.

## Key Features

* **File-based Routing**: Routes are generated automatically based on your file structure.
* **Multiple Render Modes**: Support for SSG (Static), SSR (Server), ISR (Incremental), and PPR (Partial).
* **Interactive Islands**: Ship HTML by default and hydrate only specific interactive components.
* **Built-in Database**: Includes JDB (an embedded JSON database) and SQL adapters.
* **Middleware Pipeline**: robust, Express-style middleware architecture.
* **TypeScript**: Written in TypeScript with strict mode enabled by default.
`
  },
  "tech-stack": {
    title: "Technology Stack",
    category: "Introduction",
    content: `
# Technology Stack

Jen.js is built on top of modern, battle-tested technologies.

| Layer | Technology | Description |
|-------|-----------|-------------|
| **View** | Preact | A fast, lightweight alternative to React (3kB). |
| **Language** | TypeScript | Enforces strict type safety across the entire framework. |
| **Build** | esbuild | Extremely fast bundler and minifier. |
| **Styling** | Sass/SCSS | Built-in support for Dart Sass compilation. |
| **Runtime** | Node.js 18+ | Required for the dev server and SSR. |
| **Database** | JDB / SQL | Embedded JSON DB or standard SQL adapters. |
`
  },

  // =========================================================================
  // 2. GETTING STARTED
  // =========================================================================
  "installation": {
    title: "Installation",
    category: "Getting Started",
    content: `
# Installation

To create a new Jen.js project, ensure you have Node.js 18 or higher installed.

### Install Dependencies

Run the following command in your terminal:

\`\`\`bash
npm install
\`\`\`
`
  },
  "project-structure": {
    title: "Project Structure",
    category: "Getting Started",
    content: `
# Project Structure

Jen.js relies on a specific directory structure to function correctly.

\`\`\`text
project/
├── site/                        # Application source code
│   ├── pages/                   # Route definitions
│   │   ├── index.tsx            # Homepage
│   │   └── api/                 # API Endpoints
│   ├── components/              # Reusable UI components
│   ├── assets/                  # Global styles (SCSS)
│   └── public/                  # Static files (images, fonts)
├── jen.config.ts                # Framework configuration
└── dist/                        # Production build output
\`\`\`
`
  },
  "first-page": {
    title: "Creating a Page",
    category: "Getting Started",
    content: `
# Creating Your First Page

Pages are React/Preact components exported from the \`site/pages\` directory.

Create a file named \`site/pages/index.tsx\`:

\`\`\`typescript
export default function Home() {
  return (
    <html>
      <head>
        <title>My First Jen.js Site</title>
      </head>
      <body>
        <h1>Hello World</h1>
        <p>Welcome to my static site.</p>
      </body>
    </html>
  );
}
\`\`\`

Run the development server to see it live:

\`\`\`bash
npm run dev
\`\`\`
`
  },
  "cli-commands": {
    title: "CLI Commands",
    category: "Getting Started",
    content: `
# Command Line Interface

Common commands used during development and deployment.

| Command | Description |
|---------|-------------|
| \`npm run dev\` | Starts the development server with Hot Module Replacement (HMR). |
| \`npm run build\` | Compiles the application into a static site in the \`dist/\` folder. |
| \`npm run start\` | Starts the production server (Node.js). |
| \`npm run typecheck\` | Runs the TypeScript compiler to check for errors. |
| \`npm run clean\` | Removes previous build artifacts. |
`
  },

  // =========================================================================
  // 3. CORE CONCEPTS
  // =========================================================================
  "file-routing": {
    title: "File-Based Routing",
    category: "Core Concepts",
    content: `
# File-Based Routing

Jen.js maps files in the \`site/pages\` directory directly to URLs.

### Standard Routes

* \`site/pages/index.tsx\` → \`/\`
* \`site/pages/about.tsx\` → \`/about\`
* \`site/pages/contact.tsx\` → \`/contact\`

### Dynamic Routes

Use square brackets to define dynamic parameters.

* \`site/pages/users/[id].tsx\` → \`/users/123\`, \`/users/abc\`

Access parameters via the Loader Context:

\`\`\`typescript
export async function loader(ctx) {
  return { id: ctx.params.id };
}
\`\`\`

### API Routes

Files inside \`site/pages/api/\` become API endpoints.

* \`site/pages/api/users.ts\` → \`/api/users\`
`
  },
  "rendering-modes": {
    title: "Rendering Modes",
    category: "Core Concepts",
    content: `
# Rendering Modes

You can control how each page is rendered by exporting a \`mode\` constant from the page file.

### SSG (Static Site Generation)
The default mode. Pages are built once during \`npm run build\`. Best for blogs and documentation.

\`\`\`typescript
export const mode = "ssg";
\`\`\`

### SSR (Server-Side Rendering)
Pages are built on every request. Best for user dashboards or real-time data.

\`\`\`typescript
export const mode = "ssr";
\`\`\`

### ISR (Incremental Static Regeneration)
Pages are static but revalidate after a set time.

\`\`\`typescript
export const mode = "isr";
export const revalidateSeconds = 3600; // 1 hour
\`\`\`
`
  },
  "islands-arch": {
    title: "Islands Architecture",
    category: "Core Concepts",
    content: `
# Islands Architecture

By default, Jen.js renders zero JavaScript to the client. To add interactivity (like button clicks or state), you must use **Islands**.

### The Island Component

Wrap your interactive components in the \`<Island>\` wrapper.

\`\`\`typescript
import { Island } from "jen";
import Counter from "../components/Counter";

export default function Page() {
  return (
    <div>
      <h1>Static Title</h1>
      <Island hydrate="load">
        <Counter />
      </Island>
    </div>
  );
}
\`\`\`

### Hydration Strategies

* \`load\`: Hydrates immediately when the page loads.
* \`visible\`: Hydrates only when the component scrolls into view.
* \`idle\`: Hydrates when the browser main thread is idle.
`
  },
  "data-loading": {
    title: "Data Loading",
    category: "Core Concepts",
    content: `
# Data Loading

Fetch data on the server before the page renders using the \`loader\` function.

\`\`\`typescript
import { LoaderContext } from "jen";

export async function loader(ctx: LoaderContext) {
  // This runs on the server (Node.js)
  const data = await db.posts.find();
  return { posts: data };
}

export default function Blog({ posts }) {
  // 'posts' is passed as a prop
  return (
    <ul>
      {posts.map(p => <li>{p.title}</li>)}
    </ul>
  );
}
\`\`\`
`
  },

  // =========================================================================
  // 4. ARCHITECTURE
  // =========================================================================
  "system-overview": {
    title: "System Overview",
    category: "Architecture",
    content: `
# Architecture Overview

Jen.js is split into three main subsystems:

1.  **Build Pipeline**: Handles Static Site Generation (SSG), asset optimization, and compiling.
2.  **Server**: A Node.js server that handles routing, SSR, and API requests.
3.  **Runtime**: The client-side code that handles hydration and islands.

## Core Flow

1.  **Route Scanning**: The framework scans \`site/pages\` to build a route manifest.
2.  **Middleware**: Requests pass through a pipeline (CORS, Auth, Logging).
3.  **Loader**: The route's data loader is executed.
4.  **Render**: The component is rendered to an HTML string.
5.  **Hydration**: If Islands are present, hydration scripts are injected.
`
  },
  "req-resp-flow": {
    title: "Request/Response Flow",
    category: "Architecture",
    content: `
# Request Flow

When a request hits the Jen.js server:

1.  **Static Check**: Checks if a file exists in \`public/\` or \`dist/\`. If yes, serve it.
2.  **HMR Check**: If in dev mode, check for Hot Module Replacement signals.
3.  **API Handler**: If the path starts with \`/api\`, route to the API handler.
4.  **Route Matcher**: Matches the URL against the known route patterns.
5.  **SSR Execution**:
    * Run Middleware.
    * Run \`loader()\`.
    * Render Preact Component.
    * Inject Island Scripts.
    * Send HTML Response.
`
  },

  // =========================================================================
  // 5. CONFIGURATION
  // =========================================================================
  "config-file": {
    title: "jen.config.ts",
    category: "Configuration",
    content: `
# Configuration File

The \`jen.config.ts\` file controls the framework's behavior.

\`\`\`typescript
import type { FrameworkConfig } from "jen";

export default {
  siteDir: "site",
  distDir: "dist",

  server: {
    port: 3000,
    hostname: "localhost"
  },

  build: {
    minifyHtml: true,
    hashAssets: true
  },

  css: {
    globalScss: "site/assets/style.scss"
  }
} satisfies FrameworkConfig;
\`\`\`
`
  },
  "env-vars": {
    title: "Environment Variables",
    category: "Configuration",
    content: `
# Environment Variables

Jen.js supports \`.env\` files for managing secrets and configuration.

Create a \`.env\` file in your project root:

\`\`\`env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@localhost/db
JWT_SECRET=super-secret-key-123
\`\`\`

Access them in your code via \`process.env\`:

\`\`\`typescript
const dbUrl = process.env.DATABASE_URL;
\`\`\`
`
  },

  // =========================================================================
  // 6. API REFERENCE
  // =========================================================================
  "api-build": {
    title: "Build API",
    category: "API Reference",
    content: `
# Build API

Functions related to generating the static site.

### \`buildSite(opts)\`

Triggers a full site build programmatically.

\`\`\`typescript
import { buildSite } from "jen";

await buildSite({ config: myConfig });
\`\`\`
`
  },
  "api-routing": {
    title: "Routing API",
    category: "API Reference",
    content: `
# Routing API

### \`scanRoutes(config)\`

Scans the file system and returns an array of route objects.

### \`matchRoute(url, routes)\`

Matches a URL string against the route array and returns the matching route + parameters.

\`\`\`typescript
const route = matchRoute("/users/123", routes);
console.log(route.params); // { id: "123" }
\`\`\`
`
  },
  "api-middleware": {
    title: "Middleware API",
    category: "API Reference",
    content: `
# Middleware API

### \`Pipeline\`

Orchestrates a chain of middleware functions.

\`\`\`typescript
const pipeline = new Pipeline();
pipeline.use(logger());
pipeline.use(cors());
await pipeline.execute(context);
\`\`\`

### Built-in Middleware

* \`cors(options)\`: Handles Cross-Origin Resource Sharing.
* \`rateLimit(options)\`: Limits request frequency.
* \`logger()\`: Logs requests to the console.
* \`securityHeaders()\`: Adds Helmet-style security headers.
`
  },
  "api-db": {
    title: "Database API",
    category: "API Reference",
    content: `
# Database API

Jen.js provides a unified database abstraction.

### Initialization

\`\`\`typescript
const db = new DB({ type: "jdb", path: "./data" });
const users = db.collection("users");
\`\`\`

### Operations

* **Find**: \`users.find({ age: { $gt: 18 } })\`
* **FindOne**: \`users.findOne({ id: "123" })\`
* **Insert**: \`users.insertOne({ name: "Alice" })\`
* **Update**: \`users.updateOne({ id: "1" }, { $set: { name: "Bob" } })\`
* **Delete**: \`users.deleteOne({ id: "1" })\`
`
  },
  "api-auth": {
    title: "Authentication API",
    category: "API Reference",
    content: `
# Authentication API

### JWT (JSON Web Tokens)

Utilities for signing and verifying tokens.

\`\`\`typescript
import { JWT } from "jen";

const jwt = new JWT({ secret: "secret" });
const token = jwt.sign({ userId: 123 });
const payload = jwt.verify(token);
\`\`\`

### Session

Server-side session management backed by Redis or Memory.

\`\`\`typescript
const session = new Session({ store: redis });
await session.create({ user: "alice" });
\`\`\`
`
  },
  "api-caching": {
    title: "Caching API",
    category: "API Reference",
    content: `
# Caching API

Abstract interface for caching strategies.

### Methods

* \`get(key)\`: Retrieve data.
* \`set(key, value, ttl)\`: Save data with time-to-live.
* \`delete(key)\`: Remove data.

### Implementations

* **MemoryCache**: Uses RAM. Good for development.
* **RedisCache**: Uses Redis. Required for production clusters.
`
  },
  "api-utils": {
    title: "Utilities API",
    category: "API Reference",
    content: `
# Utilities

### HTTP Helpers

* \`parseCookies(req)\`: Returns an object of cookies.
* \`headersToObject(headers)\`: Normalizes Node.js headers.

### Logging

\`\`\`typescript
import { log } from "jen";

log.info("Server started");
log.error("Database connection failed");
\`\`\`
`
  },

  // =========================================================================
  // 7. ADVANCED TOPICS
  // =========================================================================
  "adv-routing": {
    title: "Advanced Routing",
    category: "Advanced",
    content: `
# Advanced Routing

### Route-Specific Middleware

You can export middleware directly from a route file to run it only for that page.

\`\`\`typescript
// pages/admin.tsx
export const middleware = async (ctx) => {
  if (!ctx.cookies.isAdmin) throw new Error("Forbidden");
};
\`\`\`

### Catch-All Routes

Create a file named \`[[...slug]].tsx\` to match all remaining paths. This is useful for implementing CMS-driven routing.
`
  },
  "adv-db": {
    title: "Advanced Database",
    category: "Advanced",
    content: `
# Advanced Database Patterns

### Transactions

Perform multiple operations atomically.

\`\`\`typescript
try {
  await accounts.updateOne({ id: 1 }, { $inc: { balance: -10 } });
  await accounts.updateOne({ id: 2 }, { $inc: { balance: 10 } });
} catch (e) {
  // Handle rollback logic here
}
\`\`\`

### Migrations

Define \`up\` and \`down\` functions to manage schema changes over time.
`
  },
  "performance": {
    title: "Performance",
    category: "Advanced",
    content: `
# Performance Optimization

### Asset Hashing
Jen.js automatically hashes assets (e.g., \`style.abc123.css\`) to enable aggressive browser caching.

### Minification
HTML, CSS, and JS are minified during the build process using \`esbuild\`.

### Critical CSS
If enabled in config, Jen.js extracts the CSS required for the initial fold and inlines it in the \`<head>\` to reduce First Contentful Paint (FCP).
`
  },
  "deployment": {
    title: "Deployment",
    category: "Advanced",
    content: `
# Deployment

### Static Hosting
If using \`mode: "ssg"\`, run \`npm run build\` and upload the \`dist/\` folder to any static host (Vercel, Netlify, S3, GitHub Pages).

### Docker Container
For SSR applications, use the provided Dockerfile.

\`\`\`dockerfile
FROM node:20-alpine
COPY . .
RUN npm ci && npm run build
CMD ["npm", "start"]
\`\`\`
`
  },

  // =========================================================================
  // 8. TROUBLESHOOTING
  // =========================================================================
  "ts-build": {
    title: "Build Issues",
    category: "Troubleshooting",
    content: `
# Troubleshooting Build Issues

### Routes Not Found
* Ensure files are in \`site/pages\`.
* Check \`jen.config.ts\` to see if \`.tsx\` extensions are enabled.
* Verify filenames do not start with an underscore \`_\`.

### SCSS Compilation Failed
* Check that \`site/assets/style.scss\` exists.
* Verify that all \`@import\` paths inside the SCSS file are correct.
`
  },
  "ts-runtime": {
    title: "Runtime Issues",
    category: "Troubleshooting",
    content: `
# Troubleshooting Runtime Issues

### 404 Not Found
* Verify the URL matches the file structure.
* If using dynamic routes, ensure the ID exists in your database.

### Hydration Mismatch
This occurs when the server HTML differs from the client's initial render.
* **Cause**: Using \`Math.random()\` or \`Date.now()\` directly in the component body.
* **Fix**: Move non-deterministic logic into the \`loader\` or \`useEffect\`.
`
  },
  "ts-dev": {
    title: "Dev Server Issues",
    category: "Troubleshooting",
    content: `
# Development Server Issues

### Port Already in Use
The default port 3000 might be taken. Update your config:

\`\`\`typescript
server: {
  port: 3001
}
\`\`\`

### Hot Reload Not Working
* Ensure \`dev.liveReload\` is set to \`true\` in config.
* Check the browser console for HMR connection errors (WebSocket).
`
  }
};