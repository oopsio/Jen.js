# Jen.js API Routes Example

Complete example showcasing Jen.js API routing system - file-based API routes similar to Next.js.

## Features Demonstrated

- ✅ File-based routing (`/src/api/*.ts` → `/api/*`)
- ✅ Dynamic routes (`[id]`, `[...slug]`)
- ✅ HTTP methods (GET, POST, PUT, DELETE)
- ✅ Query parameters
- ✅ Request body parsing
- ✅ Path parameters
- ✅ Cookies & headers
- ✅ Type-safe responses

## Directory Structure

```
examples/api/
├── src/
│   ├── api/
│   │   ├── hello.ts              (GET /api/hello)
│   │   ├── todos.ts              (GET|POST /api/todos)
│   │   ├── todos/[id].ts         (GET|PUT|DELETE /api/todos/:id)
│   │   ├── search.ts             (GET /api/search?q=...)
│   │   ├── upload.ts             (POST /api/upload)
│   │   ├── users/[id]/profile.ts (GET /api/users/:id/profile)
│   │   └── files/[...path].ts    (GET /api/files/...)
│   ├── pages/
│   │   └── index.tsx             (Frontend demonstrating API calls)
│   └── server.ts                 (Express server with API loader)
├── package.json
└── README.md
```

## Usage

### 1. API Route Handler

```typescript
// src/api/hello.ts
import type { ApiRequest, ApiResponse } from "@src/api";

export default function handler(req: ApiRequest, res: ApiResponse) {
  res.status(200).json({ message: "Hello from Jen.js API!" });
}

export const config = {
  maxDuration: 30,
  bodyParser: { sizeLimit: "1mb" },
};
```

### 2. Dynamic Route with Path Parameters

```typescript
// src/api/todos/[id].ts
import type { ApiRequest, ApiResponse } from "@src/api";

export default function handler(req: ApiRequest, res: ApiResponse) {
  const { id } = req.params; // Extract from [id]

  if (req.method === "GET") {
    res.json({ id, title: `Todo ${id}` });
  } else if (req.method === "PUT") {
    res.json({ id, updated: true });
  }
}
```

### 3. Catch-All Routes

```typescript
// src/api/files/[...path].ts
import type { ApiRequest, ApiResponse } from "@src/api";

export default function handler(req: ApiRequest, res: ApiResponse) {
  const { path } = req.params; // path will be array
  // /api/files/docs/readme.md -> path = ['docs', 'readme.md']

  res.json({ filePath: path.join("/") });
}
```

### 4. Query Parameters & Request Body

```typescript
// src/api/search.ts
import type { ApiRequest, ApiResponse } from "@src/api";

export default function handler(req: ApiRequest, res: ApiResponse) {
  const { q, limit } = req.query;
  const body = req.body; // Automatically parsed JSON

  res.json({ query: q, limit, body });
}
```

### 5. Server Integration (Express)

```typescript
// src/server.ts
import express from "express";
import { ApiLoader, createApiMiddleware } from "@src/api";

const app = express();

// Load all API routes from src/api directory
const loader = new ApiLoader();
loader.loadRoutes("./src/api").then((routes) => {
  app.use(createApiMiddleware(routes));
});

app.listen(3000, () => console.log("API server running"));
```

## Running the Example

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Server will start at http://localhost:3000
```

## API Endpoints

### Hello World

```bash
curl http://localhost:3000/api/hello
```

### Todos (List & Create)

```bash
# List all todos
curl http://localhost:3000/api/todos

# Create new todo
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Learn Jen.js","completed":false}'
```

### Todo Detail (Get, Update, Delete)

```bash
# Get todo by ID
curl http://localhost:3000/api/todos/1

# Update todo
curl -X PUT http://localhost:3000/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated","completed":true}'

# Delete todo
curl -X DELETE http://localhost:3000/api/todos/1
```

### Search with Query Parameters

```bash
curl "http://localhost:3000/api/search?q=javascript&limit=5"
```

### Upload Files

```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@/path/to/file.txt"
```

### Nested Dynamic Routes

```bash
curl http://localhost:3000/api/users/123/profile
```

### Catch-All Routes

```bash
curl http://localhost:3000/api/files/docs/guides/getting-started.md
curl http://localhost:3000/api/files/images/2024/photo.jpg
```

## Key Differences from Next.js

| Feature       | Next.js | Jen.js      |
| ------------- | ------- | ----------- |
| Framework     | React   | Preact      |
| Bundle size   | Large   | Lightweight |
| Setup         | Complex | Simple      |
| API routes    | ✅      | ✅          |
| Type safety   | ✅      | ✅          |
| Query parsing | Auto    | Auto        |
| Body parsing  | Auto    | Auto        |
| Streaming     | ✅      | ✅          |
| Middleware    | ✅      | ✅          |

## Advanced Features

### Custom Middleware

```typescript
export default function handler(req: ApiRequest, res: ApiResponse) {
  // Add custom headers
  res.header("X-Custom", "value");

  // Check authentication
  const auth = req.cookies.auth;
  if (!auth) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  res.json({ data: "protected" });
}
```

### Streaming Responses

```typescript
export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.header("Content-Type", "text/event-stream");

  for (let i = 0; i < 10; i++) {
    res.write(`data: ${i}\n\n`);
    await new Promise((r) => setTimeout(r, 1000));
  }

  res.end();
}
```

### File Download

```typescript
export default function handler(req: ApiRequest, res: ApiResponse) {
  res.download("./files/document.pdf", "my-document.pdf");
}
```

## Performance Tips

1. **Lazy load expensive operations** - Only compute what's needed per request
2. **Cache responses** - Add Cache-Control headers
3. **Limit body size** - Use `bodyParser.sizeLimit` config
4. **Set timeouts** - Use `maxDuration` config
5. **Validate input** - Always validate query/body parameters

## Testing

```typescript
// Example test
import { handler } from "./api/todos";

test("GET /api/todos", async () => {
  const req = { method: "GET", query: {}, params: {}, body: null };
  const res = { json: jest.fn() };

  await handler(req, res);

  expect(res.json).toHaveBeenCalledWith(
    expect.objectContaining({ data: expect.any(Array) }),
  );
});
```

## Next Steps

- [ ] Add database integration (Prisma, Drizzle)
- [ ] Add authentication middleware
- [ ] Add request logging/monitoring
- [ ] Add CORS handling
- [ ] Add rate limiting
- [ ] Add validation library integration

---

See `/src/api/` for the complete implementation.
