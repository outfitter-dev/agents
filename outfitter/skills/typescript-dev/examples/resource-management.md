# Resource Management Examples

Comprehensive examples of explicit resource management using `using` and `await using` (TypeScript 5.2+).

## Database Connection Management

### Basic Connection Pool

```typescript
class DatabaseConnection implements Disposable {
  private conn: Connection | null = null;

  constructor(private config: ConnectionConfig) {
    this.conn = createConnection(config);
  }

  [Symbol.dispose]() {
    if (this.conn) {
      this.conn.close();
      this.conn = null;
    }
  }

  query(sql: string) {
    if (!this.conn) {
      throw new Error('Connection disposed');
    }
    return this.conn.execute(sql);
  }
}

function queryUsers() {
  using db = new DatabaseConnection({ host: 'localhost' });
  return db.query('SELECT * FROM users');
  // Connection automatically closed, even on exception
}
```

### Async Database Transactions

```typescript
class Transaction implements AsyncDisposable {
  private committed = false;

  constructor(private conn: Connection) {}

  async [Symbol.asyncDispose]() {
    if (!this.committed) {
      await this.conn.rollback();
    }
  }

  async commit() {
    await this.conn.commit();
    this.committed = true;
  }

  async execute(sql: string) {
    return this.conn.execute(sql);
  }
}

async function transferFunds(from: string, to: string, amount: number) {
  await using tx = new Transaction(getConnection());

  await tx.execute(`UPDATE accounts SET balance = balance - ${amount} WHERE id = '${from}'`);
  await tx.execute(`UPDATE accounts SET balance = balance + ${amount} WHERE id = '${to}'`);

  await tx.commit();
  // If commit not called, automatic rollback on dispose
}
```

### Connection Pool with Metrics

```typescript
class PooledConnection implements AsyncDisposable {
  private startTime = Date.now();

  constructor(
    private conn: Connection,
    private pool: ConnectionPool
  ) {}

  async [Symbol.asyncDispose]() {
    const duration = Date.now() - this.startTime;
    await this.pool.release(this.conn, duration);
  }

  query(sql: string) {
    return this.conn.execute(sql);
  }
}

class ConnectionPool {
  private available: Connection[] = [];
  private metrics = { totalTime: 0, requests: 0 };

  acquire(): PooledConnection {
    const conn = this.available.pop() ?? this.createConnection();
    return new PooledConnection(conn, this);
  }

  async release(conn: Connection, duration: number) {
    this.metrics.totalTime += duration;
    this.metrics.requests++;
    this.available.push(conn);
  }

  private createConnection(): Connection {
    // Create new connection
  }
}

async function runQuery(sql: string) {
  const pool = new ConnectionPool();
  await using conn = pool.acquire();
  return conn.query(sql);
  // Metrics tracked, connection returned to pool
}
```

## File Handle Management

### Basic File Operations

```typescript
class FileHandle implements Disposable {
  private fd: number;

  constructor(path: string, mode: string) {
    this.fd = fs.openSync(path, mode);
  }

  [Symbol.dispose]() {
    if (this.fd) {
      fs.closeSync(this.fd);
    }
  }

  write(data: string) {
    fs.writeSync(this.fd, data);
  }

  read(buffer: Buffer) {
    return fs.readSync(this.fd, buffer, 0, buffer.length, null);
  }
}

function writeLog(message: string) {
  using file = new FileHandle('/var/log/app.log', 'a');
  file.write(`${new Date().toISOString()} ${message}\n`);
  // File automatically closed
}
```

### Async File Streaming

```typescript
class AsyncFileHandle implements AsyncDisposable {
  private handle: fs.promises.FileHandle | null = null;

  private constructor(handle: fs.promises.FileHandle) {
    this.handle = handle;
  }

  static async open(path: string, mode: string): Promise<AsyncFileHandle> {
    const handle = await fs.promises.open(path, mode);
    return new AsyncFileHandle(handle);
  }

  async [Symbol.asyncDispose]() {
    if (this.handle) {
      await this.handle.close();
      this.handle = null;
    }
  }

  async write(data: string) {
    if (!this.handle) throw new Error('File closed');
    await this.handle.write(data);
  }

  async read(buffer: Buffer) {
    if (!this.handle) throw new Error('File closed');
    return this.handle.read(buffer, 0, buffer.length, null);
  }
}

async function processFile(path: string) {
  await using file = await AsyncFileHandle.open(path, 'r');
  const buffer = Buffer.alloc(1024);
  const { bytesRead } = await file.read(buffer);
  return buffer.toString('utf8', 0, bytesRead);
  // File closed automatically
}
```

### Temporary File Management

```typescript
class TempFile implements AsyncDisposable {
  readonly path: string;

  constructor() {
    this.path = `/tmp/${crypto.randomUUID()}.tmp`;
  }

  async [Symbol.asyncDispose]() {
    try {
      await fs.promises.unlink(this.path);
    } catch (err) {
      // File might not exist, ignore
    }
  }

  async write(data: string) {
    await fs.promises.writeFile(this.path, data);
  }

  async read() {
    return fs.promises.readFile(this.path, 'utf8');
  }
}

async function processWithTemp(data: string) {
  await using temp = new TempFile();

  await temp.write(data);
  const processed = await someExternalTool(temp.path);
  return processed;
  // Temp file automatically deleted
}
```

## Lock Management

### Basic Mutex

```typescript
class MutexLock implements Disposable {
  constructor(private mutex: Mutex) {}

  [Symbol.dispose]() {
    this.mutex.unlock();
  }
}

class Mutex {
  private locked = false;
  private waiting: (() => void)[] = [];

  acquire(): MutexLock {
    if (this.locked) {
      throw new Error('Mutex already locked (use async version)');
    }
    this.locked = true;
    return new MutexLock(this);
  }

  unlock() {
    this.locked = false;
    const next = this.waiting.shift();
    if (next) next();
  }
}

function updateSharedState() {
  const mutex = new Mutex();
  using lock = mutex.acquire();

  // Critical section
  sharedState.value++;

  // Lock automatically released
}
```

### Async Read-Write Lock

```typescript
class ReadLock implements AsyncDisposable {
  constructor(private lock: RWLock) {}

  async [Symbol.asyncDispose]() {
    await this.lock.releaseRead();
  }
}

class WriteLock implements AsyncDisposable {
  constructor(private lock: RWLock) {}

  async [Symbol.asyncDispose]() {
    await this.lock.releaseWrite();
  }
}

class RWLock {
  private readers = 0;
  private writer = false;
  private waitingReaders: (() => void)[] = [];
  private waitingWriters: (() => void)[] = [];

  async acquireRead(): Promise<ReadLock> {
    while (this.writer || this.waitingWriters.length > 0) {
      await new Promise<void>(resolve => this.waitingReaders.push(resolve));
    }
    this.readers++;
    return new ReadLock(this);
  }

  async acquireWrite(): Promise<WriteLock> {
    while (this.readers > 0 || this.writer) {
      await new Promise<void>(resolve => this.waitingWriters.push(resolve));
    }
    this.writer = true;
    return new WriteLock(this);
  }

  async releaseRead() {
    this.readers--;
    if (this.readers === 0) {
      const next = this.waitingWriters.shift();
      if (next) next();
    }
  }

  async releaseWrite() {
    this.writer = false;

    // Prefer waiting writer over readers
    const nextWriter = this.waitingWriters.shift();
    if (nextWriter) {
      nextWriter();
      return;
    }

    // Wake all waiting readers
    const readers = this.waitingReaders.splice(0);
    readers.forEach(r => r());
  }
}

async function readData(lock: RWLock) {
  await using readLock = await lock.acquireRead();
  return sharedData.value;
  // Read lock released, allows other readers or next writer
}

async function writeData(lock: RWLock, value: number) {
  await using writeLock = await lock.acquireWrite();
  sharedData.value = value;
  // Write lock released automatically
}
```

## HTTP Connection Management

### Request Context

```typescript
class RequestContext implements AsyncDisposable {
  private timers: NodeJS.Timeout[] = [];
  private cleanupFns: (() => Promise<void>)[] = [];

  constructor(public readonly requestId: string) {}

  async [Symbol.asyncDispose]() {
    // Clear all timers
    this.timers.forEach(t => clearTimeout(t));

    // Run cleanup functions in reverse order
    for (const cleanup of this.cleanupFns.reverse()) {
      await cleanup();
    }
  }

  addTimer(timer: NodeJS.Timeout) {
    this.timers.push(timer);
  }

  onCleanup(fn: () => Promise<void>) {
    this.cleanupFns.push(fn);
  }
}

async function handleRequest(req: Request) {
  await using ctx = new RequestContext(crypto.randomUUID());

  // Setup resources
  const db = await connectDatabase();
  ctx.onCleanup(async () => await db.close());

  const cache = await connectCache();
  ctx.onCleanup(async () => await cache.disconnect());

  // Process request
  const result = await processRequest(req, db, cache);

  return result;
  // All resources cleaned up in reverse order
}
```

### HTTP Client Pool

```typescript
class HTTPClient implements AsyncDisposable {
  private agent: https.Agent;

  constructor(private config: ClientConfig) {
    this.agent = new https.Agent({
      keepAlive: true,
      maxSockets: config.maxConnections
    });
  }

  async [Symbol.asyncDispose]() {
    this.agent.destroy();
  }

  async request(url: string): Promise<Response> {
    return fetch(url, { agent: this.agent });
  }
}

async function fetchMultiple(urls: string[]) {
  await using client = new HTTPClient({ maxConnections: 10 });

  const results = await Promise.all(
    urls.map(url => client.request(url))
  );

  return results;
  // Agent destroyed, all connections closed
}
```

## Nested Resource Management

### Multiple Resources

```typescript
async function complexOperation() {
  await using db = await DatabaseConnection.connect();
  await using cache = await CacheConnection.connect();
  await using lock = await mutex.acquire();

  // All resources available
  const data = await db.query('SELECT * FROM users');
  await cache.set('users', data);

  // Resources disposed in reverse order: lock, cache, db
}
```

### Conditional Resources

```typescript
async function conditionalCleanup(needsCache: boolean) {
  await using db = await DatabaseConnection.connect();

  let cache: CacheConnection | null = null;
  if (needsCache) {
    cache = await CacheConnection.connect();
  }

  try {
    const data = await db.query('SELECT * FROM users');

    if (cache) {
      await cache.set('users', data);
    }

    return data;
  } finally {
    if (cache) {
      await cache[Symbol.asyncDispose]();
    }
  }
  // db disposed automatically
}
```

### Resource Factory Pattern

```typescript
class ResourceManager {
  static create<T extends Disposable>(factory: () => T): T {
    return factory();
  }

  static async createAsync<T extends AsyncDisposable>(
    factory: () => Promise<T>
  ): Promise<T> {
    return factory();
  }
}

async function useResources() {
  await using db = await ResourceManager.createAsync(
    async () => await DatabaseConnection.connect()
  );

  using file = ResourceManager.create(
    () => new FileHandle('/tmp/data', 'w')
  );

  // Use both resources
  const data = await db.query('SELECT * FROM users');
  file.write(JSON.stringify(data));

  // Both disposed automatically
}
```

## Error Handling Patterns

### Disposal Errors

```typescript
class SafeResource implements AsyncDisposable {
  async [Symbol.asyncDispose]() {
    try {
      await this.cleanup();
    } catch (err) {
      // Log but don't throw from dispose
      console.error('Cleanup error:', err);
    }
  }

  private async cleanup() {
    // Cleanup logic that might fail
  }
}
```

### Disposal Guarantees

```typescript
async function guaranteedCleanup() {
  let resource: Resource | null = null;

  try {
    resource = await acquireResource();
    await using disposable = new DisposableWrapper(resource);

    // Use resource
    await processResource(resource);

  } catch (err) {
    // Resource still disposed via using
    throw err;
  }
  // Disposal guaranteed even on exception
}

class DisposableWrapper<T> implements AsyncDisposable {
  constructor(private resource: T) {}

  async [Symbol.asyncDispose]() {
    await releaseResource(this.resource);
  }
}
```

## Migration from try/finally

### Before: Manual Cleanup

```typescript
❌ Manual try/finally (verbose, error-prone)
async function oldPattern() {
  const conn = await createConnection();
  try {
    const result = await conn.query('SELECT * FROM users');
    return result;
  } finally {
    await conn.close();
  }
}
```

### After: Automatic Disposal

```typescript
✅ Using keyword (cleaner, safer)
async function newPattern() {
  await using conn = await createConnection();
  return conn.query('SELECT * FROM users');
  // Automatic disposal
}
```

### Multiple Resources Before

```typescript
❌ Nested try/finally (complex, hard to read)
async function oldMultiple() {
  const db = await connectDB();
  try {
    const cache = await connectCache();
    try {
      const lock = await acquireLock();
      try {
        return await doWork(db, cache, lock);
      } finally {
        await releaseLock(lock);
      }
    } finally {
      await cache.disconnect();
    }
  } finally {
    await db.close();
  }
}
```

### Multiple Resources After

```typescript
✅ Sequential using (clean, obvious)
async function newMultiple() {
  await using db = await connectDB();
  await using cache = await connectCache();
  await using lock = await acquireLock();

  return doWork(db, cache, lock);
  // All disposed in reverse order automatically
}
```
