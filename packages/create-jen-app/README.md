# create-jen-app

The fastest way to create a beautiful Jen.js application.

## Quick Start

```bash
npm create jen-app my-app
cd my-app
npm run dev
```

## Usage

```bash
npm create jen-app [project-name]
```

### Interactive Prompts

When you run the command, you'll be guided through:

1. **Project Name** - What to call your project
2. **Template Selection** - The CLI currently offers:
   - **Static** - Pure SSG with components
3. **TypeScript** - Enable TypeScript support (recommended)
4. **Dependencies** - Install npm packages automatically
5. **Git** - Initialize a git repository

## Templates

### Static Template

Perfect for marketing sites, blogs, and documentation.

-  Pure static site generation
-  Component-based with Preact
-  Beautiful dark theme styles
-  Zero JavaScript overhead

## Available Commands

All templates come with these npm scripts:

```bash
npm run dev        # Start development server (port 3000)
npm run build      # Build for production
npm run start      # Start production server
npm run typecheck  # TypeScript type checking (if enabled)
```

## Features

-  **Beautiful Dark Theme** - Modern, colorful CLI with no white backgrounds
-  **Fast Setup** - Get started in seconds with template selection
-  **Modern Stack** - Pre-configured and ready to use
-  **TypeScript Ready** - Full TypeScript support included
-  **Colorful Prompts** - Interactive, beautiful terminal experience

## Project Structure

### Static Template

```
my-app/
├── site/
│   ├── styles/           # SCSS styles
│   ├── components/       # Preact components
│   ├── routes/           # Page routes (file-based)
│   └── assets/           # Static assets
├── dist/                 # Build output
├── jen.config.ts         # Jen.js config
└── package.json
```

## Technologies

- [Jen.js](https://github.com/kessud2021/Jen.js) - Web framework
- [Preact](https://preactjs.com) - Lightweight React alternative
- [TypeScript](https://www.typescriptlang.org) - Type safety
- [SCSS](https://sass-lang.com) - Advanced styling

## Documentation

- [Jen.js Docs](https://github.com/kessud2021/Jen.js)
- [Preact Guide](https://preactjs.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

## License

MIT - See LICENSE in the Jen.js repository
