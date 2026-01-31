# Database

Jen.js includes a multi-driver database abstraction layer. Use SQLite, PostgreSQL, MySQL, MongoDB, or jDB.

## Supported Databases

| Database | Type | Use Case |
|----------|------|----------|
| SQLite | Embedded | Development, small projects, offline-first |
| PostgreSQL | SQL | Production, complex queries, ACID |
| MySQL | SQL | Production, shared hosting |
| MongoDB | NoSQL | Flexible schema, document storage |
| jDB | Custom | Embedded, lightweight, no dependencies |

## Basic Usage

### Setup

Configure in `jen.config.ts`:

```typescript
import type { FrameworkConfig } from '@src/core/config';

const config: FrameworkConfig = {
  database: {
    default: {
      type: 'sqlite',
      config: { filename: './data.db' }
    }
  }
};

export default config;
```

Or use environment variables:

```bash
# .env
DATABASE_URL=postgresql://user:password@localhost/mydb
```

```typescript
const config: FrameworkConfig = {
  database: {
    default: {
      type: 'postgres',
      config: { connectionString: process.env.DATABASE_URL }
    }
  }
};
```

### Connect and Query

`src/lib/db.ts`

```typescript
import { DB } from '@src/db';
import type { FrameworkConfig } from '@src/core/config';

let db: DB;

export async function initDB(config: FrameworkConfig) {
  db = new DB(config.database.default);
  await db.connect();
  return db;
}

export function getDB() {
  return db;
}
```

Use in routes:

```typescript
// site/api/(users).ts
import { getDB } from '@src/lib/db';

export async function handle(req: any, res: any) {
  const db = getDB();
  const users = await db.find('users', {});
  res.writeHead(200, { 'content-type': 'application/json' });
  res.end(JSON.stringify(users));
}
```

## SQLite

Embedded database, zero configuration.

### Configuration

```typescript
const config: FrameworkConfig = {
  database: {
    default: {
      type: 'sqlite',
      config: {
        filename: './data.db'
      }
    }
  }
};
```

### Usage

```typescript
const db = new DB({ type: 'sqlite' });
await db.connect();

// Create table
await db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE
  )
`);

// Insert
await db.insert('users', { name: 'Alice', email: 'alice@example.com' });

// Find
const users = await db.find('users', { name: 'Alice' });

// Update
await db.update('users', { id: 1 }, { name: 'Bob' });

// Delete
await db.delete('users', { id: 1 });
```

## PostgreSQL

Production-grade SQL database.

### Configuration

```typescript
const config: FrameworkConfig = {
  database: {
    default: {
      type: 'postgres',
      config: {
        host: 'localhost',
        port: 5432,
        database: 'myapp',
        user: 'postgres',
        password: process.env.DB_PASSWORD
      }
    }
  }
};
```

### Usage

```typescript
const db = new DB({
  type: 'postgres',
  config: { connectionString: process.env.DATABASE_URL }
});

await db.connect();

// Migrations
await db.exec(`
  CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT NOW()
  );
  
  CREATE INDEX idx_email ON users(email);
`);

// Prepared statements
const [user] = await db.find('users', { id: 1 });
```

## MySQL

Fast and reliable SQL database.

### Configuration

```typescript
const config: FrameworkConfig = {
  database: {
    default: {
      type: 'mysql',
      config: {
        host: 'localhost',
        user: 'root',
        password: process.env.DB_PASSWORD,
        database: 'myapp'
      }
    }
  }
};
```

### Usage

```typescript
const db = new DB({
  type: 'mysql',
  config: { 
    connectionString: process.env.DATABASE_URL 
  }
});

await db.connect();

// Create table
await db.exec(`
  CREATE TABLE articles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    content LONGTEXT,
    published BOOLEAN DEFAULT FALSE
  );
`);

// Query
const articles = await db.find('articles', { published: true });
```

## MongoDB

Flexible document database.

### Configuration

```typescript
const config: FrameworkConfig = {
  database: {
    default: {
      type: 'mongodb',
      config: {
        url: 'mongodb://localhost:27017/myapp'
      }
    }
  }
};
```

### Usage

```typescript
const db = new DB({
  type: 'mongodb',
  config: { url: process.env.MONGODB_URL }
});

await db.connect();

// Insert documents
await db.insert('posts', {
  title: 'Hello',
  content: 'World',
  tags: ['mongodb', 'nodejs']
});

// Find with queries
const posts = await db.find('posts', { 
  tags: { $in: ['nodejs'] }
});

// Update
await db.update('posts', { _id: id }, { published: true });

// Delete
await db.delete('posts', { archived: true });
```

## jDB

Jen's lightweight embedded database.

### Configuration

```typescript
const config: FrameworkConfig = {
  database: {
    default: {
      type: 'jdb',
      config: {
        root: './data',
        name: 'app'
      }
    }
  }
};
```

### Usage

```typescript
const db = new DB({
  type: 'jdb',
  config: { root: './data' }
});

await db.connect();

// Insert
await db.insert('users', { name: 'Alice', email: 'alice@example.com' });

// Find
const users = await db.find('users', { name: 'Alice' });

// Update
await db.update('users', { id: 1 }, { name: 'Bob' });

// Delete
await db.delete('users', { id: 1 });
```

Perfect for development and small projects.

## Multiple Databases

Connect to multiple databases:

```typescript
const config: FrameworkConfig = {
  database: {
    default: {
      type: 'postgres',
      config: { connectionString: process.env.DATABASE_URL }
    },
    connections: {
      cache: {
        type: 'redis',
        config: { url: 'redis://localhost:6379' }
      },
      search: {
        type: 'mongodb',
        config: { url: 'mongodb://localhost:27017/search' }
      }
    }
  }
};
```

Usage:

```typescript
const primaryDB = getDB();
const cacheDB = getDB('cache');
const searchDB = getDB('search');
```

## Common Operations

### Create Table

```typescript
await db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
```

### Insert

```typescript
await db.insert('posts', {
  title: 'Hello World',
  content: 'This is my first post'
});
```

### Find One

```typescript
const post = await db.findOne('posts', { id: 1 });
```

### Find Many

```typescript
const posts = await db.find('posts', {});
const published = await db.find('posts', { published: true });
```

### Update

```typescript
await db.update('posts', { id: 1 }, { 
  title: 'Updated Title',
  published: true
});
```

### Delete

```typescript
await db.delete('posts', { id: 1 });
```

### Count

```typescript
const count = await db.count('posts', {});
const published = await db.count('posts', { published: true });
```

## Migrations

Create migration files:

`src/migrations/001_create_users.ts`

```typescript
export async function up(db: DB) {
  await db.exec(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL
    )
  `);
}

export async function down(db: DB) {
  await db.exec('DROP TABLE users');
}
```

Run migrations:

```bash
npm run migrate
```

## Transactions

Handle multiple operations atomically:

```typescript
const db = getDB();

try {
  await db.transaction(async (tx) => {
    await tx.insert('users', { name: 'Alice', email: 'alice@example.com' });
    await tx.insert('profiles', { userId: lastId, bio: 'Hello' });
  });
} catch (err) {
  console.error('Transaction failed, rolled back');
}
```

## Best Practices

1. **Use environment variables** for database URLs
2. **Create indexes** for frequently queried columns
3. **Use transactions** for related operations
4. **Validate inputs** before querying
5. **Handle connection pooling** in production
6. **Monitor query performance**
7. **Regular backups** for important data
8. **Use migrations** for schema changes
