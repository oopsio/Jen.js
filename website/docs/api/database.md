# Database API

Complete reference for database operations in Jen.js.

## DB Class

```typescript
import { DB } from '@src/db';

const db = new DB({ type: 'sqlite' });
await db.connect();
```

## Methods

### connect()

Initialize database connection:

```typescript
const db = new DB(config);
await db.connect();
```

### disconnect()

Close connection:

```typescript
await db.disconnect();
```

### insert()

Add new record:

```typescript
const result = await db.insert('users', {
  name: 'Alice',
  email: 'alice@example.com'
});

// Returns { id: 1, ... }
```

### find()

Query multiple records:

```typescript
const users = await db.find('users', {
  active: true
});

const results = await db.find('users', {
  name: { $startsWith: 'A' }
});
```

### findOne()

Get single record:

```typescript
const user = await db.findOne('users', {
  id: 1
});

// Returns user object or null
```

### update()

Modify records:

```typescript
await db.update('users', 
  { id: 1 },                    // Filter
  { name: 'Bob', active: true } // Updates
);
```

### delete()

Remove records:

```typescript
await db.delete('users', {
  id: 1
});
```

### count()

Count records:

```typescript
const total = await db.count('users', {});
const active = await db.count('users', { active: true });
```

### exec()

Execute raw SQL:

```typescript
await db.exec(`
  CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL
  )
`);
```

### transaction()

Atomic operations:

```typescript
await db.transaction(async (tx) => {
  await tx.insert('users', { name: 'Alice' });
  await tx.insert('profiles', { userId: 1 });
});
```

All changes committed or rolled back together.

## Query Operators

### Comparison

```typescript
// Equals
db.find('users', { active: true })

// Greater than
db.find('users', { age: { $gt: 18 } })

// Less than
db.find('users', { age: { $lt: 65 } })

// Greater or equal
db.find('users', { age: { $gte: 18 } })

// Less or equal
db.find('users', { age: { $lte: 65 } })

// Not equal
db.find('users', { status: { $ne: 'inactive' } })
```

### String

```typescript
// Starts with
db.find('users', { name: { $startsWith: 'Al' } })

// Ends with
db.find('users', { email: { $endsWith: '@example.com' } })

// Contains
db.find('users', { bio: { $contains: 'developer' } })

// Regex
db.find('users', { email: { $regex: /@example\.com$/ } })
```

### Array

```typescript
// In array
db.find('users', { role: { $in: ['admin', 'moderator'] } })

// Not in array
db.find('users', { status: { $nin: ['banned', 'inactive'] } })

// Contains value
db.find('posts', { tags: { $contains: 'javascript' } })
```

### Logical

```typescript
// AND (implicit)
db.find('users', { active: true, role: 'admin' })

// OR
db.find('users', { $or: [
  { role: 'admin' },
  { role: 'moderator' }
]})

// NOT
db.find('users', { status: { $not: 'inactive' } })
```

## Options

### Pagination

```typescript
const page = 2;
const limit = 20;
const offset = (page - 1) * limit;

const users = await db.find('users', {}, {
  limit,
  offset
});
```

### Sorting

```typescript
const users = await db.find('users', {}, {
  sort: { createdAt: -1 }  // -1 = desc, 1 = asc
});
```

### Selection

```typescript
const users = await db.find('users', {}, {
  select: ['id', 'name', 'email']  // Only these fields
});
```

### Full Example

```typescript
const users = await db.find(
  'users',
  { active: true, age: { $gte: 18 } },
  {
    select: ['id', 'name', 'email'],
    sort: { createdAt: -1 },
    limit: 10,
    offset: 20
  }
);
```

## Data Types

Supported types by database:

### SQLite

- INTEGER (int)
- TEXT (string)
- REAL (float)
- BLOB (buffer)
- NULL

### PostgreSQL

- INTEGER
- VARCHAR, TEXT
- NUMERIC, DECIMAL
- BOOLEAN
- TIMESTAMP
- UUID
- JSONB

### MySQL

- INT
- VARCHAR, TEXT
- DECIMAL
- BOOLEAN
- DATETIME
- JSON

### MongoDB

- String
- Number
- Boolean
- Date
- ObjectId
- Array
- Object

## Error Handling

```typescript
try {
  const user = await db.findOne('users', { id: 999 });
  if (!user) {
    throw new Error('User not found');
  }
} catch (err) {
  console.error('Database error:', err);
  // Handle error
}
```

## Connection Pooling

```typescript
const config = {
  type: 'postgres',
  config: {
    connectionString: process.env.DATABASE_URL,
    pool: {
      min: 2,
      max: 10
    }
  }
};

const db = new DB(config);
```

## Migrations

Create migration files:

```typescript
// migrations/001_create_users.ts
export async function up(db: DB) {
  await db.exec(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY,
      name VARCHAR(255),
      email VARCHAR(255) UNIQUE
    )
  `);
}

export async function down(db: DB) {
  await db.exec('DROP TABLE users');
}
```

## Views

Create database views:

```typescript
await db.exec(`
  CREATE VIEW active_users AS
  SELECT * FROM users WHERE active = true
`);

const activeUsers = await db.find('active_users', {});
```

## Indexes

Create indexes for performance:

```typescript
await db.exec('CREATE INDEX idx_email ON users(email)');
await db.exec('CREATE INDEX idx_created ON posts(created_at DESC)');
```

## Transactions

ACID transactions:

```typescript
await db.transaction(async (tx) => {
  const user = await tx.insert('users', { name: 'Alice' });
  const profile = await tx.insert('profiles', {
    userId: user.id,
    bio: 'New user'
  });
  
  return { user, profile };
});
```

Rollback on error:

```typescript
try {
  await db.transaction(async (tx) => {
    await tx.update('users', { id: 1 }, { balance: 50 });
    
    // This error triggers rollback
    throw new Error('Insufficient funds');
    
    await tx.update('accounts', { id: 1 }, { balance: 150 });
  });
} catch (err) {
  // Both operations rolled back
}
```

## Raw Queries

```typescript
const result = await db.query(
  'SELECT * FROM users WHERE id = ?',
  [123]
);

// Parameterized to prevent SQL injection
```
