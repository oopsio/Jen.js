---
sidebar_position: 8
---

# API Routes

Build REST APIs with Jen.js API routes.

## Creating API Routes

API routes are `.ts` files that export an async `handle` function:

```
site/api/
├── (users).ts       → /api/users
├── (posts).ts       → /api/posts
└── auth/
    ├── (login).ts   → /api/auth/login
    └── (logout).ts  → /api/auth/logout
```

## Basic API Route

Create `site/api/(users).ts`:

```typescript
import type { IncomingMessage, ServerResponse } from 'node:http';

export async function handle(req: IncomingMessage, res: ServerResponse) {
  if (req.method === 'GET') {
    const users = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' }
    ];
    
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify(users));
  }
}
```

Visit `GET /api/users` to get the list.

## HTTP Methods

Handle different HTTP methods:

```typescript
// site/api/(posts).ts

export async function handle(req: IncomingMessage, res: ServerResponse) {
  if (req.method === 'GET') {
    // Get posts
    return handleGet(req, res);
  } else if (req.method === 'POST') {
    // Create post
    return handlePost(req, res);
  } else if (req.method === 'PUT') {
    // Update post
    return handlePut(req, res);
  } else if (req.method === 'DELETE') {
    // Delete post
    return handleDelete(req, res);
  } else {
    res.writeHead(405);
    res.end('Method not allowed');
  }
}

async function handleGet(req: IncomingMessage, res: ServerResponse) {
  res.writeHead(200, { 'content-type': 'application/json' });
  res.end(JSON.stringify({ posts: [] }));
}

async function handlePost(req: IncomingMessage, res: ServerResponse) {
  res.writeHead(201, { 'content-type': 'application/json' });
  res.end(JSON.stringify({ id: 1, title: 'New post' }));
}

async function handlePut(req: IncomingMessage, res: ServerResponse) {
  res.writeHead(200, { 'content-type': 'application/json' });
  res.end(JSON.stringify({ id: 1, title: 'Updated' }));
}

async function handleDelete(req: IncomingMessage, res: ServerResponse) {
  res.writeHead(204);
  res.end();
}
```

## Query Parameters

Access URL query strings:

```typescript
// site/api/(search).ts

export async function handle(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  const query = url.searchParams.get('q');
  const limit = url.searchParams.get('limit') || '10';
  
  const results = await searchDatabase(query, parseInt(limit));
  
  res.writeHead(200, { 'content-type': 'application/json' });
  res.end(JSON.stringify(results));
}
```

Visit `GET /api/search?q=typescript&limit=20`.

## Route Parameters

Dynamic route parameters:

```typescript
// site/api/users/($id).ts

export async function handle(req: IncomingMessage, res: ServerResponse) {
  const { id } = req.params as { id: string };
  
  const user = await db.query('users', { id: parseInt(id) });
  
  if (!user) {
    res.writeHead(404, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: 'User not found' }));
    return;
  }
  
  res.writeHead(200, { 'content-type': 'application/json' });
  res.end(JSON.stringify(user));
}
```

Visit `GET /api/users/123`.

## Request Body

Read JSON request body:

```typescript
// site/api/(users).ts

export async function handle(req: IncomingMessage, res: ServerResponse) {
  if (req.method === 'POST') {
    const body = await readBody(req);
    const data = JSON.parse(body);
    
    const user = await db.create('users', data);
    
    res.writeHead(201, { 'content-type': 'application/json' });
    res.end(JSON.stringify(user));
  }
}

async function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => (data += chunk));
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}
```

## Response Status Codes

```typescript
// Success
res.writeHead(200);  // OK
res.writeHead(201);  // Created
res.writeHead(204);  // No Content

// Errors
res.writeHead(400);  // Bad Request
res.writeHead(401);  // Unauthorized
res.writeHead(403);  // Forbidden
res.writeHead(404);  // Not Found
res.writeHead(500);  // Server Error
```

## JSON Responses

```typescript
export async function handle(req: IncomingMessage, res: ServerResponse) {
  const data = {
    success: true,
    message: 'Data retrieved',
    data: { id: 1, name: 'John' }
  };
  
  res.writeHead(200, {
    'content-type': 'application/json',
    'content-length': JSON.stringify(data).length
  });
  res.end(JSON.stringify(data));
}
```

## CORS

Enable CORS for cross-origin requests:

```typescript
export async function handle(req: IncomingMessage, res: ServerResponse) {
  // Add CORS headers
  res.setHeader('access-control-allow-origin', '*');
  res.setHeader('access-control-allow-methods', 'GET, POST, PUT, DELETE');
  res.setHeader('access-control-allow-headers', 'content-type');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Handle request
  if (req.method === 'GET') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ data: [] }));
  }
}
```

## Authentication

Check authorization headers:

```typescript
import { verifyToken } from '@src/auth/jwt';

export async function handle(req: IncomingMessage, res: ServerResponse) {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    res.writeHead(401, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: 'Unauthorized' }));
    return;
  }
  
  try {
    const token = authHeader.replace('Bearer ', '');
    const payload = verifyToken(token);
    
    // User is authenticated
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ user: payload }));
  } catch (error) {
    res.writeHead(403, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: 'Invalid token' }));
  }
}
```

## Error Handling

Handle errors gracefully:

```typescript
export async function handle(req: IncomingMessage, res: ServerResponse) {
  try {
    if (req.method === 'GET') {
      const data = await fetchData();
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify(data));
    }
  } catch (error) {
    console.error('API error:', error);
    res.writeHead(500, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ 
      error: 'Internal server error' 
    }));
  }
}
```

## Validation

Validate request data:

```typescript
export async function handle(req: IncomingMessage, res: ServerResponse) {
  if (req.method === 'POST') {
    const body = await readBody(req);
    const data = JSON.parse(body);
    
    // Validate input
    if (!data.name || typeof data.name !== 'string') {
      res.writeHead(400, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid name' }));
      return;
    }
    
    if (!data.email || !isValidEmail(data.email)) {
      res.writeHead(400, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid email' }));
      return;
    }
    
    // Proceed
    const user = await db.create('users', data);
    res.writeHead(201, { 'content-type': 'application/json' });
    res.end(JSON.stringify(user));
  }
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

## Common Patterns

### List with Pagination

```typescript
// site/api/(posts).ts

export async function handle(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '10');
  
  const offset = (page - 1) * limit;
  
  const [posts, total] = await Promise.all([
    db.query('posts', { offset, limit }),
    db.query('posts', { count: true })
  ]);
  
  res.writeHead(200, { 'content-type': 'application/json' });
  res.end(JSON.stringify({
    posts,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  }));
}
```

### REST CRUD

```typescript
// site/api/posts/($id).ts

export async function handle(req: IncomingMessage, res: ServerResponse) {
  const { id } = req.params as { id: string };
  
  try {
    if (req.method === 'GET') {
      const post = await db.query('posts', { id: parseInt(id) });
      
      if (!post) {
        res.writeHead(404);
        res.end();
        return;
      }
      
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify(post));
      
    } else if (req.method === 'PUT') {
      const body = await readBody(req);
      const data = JSON.parse(body);
      
      const updated = await db.update('posts', { id: parseInt(id) }, data);
      
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify(updated));
      
    } else if (req.method === 'DELETE') {
      await db.delete('posts', { id: parseInt(id) });
      
      res.writeHead(204);
      res.end();
    } else {
      res.writeHead(405);
      res.end();
    }
  } catch (error) {
    res.writeHead(500, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: 'Server error' }));
  }
}
```

## Best Practices

1. **Use proper HTTP methods** - GET, POST, PUT, DELETE
2. **Validate all inputs** - Check types and format
3. **Return proper status codes** - 200, 201, 400, 401, 404, 500
4. **Use consistent response format** - Wrap data and errors
5. **Log errors** - Track failed requests
6. **Implement rate limiting** - Prevent abuse
7. **Use authentication** - Protect sensitive endpoints
8. **Document endpoints** - Include examples

## Next Steps

- [Database](./database) - Query and store data
- [Authentication](./auth) - Secure your API
- [Middleware](./middleware) - Add cross-cutting concerns
