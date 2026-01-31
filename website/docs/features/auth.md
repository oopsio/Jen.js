# Authentication

Jen.js includes built-in JWT authentication utilities for securing your application.

## JWT Authentication

### Basic Setup

```typescript
import { signToken, verifyToken } from '@src/auth/jwt';

// Create a token
const token = signToken({ userId: '123' }, '7d');

// Verify a token
const payload = verifyToken(token);
```

## Creating Tokens

Sign a token with user data:

```typescript
const token = signToken(
  { 
    userId: user.id,
    email: user.email,
    role: user.role
  },
  '7d'  // Expires in 7 days
);
```

## Verifying Tokens

Verify and decode tokens:

```typescript
try {
  const payload = verifyToken(token);
  console.log(payload.userId);  // Access claims
} catch (err) {
  console.error('Invalid token');
}
```

## Login Route

Create an API route for login:

```typescript
// site/api/(login).ts
import { signToken } from '@src/auth/jwt';

export async function handle(req, res) {
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const { email, password } = JSON.parse(body);
      
      // Verify credentials (check database)
      const user = await verifyCredentials(email, password);
      
      if (user) {
        const token = signToken({ userId: user.id }, '7d');
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ token }));
      } else {
        res.writeHead(401);
        res.end('Invalid credentials');
      }
    });
  }
}
```

## Middleware for Protected Routes

Create auth middleware:

```typescript
// src/middleware/auth.ts
import { verifyToken } from '@src/auth/jwt';

export async function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    res.writeHead(401);
    res.end('No token provided');
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

## Protected Pages

```typescript
// site/dashboard/($userId).tsx
import { verifyToken } from '@src/auth/jwt';

export async function loader(ctx) {
  const token = ctx.request.headers.authorization?.split(' ')[1];
  
  try {
    const payload = verifyToken(token);
    // Token is valid, load user data
    return { user: payload };
  } catch (err) {
    // Redirect to login
    ctx.response.writeHead(302, { location: '/login' });
    ctx.response.end();
    return {};
  }
}

export default function Dashboard({ data }) {
  return <h1>Welcome, {data.user.userId}</h1>;
}
```

## Configuration

In `jen.config.ts`:

```typescript
const config: FrameworkConfig = {
  auth: {
    secret: process.env.JWT_SECRET,
    algorithm: 'HS256',
    issuer: 'your-app'
  }
};
```

## Best Practices

1. **Use environment variables** for secrets
2. **Set appropriate expiration** (shorter = more secure)
3. **Validate tokens** on protected routes
4. **Use HTTPS** in production
5. **Store tokens securely** on client (httpOnly cookies)
6. **Implement refresh tokens** for long sessions
7. **Hash passwords** before storing
