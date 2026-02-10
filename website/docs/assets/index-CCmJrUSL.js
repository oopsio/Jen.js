var dt=(p,d)=>()=>(d||p((d={exports:{}}).exports,d),d.exports);import"https://cdn.jsdelivr.net/npm/geist@1.0.0/dist/fonts/geist-sans/style.css";import"https://cdn.jsdelivr.net/npm/geist@1.0.0/dist/fonts/geist-mono/style.css";import"https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css";import"https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css";var Rt=dt((Qe,he)=>{(function(){const d=document.createElement("link").relList;if(d&&d.supports&&d.supports("modulepreload"))return;for(const m of document.querySelectorAll('link[rel="modulepreload"]'))A(m);new MutationObserver(m=>{for(const h of m)if(h.type==="childList")for(const $ of h.addedNodes)$.tagName==="LINK"&&$.rel==="modulepreload"&&A($)}).observe(document,{childList:!0,subtree:!0});function x(m){const h={};return m.integrity&&(h.integrity=m.integrity),m.referrerPolicy&&(h.referrerPolicy=m.referrerPolicy),m.crossOrigin==="use-credentials"?h.credentials="include":m.crossOrigin==="anonymous"?h.credentials="omit":h.credentials="same-origin",h}function A(m){if(m.ep)return;m.ep=!0;const h=x(m);fetch(m.href,h)}})();const V={introduction:{title:"Introduction",category:"Introduction",content:`
# Introduction to Jen.js

Jen.js is a TypeScript-first web framework designed for building static and server-rendered applications using Preact. It focuses on performance, strict typing, and a unified development experience.

## Key Features

* **File-based Routing**: Routes are generated automatically based on your file structure.
* **Multiple Render Modes**: Support for SSG (Static), SSR (Server), ISR (Incremental), and PPR (Partial).
* **Interactive Islands**: Ship HTML by default and hydrate only specific interactive components.
* **Built-in Database**: Includes JDB (an embedded JSON database) and SQL adapters.
* **Middleware Pipeline**: robust, Express-style middleware architecture.
* **TypeScript**: Written in TypeScript with strict mode enabled by default.
`},"tech-stack":{title:"Technology Stack",category:"Introduction",content:`
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
`},installation:{title:"Installation",category:"Getting Started",content:`
# Installation

To create a new Jen.js project, ensure you have Node.js 18 or higher installed.

### Install Dependencies

Run the following command in your terminal:

\`\`\`bash
npm install
\`\`\`
`},"project-structure":{title:"Project Structure",category:"Getting Started",content:`
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
`},"first-page":{title:"Creating a Page",category:"Getting Started",content:`
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
`},"cli-commands":{title:"CLI Commands",category:"Getting Started",content:"\n# Command Line Interface\n\nCommon commands used during development and deployment.\n\n| Command | Description |\n|---------|-------------|\n| `npm run dev` | Starts the development server with Hot Module Replacement (HMR). |\n| `npm run build` | Compiles the application into a static site in the `dist/` folder. |\n| `npm run start` | Starts the production server (Node.js). |\n| `npm run typecheck` | Runs the TypeScript compiler to check for errors. |\n| `npm run clean` | Removes previous build artifacts. |\n"},"file-routing":{title:"File-Based Routing",category:"Core Concepts",content:"\n# File-Based Routing\n\nJen.js maps files in the `site/pages` directory directly to URLs.\n\n### Standard Routes\n\n* `site/pages/index.tsx` → `/`\n* `site/pages/about.tsx` → `/about`\n* `site/pages/contact.tsx` → `/contact`\n\n### Dynamic Routes\n\nUse square brackets to define dynamic parameters.\n\n* `site/pages/users/[id].tsx` → `/users/123`, `/users/abc`\n\nAccess parameters via the Loader Context:\n\n```typescript\nexport async function loader(ctx) {\n  return { id: ctx.params.id };\n}\n```\n\n### API Routes\n\nFiles inside `site/pages/api/` become API endpoints.\n\n* `site/pages/api/users.ts` → `/api/users`\n"},"rendering-modes":{title:"Rendering Modes",category:"Core Concepts",content:`
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
`},"islands-arch":{title:"Islands Architecture",category:"Core Concepts",content:`
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
`},"data-loading":{title:"Data Loading",category:"Core Concepts",content:`
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
`},"system-overview":{title:"System Overview",category:"Architecture",content:`
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
`},"req-resp-flow":{title:"Request/Response Flow",category:"Architecture",content:`
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
`},"config-file":{title:"jen.config.ts",category:"Configuration",content:`
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
`},"env-vars":{title:"Environment Variables",category:"Configuration",content:"\n# Environment Variables\n\nJen.js supports `.env` files for managing secrets and configuration.\n\nCreate a `.env` file in your project root:\n\n```env\nNODE_ENV=production\nDATABASE_URL=postgresql://user:pass@localhost/db\nJWT_SECRET=super-secret-key-123\n```\n\nAccess them in your code via `process.env`:\n\n```typescript\nconst dbUrl = process.env.DATABASE_URL;\n```\n"},"api-build":{title:"Build API",category:"API Reference",content:`
# Build API

Functions related to generating the static site.

### \`buildSite(opts)\`

Triggers a full site build programmatically.

\`\`\`typescript
import { buildSite } from "jen";

await buildSite({ config: myConfig });
\`\`\`
`},"api-routing":{title:"Routing API",category:"API Reference",content:`
# Routing API

### \`scanRoutes(config)\`

Scans the file system and returns an array of route objects.

### \`matchRoute(url, routes)\`

Matches a URL string against the route array and returns the matching route + parameters.

\`\`\`typescript
const route = matchRoute("/users/123", routes);
console.log(route.params); // { id: "123" }
\`\`\`
`},"api-middleware":{title:"Middleware API",category:"API Reference",content:`
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
`},"api-db":{title:"Database API",category:"API Reference",content:`
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
`},"api-auth":{title:"Authentication API",category:"API Reference",content:`
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
`},"api-caching":{title:"Caching API",category:"API Reference",content:`
# Caching API

Abstract interface for caching strategies.

### Methods

* \`get(key)\`: Retrieve data.
* \`set(key, value, ttl)\`: Save data with time-to-live.
* \`delete(key)\`: Remove data.

### Implementations

* **MemoryCache**: Uses RAM. Good for development.
* **RedisCache**: Uses Redis. Required for production clusters.
`},"api-utils":{title:"Utilities API",category:"API Reference",content:`
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
`},"adv-routing":{title:"Advanced Routing",category:"Advanced",content:`
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
`},"adv-db":{title:"Advanced Database",category:"Advanced",content:`
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
`},performance:{title:"Performance",category:"Advanced",content:`
# Performance Optimization

### Asset Hashing
Jen.js automatically hashes assets (e.g., \`style.abc123.css\`) to enable aggressive browser caching.

### Minification
HTML, CSS, and JS are minified during the build process using \`esbuild\`.

### Critical CSS
If enabled in config, Jen.js extracts the CSS required for the initial fold and inlines it in the \`<head>\` to reduce First Contentful Paint (FCP).
`},deployment:{title:"Deployment",category:"Advanced",content:`
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
`},"ts-build":{title:"Build Issues",category:"Troubleshooting",content:"\n# Troubleshooting Build Issues\n\n### Routes Not Found\n* Ensure files are in `site/pages`.\n* Check `jen.config.ts` to see if `.tsx` extensions are enabled.\n* Verify filenames do not start with an underscore `_`.\n\n### SCSS Compilation Failed\n* Check that `site/assets/style.scss` exists.\n* Verify that all `@import` paths inside the SCSS file are correct.\n"},"ts-runtime":{title:"Runtime Issues",category:"Troubleshooting",content:`
# Troubleshooting Runtime Issues

### 404 Not Found
* Verify the URL matches the file structure.
* If using dynamic routes, ensure the ID exists in your database.

### Hydration Mismatch
This occurs when the server HTML differs from the client's initial render.
* **Cause**: Using \`Math.random()\` or \`Date.now()\` directly in the component body.
* **Fix**: Move non-deterministic logic into the \`loader\` or \`useEffect\`.
`},"ts-dev":{title:"Dev Server Issues",category:"Troubleshooting",content:`
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
`}};(function(p,d){typeof Qe=="object"&&typeof he<"u"?he.exports=d():typeof define=="function"&&define.amd?define("marked",d):p.marked=d()})(typeof globalThis<"u"?globalThis:typeof self<"u"?self:void 0,(function(){var p,d={},x=d,A={exports:d},m=Object.defineProperty,h=Object.getOwnPropertyDescriptor,$=Object.getOwnPropertyNames,D=Object.prototype.hasOwnProperty,ne={};function q(){return{async:!1,breaks:!1,extensions:null,gfm:!0,hooks:null,pedantic:!1,renderer:null,silent:!1,tokenizer:null,walkTokens:null}}((r,e)=>{for(var n in e)m(r,n,{get:e[n],enumerable:!0})})(ne,{Hooks:()=>xe,Lexer:()=>W,Marked:()=>Ge,Parser:()=>X,Renderer:()=>ye,TextRenderer:()=>$e,Tokenizer:()=>ke,defaults:()=>I,getDefaults:()=>q,lexer:()=>ut,marked:()=>R,options:()=>rt,parse:()=>ot,parseInline:()=>lt,parser:()=>ct,setOptions:()=>st,use:()=>at,walkTokens:()=>it}),A.exports=(p=ne,((r,e,n,s)=>{if(e&&typeof e=="object"||typeof e=="function")for(let t of $(e))!D.call(r,t)&&t!==n&&m(r,t,{get:()=>e[t],enumerable:!(s=h(e,t))||s.enumerable});return r})(m({},"__esModule",{value:!0}),p));var I={async:!1,breaks:!1,extensions:null,gfm:!0,hooks:null,pedantic:!1,renderer:null,silent:!1,tokenizer:null,walkTokens:null};function L(r){I=r}var c={exec:()=>null};function i(r,e=""){let n=typeof r=="string"?r:r.source,s={replace:(t,l)=>{let a=typeof l=="string"?l:l.source;return a=a.replace(u.caret,"$1"),n=n.replace(t,a),s},getRegex:()=>new RegExp(n,e)};return s}var u={codeRemoveIndent:/^(?: {1,4}| {0,3}\t)/gm,outputLinkReplace:/\\([\[\]])/g,indentCodeCompensation:/^(\s+)(?:```)/,beginningSpace:/^\s+/,endingHash:/#$/,startingSpaceChar:/^ /,endingSpaceChar:/ $/,nonSpaceChar:/[^ ]/,newLineCharGlobal:/\n/g,tabCharGlobal:/\t/g,multipleSpaceGlobal:/\s+/g,blankLine:/^[ \t]*$/,doubleBlankLine:/\n[ \t]*\n[ \t]*$/,blockquoteStart:/^ {0,3}>/,blockquoteSetextReplace:/\n {0,3}((?:=+|-+) *)(?=\n|$)/g,blockquoteSetextReplace2:/^ {0,3}>[ \t]?/gm,listReplaceTabs:/^\t+/,listReplaceNesting:/^ {1,4}(?=( {4})*[^ ])/g,listIsTask:/^\[[ xX]\] /,listReplaceTask:/^\[[ xX]\] +/,anyLine:/\n.*\n/,hrefBrackets:/^<(.*)>$/,tableDelimiter:/[:|]/,tableAlignChars:/^\||\| *$/g,tableRowBlankLine:/\n[ \t]*$/,tableAlignRight:/^ *-+: *$/,tableAlignCenter:/^ *:-+: *$/,tableAlignLeft:/^ *:-+ *$/,startATag:/^<a /i,endATag:/^<\/a>/i,startPreScriptTag:/^<(pre|code|kbd|script)(\s|>)/i,endPreScriptTag:/^<\/(pre|code|kbd|script)(\s|>)/i,startAngleBracket:/^</,endAngleBracket:/>$/,pedanticHrefTitle:/^([^'"]*[^\s])\s+(['"])(.*)\2/,unicodeAlphaNumeric:/[\p{L}\p{N}]/u,escapeTest:/[&<>"']/,escapeReplace:/[&<>"']/g,escapeTestNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,escapeReplaceNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g,unescapeTest:/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/gi,caret:/(^|[^\[])\^/g,percentDecode:/%25/g,findPipe:/\|/g,splitPipe:/ \|/,slashPipe:/\\\|/g,carriageReturn:/\r\n|\r/g,spaceLine:/^ +$/gm,notSpaceStart:/^\S*/,endingNewline:/\n$/,listItemRegex:r=>new RegExp(`^( {0,3}${r})((?:[	 ][^\\n]*)?(?:\\n|$))`),nextBulletRegex:r=>new RegExp(`^ {0,${Math.min(3,r-1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`),hrRegex:r=>new RegExp(`^ {0,${Math.min(3,r-1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`),fencesBeginRegex:r=>new RegExp(`^ {0,${Math.min(3,r-1)}}(?:\`\`\`|~~~)`),headingBeginRegex:r=>new RegExp(`^ {0,${Math.min(3,r-1)}}#`),htmlBeginRegex:r=>new RegExp(`^ {0,${Math.min(3,r-1)}}<(?:[a-z].*>|!--)`,"i")},f=/^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,k=/(?:[*+-]|\d{1,9}[.)])/,S=/^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/,w=i(S).replace(/bull/g,k).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/\|table/g,"").getRegex(),F=i(S).replace(/bull/g,k).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/table/g,/ {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(),C=/^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/,N=/(?!\s*\])(?:\\.|[^\[\]\\])+/,B=i(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label",N).replace("title",/(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(),re=i(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g,k).getRegex(),ce="address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul",ge=/<!--(?:-?>|[\s\S]*?(?:-->|$))/,M=i("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))","i").replace("comment",ge).replace("tag",ce).replace("attribute",/ +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(),Q=i(C).replace("hr",f).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("|table","").replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",ce).getRegex(),U={blockquote:i(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph",Q).getRegex(),code:/^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/,def:B,fences:/^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/,heading:/^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,hr:f,html:M,lheading:w,list:re,newline:/^(?:[ \t]*(?:\n|$))+/,paragraph:Q,table:c,text:/^[^\n]+/},te=i("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr",f).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("blockquote"," {0,3}>").replace("code","(?: {4}| {0,3}	)[^\\n]").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",ce).getRegex(),Se={...U,lheading:F,table:te,paragraph:i(C).replace("hr",f).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("table",te).replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",ce).getRegex()},j={...U,html:i(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace("comment",ge).replace(/tag/g,"(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),def:/^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,heading:/^(#{1,6})(.*)(?:\n+|$)/,fences:c,lheading:/^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,paragraph:i(C).replace("hr",f).replace("heading",` *#{1,6} *[^
]`).replace("lheading",w).replace("|table","").replace("blockquote"," {0,3}>").replace("|fences","").replace("|list","").replace("|html","").replace("|tag","").getRegex()},fe=/^( {2,}|\\)\n(?!\s*$)/,se=/[\p{P}\p{S}]/u,ue=/[\s\p{P}\p{S}]/u,ve=/[^\s\p{P}\p{S}]/u,Ae=i(/^((?![*_])punctSpace)/,"u").replace(/punctSpace/g,ue).getRegex(),_=/(?!~)[\p{P}\p{S}]/u,z=/^(?:\*+(?:((?!\*)punct)|[^\s*]))|^_+(?:((?!_)punct)|([^\s_]))/,H=i(z,"u").replace(/punct/g,se).getRegex(),G=i(z,"u").replace(/punct/g,_).getRegex(),ae="^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)",pe=i(ae,"gu").replace(/notPunctSpace/g,ve).replace(/punctSpace/g,ue).replace(/punct/g,se).getRegex(),Fe=i(ae,"gu").replace(/notPunctSpace/g,/(?:[^\s\p{P}\p{S}]|~)/u).replace(/punctSpace/g,/(?!~)[\s\p{P}\p{S}]/u).replace(/punct/g,_).getRegex(),K=i("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)","gu").replace(/notPunctSpace/g,ve).replace(/punctSpace/g,ue).replace(/punct/g,se).getRegex(),ie=i(/\\(punct)/,"gu").replace(/punct/g,se).getRegex(),Z=i(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme",/[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email",/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(),le=i(ge).replace("(?:-->|$)","-->").getRegex(),Re=i("^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment",le).replace("attribute",/\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(),ee=/(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/,Ke=i(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]*(?:\n[ \t]*)?)(title))?\s*\)/).replace("label",ee).replace("href",/<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]*/).replace("title",/"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(),Ne=i(/^!?\[(label)\]\[(ref)\]/).replace("label",ee).replace("ref",N).getRegex(),Be=i(/^!?\[(ref)\](?:\[\])?/).replace("ref",N).getRegex(),Pe={_backpedal:c,anyPunctuation:ie,autolink:Z,blockSkip:/\[[^[\]]*?\]\((?:\\.|[^\\\(\)]|\((?:\\.|[^\\\(\)])*\))*\)|`[^`]*?`|<[^<>]*?>/g,br:fe,code:/^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,del:c,emStrongLDelim:H,emStrongRDelimAst:pe,emStrongRDelimUnd:K,escape:/^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,link:Ke,nolink:Be,punctuation:Ae,reflink:Ne,reflinkSearch:i("reflink|nolink(?!\\()","g").replace("reflink",Ne).replace("nolink",Be).getRegex(),tag:Re,text:/^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,url:c},et={...Pe,link:i(/^!?\[(label)\]\((.*?)\)/).replace("label",ee).getRegex(),reflink:i(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label",ee).getRegex()},_e={...Pe,emStrongRDelimAst:Fe,emStrongLDelim:G,url:i(/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/,"i").replace("email",/[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),_backpedal:/(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,del:/^(~~?)(?=[^\s~])((?:\\.|[^\\])*?(?:\\.|[^\s~\\]))\1(?=[^~]|$)/,text:/^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/},tt={..._e,br:i(fe).replace("{2,}","*").getRegex(),text:i(_e.text).replace("\\b_","\\b_| {2,}\\n").replace(/\{2,\}/g,"*").getRegex()},Te={normal:U,gfm:Se,pedantic:j},me={normal:Pe,gfm:_e,breaks:tt,pedantic:et},nt={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},Me=r=>nt[r];function J(r,e){if(e){if(u.escapeTest.test(r))return r.replace(u.escapeReplace,Me)}else if(u.escapeTestNoEncode.test(r))return r.replace(u.escapeReplaceNoEncode,Me);return r}function je(r){try{r=encodeURI(r).replace(u.percentDecode,"%")}catch{return null}return r}function He(r,e){let n=r.replace(u.findPipe,((t,l,a)=>{let o=!1,g=l;for(;--g>=0&&a[g]==="\\";)o=!o;return o?"|":" |"})).split(u.splitPipe),s=0;if(n[0].trim()||n.shift(),n.length>0&&!n.at(-1)?.trim()&&n.pop(),e)if(n.length>e)n.splice(e);else for(;n.length<e;)n.push("");for(;s<n.length;s++)n[s]=n[s].trim().replace(u.slashPipe,"|");return n}function be(r,e,n){let s=r.length;if(s===0)return"";let t=0;for(;t<s&&!(r.charAt(s-t-1)!==e||n);)t++;return r.slice(0,s-t)}function qe(r,e,n,s,t){let l=e.href,a=e.title||null,o=r[1].replace(t.other.outputLinkReplace,"$1");s.state.inLink=!0;let g={type:r[0].charAt(0)==="!"?"image":"link",raw:n,href:l,title:a,text:o,tokens:s.inlineTokens(o)};return s.state.inLink=!1,g}var ke=class{options;rules;lexer;constructor(r){this.options=r||I}space(r){let e=this.rules.block.newline.exec(r);if(e&&e[0].length>0)return{type:"space",raw:e[0]}}code(r){let e=this.rules.block.code.exec(r);if(e){let n=e[0].replace(this.rules.other.codeRemoveIndent,"");return{type:"code",raw:e[0],codeBlockStyle:"indented",text:this.options.pedantic?n:be(n,`
`)}}}fences(r){let e=this.rules.block.fences.exec(r);if(e){let n=e[0],s=(function(t,l,a){let o=t.match(a.other.indentCodeCompensation);if(o===null)return l;let g=o[1];return l.split(`
`).map((b=>{let v=b.match(a.other.beginningSpace);if(v===null)return b;let[E]=v;return E.length>=g.length?b.slice(g.length):b})).join(`
`)})(n,e[3]||"",this.rules);return{type:"code",raw:n,lang:e[2]?e[2].trim().replace(this.rules.inline.anyPunctuation,"$1"):e[2],text:s}}}heading(r){let e=this.rules.block.heading.exec(r);if(e){let n=e[2].trim();if(this.rules.other.endingHash.test(n)){let s=be(n,"#");(this.options.pedantic||!s||this.rules.other.endingSpaceChar.test(s))&&(n=s.trim())}return{type:"heading",raw:e[0],depth:e[1].length,text:n,tokens:this.lexer.inline(n)}}}hr(r){let e=this.rules.block.hr.exec(r);if(e)return{type:"hr",raw:be(e[0],`
`)}}blockquote(r){let e=this.rules.block.blockquote.exec(r);if(e){let n=be(e[0],`
`).split(`
`),s="",t="",l=[];for(;n.length>0;){let a,o=!1,g=[];for(a=0;a<n.length;a++)if(this.rules.other.blockquoteStart.test(n[a]))g.push(n[a]),o=!0;else{if(o)break;g.push(n[a])}n=n.slice(a);let b=g.join(`
`),v=b.replace(this.rules.other.blockquoteSetextReplace,`
    $1`).replace(this.rules.other.blockquoteSetextReplace2,"");s=s?`${s}
${b}`:b,t=t?`${t}
${v}`:v;let E=this.lexer.state.top;if(this.lexer.state.top=!0,this.lexer.blockTokens(v,l,!0),this.lexer.state.top=E,n.length===0)break;let T=l.at(-1);if(T?.type==="code")break;if(T?.type==="blockquote"){let O=T,P=O.raw+`
`+n.join(`
`),Y=this.blockquote(P);l[l.length-1]=Y,s=s.substring(0,s.length-O.raw.length)+Y.raw,t=t.substring(0,t.length-O.text.length)+Y.text;break}if(T?.type==="list"){let O=T,P=O.raw+`
`+n.join(`
`),Y=this.list(P);l[l.length-1]=Y,s=s.substring(0,s.length-T.raw.length)+Y.raw,t=t.substring(0,t.length-O.raw.length)+Y.raw,n=P.substring(l.at(-1).raw.length).split(`
`)}}return{type:"blockquote",raw:s,tokens:l,text:t}}}list(r){let e=this.rules.block.list.exec(r);if(e){let n=e[1].trim(),s=n.length>1,t={type:"list",raw:"",ordered:s,start:s?+n.slice(0,-1):"",loose:!1,items:[]};n=s?`\\d{1,9}\\${n.slice(-1)}`:`\\${n}`,this.options.pedantic&&(n=s?n:"[*+-]");let l=this.rules.other.listItemRegex(n),a=!1;for(;r;){let g=!1,b="",v="";if(!(e=l.exec(r))||this.rules.block.hr.test(r))break;b=e[0],r=r.substring(b.length);let E=e[2].split(`
`,1)[0].replace(this.rules.other.listReplaceTabs,(Le=>" ".repeat(3*Le.length))),T=r.split(`
`,1)[0],O=!E.trim(),P=0;if(this.options.pedantic?(P=2,v=E.trimStart()):O?P=e[1].length+1:(P=e[2].search(this.rules.other.nonSpaceChar),P=P>4?1:P,v=E.slice(P),P+=e[1].length),O&&this.rules.other.blankLine.test(T)&&(b+=T+`
`,r=r.substring(T.length+1),g=!0),!g){let Le=this.rules.other.nextBulletRegex(P),Ue=this.rules.other.hrRegex(P),Ze=this.rules.other.fencesBeginRegex(P),Je=this.rules.other.headingBeginRegex(P),pt=this.rules.other.htmlBeginRegex(P);for(;r;){let we,Ce=r.split(`
`,1)[0];if(T=Ce,this.options.pedantic?(T=T.replace(this.rules.other.listReplaceNesting,"  "),we=T):we=T.replace(this.rules.other.tabCharGlobal,"    "),Ze.test(T)||Je.test(T)||pt.test(T)||Le.test(T)||Ue.test(T))break;if(we.search(this.rules.other.nonSpaceChar)>=P||!T.trim())v+=`
`+we.slice(P);else{if(O||E.replace(this.rules.other.tabCharGlobal,"    ").search(this.rules.other.nonSpaceChar)>=4||Ze.test(E)||Je.test(E)||Ue.test(E))break;v+=`
`+T}!O&&!T.trim()&&(O=!0),b+=Ce+`
`,r=r.substring(Ce.length+1),E=we.slice(P)}}t.loose||(a?t.loose=!0:this.rules.other.doubleBlankLine.test(b)&&(a=!0));let Y,Ee=null;this.options.gfm&&(Ee=this.rules.other.listIsTask.exec(v),Ee&&(Y=Ee[0]!=="[ ] ",v=v.replace(this.rules.other.listReplaceTask,""))),t.items.push({type:"list_item",raw:b,task:!!Ee,checked:Y,loose:!1,text:v,tokens:[]}),t.raw+=b}let o=t.items.at(-1);if(!o)return;o.raw=o.raw.trimEnd(),o.text=o.text.trimEnd(),t.raw=t.raw.trimEnd();for(let g=0;g<t.items.length;g++)if(this.lexer.state.top=!1,t.items[g].tokens=this.lexer.blockTokens(t.items[g].text,[]),!t.loose){let b=t.items[g].tokens.filter((E=>E.type==="space")),v=b.length>0&&b.some((E=>this.rules.other.anyLine.test(E.raw)));t.loose=v}if(t.loose)for(let g=0;g<t.items.length;g++)t.items[g].loose=!0;return t}}html(r){let e=this.rules.block.html.exec(r);if(e)return{type:"html",block:!0,raw:e[0],pre:e[1]==="pre"||e[1]==="script"||e[1]==="style",text:e[0]}}def(r){let e=this.rules.block.def.exec(r);if(e){let n=e[1].toLowerCase().replace(this.rules.other.multipleSpaceGlobal," "),s=e[2]?e[2].replace(this.rules.other.hrefBrackets,"$1").replace(this.rules.inline.anyPunctuation,"$1"):"",t=e[3]?e[3].substring(1,e[3].length-1).replace(this.rules.inline.anyPunctuation,"$1"):e[3];return{type:"def",tag:n,raw:e[0],href:s,title:t}}}table(r){let e=this.rules.block.table.exec(r);if(!e||!this.rules.other.tableDelimiter.test(e[2]))return;let n=He(e[1]),s=e[2].replace(this.rules.other.tableAlignChars,"").split("|"),t=e[3]?.trim()?e[3].replace(this.rules.other.tableRowBlankLine,"").split(`
`):[],l={type:"table",raw:e[0],header:[],align:[],rows:[]};if(n.length===s.length){for(let a of s)this.rules.other.tableAlignRight.test(a)?l.align.push("right"):this.rules.other.tableAlignCenter.test(a)?l.align.push("center"):this.rules.other.tableAlignLeft.test(a)?l.align.push("left"):l.align.push(null);for(let a=0;a<n.length;a++)l.header.push({text:n[a],tokens:this.lexer.inline(n[a]),header:!0,align:l.align[a]});for(let a of t)l.rows.push(He(a,l.header.length).map(((o,g)=>({text:o,tokens:this.lexer.inline(o),header:!1,align:l.align[g]}))));return l}}lheading(r){let e=this.rules.block.lheading.exec(r);if(e)return{type:"heading",raw:e[0],depth:e[2].charAt(0)==="="?1:2,text:e[1],tokens:this.lexer.inline(e[1])}}paragraph(r){let e=this.rules.block.paragraph.exec(r);if(e){let n=e[1].charAt(e[1].length-1)===`
`?e[1].slice(0,-1):e[1];return{type:"paragraph",raw:e[0],text:n,tokens:this.lexer.inline(n)}}}text(r){let e=this.rules.block.text.exec(r);if(e)return{type:"text",raw:e[0],text:e[0],tokens:this.lexer.inline(e[0])}}escape(r){let e=this.rules.inline.escape.exec(r);if(e)return{type:"escape",raw:e[0],text:e[1]}}tag(r){let e=this.rules.inline.tag.exec(r);if(e)return!this.lexer.state.inLink&&this.rules.other.startATag.test(e[0])?this.lexer.state.inLink=!0:this.lexer.state.inLink&&this.rules.other.endATag.test(e[0])&&(this.lexer.state.inLink=!1),!this.lexer.state.inRawBlock&&this.rules.other.startPreScriptTag.test(e[0])?this.lexer.state.inRawBlock=!0:this.lexer.state.inRawBlock&&this.rules.other.endPreScriptTag.test(e[0])&&(this.lexer.state.inRawBlock=!1),{type:"html",raw:e[0],inLink:this.lexer.state.inLink,inRawBlock:this.lexer.state.inRawBlock,block:!1,text:e[0]}}link(r){let e=this.rules.inline.link.exec(r);if(e){let n=e[2].trim();if(!this.options.pedantic&&this.rules.other.startAngleBracket.test(n)){if(!this.rules.other.endAngleBracket.test(n))return;let l=be(n.slice(0,-1),"\\");if((n.length-l.length)%2==0)return}else{let l=(function(a,o){if(a.indexOf(o[1])===-1)return-1;let g=0;for(let b=0;b<a.length;b++)if(a[b]==="\\")b++;else if(a[b]===o[0])g++;else if(a[b]===o[1]&&(g--,g<0))return b;return g>0?-2:-1})(e[2],"()");if(l===-2)return;if(l>-1){let a=(e[0].indexOf("!")===0?5:4)+e[1].length+l;e[2]=e[2].substring(0,l),e[0]=e[0].substring(0,a).trim(),e[3]=""}}let s=e[2],t="";if(this.options.pedantic){let l=this.rules.other.pedanticHrefTitle.exec(s);l&&(s=l[1],t=l[3])}else t=e[3]?e[3].slice(1,-1):"";return s=s.trim(),this.rules.other.startAngleBracket.test(s)&&(s=this.options.pedantic&&!this.rules.other.endAngleBracket.test(n)?s.slice(1):s.slice(1,-1)),qe(e,{href:s&&s.replace(this.rules.inline.anyPunctuation,"$1"),title:t&&t.replace(this.rules.inline.anyPunctuation,"$1")},e[0],this.lexer,this.rules)}}reflink(r,e){let n;if((n=this.rules.inline.reflink.exec(r))||(n=this.rules.inline.nolink.exec(r))){let s=e[(n[2]||n[1]).replace(this.rules.other.multipleSpaceGlobal," ").toLowerCase()];if(!s){let t=n[0].charAt(0);return{type:"text",raw:t,text:t}}return qe(n,s,n[0],this.lexer,this.rules)}}emStrong(r,e,n=""){let s=this.rules.inline.emStrongLDelim.exec(r);if(!(!s||s[3]&&n.match(this.rules.other.unicodeAlphaNumeric))&&(!s[1]&&!s[2]||!n||this.rules.inline.punctuation.exec(n))){let t,l,a=[...s[0]].length-1,o=a,g=0,b=s[0][0]==="*"?this.rules.inline.emStrongRDelimAst:this.rules.inline.emStrongRDelimUnd;for(b.lastIndex=0,e=e.slice(-1*r.length+a);(s=b.exec(e))!=null;){if(t=s[1]||s[2]||s[3]||s[4]||s[5]||s[6],!t)continue;if(l=[...t].length,s[3]||s[4]){o+=l;continue}if((s[5]||s[6])&&a%3&&!((a+l)%3)){g+=l;continue}if(o-=l,o>0)continue;l=Math.min(l,l+o+g);let v=[...s[0]][0].length,E=r.slice(0,a+s.index+v+l);if(Math.min(a,l)%2){let O=E.slice(1,-1);return{type:"em",raw:E,text:O,tokens:this.lexer.inlineTokens(O)}}let T=E.slice(2,-2);return{type:"strong",raw:E,text:T,tokens:this.lexer.inlineTokens(T)}}}}codespan(r){let e=this.rules.inline.code.exec(r);if(e){let n=e[2].replace(this.rules.other.newLineCharGlobal," "),s=this.rules.other.nonSpaceChar.test(n),t=this.rules.other.startingSpaceChar.test(n)&&this.rules.other.endingSpaceChar.test(n);return s&&t&&(n=n.substring(1,n.length-1)),{type:"codespan",raw:e[0],text:n}}}br(r){let e=this.rules.inline.br.exec(r);if(e)return{type:"br",raw:e[0]}}del(r){let e=this.rules.inline.del.exec(r);if(e)return{type:"del",raw:e[0],text:e[2],tokens:this.lexer.inlineTokens(e[2])}}autolink(r){let e=this.rules.inline.autolink.exec(r);if(e){let n,s;return e[2]==="@"?(n=e[1],s="mailto:"+n):(n=e[1],s=n),{type:"link",raw:e[0],text:n,href:s,tokens:[{type:"text",raw:n,text:n}]}}}url(r){let e;if(e=this.rules.inline.url.exec(r)){let n,s;if(e[2]==="@")n=e[0],s="mailto:"+n;else{let t;do t=e[0],e[0]=this.rules.inline._backpedal.exec(e[0])?.[0]??"";while(t!==e[0]);n=e[0],s=e[1]==="www."?"http://"+e[0]:e[0]}return{type:"link",raw:e[0],text:n,href:s,tokens:[{type:"text",raw:n,text:n}]}}}inlineText(r){let e=this.rules.inline.text.exec(r);if(e){let n=this.lexer.state.inRawBlock;return{type:"text",raw:e[0],text:e[0],escaped:n}}}},W=class De{tokens;options;state;tokenizer;inlineQueue;constructor(e){this.tokens=[],this.tokens.links=Object.create(null),this.options=e||I,this.options.tokenizer=this.options.tokenizer||new ke,this.tokenizer=this.options.tokenizer,this.tokenizer.options=this.options,this.tokenizer.lexer=this,this.inlineQueue=[],this.state={inLink:!1,inRawBlock:!1,top:!0};let n={other:u,block:Te.normal,inline:me.normal};this.options.pedantic?(n.block=Te.pedantic,n.inline=me.pedantic):this.options.gfm&&(n.block=Te.gfm,this.options.breaks?n.inline=me.breaks:n.inline=me.gfm),this.tokenizer.rules=n}static get rules(){return{block:Te,inline:me}}static lex(e,n){return new De(n).lex(e)}static lexInline(e,n){return new De(n).inlineTokens(e)}lex(e){e=e.replace(u.carriageReturn,`
`),this.blockTokens(e,this.tokens);for(let n=0;n<this.inlineQueue.length;n++){let s=this.inlineQueue[n];this.inlineTokens(s.src,s.tokens)}return this.inlineQueue=[],this.tokens}blockTokens(e,n=[],s=!1){for(this.options.pedantic&&(e=e.replace(u.tabCharGlobal,"    ").replace(u.spaceLine,""));e;){let t;if(this.options.extensions?.block?.some((a=>!!(t=a.call({lexer:this},e,n))&&(e=e.substring(t.raw.length),n.push(t),!0))))continue;if(t=this.tokenizer.space(e)){e=e.substring(t.raw.length);let a=n.at(-1);t.raw.length===1&&a!==void 0?a.raw+=`
`:n.push(t);continue}if(t=this.tokenizer.code(e)){e=e.substring(t.raw.length);let a=n.at(-1);a?.type==="paragraph"||a?.type==="text"?(a.raw+=`
`+t.raw,a.text+=`
`+t.text,this.inlineQueue.at(-1).src=a.text):n.push(t);continue}if(t=this.tokenizer.fences(e)){e=e.substring(t.raw.length),n.push(t);continue}if(t=this.tokenizer.heading(e)){e=e.substring(t.raw.length),n.push(t);continue}if(t=this.tokenizer.hr(e)){e=e.substring(t.raw.length),n.push(t);continue}if(t=this.tokenizer.blockquote(e)){e=e.substring(t.raw.length),n.push(t);continue}if(t=this.tokenizer.list(e)){e=e.substring(t.raw.length),n.push(t);continue}if(t=this.tokenizer.html(e)){e=e.substring(t.raw.length),n.push(t);continue}if(t=this.tokenizer.def(e)){e=e.substring(t.raw.length);let a=n.at(-1);a?.type==="paragraph"||a?.type==="text"?(a.raw+=`
`+t.raw,a.text+=`
`+t.raw,this.inlineQueue.at(-1).src=a.text):this.tokens.links[t.tag]||(this.tokens.links[t.tag]={href:t.href,title:t.title});continue}if(t=this.tokenizer.table(e)){e=e.substring(t.raw.length),n.push(t);continue}if(t=this.tokenizer.lheading(e)){e=e.substring(t.raw.length),n.push(t);continue}let l=e;if(this.options.extensions?.startBlock){let a,o=1/0,g=e.slice(1);this.options.extensions.startBlock.forEach((b=>{a=b.call({lexer:this},g),typeof a=="number"&&a>=0&&(o=Math.min(o,a))})),o<1/0&&o>=0&&(l=e.substring(0,o+1))}if(this.state.top&&(t=this.tokenizer.paragraph(l))){let a=n.at(-1);s&&a?.type==="paragraph"?(a.raw+=`
`+t.raw,a.text+=`
`+t.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=a.text):n.push(t),s=l.length!==e.length,e=e.substring(t.raw.length)}else if(t=this.tokenizer.text(e)){e=e.substring(t.raw.length);let a=n.at(-1);a?.type==="text"?(a.raw+=`
`+t.raw,a.text+=`
`+t.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=a.text):n.push(t)}else if(e){let a="Infinite loop on byte: "+e.charCodeAt(0);if(this.options.silent){console.error(a);break}throw new Error(a)}}return this.state.top=!0,n}inline(e,n=[]){return this.inlineQueue.push({src:e,tokens:n}),n}inlineTokens(e,n=[]){let s=e,t=null;if(this.tokens.links){let o=Object.keys(this.tokens.links);if(o.length>0)for(;(t=this.tokenizer.rules.inline.reflinkSearch.exec(s))!=null;)o.includes(t[0].slice(t[0].lastIndexOf("[")+1,-1))&&(s=s.slice(0,t.index)+"["+"a".repeat(t[0].length-2)+"]"+s.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex))}for(;(t=this.tokenizer.rules.inline.anyPunctuation.exec(s))!=null;)s=s.slice(0,t.index)+"++"+s.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);for(;(t=this.tokenizer.rules.inline.blockSkip.exec(s))!=null;)s=s.slice(0,t.index)+"["+"a".repeat(t[0].length-2)+"]"+s.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);let l=!1,a="";for(;e;){let o;if(l||(a=""),l=!1,this.options.extensions?.inline?.some((b=>!!(o=b.call({lexer:this},e,n))&&(e=e.substring(o.raw.length),n.push(o),!0))))continue;if(o=this.tokenizer.escape(e)){e=e.substring(o.raw.length),n.push(o);continue}if(o=this.tokenizer.tag(e)){e=e.substring(o.raw.length),n.push(o);continue}if(o=this.tokenizer.link(e)){e=e.substring(o.raw.length),n.push(o);continue}if(o=this.tokenizer.reflink(e,this.tokens.links)){e=e.substring(o.raw.length);let b=n.at(-1);o.type==="text"&&b?.type==="text"?(b.raw+=o.raw,b.text+=o.text):n.push(o);continue}if(o=this.tokenizer.emStrong(e,s,a)){e=e.substring(o.raw.length),n.push(o);continue}if(o=this.tokenizer.codespan(e)){e=e.substring(o.raw.length),n.push(o);continue}if(o=this.tokenizer.br(e)){e=e.substring(o.raw.length),n.push(o);continue}if(o=this.tokenizer.del(e)){e=e.substring(o.raw.length),n.push(o);continue}if(o=this.tokenizer.autolink(e)){e=e.substring(o.raw.length),n.push(o);continue}if(!this.state.inLink&&(o=this.tokenizer.url(e))){e=e.substring(o.raw.length),n.push(o);continue}let g=e;if(this.options.extensions?.startInline){let b,v=1/0,E=e.slice(1);this.options.extensions.startInline.forEach((T=>{b=T.call({lexer:this},E),typeof b=="number"&&b>=0&&(v=Math.min(v,b))})),v<1/0&&v>=0&&(g=e.substring(0,v+1))}if(o=this.tokenizer.inlineText(g)){e=e.substring(o.raw.length),o.raw.slice(-1)!=="_"&&(a=o.raw.slice(-1)),l=!0;let b=n.at(-1);b?.type==="text"?(b.raw+=o.raw,b.text+=o.text):n.push(o)}else if(e){let b="Infinite loop on byte: "+e.charCodeAt(0);if(this.options.silent){console.error(b);break}throw new Error(b)}}return n}},ye=class{options;parser;constructor(r){this.options=r||I}space(r){return""}code({text:r,lang:e,escaped:n}){let s=(e||"").match(u.notSpaceStart)?.[0],t=r.replace(u.endingNewline,"")+`
`;return s?'<pre><code class="language-'+J(s)+'">'+(n?t:J(t,!0))+`</code></pre>
`:"<pre><code>"+(n?t:J(t,!0))+`</code></pre>
`}blockquote({tokens:r}){return`<blockquote>
${this.parser.parse(r)}</blockquote>
`}html({text:r}){return r}heading({tokens:r,depth:e}){return`<h${e}>${this.parser.parseInline(r)}</h${e}>
`}hr(r){return`<hr>
`}list(r){let e=r.ordered,n=r.start,s="";for(let l=0;l<r.items.length;l++){let a=r.items[l];s+=this.listitem(a)}let t=e?"ol":"ul";return"<"+t+(e&&n!==1?' start="'+n+'"':"")+`>
`+s+"</"+t+`>
`}listitem(r){let e="";if(r.task){let n=this.checkbox({checked:!!r.checked});r.loose?r.tokens[0]?.type==="paragraph"?(r.tokens[0].text=n+" "+r.tokens[0].text,r.tokens[0].tokens&&r.tokens[0].tokens.length>0&&r.tokens[0].tokens[0].type==="text"&&(r.tokens[0].tokens[0].text=n+" "+J(r.tokens[0].tokens[0].text),r.tokens[0].tokens[0].escaped=!0)):r.tokens.unshift({type:"text",raw:n+" ",text:n+" ",escaped:!0}):e+=n+" "}return e+=this.parser.parse(r.tokens,!!r.loose),`<li>${e}</li>
`}checkbox({checked:r}){return"<input "+(r?'checked="" ':"")+'disabled="" type="checkbox">'}paragraph({tokens:r}){return`<p>${this.parser.parseInline(r)}</p>
`}table(r){let e="",n="";for(let t=0;t<r.header.length;t++)n+=this.tablecell(r.header[t]);e+=this.tablerow({text:n});let s="";for(let t=0;t<r.rows.length;t++){let l=r.rows[t];n="";for(let a=0;a<l.length;a++)n+=this.tablecell(l[a]);s+=this.tablerow({text:n})}return s&&(s=`<tbody>${s}</tbody>`),`<table>
<thead>
`+e+`</thead>
`+s+`</table>
`}tablerow({text:r}){return`<tr>
${r}</tr>
`}tablecell(r){let e=this.parser.parseInline(r.tokens),n=r.header?"th":"td";return(r.align?`<${n} align="${r.align}">`:`<${n}>`)+e+`</${n}>
`}strong({tokens:r}){return`<strong>${this.parser.parseInline(r)}</strong>`}em({tokens:r}){return`<em>${this.parser.parseInline(r)}</em>`}codespan({text:r}){return`<code>${J(r,!0)}</code>`}br(r){return"<br>"}del({tokens:r}){return`<del>${this.parser.parseInline(r)}</del>`}link({href:r,title:e,tokens:n}){let s=this.parser.parseInline(n),t=je(r);if(t===null)return s;let l='<a href="'+(r=t)+'"';return e&&(l+=' title="'+J(e)+'"'),l+=">"+s+"</a>",l}image({href:r,title:e,text:n,tokens:s}){s&&(n=this.parser.parseInline(s,this.parser.textRenderer));let t=je(r);if(t===null)return J(n);let l=`<img src="${r=t}" alt="${n}"`;return e&&(l+=` title="${J(e)}"`),l+=">",l}text(r){return"tokens"in r&&r.tokens?this.parser.parseInline(r.tokens):"escaped"in r&&r.escaped?r.text:J(r.text)}},$e=class{strong({text:r}){return r}em({text:r}){return r}codespan({text:r}){return r}del({text:r}){return r}html({text:r}){return r}text({text:r}){return r}link({text:r}){return""+r}image({text:r}){return""+r}br(){return""}},X=class ze{options;renderer;textRenderer;constructor(e){this.options=e||I,this.options.renderer=this.options.renderer||new ye,this.renderer=this.options.renderer,this.renderer.options=this.options,this.renderer.parser=this,this.textRenderer=new $e}static parse(e,n){return new ze(n).parse(e)}static parseInline(e,n){return new ze(n).parseInline(e)}parse(e,n=!0){let s="";for(let t=0;t<e.length;t++){let l=e[t];if(this.options.extensions?.renderers?.[l.type]){let o=l,g=this.options.extensions.renderers[o.type].call({parser:this},o);if(g!==!1||!["space","hr","heading","code","table","blockquote","list","html","paragraph","text"].includes(o.type)){s+=g||"";continue}}let a=l;switch(a.type){case"space":s+=this.renderer.space(a);continue;case"hr":s+=this.renderer.hr(a);continue;case"heading":s+=this.renderer.heading(a);continue;case"code":s+=this.renderer.code(a);continue;case"table":s+=this.renderer.table(a);continue;case"blockquote":s+=this.renderer.blockquote(a);continue;case"list":s+=this.renderer.list(a);continue;case"html":s+=this.renderer.html(a);continue;case"paragraph":s+=this.renderer.paragraph(a);continue;case"text":{let o=a,g=this.renderer.text(o);for(;t+1<e.length&&e[t+1].type==="text";)o=e[++t],g+=`
`+this.renderer.text(o);s+=n?this.renderer.paragraph({type:"paragraph",raw:g,text:g,tokens:[{type:"text",raw:g,text:g,escaped:!0}]}):g;continue}default:{let o='Token with "'+a.type+'" type was not found.';if(this.options.silent)return console.error(o),"";throw new Error(o)}}}return s}parseInline(e,n=this.renderer){let s="";for(let t=0;t<e.length;t++){let l=e[t];if(this.options.extensions?.renderers?.[l.type]){let o=this.options.extensions.renderers[l.type].call({parser:this},l);if(o!==!1||!["escape","html","link","image","strong","em","codespan","br","del","text"].includes(l.type)){s+=o||"";continue}}let a=l;switch(a.type){case"escape":case"text":s+=n.text(a);break;case"html":s+=n.html(a);break;case"link":s+=n.link(a);break;case"image":s+=n.image(a);break;case"strong":s+=n.strong(a);break;case"em":s+=n.em(a);break;case"codespan":s+=n.codespan(a);break;case"br":s+=n.br(a);break;case"del":s+=n.del(a);break;default:{let o='Token with "'+a.type+'" type was not found.';if(this.options.silent)return console.error(o),"";throw new Error(o)}}}return s}},xe=class{options;block;constructor(r){this.options=r||I}static passThroughHooks=new Set(["preprocess","postprocess","processAllTokens"]);preprocess(r){return r}postprocess(r){return r}processAllTokens(r){return r}provideLexer(){return this.block?W.lex:W.lexInline}provideParser(){return this.block?X.parse:X.parseInline}},Ge=class{defaults={async:!1,breaks:!1,extensions:null,gfm:!0,hooks:null,pedantic:!1,renderer:null,silent:!1,tokenizer:null,walkTokens:null};options=this.setOptions;parse=this.parseMarkdown(!0);parseInline=this.parseMarkdown(!1);Parser=X;Renderer=ye;TextRenderer=$e;Lexer=W;Tokenizer=ke;Hooks=xe;constructor(...r){this.use(...r)}walkTokens(r,e){let n=[];for(let s of r)switch(n=n.concat(e.call(this,s)),s.type){case"table":{let t=s;for(let l of t.header)n=n.concat(this.walkTokens(l.tokens,e));for(let l of t.rows)for(let a of l)n=n.concat(this.walkTokens(a.tokens,e));break}case"list":{let t=s;n=n.concat(this.walkTokens(t.items,e));break}default:{let t=s;this.defaults.extensions?.childTokens?.[t.type]?this.defaults.extensions.childTokens[t.type].forEach((l=>{let a=t[l].flat(1/0);n=n.concat(this.walkTokens(a,e))})):t.tokens&&(n=n.concat(this.walkTokens(t.tokens,e)))}}return n}use(...r){let e=this.defaults.extensions||{renderers:{},childTokens:{}};return r.forEach((n=>{let s={...n};if(s.async=this.defaults.async||s.async||!1,n.extensions&&(n.extensions.forEach((t=>{if(!t.name)throw new Error("extension name required");if("renderer"in t){let l=e.renderers[t.name];e.renderers[t.name]=l?function(...a){let o=t.renderer.apply(this,a);return o===!1&&(o=l.apply(this,a)),o}:t.renderer}if("tokenizer"in t){if(!t.level||t.level!=="block"&&t.level!=="inline")throw new Error("extension level must be 'block' or 'inline'");let l=e[t.level];l?l.unshift(t.tokenizer):e[t.level]=[t.tokenizer],t.start&&(t.level==="block"?e.startBlock?e.startBlock.push(t.start):e.startBlock=[t.start]:t.level==="inline"&&(e.startInline?e.startInline.push(t.start):e.startInline=[t.start]))}"childTokens"in t&&t.childTokens&&(e.childTokens[t.name]=t.childTokens)})),s.extensions=e),n.renderer){let t=this.defaults.renderer||new ye(this.defaults);for(let l in n.renderer){if(!(l in t))throw new Error(`renderer '${l}' does not exist`);if(["options","parser"].includes(l))continue;let a=l,o=n.renderer[a],g=t[a];t[a]=(...b)=>{let v=o.apply(t,b);return v===!1&&(v=g.apply(t,b)),v||""}}s.renderer=t}if(n.tokenizer){let t=this.defaults.tokenizer||new ke(this.defaults);for(let l in n.tokenizer){if(!(l in t))throw new Error(`tokenizer '${l}' does not exist`);if(["options","rules","lexer"].includes(l))continue;let a=l,o=n.tokenizer[a],g=t[a];t[a]=(...b)=>{let v=o.apply(t,b);return v===!1&&(v=g.apply(t,b)),v}}s.tokenizer=t}if(n.hooks){let t=this.defaults.hooks||new xe;for(let l in n.hooks){if(!(l in t))throw new Error(`hook '${l}' does not exist`);if(["options","block"].includes(l))continue;let a=l,o=n.hooks[a],g=t[a];xe.passThroughHooks.has(l)?t[a]=b=>{if(this.defaults.async)return Promise.resolve(o.call(t,b)).then((E=>g.call(t,E)));let v=o.call(t,b);return g.call(t,v)}:t[a]=(...b)=>{let v=o.apply(t,b);return v===!1&&(v=g.apply(t,b)),v}}s.hooks=t}if(n.walkTokens){let t=this.defaults.walkTokens,l=n.walkTokens;s.walkTokens=function(a){let o=[];return o.push(l.call(this,a)),t&&(o=o.concat(t.call(this,a))),o}}this.defaults={...this.defaults,...s}})),this}setOptions(r){return this.defaults={...this.defaults,...r},this}lexer(r,e){return W.lex(r,e??this.defaults)}parser(r,e){return X.parse(r,e??this.defaults)}parseMarkdown(r){return(e,n)=>{let s={...n},t={...this.defaults,...s},l=this.onError(!!t.silent,!!t.async);if(this.defaults.async===!0&&s.async===!1)return l(new Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));if(typeof e>"u"||e===null)return l(new Error("marked(): input parameter is undefined or null"));if(typeof e!="string")return l(new Error("marked(): input parameter is of type "+Object.prototype.toString.call(e)+", string expected"));t.hooks&&(t.hooks.options=t,t.hooks.block=r);let a=t.hooks?t.hooks.provideLexer():r?W.lex:W.lexInline,o=t.hooks?t.hooks.provideParser():r?X.parse:X.parseInline;if(t.async)return Promise.resolve(t.hooks?t.hooks.preprocess(e):e).then((g=>a(g,t))).then((g=>t.hooks?t.hooks.processAllTokens(g):g)).then((g=>t.walkTokens?Promise.all(this.walkTokens(g,t.walkTokens)).then((()=>g)):g)).then((g=>o(g,t))).then((g=>t.hooks?t.hooks.postprocess(g):g)).catch(l);try{t.hooks&&(e=t.hooks.preprocess(e));let g=a(e,t);t.hooks&&(g=t.hooks.processAllTokens(g)),t.walkTokens&&this.walkTokens(g,t.walkTokens);let b=o(g,t);return t.hooks&&(b=t.hooks.postprocess(b)),b}catch(g){return l(g)}}}onError(r,e){return n=>{if(n.message+=`
Please report this to https://github.com/markedjs/marked.`,r){let s="<p>An error occurred:</p><pre>"+J(n.message+"",!0)+"</pre>";return e?Promise.resolve(s):s}if(e)return Promise.reject(n);throw n}}},oe=new Ge;function R(r,e){return oe.parse(r,e)}R.options=R.setOptions=function(r){return oe.setOptions(r),R.defaults=oe.defaults,L(R.defaults),R},R.getDefaults=q,R.defaults=I,R.use=function(...r){return oe.use(...r),R.defaults=oe.defaults,L(R.defaults),R},R.walkTokens=function(r,e){return oe.walkTokens(r,e)},R.parseInline=oe.parseInline,R.Parser=X,R.parser=X.parse,R.Renderer=ye,R.TextRenderer=$e,R.Lexer=W,R.lexer=W.lex,R.Tokenizer=ke,R.Hooks=xe,R.parse=R;var rt=R.options,st=R.setOptions,at=R.use,it=R.walkTokens,lt=R.parseInline,ot=R,ct=X.parse,ut=W.lex;return x!=d&&(A.exports=d),A.exports}));var ht=typeof window<"u"?window:typeof WorkerGlobalScope<"u"&&self instanceof WorkerGlobalScope?self:{},y=(function(p){var d,x=/(?:^|\s)lang(?:uage)?-([\w-]+)(?=\s|$)/i,A=0,m={},h={manual:p.Prism&&p.Prism.manual,disableWorkerMessageHandler:p.Prism&&p.Prism.disableWorkerMessageHandler,util:{encode:function c(i){return i instanceof $?new $(i.type,c(i.content),i.alias):Array.isArray(i)?i.map(c):i.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/\u00a0/g," ")},type:function(c){return Object.prototype.toString.call(c).slice(8,-1)},objId:function(c){return c.__id||Object.defineProperty(c,"__id",{value:++A}),c.__id},clone:function c(i,u){var f,k;switch(u=u||{},h.util.type(i)){case"Object":if(k=h.util.objId(i),u[k])return u[k];for(var S in f={},u[k]=f,i)i.hasOwnProperty(S)&&(f[S]=c(i[S],u));return f;case"Array":return k=h.util.objId(i),u[k]?u[k]:(f=[],u[k]=f,i.forEach((function(w,F){f[F]=c(w,u)})),f);default:return i}},getLanguage:function(c){for(;c;){var i=x.exec(c.className);if(i)return i[1].toLowerCase();c=c.parentElement}return"none"},setLanguage:function(c,i){c.className=c.className.replace(RegExp(x,"gi"),""),c.classList.add("language-"+i)},currentScript:function(){if(typeof document>"u")return null;if("currentScript"in document)return document.currentScript;try{throw new Error}catch(f){var c=(/at [^(\r\n]*\((.*):[^:]+:[^:]+\)$/i.exec(f.stack)||[])[1];if(c){var i,u=document.getElementsByTagName("script");for(i in u)if(u[i].src==c)return u[i]}return null}},isActive:function(c,i,u){for(var f="no-"+i;c;){var k=c.classList;if(k.contains(i))return!0;if(k.contains(f))return!1;c=c.parentElement}return!!u}},languages:{plain:m,plaintext:m,text:m,txt:m,extend:function(c,i){var u,f=h.util.clone(h.languages[c]);for(u in i)f[u]=i[u];return f},insertBefore:function(c,i,u,f){var k,S=(f=f||h.languages)[c],w={};for(k in S)if(S.hasOwnProperty(k)){if(k==i)for(var F in u)u.hasOwnProperty(F)&&(w[F]=u[F]);u.hasOwnProperty(k)||(w[k]=S[k])}var C=f[c];return f[c]=w,h.languages.DFS(h.languages,(function(N,B){B===C&&N!=c&&(this[N]=w)})),w},DFS:function c(i,u,f,k){k=k||{};var S,w,F,C=h.util.objId;for(S in i)i.hasOwnProperty(S)&&(u.call(i,S,i[S],f||S),w=i[S],(F=h.util.type(w))!=="Object"||k[C(w)]?F!=="Array"||k[C(w)]||(k[C(w)]=!0,c(w,u,S,k)):(k[C(w)]=!0,c(w,u,null,k)))}},plugins:{},highlightAll:function(c,i){h.highlightAllUnder(document,c,i)},highlightAllUnder:function(c,i,u){var f={callback:u,container:c,selector:'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'};h.hooks.run("before-highlightall",f),f.elements=Array.prototype.slice.apply(f.container.querySelectorAll(f.selector)),h.hooks.run("before-all-elements-highlight",f);for(var k,S=0;k=f.elements[S++];)h.highlightElement(k,i===!0,f.callback)},highlightElement:function(c,i,u){var f=h.util.getLanguage(c),k=h.languages[f],S=(h.util.setLanguage(c,f),c.parentElement);S&&S.nodeName.toLowerCase()==="pre"&&h.util.setLanguage(S,f);var w={element:c,language:f,grammar:k,code:c.textContent};function F(C){w.highlightedCode=C,h.hooks.run("before-insert",w),w.element.innerHTML=w.highlightedCode,h.hooks.run("after-highlight",w),h.hooks.run("complete",w),u&&u.call(w.element)}if(h.hooks.run("before-sanity-check",w),(S=w.element.parentElement)&&S.nodeName.toLowerCase()==="pre"&&!S.hasAttribute("tabindex")&&S.setAttribute("tabindex","0"),!w.code)return h.hooks.run("complete",w),void(u&&u.call(w.element));h.hooks.run("before-highlight",w),w.grammar?i&&p.Worker?((f=new Worker(h.filename)).onmessage=function(C){F(C.data)},f.postMessage(JSON.stringify({language:w.language,code:w.code,immediateClose:!0}))):F(h.highlight(w.code,w.grammar,w.language)):F(h.util.encode(w.code))},highlight:function(c,i,u){if(c={code:c,grammar:i,language:u},h.hooks.run("before-tokenize",c),c.grammar)return c.tokens=h.tokenize(c.code,c.grammar),h.hooks.run("after-tokenize",c),$.stringify(h.util.encode(c.tokens),c.language);throw new Error('The language "'+c.language+'" has no grammar.')},tokenize:function(c,i){var u=i.rest;if(u){for(var f in u)i[f]=u[f];delete i.rest}for(var k=new ne,S=(q(k,k.head,c),(function C(N,B,re,ce,ge,M){for(var Q in re)if(re.hasOwnProperty(Q)&&re[Q]){var U=re[Q];U=Array.isArray(U)?U:[U];for(var te=0;te<U.length;++te){if(M&&M.cause==Q+","+te)return;for(var Se,j=U[te],fe=j.inside,se=!!j.lookbehind,ue=!!j.greedy,ve=j.alias,Ae=(ue&&!j.pattern.global&&(Se=j.pattern.toString().match(/[imsuy]*$/)[0],j.pattern=RegExp(j.pattern.source,Se+"g")),j.pattern||j),_=ce.next,z=ge;_!==B.tail&&!(M&&z>=M.reach);z+=_.value.length,_=_.next){var H=_.value;if(B.length>N.length)return;if(!(H instanceof $)){var G,ae=1;if(ue){if(!(G=D(Ae,z,N,se))||G.index>=N.length)break;var pe=G.index,Fe=G.index+G[0].length,K=z;for(K+=_.value.length;K<=pe;)K+=(_=_.next).value.length;if(z=K-=_.value.length,_.value instanceof $)continue;for(var ie=_;ie!==B.tail&&(K<Fe||typeof ie.value=="string");ie=ie.next)ae++,K+=ie.value.length;ae--,H=N.slice(z,K),G.index-=z}else if(!(G=D(Ae,0,H,se)))continue;pe=G.index;var Z=G[0],le=H.slice(0,pe),Re=H.slice(pe+Z.length),ee=(H=z+H.length,M&&H>M.reach&&(M.reach=H),_.prev);le=(le&&(ee=q(B,ee,le),z+=le.length),I(B,ee,ae),new $(Q,fe?h.tokenize(Z,fe):Z,ve,Z)),_=q(B,ee,le),Re&&q(B,_,Re),1<ae&&(Z={cause:Q+","+te,reach:H},C(N,B,re,_.prev,z,Z),M&&Z.reach>M.reach&&(M.reach=Z.reach))}}}}})(c,k,i,k.head,0),k),w=[],F=S.head.next;F!==S.tail;)w.push(F.value),F=F.next;return w},hooks:{all:{},add:function(c,i){var u=h.hooks.all;u[c]=u[c]||[],u[c].push(i)},run:function(c,i){var u=h.hooks.all[c];if(u&&u.length)for(var f,k=0;f=u[k++];)f(i)}},Token:$};function $(c,i,u,f){this.type=c,this.content=i,this.alias=u,this.length=0|(f||"").length}function D(c,i,u,f){return c.lastIndex=i,(i=c.exec(u))&&f&&i[1]&&(c=i[1].length,i.index+=c,i[0]=i[0].slice(c)),i}function ne(){var c={value:null,prev:null,next:null},i={value:null,prev:c,next:null};c.next=i,this.head=c,this.tail=i,this.length=0}function q(c,i,u){var f=i.next;return u={value:u,prev:i,next:f},i.next=u,f.prev=u,c.length++,u}function I(c,i,u){for(var f=i.next,k=0;k<u&&f!==c.tail;k++)f=f.next;(i.next=f).prev=i,c.length-=k}if(p.Prism=h,$.stringify=function c(i,u){if(typeof i=="string")return i;var f;if(Array.isArray(i))return f="",i.forEach((function(F){f+=c(F,u)})),f;var k,S={type:i.type,content:c(i.content,u),tag:"span",classes:["token",i.type],attributes:{},language:u},w=((i=i.alias)&&(Array.isArray(i)?Array.prototype.push.apply(S.classes,i):S.classes.push(i)),h.hooks.run("wrap",S),"");for(k in S.attributes)w+=" "+k+'="'+(S.attributes[k]||"").replace(/"/g,"&quot;")+'"';return"<"+S.tag+' class="'+S.classes.join(" ")+'"'+w+">"+S.content+"</"+S.tag+">"},!p.document)return p.addEventListener&&(h.disableWorkerMessageHandler||p.addEventListener("message",(function(c){var i=(c=JSON.parse(c.data)).language,u=c.code;c=c.immediateClose,p.postMessage(h.highlight(u,h.languages[i],i)),c&&p.close()}),!1)),h;function L(){h.manual||h.highlightAll()}return(m=h.util.currentScript())&&(h.filename=m.src,m.hasAttribute("data-manual")&&(h.manual=!0)),h.manual||((d=document.readyState)==="loading"||d==="interactive"&&m&&m.defer?document.addEventListener("DOMContentLoaded",L):window.requestAnimationFrame?window.requestAnimationFrame(L):window.setTimeout(L,16)),h})(ht);typeof he<"u"&&he.exports&&(he.exports=y),typeof global<"u"&&(global.Prism=y),y.languages.markup={comment:{pattern:/<!--(?:(?!<!--)[\s\S])*?-->/,greedy:!0},prolog:{pattern:/<\?[\s\S]+?\?>/,greedy:!0},doctype:{pattern:/<!DOCTYPE(?:[^>"'[\]]|"[^"]*"|'[^']*')+(?:\[(?:[^<"'\]]|"[^"]*"|'[^']*'|<(?!!--)|<!--(?:[^-]|-(?!->))*-->)*\]\s*)?>/i,greedy:!0,inside:{"internal-subset":{pattern:/(^[^\[]*\[)[\s\S]+(?=\]>$)/,lookbehind:!0,greedy:!0,inside:null},string:{pattern:/"[^"]*"|'[^']*'/,greedy:!0},punctuation:/^<!|>$|[[\]]/,"doctype-tag":/^DOCTYPE/i,name:/[^\s<>'"]+/}},cdata:{pattern:/<!\[CDATA\[[\s\S]*?\]\]>/i,greedy:!0},tag:{pattern:/<\/?(?!\d)[^\s>\/=$<%]+(?:\s(?:\s*[^\s>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))|(?=[\s/>])))+)?\s*\/?>/,greedy:!0,inside:{tag:{pattern:/^<\/?[^\s>\/]+/,inside:{punctuation:/^<\/?/,namespace:/^[^\s>\/:]+:/}},"special-attr":[],"attr-value":{pattern:/=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+)/,inside:{punctuation:[{pattern:/^=/,alias:"attr-equals"},{pattern:/^(\s*)["']|["']$/,lookbehind:!0}]}},punctuation:/\/?>/,"attr-name":{pattern:/[^\s>\/]+/,inside:{namespace:/^[^\s>\/:]+:/}}}},entity:[{pattern:/&[\da-z]{1,8};/i,alias:"named-entity"},/&#x?[\da-f]{1,8};/i]},y.languages.markup.tag.inside["attr-value"].inside.entity=y.languages.markup.entity,y.languages.markup.doctype.inside["internal-subset"].inside=y.languages.markup,y.hooks.add("wrap",(function(p){p.type==="entity"&&(p.attributes.title=p.content.replace(/&amp;/,"&"))})),Object.defineProperty(y.languages.markup.tag,"addInlined",{value:function(p,d){var x;(d=((x=((x={})["language-"+d]={pattern:/(^<!\[CDATA\[)[\s\S]+?(?=\]\]>$)/i,lookbehind:!0,inside:y.languages[d]},x.cdata=/^<!\[CDATA\[|\]\]>$/i,{"included-cdata":{pattern:/<!\[CDATA\[[\s\S]*?\]\]>/i,inside:x}}))["language-"+d]={pattern:/[\s\S]+/,inside:y.languages[d]},{}))[p]={pattern:RegExp(/(<__[^>]*>)(?:<!\[CDATA\[(?:[^\]]|\](?!\]>))*\]\]>|(?!<!\[CDATA\[)[\s\S])*?(?=<\/__>)/.source.replace(/__/g,(function(){return p})),"i"),lookbehind:!0,greedy:!0,inside:x},y.languages.insertBefore("markup","cdata",d)}}),Object.defineProperty(y.languages.markup.tag,"addAttribute",{value:function(p,d){y.languages.markup.tag.inside["special-attr"].push({pattern:RegExp(/(^|["'\s])/.source+"(?:"+p+")"+/\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))/.source,"i"),lookbehind:!0,inside:{"attr-name":/^[^\s=]+/,"attr-value":{pattern:/=[\s\S]+/,inside:{value:{pattern:/(^=\s*(["']|(?!["'])))\S[\s\S]*(?=\2$)/,lookbehind:!0,alias:[d,"language-"+d],inside:y.languages[d]},punctuation:[{pattern:/^=/,alias:"attr-equals"},/"|'/]}}}})}}),y.languages.html=y.languages.markup,y.languages.mathml=y.languages.markup,y.languages.svg=y.languages.markup,y.languages.xml=y.languages.extend("markup",{}),y.languages.ssml=y.languages.xml,y.languages.atom=y.languages.xml,y.languages.rss=y.languages.xml,(function(p){var d=/(?:"(?:\\(?:\r\n|[\s\S])|[^"\\\r\n])*"|'(?:\\(?:\r\n|[\s\S])|[^'\\\r\n])*')/;(d=(p.languages.css={comment:/\/\*[\s\S]*?\*\//,atrule:{pattern:RegExp("@[\\w-](?:"+/[^;{\s"']|\s+(?!\s)/.source+"|"+d.source+")*?"+/(?:;|(?=\s*\{))/.source),inside:{rule:/^@[\w-]+/,"selector-function-argument":{pattern:/(\bselector\s*\(\s*(?![\s)]))(?:[^()\s]|\s+(?![\s)])|\((?:[^()]|\([^()]*\))*\))+(?=\s*\))/,lookbehind:!0,alias:"selector"},keyword:{pattern:/(^|[^\w-])(?:and|not|only|or)(?![\w-])/,lookbehind:!0}}},url:{pattern:RegExp("\\burl\\((?:"+d.source+"|"+/(?:[^\\\r\n()"']|\\[\s\S])*/.source+")\\)","i"),greedy:!0,inside:{function:/^url/i,punctuation:/^\(|\)$/,string:{pattern:RegExp("^"+d.source+"$"),alias:"url"}}},selector:{pattern:RegExp(`(^|[{}\\s])[^{}\\s](?:[^{};"'\\s]|\\s+(?![\\s{])|`+d.source+")*(?=\\s*\\{)"),lookbehind:!0},string:{pattern:d,greedy:!0},property:{pattern:/(^|[^-\w\xA0-\uFFFF])(?!\s)[-_a-z\xA0-\uFFFF](?:(?!\s)[-\w\xA0-\uFFFF])*(?=\s*:)/i,lookbehind:!0},important:/!important\b/i,function:{pattern:/(^|[^-a-z0-9])[-a-z0-9]+(?=\()/i,lookbehind:!0},punctuation:/[(){};:,]/},p.languages.css.atrule.inside.rest=p.languages.css,p.languages.markup))&&(d.tag.addInlined("style","css"),d.tag.addAttribute("style","css"))})(y),y.languages.clike={comment:[{pattern:/(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/,lookbehind:!0,greedy:!0},{pattern:/(^|[^\\:])\/\/.*/,lookbehind:!0,greedy:!0}],string:{pattern:/(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,greedy:!0},"class-name":{pattern:/(\b(?:class|extends|implements|instanceof|interface|new|trait)\s+|\bcatch\s+\()[\w.\\]+/i,lookbehind:!0,inside:{punctuation:/[.\\]/}},keyword:/\b(?:break|catch|continue|do|else|finally|for|function|if|in|instanceof|new|null|return|throw|try|while)\b/,boolean:/\b(?:false|true)\b/,function:/\b\w+(?=\()/,number:/\b0x[\da-f]+\b|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?/i,operator:/[<>]=?|[!=]=?=?|--?|\+\+?|&&?|\|\|?|[?*/~^%]/,punctuation:/[{}[\];(),.:]/},y.languages.javascript=y.languages.extend("clike",{"class-name":[y.languages.clike["class-name"],{pattern:/(^|[^$\w\xA0-\uFFFF])(?!\s)[_$A-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\.(?:constructor|prototype))/,lookbehind:!0}],keyword:[{pattern:/((?:^|\})\s*)catch\b/,lookbehind:!0},{pattern:/(^|[^.]|\.\.\.\s*)\b(?:as|assert(?=\s*\{)|async(?=\s*(?:function\b|\(|[$\w\xA0-\uFFFF]|$))|await|break|case|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally(?=\s*(?:\{|$))|for|from(?=\s*(?:['"]|$))|function|(?:get|set)(?=\s*(?:[#\[$\w\xA0-\uFFFF]|$))|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)\b/,lookbehind:!0}],function:/#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*(?:\.\s*(?:apply|bind|call)\s*)?\()/,number:{pattern:RegExp(/(^|[^\w$])/.source+"(?:"+/NaN|Infinity/.source+"|"+/0[bB][01]+(?:_[01]+)*n?/.source+"|"+/0[oO][0-7]+(?:_[0-7]+)*n?/.source+"|"+/0[xX][\dA-Fa-f]+(?:_[\dA-Fa-f]+)*n?/.source+"|"+/\d+(?:_\d+)*n/.source+"|"+/(?:\d+(?:_\d+)*(?:\.(?:\d+(?:_\d+)*)?)?|\.\d+(?:_\d+)*)(?:[Ee][+-]?\d+(?:_\d+)*)?/.source+")"+/(?![\w$])/.source),lookbehind:!0},operator:/--|\+\+|\*\*=?|=>|&&=?|\|\|=?|[!=]==|<<=?|>>>?=?|[-+*/%&|^!=<>]=?|\.{3}|\?\?=?|\?\.?|[~:]/}),y.languages.javascript["class-name"][0].pattern=/(\b(?:class|extends|implements|instanceof|interface|new)\s+)[\w.\\]+/,y.languages.insertBefore("javascript","keyword",{regex:{pattern:RegExp(/((?:^|[^$\w\xA0-\uFFFF."'\])\s]|\b(?:return|yield))\s*)/.source+/\//.source+"(?:"+/(?:\[(?:[^\]\\\r\n]|\\.)*\]|\\.|[^/\\\[\r\n])+\/[dgimyus]{0,7}/.source+"|"+/(?:\[(?:[^[\]\\\r\n]|\\.|\[(?:[^[\]\\\r\n]|\\.|\[(?:[^[\]\\\r\n]|\\.)*\])*\])*\]|\\.|[^/\\\[\r\n])+\/[dgimyus]{0,7}v[dgimyus]{0,7}/.source+")"+/(?=(?:\s|\/\*(?:[^*]|\*(?!\/))*\*\/)*(?:$|[\r\n,.;:})\]]|\/\/))/.source),lookbehind:!0,greedy:!0,inside:{"regex-source":{pattern:/^(\/)[\s\S]+(?=\/[a-z]*$)/,lookbehind:!0,alias:"language-regex",inside:y.languages.regex},"regex-delimiter":/^\/|\/$/,"regex-flags":/^[a-z]+$/}},"function-variable":{pattern:/#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*[=:]\s*(?:async\s*)?(?:\bfunction\b|(?:\((?:[^()]|\([^()]*\))*\)|(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)\s*=>))/,alias:"function"},parameter:[{pattern:/(function(?:\s+(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)?\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\))/,lookbehind:!0,inside:y.languages.javascript},{pattern:/(^|[^$\w\xA0-\uFFFF])(?!\s)[_$a-z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*=>)/i,lookbehind:!0,inside:y.languages.javascript},{pattern:/(\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*=>)/,lookbehind:!0,inside:y.languages.javascript},{pattern:/((?:\b|\s|^)(?!(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)(?![$\w\xA0-\uFFFF]))(?:(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*\s*)\(\s*|\]\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*\{)/,lookbehind:!0,inside:y.languages.javascript}],constant:/\b[A-Z](?:[A-Z_]|\dx?)*\b/}),y.languages.insertBefore("javascript","string",{hashbang:{pattern:/^#!.*/,greedy:!0,alias:"comment"},"template-string":{pattern:/`(?:\\[\s\S]|\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}|(?!\$\{)[^\\`])*`/,greedy:!0,inside:{"template-punctuation":{pattern:/^`|`$/,alias:"string"},interpolation:{pattern:/((?:^|[^\\])(?:\\{2})*)\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}/,lookbehind:!0,inside:{"interpolation-punctuation":{pattern:/^\$\{|\}$/,alias:"punctuation"},rest:y.languages.javascript}},string:/[\s\S]+/}},"string-property":{pattern:/((?:^|[,{])[ \t]*)(["'])(?:\\(?:\r\n|[\s\S])|(?!\2)[^\\\r\n])*\2(?=\s*:)/m,lookbehind:!0,greedy:!0,alias:"property"}}),y.languages.insertBefore("javascript","operator",{"literal-property":{pattern:/((?:^|[,{])[ \t]*)(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*:)/m,lookbehind:!0,alias:"property"}}),y.languages.markup&&(y.languages.markup.tag.addInlined("script","javascript"),y.languages.markup.tag.addAttribute(/on(?:abort|blur|change|click|composition(?:end|start|update)|dblclick|error|focus(?:in|out)?|key(?:down|up)|load|mouse(?:down|enter|leave|move|out|over|up)|reset|resize|scroll|select|slotchange|submit|unload|wheel)/.source,"javascript")),y.languages.js=y.languages.javascript,(function(){var p,d,x,A;y!==void 0&&typeof document<"u"&&(Element.prototype.matches||(Element.prototype.matches=Element.prototype.msMatchesSelector||Element.prototype.webkitMatchesSelector),p={js:"javascript",py:"python",rb:"ruby",ps1:"powershell",psm1:"powershell",sh:"bash",bat:"batch",h:"c",tex:"latex"},x="pre[data-src]:not(["+(d="data-src-status")+'="loaded"]):not(['+d+'="loading"])',y.hooks.add("before-highlightall",(function(m){m.selector+=", "+x})),y.hooks.add("before-sanity-check",(function(m){var h,$,D,ne,q,I,L=m.element;L.matches(x)&&(m.code="",L.setAttribute(d,"loading"),(h=L.appendChild(document.createElement("CODE"))).textContent="Loading…",$=L.getAttribute("data-src"),(m=m.language)==="none"&&(D=(/\.(\w+)$/.exec($)||[,"none"])[1],m=p[D]||D),y.util.setLanguage(h,m),y.util.setLanguage(L,m),(D=y.plugins.autoloader)&&D.loadLanguages(m),D=$,ne=function(c){L.setAttribute(d,"loaded");var i,u,f=(function(k){var S,w;if(k=/^\s*(\d+)\s*(?:(,)\s*(?:(\d+)\s*)?)?$/.exec(k||""))return S=Number(k[1]),w=k[2],k=k[3],w?k?[S,Number(k)]:[S,void 0]:[S,S]})(L.getAttribute("data-range"));f&&(i=c.split(/\r\n?|\n/g),u=f[0],f=f[1]==null?i.length:f[1],u<0&&(u+=i.length),u=Math.max(0,Math.min(u-1,i.length)),f<0&&(f+=i.length),f=Math.max(0,Math.min(f,i.length)),c=i.slice(u,f).join(`
`),L.hasAttribute("data-start")||L.setAttribute("data-start",String(u+1))),h.textContent=c,y.highlightElement(h)},q=function(c){L.setAttribute(d,"failed"),h.textContent=c},(I=new XMLHttpRequest).open("GET",D,!0),I.onreadystatechange=function(){I.readyState==4&&(I.status<400&&I.responseText?ne(I.responseText):400<=I.status?q("✖ Error "+I.status+" while fetching file: "+I.statusText):q("✖ Error: File does not exist or is empty"))},I.send(null))})),A=!(y.plugins.fileHighlight={highlight:function(m){for(var h,$=(m||document).querySelectorAll(x),D=0;h=$[D++];)y.highlightElement(h)}}),y.fileHighlight=function(){A||(console.warn("Prism.fileHighlight is deprecated. Use `Prism.plugins.fileHighlight.highlight` instead."),A=!0),y.plugins.fileHighlight.highlight.apply(this,arguments)})})();(function(p){p.languages.typescript=p.languages.extend("javascript",{"class-name":{pattern:/(\b(?:class|extends|implements|instanceof|interface|new|type)\s+)(?!keyof\b)(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?:\s*<(?:[^<>]|<(?:[^<>]|<[^<>]*>)*>)*>)?/,lookbehind:!0,greedy:!0,inside:null},builtin:/\b(?:Array|Function|Promise|any|boolean|console|never|number|string|symbol|unknown)\b/}),p.languages.typescript.keyword.push(/\b(?:abstract|declare|is|keyof|readonly|require)\b/,/\b(?:asserts|infer|interface|module|namespace|type)\b(?=\s*(?:[{_$a-zA-Z\xA0-\uFFFF]|$))/,/\btype\b(?=\s*(?:[\{*]|$))/),delete p.languages.typescript.parameter,delete p.languages.typescript["literal-property"];var d=p.languages.extend("typescript",{});delete d["class-name"],p.languages.typescript["class-name"].inside=d,p.languages.insertBefore("typescript","function",{decorator:{pattern:/@[$\w\xA0-\uFFFF]+/,inside:{at:{pattern:/^@/,alias:"operator"},function:/^[\s\S]+/}},"generic-function":{pattern:/#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*\s*<(?:[^<>]|<(?:[^<>]|<[^<>]*>)*>)*>(?=\s*\()/,greedy:!0,inside:{function:/^#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*/,generic:{pattern:/<[\s\S]+/,alias:"class-name",inside:d}}}}),p.languages.ts=p.languages.typescript})(Prism);(function(p){var d="\\b(?:BASH|BASHOPTS|BASH_ALIASES|BASH_ARGC|BASH_ARGV|BASH_CMDS|BASH_COMPLETION_COMPAT_DIR|BASH_LINENO|BASH_REMATCH|BASH_SOURCE|BASH_VERSINFO|BASH_VERSION|COLORTERM|COLUMNS|COMP_WORDBREAKS|DBUS_SESSION_BUS_ADDRESS|DEFAULTS_PATH|DESKTOP_SESSION|DIRSTACK|DISPLAY|EUID|GDMSESSION|GDM_LANG|GNOME_KEYRING_CONTROL|GNOME_KEYRING_PID|GPG_AGENT_INFO|GROUPS|HISTCONTROL|HISTFILE|HISTFILESIZE|HISTSIZE|HOME|HOSTNAME|HOSTTYPE|IFS|INSTANCE|JOB|LANG|LANGUAGE|LC_ADDRESS|LC_ALL|LC_IDENTIFICATION|LC_MEASUREMENT|LC_MONETARY|LC_NAME|LC_NUMERIC|LC_PAPER|LC_TELEPHONE|LC_TIME|LESSCLOSE|LESSOPEN|LINES|LOGNAME|LS_COLORS|MACHTYPE|MAILCHECK|MANDATORY_PATH|NO_AT_BRIDGE|OLDPWD|OPTERR|OPTIND|ORBIT_SOCKETDIR|OSTYPE|PAPERSIZE|PATH|PIPESTATUS|PPID|PS1|PS2|PS3|PS4|PWD|RANDOM|REPLY|SECONDS|SELINUX_INIT|SESSION|SESSIONTYPE|SESSION_MANAGER|SHELL|SHELLOPTS|SHLVL|SSH_AUTH_SOCK|TERM|UID|UPSTART_EVENTS|UPSTART_INSTANCE|UPSTART_JOB|UPSTART_SESSION|USER|WINDOWID|XAUTHORITY|XDG_CONFIG_DIRS|XDG_CURRENT_DESKTOP|XDG_DATA_DIRS|XDG_GREETER_DATA_DIR|XDG_MENU_PREFIX|XDG_RUNTIME_DIR|XDG_SEAT|XDG_SEAT_PATH|XDG_SESSION_DESKTOP|XDG_SESSION_ID|XDG_SESSION_PATH|XDG_SESSION_TYPE|XDG_VTNR|XMODIFIERS)\\b",x={pattern:/(^(["']?)\w+\2)[ \t]+\S.*/,lookbehind:!0,alias:"punctuation",inside:null},A={bash:x,environment:{pattern:RegExp("\\$"+d),alias:"constant"},variable:[{pattern:/\$?\(\([\s\S]+?\)\)/,greedy:!0,inside:{variable:[{pattern:/(^\$\(\([\s\S]+)\)\)/,lookbehind:!0},/^\$\(\(/],number:/\b0x[\dA-Fa-f]+\b|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:[Ee]-?\d+)?/,operator:/--|\+\+|\*\*=?|<<=?|>>=?|&&|\|\||[=!+\-*/%<>^&|]=?|[?~:]/,punctuation:/\(\(?|\)\)?|,|;/}},{pattern:/\$\((?:\([^)]+\)|[^()])+\)|`[^`]+`/,greedy:!0,inside:{variable:/^\$\(|^`|\)$|`$/}},{pattern:/\$\{[^}]+\}/,greedy:!0,inside:{operator:/:[-=?+]?|[!\/]|##?|%%?|\^\^?|,,?/,punctuation:/[\[\]]/,environment:{pattern:RegExp("(\\{)"+d),lookbehind:!0,alias:"constant"}}},/\$(?:\w+|[#?*!@$])/],entity:/\\(?:[abceEfnrtv\\"]|O?[0-7]{1,3}|U[0-9a-fA-F]{8}|u[0-9a-fA-F]{4}|x[0-9a-fA-F]{1,2})/};p.languages.bash={shebang:{pattern:/^#!\s*\/.*/,alias:"important"},comment:{pattern:/(^|[^"{\\$])#.*/,lookbehind:!0},"function-name":[{pattern:/(\bfunction\s+)[\w-]+(?=(?:\s*\(?:\s*\))?\s*\{)/,lookbehind:!0,alias:"function"},{pattern:/\b[\w-]+(?=\s*\(\s*\)\s*\{)/,alias:"function"}],"for-or-select":{pattern:/(\b(?:for|select)\s+)\w+(?=\s+in\s)/,alias:"variable",lookbehind:!0},"assign-left":{pattern:/(^|[\s;|&]|[<>]\()\w+(?:\.\w+)*(?=\+?=)/,inside:{environment:{pattern:RegExp("(^|[\\s;|&]|[<>]\\()"+d),lookbehind:!0,alias:"constant"}},alias:"variable",lookbehind:!0},parameter:{pattern:/(^|\s)-{1,2}(?:\w+:[+-]?)?\w+(?:\.\w+)*(?=[=\s]|$)/,alias:"variable",lookbehind:!0},string:[{pattern:/((?:^|[^<])<<-?\s*)(\w+)\s[\s\S]*?(?:\r?\n|\r)\2/,lookbehind:!0,greedy:!0,inside:A},{pattern:/((?:^|[^<])<<-?\s*)(["'])(\w+)\2\s[\s\S]*?(?:\r?\n|\r)\3/,lookbehind:!0,greedy:!0,inside:{bash:x}},{pattern:/(^|[^\\](?:\\\\)*)"(?:\\[\s\S]|\$\([^)]+\)|\$(?!\()|`[^`]+`|[^"\\`$])*"/,lookbehind:!0,greedy:!0,inside:A},{pattern:/(^|[^$\\])'[^']*'/,lookbehind:!0,greedy:!0},{pattern:/\$'(?:[^'\\]|\\[\s\S])*'/,greedy:!0,inside:{entity:A.entity}}],environment:{pattern:RegExp("\\$?"+d),alias:"constant"},variable:A.variable,function:{pattern:/(^|[\s;|&]|[<>]\()(?:add|apropos|apt|apt-cache|apt-get|aptitude|aspell|automysqlbackup|awk|basename|bash|bc|bconsole|bg|bzip2|cal|cargo|cat|cfdisk|chgrp|chkconfig|chmod|chown|chroot|cksum|clear|cmp|column|comm|composer|cp|cron|crontab|csplit|curl|cut|date|dc|dd|ddrescue|debootstrap|df|diff|diff3|dig|dir|dircolors|dirname|dirs|dmesg|docker|docker-compose|du|egrep|eject|env|ethtool|expand|expect|expr|fdformat|fdisk|fg|fgrep|file|find|fmt|fold|format|free|fsck|ftp|fuser|gawk|git|gparted|grep|groupadd|groupdel|groupmod|groups|grub-mkconfig|gzip|halt|head|hg|history|host|hostname|htop|iconv|id|ifconfig|ifdown|ifup|import|install|ip|java|jobs|join|kill|killall|less|link|ln|locate|logname|logrotate|look|lpc|lpr|lprint|lprintd|lprintq|lprm|ls|lsof|lynx|make|man|mc|mdadm|mkconfig|mkdir|mke2fs|mkfifo|mkfs|mkisofs|mknod|mkswap|mmv|more|most|mount|mtools|mtr|mutt|mv|nano|nc|netstat|nice|nl|node|nohup|notify-send|npm|nslookup|op|open|parted|passwd|paste|pathchk|ping|pkill|pnpm|podman|podman-compose|popd|pr|printcap|printenv|ps|pushd|pv|quota|quotacheck|quotactl|ram|rar|rcp|reboot|remsync|rename|renice|rev|rm|rmdir|rpm|rsync|scp|screen|sdiff|sed|sendmail|seq|service|sftp|sh|shellcheck|shuf|shutdown|sleep|slocate|sort|split|ssh|stat|strace|su|sudo|sum|suspend|swapon|sync|sysctl|tac|tail|tar|tee|time|timeout|top|touch|tr|traceroute|tsort|tty|umount|uname|unexpand|uniq|units|unrar|unshar|unzip|update-grub|uptime|useradd|userdel|usermod|users|uudecode|uuencode|v|vcpkg|vdir|vi|vim|virsh|vmstat|wait|watch|wc|wget|whereis|which|who|whoami|write|xargs|xdg-open|yarn|yes|zenity|zip|zsh|zypper)(?=$|[)\s;|&])/,lookbehind:!0},keyword:{pattern:/(^|[\s;|&]|[<>]\()(?:case|do|done|elif|else|esac|fi|for|function|if|in|select|then|until|while)(?=$|[)\s;|&])/,lookbehind:!0},builtin:{pattern:/(^|[\s;|&]|[<>]\()(?:\.|:|alias|bind|break|builtin|caller|cd|command|continue|declare|echo|enable|eval|exec|exit|export|getopts|hash|help|let|local|logout|mapfile|printf|pwd|read|readarray|readonly|return|set|shift|shopt|source|test|times|trap|type|typeset|ulimit|umask|unalias|unset)(?=$|[)\s;|&])/,lookbehind:!0,alias:"class-name"},boolean:{pattern:/(^|[\s;|&]|[<>]\()(?:false|true)(?=$|[)\s;|&])/,lookbehind:!0},"file-descriptor":{pattern:/\B&\d\b/,alias:"important"},operator:{pattern:/\d?<>|>\||\+=|=[=~]?|!=?|<<[<-]?|[&\d]?>>|\d[<>]&?|[<>][&=]?|&[>&]?|\|[&|]?/,inside:{"file-descriptor":{pattern:/^\d/,alias:"important"}}},punctuation:/\$?\(\(?|\)\)?|\.\.|[{}[\];\\]/,number:{pattern:/(^|\s)(?:[1-9]\d*|0)(?:[.,]\d+)?\b/,lookbehind:!0}},x.inside=p.languages.bash;for(var m=["comment","function-name","for-or-select","assign-left","parameter","string","environment","function","keyword","builtin","boolean","file-descriptor","operator","punctuation","number"],h=A.variable[1].inside,$=0;$<m.length;$++)h[m[$]]=p.languages.bash[m[$]];p.languages.sh=p.languages.bash,p.languages.shell=p.languages.bash})(Prism);Prism.languages.json={property:{pattern:/(^|[^\\])"(?:\\.|[^\\"\r\n])*"(?=\s*:)/,lookbehind:!0,greedy:!0},string:{pattern:/(^|[^\\])"(?:\\.|[^\\"\r\n])*"(?!\s*:)/,lookbehind:!0,greedy:!0},comment:{pattern:/\/\/.*|\/\*[\s\S]*?(?:\*\/|$)/,greedy:!0},number:/-?\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/i,punctuation:/[{}[\],]/,operator:/:/,boolean:/\b(?:false|true)\b/,null:{pattern:/\bnull\b/,alias:"keyword"}},Prism.languages.webmanifest=Prism.languages.json;(function(p){var d=p.util.clone(p.languages.typescript);p.languages.tsx=p.languages.extend("jsx",d),delete p.languages.tsx.parameter,delete p.languages.tsx["literal-property"];var x=p.languages.tsx.tag;x.pattern=RegExp("(^|[^\\w$]|(?=</))(?:"+x.pattern.source+")",x.pattern.flags),x.lookbehind=!0})(Prism);let Ie=localStorage.getItem("theme")||"dark";const gt=document.getElementById("nav-tree"),Ye=document.getElementById("markdown-viewer"),ft=document.getElementById("toc-list"),mt=document.getElementById("breadcrumbs"),bt=document.getElementById("page-nav"),kt=document.getElementById("search-input"),Oe=document.getElementById("modal-search-input"),de=document.getElementById("search-modal"),We=document.getElementById("search-results");function yt(){Ve(Ie),xt();const p=window.location.hash.slice(1)||"introduction";Xe(p),window.addEventListener("hashchange",()=>Xe(window.location.hash.slice(1))),document.getElementById("theme-toggle").addEventListener("click",At),document.addEventListener("keydown",x=>{(x.ctrlKey||x.metaKey)&&x.key==="k"&&(x.preventDefault(),de.classList.remove("hidden"),Oe.focus()),x.key==="Escape"&&de.classList.add("hidden")}),kt.addEventListener("focus",()=>{de.classList.remove("hidden"),Oe.focus()}),de.addEventListener("click",x=>{x.target===de&&de.classList.add("hidden")}),Oe.addEventListener("input",vt);const d=document.getElementById("mobile-menu-btn");d&&d.addEventListener("click",()=>{document.getElementById("sidebar").classList.toggle("open")})}function xt(){const p={};Object.keys(V).forEach(A=>{const m=V[A];p[m.category]||(p[m.category]=[]),p[m.category].push({key:A,title:m.title})});const d=["Introduction","Getting Started","Core Concepts","Architecture","Configuration","API Reference","Advanced","Troubleshooting"];let x="";d.forEach(A=>{p[A]&&(x+=`<div class="nav-group">
                <div class="nav-group-title">${A}</div>
                ${p[A].map(m=>`
                    <a href="#${m.key}" class="nav-link" id="link-${m.key}">
                        ${m.title}
                    </a>
                `).join("")}
            </div>`)}),gt.innerHTML=x}function Xe(p){V[p]||(p="introduction");const d=V[p];document.querySelectorAll(".nav-link").forEach(A=>A.classList.remove("active"));const x=document.getElementById(`link-${p}`);x&&x.classList.add("active"),mt.innerHTML=`
        <span>Docs</span>
        <i class="bi bi-chevron-right chevron"></i>
        <span>${d.category}</span>
        <i class="bi bi-chevron-right chevron"></i>
        <span>${d.title}</span>
    `,Ye.innerHTML=marked.parse(d.content),window.Prism&&Prism.highlightAll(),wt(),St(p),document.getElementById("sidebar").classList.remove("open"),window.scrollTo(0,0)}function wt(){const p=Ye.querySelectorAll("h2, h3");let d="";p.forEach((x,A)=>{const m=`header-${A}`;x.id=m,d+=`
            <a href="#${m}" class="toc-link" onclick="document.getElementById('${m}').scrollIntoView({behavior: 'smooth'})">
                ${x.innerText}
            </a>
        `}),ft.innerHTML=d}function St(p){const d=Object.keys(V),x=d.indexOf(p),A=x>0?d[x-1]:null,m=x<d.length-1?d[x+1]:null;let h="";A?h+=`
            <a href="#${A}" class="page-nav-card">
                <span class="page-nav-label">Previous</span>
                <span class="page-nav-title">« ${V[A].title}</span>
            </a>
        `:h+="<div></div>",m&&(h+=`
            <a href="#${m}" class="page-nav-card" style="text-align: right;">
                <span class="page-nav-label">Next</span>
                <span class="page-nav-title">${V[m].title} »</span>
            </a>
        `),bt.innerHTML=h}function vt(p){const d=p.target.value.toLowerCase();if(d.length<2){We.innerHTML="";return}const x=Object.keys(V).filter(A=>{const m=V[A];return m.title.toLowerCase().includes(d)||m.content.toLowerCase().includes(d)});We.innerHTML=x.map(A=>{const m=V[A],h=m.content.toLowerCase().indexOf(d),$=h>-1?m.content.substring(h,h+60)+"...":m.content.substring(0,60)+"...";return`
            <div class="search-result-item" onclick="window.location.hash='${A}'; document.getElementById('search-modal').classList.add('hidden')">
                <span class="result-title">${m.title}</span>
                <span class="result-preview">${$.replace(/[#*`]/g,"")}</span>
            </div>
        `}).join("")}function At(){Ie=Ie==="dark"?"light":"dark",Ve(Ie)}function Ve(p){localStorage.setItem("theme",p),document.documentElement.className=p;const d=document.querySelector("#theme-toggle i");d&&(d.className=p==="dark"?"bi bi-moon-stars-fill":"bi bi-sun-fill")}yt()});export default Rt();
