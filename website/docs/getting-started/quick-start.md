# Quick Start

## Create Your First App

```bash
npm create jen-js@latest my-app
cd my-app
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

## Creating Pages

Pages are files in the `site/` directory. Each file becomes a route.

### Simple Page

Create `site/(hello).tsx`:

```typescript
export default function HelloPage() {
  return (
    <html>
      <head>
        <title>Hello</title>
      </head>
      <body>
        <h1>Hello World</h1>
        <p>This page is at /hello</p>
      </body>
    </html>
  );
}
```

Visit http://localhost:3000/hello

### Page with Data

Pages can load data using a `loader` function:

```typescript
import type { LoaderContext } from '@src/core/routes';

interface PageData {
  title: string;
  message: string;
}

export async function loader(ctx: LoaderContext): Promise<PageData> {
  return {
    title: 'About Us',
    message: 'Welcome to our site!'
  };
}

export default function About({ data }: { data: PageData }) {
  return (
    <html>
      <head>
        <title>{data.title}</title>
      </head>
      <body>
        <h1>{data.title}</h1>
        <p>{data.message}</p>
      </body>
    </html>
  );
}
```

### Dynamic Routes

Create `site/posts/($id).tsx`:

```typescript
import type { LoaderContext } from '@src/core/routes';

export async function loader(ctx: LoaderContext) {
  const postId = ctx.params.id;
  // Fetch post data
  return {
    id: postId,
    title: `Post ${postId}`,
    content: 'Post content here...'
  };
}

export default function Post({ data }: any) {
  return (
    <html>
      <head>
        <title>{data.title}</title>
      </head>
      <body>
        <h1>{data.title}</h1>
        <p>{data.content}</p>
      </body>
    </html>
  );
}
```

Access with URLs like `/posts/1`, `/posts/hello`, etc.

## Interactive Pages

Use Preact hooks for interactivity:

```typescript
import { useState } from 'preact/hooks';

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <html>
      <head>
        <title>Counter</title>
      </head>
      <body>
        <h1>Counter App</h1>
        <p>Count: {count}</p>
        <button onClick={() => setCount(count + 1)}>
          Increment
        </button>
      </body>
    </html>
  );
}
```

## API Routes

Create `site/api/(users).ts`:

```typescript
import type { IncomingMessage, ServerResponse } from 'node:http';

export async function handle(req: IncomingMessage, res: ServerResponse) {
  if (req.method === 'GET') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({
      users: [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' }
      ]
    }));
  }
}
```

Access with `GET /api/users` to get JSON response.

## Building for Production

### Static Site Generation

```bash
npm run build
```

Creates static HTML in `dist/`. Deploy to any CDN:

```bash
# Serve locally
npx serve dist

# Deploy to Netlify, Vercel, etc.
```

### Server-Side Rendering

Keep dev server running:

```bash
npm run start
```

Or build and serve:

```bash
npm run build
npm run start
```

## Project Structure

```
my-app/
├── site/
│   ├── (home).tsx           # Homepage at /
│   ├── (about).tsx          # About at /about
│   ├── posts/
│   │   └── ($id).tsx        # Dynamic at /posts/:id
│   └── api/
│       └── (users).ts       # API at /api/users
├── src/                     # Optional: custom code
├── dist/                    # Generated output
├── jen.config.ts           # Framework config
├── tsconfig.json           # TypeScript config
├── package.json
└── README.md
```

## Common Tasks

### Add a New Page

1. Create file in `site/` with naming pattern: `(name).tsx`
2. Export default component
3. Optionally export `loader` function for data

### Handle Forms

```typescript
export async function handle(req: IncomingMessage, res: ServerResponse) {
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const data = JSON.parse(body);
      // Process form data
      res.writeHead(200);
      res.end(JSON.stringify({ success: true }));
    });
  }
}
```

### Add Styles

Create a CSS file or use inline styles:

```typescript
const styles = `
  body { font-family: sans-serif; }
  h1 { color: blue; }
`;

export default function StyledPage() {
  return (
    <html>
      <head>
        <style>{styles}</style>
      </head>
      <body>
        <h1>Styled Page</h1>
      </body>
    </html>
  );
}
```

### Use Components

Create reusable components in `src/`:

```typescript
// src/components/header.tsx
export function Header() {
  return <header><h1>My Site</h1></header>;
}
```

Use in pages:

```typescript
import { Header } from '@src/components/header';

export default function Home() {
  return (
    <html>
      <head><title>Home</title></head>
      <body>
        <Header />
        <main>Home page</main>
      </body>
    </html>
  );
}
```

## Next Steps

- Learn about routing in detail
- Set up a database
- Add authentication
- Create API routes
- Deploy your app
