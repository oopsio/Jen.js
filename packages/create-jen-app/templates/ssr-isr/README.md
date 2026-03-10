# Jen.js Starter Kit: SSR + ISR

```sh
npm create jen-app@latest
```

> ⚡ **Building something cool?** This is an SSR (Server-Side Rendering) + ISR (Incremental Static Regeneration) Jen.js starter template with dynamic rendering and intelligent caching.

## 🚀 Project Structure

Inside your Jen.js project, you'll see the following folders and files:

```text
/
├── site/
│   ├── assets/
│   │   └── favicon.svg
│   ├── components/
│   │   └── Header.tsx
│   ├── layouts/
│   │   └── BaseLayout.tsx
│   ├── pages/
│   │   └── (index).tsx
│   ├── styles/
│   │   └── global.scss
│   └── jen.config.ts
├── dist/
└── package.json
```

### Key Folders

- **`site/pages/`** → Your routes (file-based routing)
- **`site/components/`** → Reusable UI components
- **`site/layouts/`** → Layout wrappers
- **`site/assets/`** → Public static files
- **`site/styles/`** → Global styles

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command         | Action                                    |
| :-------------- | :---------------------------------------- |
| `npm install`   | Installs dependencies                     |
| `npm run dev`   | Starts the dev server at `localhost:3001` |
| `npm run build` | Builds your SSR+ISR app into `./dist/`    |

## 🎯 SSR + ISR Mode

This template uses **Server-Side Rendering (SSR)** with **Incremental Static Regeneration (ISR)**:

- **SSR**: Pages are rendered on-demand on the server when requested
- **ISR**: Rendered pages are cached and revalidated every `defaultRevalidateSeconds` (default: 3600 seconds / 1 hour)

Configure revalidation in `jen.config.ts`:

```typescript
rendering: {
  defaultMode: "ssr",
  defaultRevalidateSeconds: 3600,  // Revalidate every hour
},
```

## 📦 Deployment

SSR+ISR apps require a Node.js runtime:

- **Vercel** - Excellent SSR support
- **Netlify** - With serverless functions
- **Railway** - Node.js hosting
- **Heroku** - Classic Node.js deployment
- **AWS Lambda** - Via serverless frameworks

## 👀 Want to learn more?

Check the Jen.js documentation (coming soon) or explore the source code to see how routing, SSR, and caching work.
