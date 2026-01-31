# Authentication API

JWT authentication utilities in Jen.js.

## signToken()

Create a JWT token:

```typescript
import { signToken } from '@src/auth/jwt';

const token = signToken(payload, expiresIn, options);
```

### Parameters

```typescript
interface TokenPayload {
  [key: string]: any;
}

// Payload - data to encode
const payload = {
  userId: '123',
  email: 'user@example.com',
  role: 'admin'
};

// Expiration time
const expiresIn = '7d';  // 7 days
// or '24h', '3600s', or number (seconds)

// Optional options
const options = {
  issuer: 'your-app',
  audience: 'your-app',
  algorithm: 'HS256'
};

const token = signToken(payload, expiresIn, options);
```

### Examples

```typescript
// Simple token
const token = signToken({ userId: '1' }, '7d');

// Complex payload
const token = signToken({
  userId: '123',
  email: 'alice@example.com',
  role: 'admin',
  permissions: ['read', 'write']
}, '24h');

// Custom options
const token = signToken(
  { userId: '1' },
  '30d',
  {
    issuer: 'my-app',
    audience: 'web-client'
  }
);
```

## verifyToken()

Verify and decode a JWT:

```typescript
import { verifyToken } from '@src/auth/jwt';

try {
  const payload = verifyToken(token);
  console.log(payload.userId);
} catch (err) {
  console.error('Invalid token');
}
```

### Returns

```typescript
interface Payload {
  [key: string]: any;
  iat?: number;     // Issued at
  exp?: number;     // Expiration time
  iss?: string;     // Issuer
  aud?: string;     // Audience
}

const payload = verifyToken(token);
// { userId: '123', email: '...', iat: 1234567890, exp: ... }
```

### Error Handling

```typescript
try {
  const payload = verifyToken(token);
} catch (err) {
  if (err.name === 'TokenExpiredError') {
    console.error('Token expired');
  } else if (err.name === 'JsonWebTokenError') {
    console.error('Invalid token');
  } else {
    console.error('Unknown error:', err);
  }
}
```

## Usage Examples

### Login Route

```typescript
// site/api/(login).ts
import { signToken } from '@src/auth/jwt';

export async function handle(req, res) {
  if (req.method === 'POST') {
    let body = '';
    
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const { email, password } = JSON.parse(body);
      
      // Verify credentials
      const user = await verifyCredentials(email, password);
      
      if (user) {
        const token = signToken(
          { userId: user.id, email: user.email, role: user.role },
          '7d'
        );
        
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ token, user }));
      } else {
        res.writeHead(401);
        res.end(JSON.stringify({ error: 'Invalid credentials' }));
      }
    });
  }
}
```

### Protected Route

```typescript
// site/dashboard/($userId).tsx
import { verifyToken } from '@src/auth/jwt';

export async function loader(ctx) {
  const token = ctx.request.headers.authorization?.split(' ')[1];
  
  if (!token) {
    ctx.response.writeHead(302, { location: '/login' });
    ctx.response.end();
    return {};
  }
  
  try {
    const payload = verifyToken(token);
    const user = await getUser(payload.userId);
    return { user };
  } catch (err) {
    ctx.response.writeHead(302, { location: '/login' });
    ctx.response.end();
    return {};
  }
}

export default function Dashboard({ user }: any) {
  return <h1>Welcome, {user.email}</h1>;
}
```

### Protected API

```typescript
// site/api/(profile).ts
import { verifyToken } from '@src/auth/jwt';

export async function handle(req, res) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    res.writeHead(401);
    res.end(JSON.stringify({ error: 'No token' }));
    return;
  }
  
  try {
    const payload = verifyToken(token);
    const user = await getUser(payload.userId);
    
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify(user));
  } catch (err) {
    res.writeHead(401);
    res.end(JSON.stringify({ error: 'Invalid token' }));
  }
}
```

### Refresh Tokens

```typescript
// site/api/(refresh).ts
import { signToken, verifyToken } from '@src/auth/jwt';

export async function handle(req, res) {
  if (req.method === 'POST') {
    let body = '';
    
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const { refreshToken } = JSON.parse(body);
      
      try {
        const payload = verifyToken(refreshToken);
        
        // Issue new token
        const newToken = signToken(
          { userId: payload.userId },
          '7d'
        );
        
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ token: newToken }));
      } catch (err) {
        res.writeHead(401);
        res.end(JSON.stringify({ error: 'Invalid refresh token' }));
      }
    });
  }
}
```

## Configuration

In `jen.config.ts`:

```typescript
const config: FrameworkConfig = {
  auth: {
    secret: process.env.JWT_SECRET || 'dev-secret',
    algorithm: 'HS256',
    issuer: 'your-app',
    audience: 'your-app'
  }
};
```

## Token Expiration

Recommended TTLs:

- Access token: 15 minutes to 1 hour
- Refresh token: 7-30 days
- Long-lived: 90+ days

```typescript
// Short-lived access token
const accessToken = signToken(payload, '15m');

// Long-lived refresh token
const refreshToken = signToken(payload, '30d');
```

## Security Best Practices

1. **Use environment variables** for secrets:
   ```
   JWT_SECRET=your-secret-key
   ```

2. **Use HTTPS** in production to prevent token interception

3. **Store tokens securely** on client:
   ```typescript
   // Good: httpOnly cookie (can't access via JS)
   // Bad: localStorage (vulnerable to XSS)
   ```

4. **Short expiration** for access tokens

5. **Validate token signature** on every request

6. **Implement logout** by invalidating tokens

7. **Use refresh tokens** for long sessions

8. **Rotate secrets** periodically

9. **Rate limit** login attempts

10. **Log auth events** for security audit

## Token Structure

JWT consists of 3 parts (header.payload.signature):

```typescript
// Header
{ "alg": "HS256", "typ": "JWT" }

// Payload (your data)
{ "userId": "123", "iat": 1234567890, "exp": 1234571490 }

// Signature (verification)
base64(HMAC-SHA256(header.payload, secret))
```

The full token:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJ1c2VySWQiOiIxMjMifQ.
SIGNATURE
```

## Algorithms

Supported algorithms:

- HS256 (HMAC) — Symmetric, uses shared secret
- RS256 (RSA) — Asymmetric, uses public/private keys

```typescript
// Symmetric (default)
const token = signToken(payload, '7d');  // Uses secret

// Asymmetric (if configured)
const token = signToken(payload, '7d', {
  algorithm: 'RS256',
  privateKey: process.env.PRIVATE_KEY
});
```

## Debugging

```typescript
import { verifyToken } from '@src/auth/jwt';
import jwt from 'jsonwebtoken';

const token = 'your-token...';

// Decode without verification
const decoded = jwt.decode(token);
console.log('Decoded:', decoded);

// Verify with detailed error
try {
  const payload = verifyToken(token);
} catch (err) {
  console.error('Error:', err.message);
  console.error('Name:', err.name);
}
```
