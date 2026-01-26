---
sidebar_position: 11
---

# Middleware

Build Express-style middleware to handle cross-cutting concerns.

## Middleware Overview

Middleware functions process requests and responses. They can:

- Validate requests
- Log activity
- Handle authentication
- Set response headers
- Transform data

## Creating Middleware

Create middleware files in `src/middleware/`:

```typescript
// src/middleware/logging.ts

import type { Middleware } from '@src/middleware/types';

export const loggingMiddleware: Middleware = (req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
};
```

## Middleware Types

```typescript
// src/middleware/types.ts

import type { IncomingMessage, ServerResponse } from 'node:http';

type Next = () => void;

export type Middleware = (
  req: IncomingMessage,
  res: ServerResponse,
  next: Next
) => void | Promise<void>;
```

## Middleware Chain

Middleware runs in order before your route handler:

```
Request → Middleware 1 → Middleware 2 → Middleware 3 → Route → Response
```

Register middleware in `jen.config.ts`:

```typescript
import { loggingMiddleware } from '@src/middleware/logging';
import { authMiddleware } from '@src/middleware/auth';

const config: FrameworkConfig = {
  middleware: [
    loggingMiddleware,
    authMiddleware
  ]
};

export default config;
```

## Common Middleware Patterns

### Logging

```typescript
// src/middleware/logging.ts

export const loggingMiddleware: Middleware = (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log(`${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
  });
  
  next();
};
```

### Authentication

```typescript
// src/middleware/auth.ts

import { verifyToken } from '@src/auth/jwt';

export const authMiddleware: Middleware = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (authHeader) {
    try {
      const token = authHeader.replace('Bearer ', '');
      const payload = verifyToken(token);
      
      // Attach user to request
      (req as any).user = payload;
    } catch (error) {
      console.error('Invalid token:', error);
    }
  }
  
  next();
};
```

### CORS

```typescript
// src/middleware/cors.ts

export const corsMiddleware: Middleware = (req, res, next) => {
  res.setHeader('access-control-allow-origin', '*');
  res.setHeader('access-control-allow-methods', 'GET, POST, PUT, DELETE');
  res.setHeader('access-control-allow-headers', 'content-type, authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  next();
};
```

### Security Headers

```typescript
// src/middleware/security.ts

export const securityMiddleware: Middleware = (req, res, next) => {
  res.setHeader('x-content-type-options', 'nosniff');
  res.setHeader('x-frame-options', 'DENY');
  res.setHeader('x-xss-protection', '1; mode=block');
  res.setHeader('strict-transport-security', 'max-age=31536000');
  
  next();
};
```

### Request Validation

```typescript
// src/middleware/validation.ts

export const validationMiddleware: Middleware = async (req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    const contentType = req.headers['content-type'];
    
    if (!contentType?.includes('application/json')) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'Content-Type must be application/json' }));
      return;
    }
  }
  
  next();
};
```

### Rate Limiting

```typescript
// src/middleware/rateLimit.ts

const requestCounts = new Map<string, { count: number; resetTime: number }>();

export const rateLimitMiddleware: Middleware = (req, res, next) => {
  const ip = req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  
  let record = requestCounts.get(ip);
  
  if (!record || now > record.resetTime) {
    record = { count: 1, resetTime: now + 60000 };  // 1 minute window
  } else {
    record.count++;
  }
  
  requestCounts.set(ip, record);
  
  if (record.count > 100) {  // 100 requests per minute
    res.writeHead(429);
    res.end('Too many requests');
    return;
  }
  
  next();
};
```

### Compression

```typescript
// src/middleware/compression.ts

import { createGzip } from 'node:zlib';

export const compressionMiddleware: Middleware = (req, res, next) => {
  const acceptEncoding = req.headers['accept-encoding'] || '';
  
  if (acceptEncoding.includes('gzip')) {
    res.setHeader('content-encoding', 'gzip');
    
    const originalEnd = res.end.bind(res);
    const gzip = createGzip();
    
    gzip.pipe(res);
    
    (res as any).end = function(data: any, encoding: any, cb: any) {
      if (data) {
        gzip.write(data, encoding);
      }
      gzip.end(cb);
    };
  }
  
  next();
};
```

## Modifying Requests

Middleware can read and modify request data:

```typescript
// src/middleware/parseBody.ts

export const parseBodyMiddleware: Middleware = async (req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    const body = await readBody(req);
    
    try {
      (req as any).body = JSON.parse(body);
    } catch (error) {
      (req as any).body = {};
    }
  }
  
  next();
};

async function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => (data += chunk));
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}
```

Access in routes:

```typescript
// site/api/(users).ts

export async function handle(req: IncomingMessage, res: ServerResponse) {
  if (req.method === 'POST') {
    const { email, name } = (req as any).body;
    
    // Create user...
  }
}
```

## Modifying Responses

Middleware can set headers and modify responses:

```typescript
// src/middleware/cache.ts

export const cacheMiddleware: Middleware = (req, res, next) => {
  if (req.method === 'GET') {
    res.setHeader('cache-control', 'public, max-age=3600');
  }
  
  next();
};
```

## Conditional Middleware

Run middleware only on certain routes:

```typescript
// src/middleware/admin.ts

export const adminMiddleware: Middleware = (req, res, next) => {
  if (req.url?.startsWith('/api/admin')) {
    // Only run on /api/admin routes
    const user = (req as any).user;
    
    if (!user || user.role !== 'admin') {
      res.writeHead(403);
      res.end('Admin access required');
      return;
    }
  }
  
  next();
};
```

## Error Handling Middleware

```typescript
// src/middleware/errorHandler.ts

export const errorHandlerMiddleware: Middleware = (req, res, next) => {
  const originalEnd = res.end.bind(res);
  
  try {
    next();
  } catch (error) {
    console.error('Error:', error);
    
    res.writeHead(500, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ 
      error: 'Internal server error' 
    }));
  }
};
```

## Middleware Ordering

Order matters! Middleware runs in registration order:

```typescript
const config: FrameworkConfig = {
  middleware: [
    corsMiddleware,              // 1. Handle CORS first
    securityMiddleware,          // 2. Set security headers
    parseBodyMiddleware,         // 3. Parse request body
    loggingMiddleware,           // 4. Log requests
    authMiddleware,              // 5. Check auth
    rateLimitMiddleware,         // 6. Rate limit
    errorHandlerMiddleware       // 7. Handle errors last
  ]
};
```

## Best Practices

1. **Keep middleware focused** - Do one thing well
2. **Don't block without reason** - Call `next()` to continue
3. **Handle errors gracefully** - Prevent crashes
4. **Log important events** - Track middleware activity
5. **Make async middleware** - For I/O operations
6. **Use type safety** - TypeScript for middleware
7. **Test in isolation** - Unit test middleware
8. **Document clearly** - Explain what each middleware does

## Complex Example

Full-featured middleware for API protection:

```typescript
// src/middleware/apiProtection.ts

import { verifyToken } from '@src/auth/jwt';
import { DB } from '@src/db';

export const apiProtectionMiddleware: Middleware = async (req, res, next) => {
  // Skip non-API routes
  if (!req.url?.startsWith('/api')) {
    next();
    return;
  }
  
  // Skip public routes
  if (req.url.startsWith('/api/public')) {
    next();
    return;
  }
  
  // Require authentication
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    res.writeHead(401, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: 'Unauthorized' }));
    return;
  }
  
  try {
    const token = authHeader.replace('Bearer ', '');
    const payload = verifyToken(token);
    
    // Check user exists
    const db = new DB();
    await db.connect();
    const user = await db.query('users', { where: { id: payload.userId } });
    await db.disconnect();
    
    if (!user) {
      res.writeHead(401);
      res.end(JSON.stringify({ error: 'User not found' }));
      return;
    }
    
    // Attach user to request
    (req as any).user = user;
    
    next();
  } catch (error) {
    res.writeHead(403, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: 'Invalid token' }));
  }
};
```

## Next Steps

- [Authentication](./auth) - Protect your API
- [API Routes](./api) - Build endpoints
- [Database](./database) - Query data in middleware
