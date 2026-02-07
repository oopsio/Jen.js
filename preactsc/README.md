# Preact Server Components (PRSC)

A standalone Node.js tool for building Preact applications with server and client component separation.

## Quick Start

```bash
npm install
npm run example:build
npm run start
```

Visit `http://localhost:3000`

## CLI

### `preactsc dev <entry.server.jsx>`
Start dev server with hot reload.
```bash
preactsc dev src/App.server.jsx
```

### `preactsc build <entry.server.jsx> --out <dir>`
Build for production.
```bash
preactsc build src/App.server.jsx --out dist
```

### `preactsc start <outdir>`
Run production build.
```bash
preactsc start dist
```

## File Conventions

- `.server.jsx` - Server-only components (can use fs, db, secrets)
- `.client.jsx` - Client-only components (can use hooks, events)

Server components can import client components.
Client components cannot import server components or Node modules.

## Example

See `examples/app/` for a working example.

```jsx
// App.server.jsx
import Counter from "./Counter.client.jsx";

export default function App() {
  return (
    <div>
      <h1>Hello PRSC</h1>
      <Counter initial={5} />
    </div>
  );
}
```

```jsx
// Counter.client.jsx
import { useState } from "preact/hooks";

export default function Counter({ initial }) {
  const [count, setCount] = useState(initial);
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

## Architecture

- `src/cli/` - CLI command handling
- `src/compiler/` - Component analysis and bundling
- `src/runtime/` - Server and client runtime
- `src/server/` - Dev and production servers
- `src/shared/` - Shared utilities
