
# Jen.js Starter Kit: Static

```sh
npm create jen-app@latest
````


> ⚡ **Building something cool?** This is a static Jen.js starter template with file-based routing and fast builds.

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

* **`site/pages/`** → Your routes (file-based routing)
* **`site/components/`** → Reusable UI components
* **`site/layouts/`** → Layout wrappers
* **`site/assets/`** → Public static files
* **`site/styles/`** → Global styles

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command           | Action                                    |
| :---------------- | :---------------------------------------- |
| `npm install`     | Installs dependencies                     |
| `npm run dev`     | Starts the dev server at `localhost:3001` |
| `npm run build`   | Builds your static site into `./dist/`    |
| `npm run preview` | Previews the production build locally     |

## 📦 Deployment

Jen.js outputs a fully static site into `dist/`.

You can deploy it easily to:

* GitHub Pages
* Netlify
* Vercel
* Cloudflare Pages

## 👀 Want to learn more?

Check the Jen.js documentation (coming soon) or explore the source code to see how routing, builds, and rendering work.


