# Middleware

Middleware allows you to process requests/responses globally or per-route. Express-style middleware system.

## Basic Middleware

Create middleware in `src/middleware/`:

```typescript
// src/middleware/logging.ts
import type { IncomingMessage, ServerResponse } from 'node:http';

export function loggingMiddleware(
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void
) {
  const start = Date.now();
  const originalEnd = res.end;
  
  res.end = function(...args) {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} - ${duration}ms`);
    return originalEnd.apply(res, args);
  };
  
  next();
}
```

## Global Middleware

Register in `jen.config.ts`:

```typescript
import { loggingMiddleware } from '@src/middleware/logging';
import { corsMiddleware } from '@src/middleware/cors';

const config: FrameworkConfig = {
  middleware: [
    loggingMiddleware,
    corsMiddleware
  ]
};
```

## CORS Middleware

```typescript
// src/middleware/cors.ts
export function corsMiddleware(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  next();
}
```

## Authentication Middleware

```typescript
// src/middleware/auth.ts
import { verifyToken } from '@src/auth/jwt';

export function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    res.writeHead(401);
    res.end('Unauthorized');
    return;
  }
  
  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (err) {
    res.writeHead(401);
    res.end('Invalid token');
  }
}
```

## Compression Middleware

```typescript
// src/middleware/compression.ts
import { createGzip } from 'node:zlib';

export function compressionMiddleware(req, res, next) {
  const acceptEncoding = req.headers['accept-encoding'] || '';
  
  if (/gzip/.test(acceptEncoding)) {
    res.setHeader('Content-Encoding', 'gzip');
    const gzip = createGzip();
    gzip.pipe(res);
    res.write = (chunk) => gzip.write(chunk);
    res.end = (chunk) => gzip.end(chunk);
  }
  
  next();
}
```

## Route-Specific Middleware

Apply middleware to specific routes:

```typescript
// site/api/(users).ts
import { authMiddleware } from '@src/middleware/auth';

export const middleware = [authMiddleware];

export async function handle(req, res) {
  // Only authenticated requests reach here
  res.writeHead(200);
  res.end(JSON.stringify({ user: req.user }));
}
```

## Request Body Parsing

```typescript
// src/middleware/bodyParser.ts
export async function bodyParserMiddleware(req, res, next) {
  let body = '';
  
  req.on('data', chunk => {
    body += chunk.toString();
  });
  
  req.on('end', () => {
    try {
      req.body = JSON.parse(body);
    } catch {
      req.body = {};
    }
    next();
  });
}
```

Use in routes:

```typescript
export async function handle(req, res) {
  const { name, email } = req.body;
  // Process...
}
```

## Rate Limiting

```typescript
// src/middleware/rateLimit.ts
const requests = new Map();

export function rateLimitMiddleware(req, res, next) {
  const ip = req.headers['x-forwarded-for'] || 'unknown';
  const now = Date.now();
  
  if (!requests.has(ip)) {
    requests.set(ip, []);
  }
  
  const userRequests = requests.get(ip).filter(t => now - t < 60000);
  userRequests.push(now);
  requests.set(ip, userRequests);
  
  if (userRequests.length > 100) {  // 100 requests per minute
    res.writeHead(429);
    res.end('Too many requests');
    return;
  }
  
  next();
}
```

## Error Handling Middleware

```typescript
// src/middleware/errorHandler.ts
export function errorHandlerMiddleware(req, res, next) {
  const originalEnd = res.end;
  
  res.end = function(...args) {
    if (res.statusCode >= 400) {
      console.error(`Error: ${res.statusCode} - ${req.url}`);
    }
    return originalEnd.apply(res, args);
  };
  
  next();
}
```

## Custom Middleware Pattern

```typescript
export function myMiddleware(options = {}) {
  return (req, res, next) => {
    // Modify request/response
    req.custom = options;
    
    // Call next middleware
    next();
  };
}

// Use:
const config = {
  middleware: [
    myMiddleware({ key: 'value' })
  ]
};
```

## Middleware Ordering

Order matters — middleware runs in order specified:

```typescript
const config = {
  middleware: [
    compressionMiddleware,    // 1. Compress response
    corsMiddleware,           // 2. Add CORS headers
    bodyParserMiddleware,     // 3. Parse body
    authMiddleware,           // 4. Verify auth
    loggingMiddleware         // 5. Log request
  ]
};
```

## Async Middleware

Middleware can be async:

```typescript
export async function asyncMiddleware(req, res, next) {
  const isAllowed = await checkPermissions(req);
  
  if (!isAllowed) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  
  next();
}
```

## Best Practices

1. Keep middleware focused and single-purpose
2. Use proper error handling
3. Order middleware carefully
4. Don't block request processing
5. Use async/await for I/O operations
6. Document middleware behavior
7. Test middleware independently
