# Workflow: Add Database

Add bun:sqlite to an existing Bun project with migrations and repository pattern.

<required_reading>

**Read these reference files NOW:**
1. [sqlite-patterns.md](../references/sqlite-patterns.md) - Migrations, pooling, repository, transactions

</required_reading>

<prerequisites>

- Existing Bun project with `package.json`
- Data model requirements understood
- Decision on database location (file path or :memory:)

</prerequisites>

<process>

## Step 1: Create Database Directory

```bash
# Create data directory (gitignore the actual database file)
mkdir -p data

# Add to .gitignore
echo "data/*.db" >> .gitignore
echo "data/*.db-wal" >> .gitignore
echo "data/*.db-shm" >> .gitignore
```

## Step 2: Create Database Module

Create `src/db/index.ts`:

```typescript
import { Database } from 'bun:sqlite';

const DB_PATH = Bun.env.DATABASE_URL || './data/app.db';

export function createDatabase(path: string = DB_PATH): Database {
  const db = new Database(path, {
    create: true,
    readwrite: true,
    strict: true,  // Strict type checking
  });

  // Enable WAL mode for better concurrency
  db.run('PRAGMA journal_mode = WAL');
  db.run('PRAGMA foreign_keys = ON');

  return db;
}

// Singleton for app usage
let _db: Database | null = null;

export function getDatabase(): Database {
  if (!_db) {
    _db = createDatabase();
  }
  return _db;
}

export function closeDatabase(): void {
  _db?.close();
  _db = null;
}
```

## Step 3: Create Migrations System

Create `src/db/migrations.ts`:

```typescript
import type { Database } from 'bun:sqlite';

// Each migration is a SQL statement or array of statements
const migrations: Array<string | string[]> = [
  // Migration 1: Create schema_version table
  `CREATE TABLE IF NOT EXISTS schema_version (
    version INTEGER PRIMARY KEY,
    applied_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`,

  // Migration 2: Create users table
  `CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`,

  // Migration 3: Create posts table
  [
    `CREATE TABLE posts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE INDEX idx_posts_user_id ON posts(user_id)`,
  ],
];

function getCurrentVersion(db: Database): number {
  try {
    const result = db.query('SELECT MAX(version) as version FROM schema_version').get() as { version: number } | null;
    return result?.version ?? 0;
  } catch {
    return 0;  // Table doesn't exist yet
  }
}

export function runMigrations(db: Database): void {
  const currentVersion = getCurrentVersion(db);

  if (currentVersion === migrations.length) {
    console.log(`Database at version ${currentVersion} (up to date)`);
    return;
  }

  console.log(`Migrating from version ${currentVersion} to ${migrations.length}`);

  const migrate = db.transaction(() => {
    for (let i = currentVersion; i < migrations.length; i++) {
      const migration = migrations[i];
      const statements = Array.isArray(migration) ? migration : [migration];

      console.log(`  Running migration ${i + 1}...`);
      for (const sql of statements) {
        db.run(sql);
      }

      db.run('INSERT INTO schema_version (version) VALUES (?)', [i + 1]);
    }
  });

  migrate();
  console.log(`Migration complete (now at version ${migrations.length})`);
}
```

## Step 4: Create Repository Pattern

Create `src/db/repositories/users.ts`:

```typescript
import type { Database } from 'bun:sqlite';

export type User = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
};

type UserRow = {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
};

export class UserRepository {
  private stmt: {
    findById: ReturnType<Database['prepare']>;
    findByEmail: ReturnType<Database['prepare']>;
    create: ReturnType<Database['prepare']>;
    update: ReturnType<Database['prepare']>;
    delete: ReturnType<Database['prepare']>;
  };

  constructor(private db: Database) {
    this.stmt = {
      findById: db.prepare('SELECT * FROM users WHERE id = ?'),
      findByEmail: db.prepare('SELECT * FROM users WHERE email = ?'),
      create: db.prepare(`
        INSERT INTO users (id, email, name, password_hash)
        VALUES (?, ?, ?, ?)
        RETURNING *
      `),
      update: db.prepare(`
        UPDATE users SET email = ?, name = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        RETURNING *
      `),
      delete: db.prepare('DELETE FROM users WHERE id = ? RETURNING *'),
    };
  }

  findById(id: string): User | null {
    const row = this.stmt.findById.get(id) as UserRow | null;
    return row ? this.mapRow(row) : null;
  }

  findByEmail(email: string): User | null {
    const row = this.stmt.findByEmail.get(email) as UserRow | null;
    return row ? this.mapRow(row) : null;
  }

  create(data: { email: string; name: string; passwordHash: string }): User {
    const id = crypto.randomUUID();
    const row = this.stmt.create.get(id, data.email, data.name, data.passwordHash) as UserRow;
    return this.mapRow(row);
  }

  update(id: string, data: { email?: string; name?: string }): User | null {
    const existing = this.findById(id);
    if (!existing) return null;

    const row = this.stmt.update.get(
      data.email ?? existing.email,
      data.name ?? existing.name,
      id
    ) as UserRow;
    return this.mapRow(row);
  }

  delete(id: string): boolean {
    const row = this.stmt.delete.get(id);
    return !!row;
  }

  private mapRow(row: UserRow): User {
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      passwordHash: row.password_hash,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
```

## Step 5: Initialize on Startup

Update `src/index.ts`:

```typescript
import { getDatabase, closeDatabase } from './db';
import { runMigrations } from './db/migrations';
import { UserRepository } from './db/repositories/users';

// Initialize database
const db = getDatabase();
runMigrations(db);

// Create repositories
const userRepo = new UserRepository(db);

// ... rest of app setup ...

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down...');
  closeDatabase();
  process.exit(0);
});
```

## Step 6: Verify with Test Query

```typescript
// Add a test route temporarily
app.get('/db-test', (c) => {
  const db = getDatabase();

  // Test query
  const result = db.query('SELECT sqlite_version() as version').get() as { version: string };

  // Test user creation
  const user = userRepo.create({
    email: 'test@example.com',
    name: 'Test User',
    passwordHash: 'test-hash',
  });

  return c.json({
    sqliteVersion: result.version,
    testUser: user,
  });
});
```

Run and test:

```bash
bun run --watch src/index.ts

# In another terminal
curl http://localhost:3000/db-test
# Expected: {"sqliteVersion":"3.x.x","testUser":{...}}
```

</process>

<cross_references>

**For transaction patterns:** See [sqlite-patterns.md](../references/sqlite-patterns.md) sections on:
- Transaction isolation levels (deferred, immediate, exclusive)
- Nested transactions with savepoints
- Batch insert optimization

**For Hono integration:** See middleware pattern in sqlite-patterns.md for per-request database access

</cross_references>

<anti_patterns>

Avoid:
- String interpolation in SQL (use `?` parameters)
- Forgetting to close database on shutdown
- Opening new connections per request (use pooling or singleton)
- Skipping WAL mode (worse concurrent performance)
- Ignoring foreign keys pragma
- Storing dates as anything other than ISO strings

</anti_patterns>

<success_criteria>

This workflow is complete when:
- [ ] Database file created in `data/` directory
- [ ] Migrations run successfully on startup
- [ ] Repository CRUD operations work
- [ ] Prepared statements used for all queries
- [ ] Database closes cleanly on shutdown
- [ ] `.gitignore` excludes database files

</success_criteria>
