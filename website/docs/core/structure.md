# Project Structure

Jen.js has a clear, conventional project structure. Understand it to build effective applications.

## Directory Layout

```
jen.js-app/
├── site/                    # Application routes and pages
│   ├── (home).tsx          # Routes in Preact/JSX
│   ├── (about).tsx
│   ├── posts/
│   │   ├── (index).tsx     # /posts → index page
│   │   └── ($id).tsx       # /posts/:id → dynamic page
│   └── api/
│       ├── (users).ts      # /api/users → API endpoint
│       └── v1/
│           └── (data).ts   # /api/v1/data → nested API
│
├── src/                     # Framework and app code
│   ├── components/         # Reusable Preact components
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   └── nav.tsx
│   ├── lib/                # Utility functions
│   │   ├── db.ts          # Database helpers
│   │   ├── api.ts         # API client
│   │   └── utils.ts       # Utilities
│   ├── middleware/         # Express-style middleware
│   │   ├── auth.ts
│   │   └── logging.ts
│   ├── plugins/            # Custom plugins
│   │   └── my-plugin.ts
│   └── styles/             # Stylesheets
│       ├── globals.css
│       └── components.css
│
├── public/                 # Static assets (copied as-is)
│   ├── favicon.ico
│   ├── robots.txt
│   └── images/
│
├── dist/                   # Build output (generated)
│   ├── index/
│   │   └── index.html     # Rendered pages
│   ├── api/               # API routes (if SSR)
│   ├── images/
│   ├── styles.css
│   └── bundle.js
│
├── .env                    # Environment variables (not in git)
├── .gitignore
├── jen.config.ts          # Framework configuration
├── tsconfig.json          # TypeScript configuration
├── package.json           # Dependencies and scripts
└── README.md
```

## Key Directories

### site/

Your application code lives here. This is where you create pages and API routes.

**Rules:**
- Files must match pattern: `(name).tsx` or `(name).ts`
- Files become routes automatically
- Directories create nested routes
- `.ts` files are API routes
- `.tsx` files are pages (render HTML)

**Examples:**
```
site/(home).tsx          → GET /
site/(about).tsx         → GET /about
site/blog/($slug).tsx    → GET /blog/:slug
site/api/(users).ts      → GET /api/users
```

### src/

Optional code supporting your application.

**Subdirectories:**
- `components/` — Reusable Preact components
- `lib/` — Utility functions and helpers
- `middleware/` — Custom middleware
- `plugins/` — Custom plugins
- `styles/` — CSS/SCSS files
- `types/` — TypeScript type definitions

**Accessed via path alias:**
```typescript
import { Header } from '@src/components/header';
import { db } from '@src/lib/db';
```

### public/

Static assets that are copied to `dist/` unchanged.

**Usage:**
- Put images in `public/images/`
- Reference as `/images/logo.png` in HTML
- Includes `robots.txt`, sitemaps, etc.

### dist/

Generated output from build. Ignored by git.

**Structure after build:**
```
dist/
├── index/               # Page routes
│   ├── index.html      # / route
│   ├── about/
│   │   └── index.html  # /about
│   └── posts/
│       └── 1/
│           └── index.html
├── api/                # API routes (SSR only)
└── assets/             # Static files
```

## File Organization

### Components

Create reusable components in `src/components/`:

```typescript
// src/components/button.tsx
interface ButtonProps {
  text: string;
  onClick: () => void;
}

export function Button({ text, onClick }: ButtonProps) {
  return <button onClick={onClick}>{text}</button>;
}
```

Use in pages:

```typescript
// site/(home).tsx
import { Button } from '@src/components/button';

export default function Home() {
  return <Button text="Click me" onClick={() => alert('Clicked!')} />;
}
```

### Utilities

Create helpers in `src/lib/`:

```typescript
// src/lib/api.ts
export async function fetchUser(id: string) {
  const res = await fetch(`/api/users/${id}`);
  return res.json();
}

// src/lib/validation.ts
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

Use throughout:

```typescript
import { fetchUser } from '@src/lib/api';
import { validateEmail } from '@src/lib/validation';
```

### Styles

Keep styles organized:

```
src/styles/
├── globals.css         # Global styles
├── layout.css          # Layout components
├── typography.css      # Typography
└── variables.css       # CSS variables
```

Import in pages:

```typescript
// site/(home).tsx
import '@src/styles/globals.css';

export default function Home() {
  return <h1>Styled page</h1>;
}
```

Or use inline styles:

```typescript
const styles = `
  h1 { color: blue; }
  p { font-size: 16px; }
`;

export default function Home() {
  return (
    <html>
      <head><style>{styles}</style></head>
      <body><h1>Heading</h1></body>
    </html>
  );
}
```

### Types

Create type definitions in `src/types/`:

```typescript
// src/types/user.ts
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface UserInput {
  name: string;
  email: string;
}
```

Use throughout:

```typescript
import type { User } from '@src/types/user';

export async function getUser(id: string): Promise<User> {
  // ...
}
```

## Configuration Files

### jen.config.ts

Main framework configuration:

```typescript
import type { FrameworkConfig } from '@src/core/config';

const config: FrameworkConfig = {
  siteDir: 'site',
  distDir: 'dist',
  // ... more options
};

export default config;
```

### tsconfig.json

TypeScript configuration:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2020",
    "jsx": "react-jsx",
    "jsxImportSource": "preact",
    "strict": true,
    "paths": {
      "@src/*": ["src/*"]
    }
  }
}
```

### .env

Environment variables (not committed):

```
DATABASE_URL=sqlite://./data.db
API_KEY=secret123
```

### package.json

Dependencies and scripts:

```json
{
  "scripts": {
    "dev": "node server.ts dev",
    "build": "node build.js",
    "start": "node server.ts start",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "preact": "^10.0.0"
  }
}
```

## Build Output Structure

After running `npm run build`:

```
dist/
├── index/
│   ├── index.html          # / (homepage)
│   ├── about/
│   │   └── index.html      # /about
│   ├── posts/
│   │   ├── 1/
│   │   │   └── index.html  # /posts/1
│   │   └── 2/
│   │       └── index.html  # /posts/2
│   └── api/                # /api/* routes (if SSR)
├── styles.css
├── bundle.js
└── assets/
    ├── images/
    └── fonts/
```

For SSR mode:

```
dist/
├── server.js               # Runtime server
├── api/                    # API route handlers
│   └── users.js
└── pages/                  # Page components
    └── home.js
```

## Organization Best Practices

### Group by Feature

For larger apps, organize by feature:

```
src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── lib/
│   │   └── types.ts
│   ├── users/
│   │   ├── components/
│   │   ├── lib/
│   │   └── types.ts
│   └── posts/
│       ├── components/
│       ├── lib/
│       └── types.ts
```

### Shared Code

Keep truly shared code in `src/`:

```
src/
├── components/      # Shared components
├── lib/            # Shared utilities
├── types/          # Shared types
└── middleware/     # Shared middleware
```

### Keep site/ Simple

The `site/` directory should mainly be route definitions that delegate to components:

```typescript
// site/(user).tsx
import { UserProfile } from '@src/features/users/components/profile';
import { getUser } from '@src/features/users/lib/api';

export async function loader(ctx: any) {
  return { user: await getUser(ctx.params.id) };
}

export default function UserPage({ data }: any) {
  return <UserProfile user={data.user} />;
}
```

## Next Steps

- Create your first component
- Organize your project
- Build your application
