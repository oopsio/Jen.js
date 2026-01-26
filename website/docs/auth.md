---
sidebar_position: 10
---

# Authentication

Implement user authentication with JWT tokens in Jen.js.

## JWT Overview

JWT (JSON Web Tokens) provide stateless authentication. Tokens contain encoded user data and are signed for security.

### Token Structure

```
header.payload.signature

{
  "alg": "HS256",
  "typ": "JWT"
}.{
  "userId": 123,
  "email": "user@example.com",
  "iat": 1516239022,
  "exp": 1516325422
}.SIGNATURE
```

## Signing Tokens

Create and sign JWT tokens:

```typescript
import { signToken } from '@src/auth/jwt';

const token = signToken(
  { userId: 123, email: 'user@example.com' },
  '7d'  // Expires in 7 days
);

console.log(token);
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Verifying Tokens

Verify and decode tokens:

```typescript
import { verifyToken } from '@src/auth/jwt';

try {
  const payload = verifyToken(token);
  console.log(payload);  // { userId: 123, email: 'user@example.com' }
} catch (error) {
  console.error('Invalid token');
}
```

## Login Endpoint

Create a login API route:

```typescript
// site/api/auth/(login).ts

import { signToken } from '@src/auth/jwt';
import { DB } from '@src/db';

export async function handle(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') {
    res.writeHead(405);
    res.end();
    return;
  }
  
  const body = await readBody(req);
  const { email, password } = JSON.parse(body);
  
  // Validate input
  if (!email || !password) {
    res.writeHead(400);
    res.end(JSON.stringify({ error: 'Email and password required' }));
    return;
  }
  
  const db = new DB();
  await db.connect();
  
  try {
    // Find user
    const user = await db.query('users', { where: { email } });
    
    if (!user || !verifyPassword(password, user.password)) {
      res.writeHead(401);
      res.end(JSON.stringify({ error: 'Invalid credentials' }));
      return;
    }
    
    // Sign token
    const token = signToken(
      { userId: user.id, email: user.email },
      '7d'
    );
    
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ token, user: { id: user.id, email: user.email } }));
  } finally {
    await db.disconnect();
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

function verifyPassword(plain: string, hashed: string): boolean {
  // Use bcrypt or similar in production
  return plain === hashed;  // Placeholder
}
```

## Protected Routes

Check authorization in routes:

```typescript
// site/api/(profile).ts

import { verifyToken } from '@src/auth/jwt';

export async function handle(req: IncomingMessage, res: ServerResponse) {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    res.writeHead(401);
    res.end(JSON.stringify({ error: 'Missing authorization header' }));
    return;
  }
  
  try {
    const token = authHeader.replace('Bearer ', '');
    const { userId } = verifyToken(token);
    
    // User is authenticated
    const user = await getUser(userId);
    
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify(user));
  } catch (error) {
    res.writeHead(403);
    res.end(JSON.stringify({ error: 'Invalid token' }));
  }
}
```

## Register Endpoint

Create a registration API route:

```typescript
// site/api/auth/(register).ts

import { signToken } from '@src/auth/jwt';
import { DB } from '@src/db';
import { hashPassword } from '@src/shared/crypto';

export async function handle(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') {
    res.writeHead(405);
    res.end();
    return;
  }
  
  const body = await readBody(req);
  const { email, password, name } = JSON.parse(body);
  
  // Validate input
  if (!email || !password || !name) {
    res.writeHead(400);
    res.end(JSON.stringify({ error: 'All fields required' }));
    return;
  }
  
  if (password.length < 8) {
    res.writeHead(400);
    res.end(JSON.stringify({ error: 'Password must be 8+ characters' }));
    return;
  }
  
  const db = new DB();
  await db.connect();
  
  try {
    // Check if email exists
    const existing = await db.query('users', { where: { email } });
    if (existing) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'Email already registered' }));
      return;
    }
    
    // Create user
    const user = await db.create('users', {
      email,
      password: await hashPassword(password),
      name
    });
    
    // Sign token
    const token = signToken({ userId: user.id, email: user.email }, '7d');
    
    res.writeHead(201, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ 
      token, 
      user: { id: user.id, email: user.email, name: user.name } 
    }));
  } finally {
    await db.disconnect();
  }
}
```

## Protected Pages

Load user data in page loaders:

```typescript
// site/(dashboard).tsx

import { verifyToken } from '@src/auth/jwt';
import type { LoaderContext } from '@src/core/types';

export async function loader(ctx: LoaderContext) {
  const token = extractToken(ctx.req);
  
  if (!token) {
    return { notFound: true };  // Redirect to login
  }
  
  try {
    const { userId } = verifyToken(token);
    const user = await getUser(userId);
    
    return { user };
  } catch (error) {
    return { notFound: true };
  }
}

export default function Dashboard({ data }: any) {
  if (!data.user) {
    return <p>Please login first</p>;
  }
  
  return (
    <div>
      <h1>Welcome, {data.user.name}</h1>
      <p>Email: {data.user.email}</p>
    </div>
  );
}

function extractToken(req: any): string | null {
  const authHeader = req?.headers['authorization'];
  return authHeader?.replace('Bearer ', '') || null;
}
```

## Client-Side Auth

Store and use tokens in the browser:

```typescript
// site/components/LoginForm.tsx

import { useState } from 'preact/hooks';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const { token, user } = await res.json();
      
      if (res.ok) {
        // Store token
        localStorage.setItem('auth_token', token);
        
        // Store user info
        localStorage.setItem('user', JSON.stringify(user));
        
        // Redirect
        window.location.href = '/dashboard';
      } else {
        setError(error);
      }
    } catch (err) {
      setError('Login failed');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit">Login</button>
    </form>
  );
}
```

## Logout

Clear authentication:

```typescript
// site/api/auth/(logout).ts

export async function handle(req: IncomingMessage, res: ServerResponse) {
  // Client-side logout with localStorage
  res.writeHead(200, { 'content-type': 'application/json' });
  res.end(JSON.stringify({ success: true }));
}

// Client-side
function logout() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
  window.location.href = '/login';
}
```

## Password Hashing

Use bcrypt for secure password storage:

```bash
npm install bcrypt
```

```typescript
import * as bcrypt from 'bcrypt';

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}
```

## Role-Based Access Control (RBAC)

Control access based on user roles:

```typescript
// site/api/admin/(users).ts

import { verifyToken } from '@src/auth/jwt';
import { DB } from '@src/db';

export async function handle(req: IncomingMessage, res: ServerResponse) {
  const token = extractToken(req);
  
  if (!token) {
    res.writeHead(401);
    res.end();
    return;
  }
  
  try {
    const { userId } = verifyToken(token);
    
    // Check user role
    const db = new DB();
    await db.connect();
    const user = await db.query('users', { where: { id: userId } });
    await db.disconnect();
    
    if (user.role !== 'admin') {
      res.writeHead(403);
      res.end(JSON.stringify({ error: 'Admin access required' }));
      return;
    }
    
    // Handle admin request
    const users = await getAllUsers();
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify(users));
  } catch (error) {
    res.writeHead(403);
    res.end();
  }
}

function extractToken(req: IncomingMessage): string | null {
  const authHeader = req.headers['authorization'];
  return authHeader?.split(' ')[1] || null;
}
```

## Session Management

Track active sessions:

```typescript
// site/api/auth/(me).ts

import { verifyToken } from '@src/auth/jwt';
import { DB } from '@src/db';

export async function handle(req: IncomingMessage, res: ServerResponse) {
  const token = extractToken(req);
  
  if (!token) {
    res.writeHead(401);
    res.end();
    return;
  }
  
  try {
    const { userId, iat, exp } = verifyToken(token);
    
    const db = new DB();
    await db.connect();
    const user = await db.query('users', { where: { id: userId } });
    await db.disconnect();
    
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({
      user,
      expiresIn: exp - Math.floor(Date.now() / 1000)
    }));
  } catch (error) {
    res.writeHead(403);
    res.end();
  }
}
```

## Best Practices

1. **Use HTTPS** - Never send tokens over HTTP
2. **Store tokens securely** - Use httpOnly cookies if possible
3. **Set expiration** - Use short-lived tokens (7-30 days)
4. **Validate thoroughly** - Check all inputs
5. **Hash passwords** - Use bcrypt or Argon2
6. **Rotate secrets** - Change signing keys periodically
7. **Implement refresh tokens** - Allow token renewal
8. **Log authentication events** - Track login/logout
9. **Rate limit auth endpoints** - Prevent brute force attacks
10. **Use CORS properly** - Restrict token access

## Security Headers

Add security headers to your routes:

```typescript
export function Head() {
  return (
    <>
      <meta httpEquiv="x-ua-compatible" content="ie=edge" />
      <meta httpEquiv="x-content-type-options" content="nosniff" />
      <meta httpEquiv="x-frame-options" content="DENY" />
    </>
  );
}
```

## Next Steps

- [API Routes](./api) - Build authentication endpoints
- [Database](./database) - Store user data
- [Middleware](./middleware) - Add auth middleware
