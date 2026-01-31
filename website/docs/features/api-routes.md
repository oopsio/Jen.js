# API Routes

Build REST APIs with file-based routing. Create `.ts` files in `site/api/` to define API endpoints.

## Basic API Route

Create `site/api/(users).ts`:

```typescript
import type { IncomingMessage, ServerResponse } from 'node:http';

export async function handle(req: IncomingMessage, res: ServerResponse) {
  if (req.method === 'GET') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ users: [] }));
  } else {
    res.writeHead(405);
    res.end('Method Not Allowed');
  }
}
```

Access at `GET /api/users`

## Request Handling

```typescript
export async function handle(req, res) {
  console.log(req.method);           // GET, POST, etc.
  console.log(req.url);              // /api/users?page=1
  console.log(req.headers);          // Headers object
  
  // Route methods
  if (req.method === 'GET') {
    // Handle GET
  } else if (req.method === 'POST') {
    // Handle POST
  } else if (req.method === 'PUT') {
    // Handle PUT
  } else if (req.method === 'DELETE') {
    // Handle DELETE
  }
}
```

## Reading Request Body

```typescript
export async function handle(req, res) {
  let body = '';
  
  req.on('data', chunk => {
    body += chunk.toString();
  });
  
  req.on('end', () => {
    try {
      const data = JSON.parse(body);
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, data }));
    } catch (err) {
      res.writeHead(400);
      res.end('Invalid JSON');
    }
  });
}
```

## Query Parameters

```typescript
export async function handle(req, res) {
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  const page = url.searchParams.get('page') || '1';
  const limit = url.searchParams.get('limit') || '10';
  
  const users = await getUsers(parseInt(page), parseInt(limit));
  
  res.writeHead(200, { 'content-type': 'application/json' });
  res.end(JSON.stringify(users));
}
```

## Response Headers

```typescript
export async function handle(req, res) {
  res.writeHead(200, {
    'content-type': 'application/json',
    'cache-control': 'public, max-age=3600',
    'x-custom-header': 'value'
  });
  
  res.end(JSON.stringify({ data: [] }));
}
```

## Status Codes

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
function sendJSON(res, data, status = 200) {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(data));
}

export async function handle(req, res) {
  if (req.method === 'GET') {
    sendJSON(res, { users: [] });
  } else {
    sendJSON(res, { error: 'Method not allowed' }, 405);
  }
}
```

## Dynamic Routes

Create nested API routes with dynamic parameters:

```typescript
// site/api/users/($id).ts
export async function handle(req, res) {
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  const userId = url.pathname.split('/')[3];  // Extract from path
  
  if (req.method === 'GET') {
    const user = await getUser(userId);
    if (user) {
      sendJSON(res, user);
    } else {
      sendJSON(res, { error: 'Not found' }, 404);
    }
  }
}
```

Access at `GET /api/users/123`

## Error Handling

```typescript
export async function handle(req, res) {
  try {
    const data = await fetchData();
    sendJSON(res, data);
  } catch (err) {
    console.error(err);
    sendJSON(res, { error: 'Server error' }, 500);
  }
}
```

## CORS

Handle cross-origin requests:

```typescript
function setCORSHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export async function handle(req, res) {
  setCORSHeaders(res);
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Handle request
}
```

## Authentication

```typescript
import { verifyToken } from '@src/auth/jwt';

export async function handle(req, res) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    sendJSON(res, { error: 'Unauthorized' }, 401);
    return;
  }
  
  try {
    const payload = verifyToken(token);
    // Use payload.userId, etc.
  } catch (err) {
    sendJSON(res, { error: 'Invalid token' }, 401);
  }
}
```

## Validation

```typescript
function validateInput(data) {
  if (!data.email || !data.name) {
    return { valid: false, error: 'Missing fields' };
  }
  
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return { valid: false, error: 'Invalid email' };
  }
  
  return { valid: true };
}

export async function handle(req, res) {
  let body = '';
  
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    const data = JSON.parse(body);
    const validation = validateInput(data);
    
    if (!validation.valid) {
      sendJSON(res, { error: validation.error }, 400);
      return;
    }
    
    // Process valid data
  });
}
```

## File Uploads

```typescript
export async function handle(req, res) {
  if (req.method === 'POST') {
    let body = '';
    
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      // Parse multipart/form-data or base64
      const file = parseUpload(body);
      
      // Save file
      await saveFile(file);
      
      sendJSON(res, { success: true });
    });
  }
}
```

## Streaming Response

```typescript
export async function handle(req, res) {
  res.writeHead(200, { 'content-type': 'application/json' });
  
  res.write('{"items":[');
  
  for (let i = 0; i < 1000; i++) {
    res.write(JSON.stringify({ id: i }));
    if (i < 999) res.write(',');
  }
  
  res.write(']}');
  res.end();
}
```

## Best Practices

1. Validate all inputs
2. Use appropriate HTTP methods
3. Return meaningful status codes
4. Implement authentication
5. Handle errors gracefully
6. Use proper error responses
7. Document your API
8. Version your API endpoints
