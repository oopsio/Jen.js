---
sidebar_position: 9
---

# Database

Jen.js supports multiple database drivers: SQLite, PostgreSQL, MySQL, and MongoDB.

## Supported Drivers

| Driver | Best For | Setup |
|--------|----------|-------|
| **SQLite** | Development, small projects | File-based, no server |
| **PostgreSQL** | Production, complex queries | Requires PostgreSQL server |
| **MySQL** | Production, MySQL ecosystem | Requires MySQL server |
| **MongoDB** | Document-based, flexible schema | Requires MongoDB server |

## Installation

Add database driver to your project:

```bash
# SQLite (included)
npm install better-sqlite3

# PostgreSQL
npm install pg

# MySQL
npm install mysql2

# MongoDB
npm install mongodb
```

## Configuration

Set database driver in `jen.config.ts`:

```typescript
import type { FrameworkConfig } from '@src/core/types';

const config: FrameworkConfig = {
  database: {
    driver: 'sqlite',
    connectionString: 'data/app.db'
  }
};

export default config;
```

Or set via environment:

```bash
export DATABASE_URL="postgresql://user:password@localhost/dbname"
export DATABASE_DRIVER="postgres"
```

## Initialization

Initialize database in your loaders or API routes:

```typescript
import { DB } from '@src/db';

export async function loader(ctx: LoaderContext) {
  const db = new DB({
    driver: 'sqlite',
    connectionString: 'data/app.db'
  });
  
  await db.connect();
  
  try {
    const users = await db.query('users', {});
    return { users };
  } finally {
    await db.disconnect();
  }
}
```

## Creating Tables

Define schemas in `migrations/`:

```typescript
// migrations/001_create_users.ts

export async function up(db: DB) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export async function down(db: DB) {
  await db.execute('DROP TABLE users');
}
```

Run migrations:

```bash
npm run migrate
```

## Querying Data

### Select

```typescript
// Get all records
const users = await db.query('users', {});

// Get one record
const user = await db.query('users', { 
  where: { id: 1 }
});

// Get with conditions
const activeUsers = await db.query('users', {
  where: { status: 'active' }
});

// Select specific columns
const names = await db.query('users', {
  select: ['id', 'name'],
  where: { status: 'active' }
});

// With limit and offset
const page1 = await db.query('users', {
  limit: 10,
  offset: 0
});

// With ordering
const recent = await db.query('users', {
  orderBy: { created_at: 'desc' },
  limit: 10
});

// With search
const results = await db.query('users', {
  where: { name: { contains: 'John' } }
});
```

### Insert

```typescript
const user = await db.create('users', {
  name: 'Alice',
  email: 'alice@example.com'
});

// Bulk insert
const users = await db.createMany('users', [
  { name: 'Alice', email: 'alice@example.com' },
  { name: 'Bob', email: 'bob@example.com' }
]);
```

### Update

```typescript
// Update one
const user = await db.update(
  'users',
  { id: 1 },
  { name: 'Updated Name' }
);

// Update many
await db.updateMany(
  'users',
  { status: 'pending' },
  { status: 'active' }
);
```

### Delete

```typescript
// Delete one
await db.delete('users', { id: 1 });

// Delete many
await db.deleteMany('users', { status: 'inactive' });
```

### Count

```typescript
const total = await db.count('users');

const active = await db.count('users', {
  where: { status: 'active' }
});
```

## Relationships

### One-to-Many

```typescript
// Get posts with author
const posts = await db.query('posts', {
  include: {
    author: true
  }
});

// Access in component
export default function Posts({ data }: any) {
  return (
    <div>
      {data.posts.map(post => (
        <div key={post.id}>
          <h2>{post.title}</h2>
          <p>By {post.author.name}</p>
        </div>
      ))}
    </div>
  );
}
```

### Many-to-Many

```typescript
// Get posts with tags
const posts = await db.query('posts', {
  include: {
    tags: true
  }
});
```

## Transactions

Run multiple queries atomically:

```typescript
const result = await db.transaction(async (tx) => {
  // Deduct from one account
  await tx.update('accounts', { id: 1 }, { balance: 100 });
  
  // Add to another account
  await tx.update('accounts', { id: 2 }, { balance: 150 });
  
  return { success: true };
});
```

## Raw Queries

Execute custom SQL:

```typescript
const users = await db.execute(`
  SELECT u.id, u.name, COUNT(p.id) as post_count
  FROM users u
  LEFT JOIN posts p ON u.id = p.user_id
  GROUP BY u.id
  ORDER BY post_count DESC
`);
```

## Validation

Validate data before inserting:

```typescript
export async function loader(ctx: LoaderContext) {
  const { email } = ctx.query;
  
  if (!email || !isValidEmail(email)) {
    return { error: 'Invalid email' };
  }
  
  const user = await db.query('users', { where: { email } });
  
  return { user };
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

## Migrations

Create migration files:

```typescript
// migrations/002_add_status_to_users.ts

export async function up(db: DB) {
  await db.execute(`
    ALTER TABLE users ADD COLUMN status VARCHAR(50) DEFAULT 'active'
  `);
}

export async function down(db: DB) {
  await db.execute(`
    ALTER TABLE users DROP COLUMN status
  `);
}
```

Run migrations:

```bash
npm run migrate:up    # Run pending migrations
npm run migrate:down  # Rollback last migration
npm run migrate:list  # Show migration status
```

## Hooks

Run custom Lua scripts on database operations:

```typescript
const db = new DB(config, null, {
  onInsert: `
    function onInsert(table, data)
      print("Inserted into " .. table)
      return data
    end
  `,
  onUpdate: `
    function onUpdate(table, data)
      print("Updated " .. table)
      return data
    end
  `
});
```

## Connection Pooling

Manage connections efficiently:

```typescript
const db = new DB(config);

db.setPool({
  min: 5,
  max: 20,
  idleTimeoutMillis: 30000
});

await db.connect();
```

## Best Practices

1. **Use migrations** - Track schema changes
2. **Index frequently queried columns** - Improve performance
3. **Validate input** - Prevent SQL injection
4. **Use transactions** - Maintain data integrity
5. **Handle errors** - Gracefully fail
6. **Close connections** - Prevent leaks
7. **Use prepared statements** - Safe queries
8. **Cache results** - Reduce database load

## Common Patterns

### User Registration

```typescript
// site/api/auth/(register).ts

export async function handle(req: IncomingMessage, res: ServerResponse) {
  if (req.method === 'POST') {
    const body = await readBody(req);
    const { email, password, name } = JSON.parse(body);
    
    // Validate
    if (!email || !password || !name) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'Missing fields' }));
      return;
    }
    
    const db = new DB();
    await db.connect();
    
    try {
      // Check existing
      const existing = await db.query('users', { where: { email } });
      if (existing) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Email already exists' }));
        return;
      }
      
      // Create user
      const user = await db.create('users', {
        email,
        password: hashPassword(password),
        name
      });
      
      res.writeHead(201);
      res.end(JSON.stringify({ user }));
    } finally {
      await db.disconnect();
    }
  }
}
```

### Paginated List

```typescript
// site/(blog).tsx

export async function loader(ctx: LoaderContext) {
  const page = parseInt(ctx.query.page || '1');
  const limit = 10;
  const offset = (page - 1) * limit;
  
  const db = new DB();
  await db.connect();
  
  try {
    const [posts, total] = await Promise.all([
      db.query('posts', {
        orderBy: { created_at: 'desc' },
        limit,
        offset,
        include: { author: true }
      }),
      db.count('posts')
    ]);
    
    return {
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } finally {
    await db.disconnect();
  }
}
```

## Next Steps

- [API Routes](./api) - Build endpoints
- [Authentication](./auth) - Secure your database
- [Middleware](./middleware) - Add database middleware
