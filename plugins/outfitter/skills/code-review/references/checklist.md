# Fresh Eyes Review Checklist Reference

Extended details, examples, and severity guidance for each checklist category.

## Type Safety

### What to Check

**No `any` types without justification:**

```typescript
// ◆◆ Severe
function process(data: any) { ... }

// ✓ Good - with justification
// @ts-expect-error: External library has incorrect types
function process(data: any) { ... }

// ✓ Better - narrow the type
function process(data: unknown) {
  if (typeof data === 'string') { ... }
}
```

**Null/undefined handling:**

```typescript
// ◆ Moderate
const user = users.find(u => u.id === id);
return user.name; // might be undefined

// ✓ Good
const user = users.find(u => u.id === id);
return user?.name ?? 'Unknown';
```

**Type guards for unions:**

```typescript
// ◆ Moderate
type Result = Success | Error;
function handle(result: Result) {
  if (result.success) { // Property doesn't exist
    return result.data;
  }
}

// ✓ Good - discriminated union
type Result =
  | { success: true; data: string }
  | { success: false; error: string };

function handle(result: Result) {
  if (result.success) {
    return result.data; // TypeScript knows this is safe
  }
}
```

**Generic constraints:**

```typescript
// ◇ Minor
function getProperty<T>(obj: T, key: string) {
  return obj[key]; // No constraint, unsafe
}

// ✓ Good
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
```

**Return types on public functions:**

```typescript
// ◇ Minor
export function calculate(x: number, y: number) {
  return x + y; // Inferred, but implicit
}

// ✓ Good - explicit contract
export function calculate(x: number, y: number): number {
  return x + y;
}
```

### Severity Guidance

- **◆◆** `any` escaping to public API, type assertions that can crash
- **◆** Missing null checks, missing return types on public functions
- **◇** Overly broad types that work but reduce safety

---

## Error Handling

### What to Check

**All error paths handled:**

```typescript
// ◆◆ Severe - silent failure
async function saveUser(user: User) {
  await db.insert(user); // Might throw, not handled
}

// ✓ Good
async function saveUser(user: User): Promise<Result<void, DbError>> {
  try {
    await db.insert(user);
    return { success: true };
  } catch (error) {
    logger.error('Failed to save user', { user, error });
    return { success: false, error: new DbError('Insert failed') };
  }
}
```

**Meaningful error messages:**

```typescript
// ◆ Moderate
if (!user) throw new Error('Invalid');

// ✓ Good
if (!user) {
  throw new Error(`User not found: id=${userId}, searched at ${new Date()}`);
}
```

**Promise rejection handling:**

```typescript
// ◆◆ Severe
fetchData().then(process); // Unhandled rejection

// ✓ Good
fetchData()
  .then(process)
  .catch(error => {
    logger.error('Fetch failed', { error });
    notifyUser('Data unavailable');
  });

// ✓ Better - async/await
try {
  const data = await fetchData();
  process(data);
} catch (error) {
  logger.error('Fetch failed', { error });
  notifyUser('Data unavailable');
}
```

**Resource cleanup:**

```typescript
// ◆ Moderate
const file = await fs.open('data.txt');
const content = await file.readFile(); // Might throw, file not closed
return content;

// ✓ Good
const file = await fs.open('data.txt');
try {
  return await file.readFile();
} finally {
  await file.close();
}
```

### Severity Guidance

- **◆◆** Silent failures, unhandled rejections, resource leaks
- **◆** Poor error messages, missing try/catch, errors swallowed
- **◇** Error messages could be more helpful, missing context

---

## Security

### What to Check

**Input validation:**

```typescript
// ◆◆ Severe
app.get('/user/:id', (req, res) => {
  const user = db.query(`SELECT * FROM users WHERE id = ${req.params.id}`);
  res.json(user);
});

// ✓ Good
app.get('/user/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id) || id < 0) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }
  const user = db.query('SELECT * FROM users WHERE id = ?', [id]);
  res.json(user);
});
```

**No hardcoded secrets:**

```typescript
// ◆◆ Severe
const API_KEY = 'sk_live_abc123xyz789';

// ✓ Good
const API_KEY = process.env.API_KEY;
if (!API_KEY) throw new Error('API_KEY not configured');
```

**Authentication checks:**

```typescript
// ◆◆ Severe
app.delete('/admin/users/:id', (req, res) => {
  db.deleteUser(req.params.id);
  res.json({ success: true });
});

// ✓ Good
app.delete('/admin/users/:id', requireAuth, requireAdmin, (req, res) => {
  db.deleteUser(req.params.id);
  res.json({ success: true });
});
```

**XSS prevention:**

```typescript
// ◆◆ Severe
function displayMessage(msg: string) {
  element.innerHTML = msg; // User content directly in HTML
}

// ✓ Good
function displayMessage(msg: string) {
  element.textContent = msg; // Automatically escaped
}

// Or use sanitization library
import DOMPurify from 'dompurify';
element.innerHTML = DOMPurify.sanitize(msg);
```

**Password handling:**

```typescript
// ◆◆ Severe
if (user.password === inputPassword) { ... }

// ✓ Good
import bcrypt from 'bcrypt';
if (await bcrypt.compare(inputPassword, user.passwordHash)) { ... }
```

### Severity Guidance

- **◆◆** SQL injection, XSS, auth bypass, exposed secrets, timing attacks
- **◆** Missing input validation, weak password checks, missing CSRF
- **◇** Could use stronger encryption, missing rate limits

---

## Testing

### What to Check

**Tests exist:**

```typescript
// ◆ Moderate - new function, no tests
export function calculateDiscount(price: number, tier: string): number {
  if (tier === 'premium') return price * 0.8;
  if (tier === 'standard') return price * 0.9;
  return price;
}
```

**Edge cases covered:**

```typescript
// ◆ Moderate - only happy path tested
test('calculateDiscount applies premium discount', () => {
  expect(calculateDiscount(100, 'premium')).toBe(80);
});

// ✓ Good - edge cases included
test('calculateDiscount handles edge cases', () => {
  expect(calculateDiscount(100, 'premium')).toBe(80);
  expect(calculateDiscount(100, 'standard')).toBe(90);
  expect(calculateDiscount(100, 'unknown')).toBe(100);
  expect(calculateDiscount(0, 'premium')).toBe(0);
  expect(calculateDiscount(-10, 'premium')).toBe(-8); // Or throw?
});
```

**Actual assertions:**

```typescript
// ◆ Moderate - test doesn't verify behavior
test('user creation', async () => {
  await createUser({ name: 'Alice' }); // No assertion!
});

// ✓ Good
test('user creation', async () => {
  const user = await createUser({ name: 'Alice' });
  expect(user.name).toBe('Alice');
  expect(user.id).toBeDefined();

  const fromDb = await db.getUser(user.id);
  expect(fromDb).toEqual(user);
});
```

**No test pollution:**

```typescript
// ◆ Moderate
test('first test', () => {
  globalState.users = [testUser];
  expect(findUser(1)).toEqual(testUser);
});

test('second test', () => {
  // Fails if first test didn't run or ran differently
  expect(globalState.users.length).toBe(1);
});

// ✓ Good
beforeEach(() => {
  globalState.users = [];
});

afterEach(() => {
  globalState.users = [];
});

test('first test', () => {
  globalState.users = [testUser];
  expect(findUser(1)).toEqual(testUser);
});

test('second test', () => {
  expect(globalState.users.length).toBe(0); // Clean slate
});
```

**Error scenarios tested:**

```typescript
// ◆ Moderate - only success path tested
test('fetchUser retrieves user', async () => {
  const user = await fetchUser(1);
  expect(user.id).toBe(1);
});

// ✓ Good
test('fetchUser handles not found', async () => {
  await expect(fetchUser(999)).rejects.toThrow('User not found');
});

test('fetchUser handles network errors', async () => {
  mockApi.get.mockRejectedValue(new NetworkError());
  await expect(fetchUser(1)).rejects.toThrow(NetworkError);
});
```

### Severity Guidance

- **◆◆** Critical paths untested, failing tests committed
- **◆** New functionality without tests, missing error scenarios, test pollution
- **◇** Could add more edge cases, test names unclear

---

## Code Quality

### What to Check

**Names reveal intent:**

```typescript
// ◇ Minor
function proc(d: Data): number {
  const x = d.items.filter(i => i.active).length;
  return x * 1.2;
}

// ✓ Good
function calculateActiveItemsWithSurcharge(data: Data): number {
  const activeItemCount = data.items.filter(item => item.active).length;
  const SURCHARGE_MULTIPLIER = 1.2;
  return activeItemCount * SURCHARGE_MULTIPLIER;
}
```

**Single responsibility:**

```typescript
// ◆ Moderate - doing too much
function processUserRequest(userId: string, action: string, data: any) {
  const user = db.getUser(userId);
  if (!user) throw new Error('Not found');

  logger.info('Processing', { userId, action });

  if (action === 'update') {
    db.updateUser(userId, data);
    email.send(user.email, 'Updated');
  } else if (action === 'delete') {
    db.deleteUser(userId);
    cache.clear(userId);
  }

  return { success: true };
}

// ✓ Good - separated concerns
function validateUser(userId: string): User {
  const user = db.getUser(userId);
  if (!user) throw new Error('User not found');
  return user;
}

function updateUser(userId: string, data: UserData): void {
  db.updateUser(userId, data);
  notifyUserUpdated(userId);
}

function deleteUser(userId: string): void {
  db.deleteUser(userId);
  cache.clear(userId);
}
```

**No magic numbers:**

```typescript
// ◇ Minor
if (user.age > 65) { ... }
setTimeout(doWork, 86400000);

// ✓ Good
const SENIOR_AGE_THRESHOLD = 65;
if (user.age > SENIOR_AGE_THRESHOLD) { ... }

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
setTimeout(doWork, ONE_DAY_MS);
```

**DRY violations:**

```typescript
// ◆ Moderate
function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateAdminEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.endsWith('@admin.com');
}

// ✓ Good
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

function validateAdminEmail(email: string): boolean {
  return validateEmail(email) && email.endsWith('@admin.com');
}
```

**Nested conditionals:**

```typescript
// ◆ Moderate - 4 levels deep
function process(user: User) {
  if (user) {
    if (user.active) {
      if (user.subscription) {
        if (user.subscription.plan === 'premium') {
          return doThing();
        }
      }
    }
  }
  return null;
}

// ✓ Good - early returns
function process(user: User) {
  if (!user) return null;
  if (!user.active) return null;
  if (!user.subscription) return null;
  if (user.subscription.plan !== 'premium') return null;

  return doThing();
}
```

**Dead code:**

```typescript
// ◇ Minor
function calculate(x: number): number {
  const legacy = x * 2; // Unused, remove
  // const oldWay = x + 10; // Commented out, remove
  return x * 3;
}
```

### Severity Guidance

- **◆◆** Functions >200 lines, cyclomatic complexity >15
- **◆** Functions >50 lines, DRY violations, deep nesting (>3)
- **◇** Unclear names, magic numbers, minor complexity

---

## Documentation

### What to Check

**Public APIs documented:**

```typescript
// ◆ Moderate - exported, no docs
export function transformData(input: RawData, options: Options): ProcessedData {
  // ...
}

// ✓ Good
/**
 * Transforms raw sensor data into processed format for analysis.
 *
 * @param input - Raw data from sensor API
 * @param options - Processing options (sampling rate, filters)
 * @returns Processed data ready for visualization
 * @throws {ValidationError} If input data format is invalid
 *
 * @example
 * const processed = transformData(rawSensorData, {
 *   samplingRate: 100,
 *   filters: ['lowpass', 'normalize']
 * });
 */
export function transformData(input: RawData, options: Options): ProcessedData {
  // ...
}
```

**Complex algorithms explained:**

```typescript
// ◆ Moderate - unclear why
function score(items: Item[]): number {
  return items.reduce((sum, item) => {
    const weight = item.priority * 0.7 + item.age * 0.3;
    return sum + (item.value * weight);
  }, 0) / items.length;
}

// ✓ Good
/**
 * Calculate weighted average score for items.
 *
 * Weight formula: (priority * 0.7) + (age * 0.3)
 * - Priority weighted more heavily (70%) as immediate importance
 * - Age contributes 30% to account for staleness
 *
 * Based on research paper: doi:10.1234/scoring-algorithm
 */
function score(items: Item[]): number {
  return items.reduce((sum, item) => {
    const weight = item.priority * 0.7 + item.age * 0.3;
    return sum + (item.value * weight);
  }, 0) / items.length;
}
```

**Non-obvious decisions:**

```typescript
// ◆ Moderate - unclear why setTimeout
async function syncData() {
  await uploadToServer(data);
  setTimeout(cleanup, 5000);
}

// ✓ Good
async function syncData() {
  await uploadToServer(data);

  // Delay cleanup to allow server-side replication (typically 2-3s).
  // Without delay, we observed 15% data loss in distributed setup.
  // See issue #456 for full investigation.
  setTimeout(cleanup, 5000);
}
```

**Breaking changes noted:**

```typescript
// ◆ Moderate
export function getUsers(): Promise<User[]> {
  // Changed from sync to async, breaking change not documented
}

// ✓ Good
/**
 * Fetch all users from database.
 *
 * @returns Promise resolving to array of users
 *
 * @breaking-change v2.0.0 - Now returns Promise instead of sync array.
 * Migration: Change `const users = getUsers()` to `const users = await getUsers()`
 */
export function getUsers(): Promise<User[]> {
  // ...
}
```

**TODOs with context:**

```typescript
// ◇ Minor
// TODO: optimize this

// ✓ Good
// TODO(@alice): Optimize with caching once user volume >10k (ETA: Q2 2024)
// Current O(n²) acceptable for <1000 users, measured at 45ms p95
```

### Severity Guidance

- **◆◆** Breaking changes undocumented
- **◆** Public APIs missing docs, complex algorithms unexplained
- **◇** TODOs without context, minor doc improvements

---

## Performance

### What to Check

**N+1 queries:**

```typescript
// ◆ Moderate
async function getUsersWithPosts(userIds: string[]) {
  const users = await db.getUsers(userIds);
  for (const user of users) {
    user.posts = await db.getPostsByUser(user.id); // N queries!
  }
  return users;
}

// ✓ Good
async function getUsersWithPosts(userIds: string[]) {
  const users = await db.getUsers(userIds);
  const posts = await db.getPostsByUsers(userIds); // 1 query

  const postsByUser = posts.reduce((acc, post) => {
    (acc[post.userId] ||= []).push(post);
    return acc;
  }, {});

  return users.map(user => ({
    ...user,
    posts: postsByUser[user.id] || []
  }));
}
```

**Appropriate data structures:**

```typescript
// ◆ Moderate - O(n) lookup
const activeUsers = users.filter(u => u.active);
function isActive(userId: string): boolean {
  return activeUsers.find(u => u.id === userId) !== undefined; // O(n)
}

// ✓ Good - O(1) lookup
const activeUserIds = new Set(users.filter(u => u.active).map(u => u.id));
function isActive(userId: string): boolean {
  return activeUserIds.has(userId); // O(1)
}
```

**Unnecessary allocations:**

```typescript
// ◇ Minor
function processItems(items: Item[]) {
  return items
    .map(i => ({ ...i }))        // Copy 1
    .map(i => ({ ...i, processed: true }))  // Copy 2
    .filter(i => i.active);
}

// ✓ Good
function processItems(items: Item[]) {
  return items
    .filter(i => i.active)
    .map(i => ({ ...i, processed: true }));
}
```

**Async operations:**

```typescript
// ◆ Moderate - sequential, slow
async function loadData() {
  const users = await fetchUsers();    // Wait
  const posts = await fetchPosts();    // Wait
  const comments = await fetchComments(); // Wait
  return { users, posts, comments };
}

// ✓ Good - parallel
async function loadData() {
  const [users, posts, comments] = await Promise.all([
    fetchUsers(),
    fetchPosts(),
    fetchComments()
  ]);
  return { users, posts, comments };
}
```

### Severity Guidance

- **◆◆** Performance bugs (infinite loops, memory leaks)
- **◆** Obvious N+1, blocking operations in hot path
- **◇** Minor optimizations, better data structures possible

---

## Rust-Specific

### What to Check

**Result over panic:**

```rust
// ◆◆ Severe
pub fn divide(a: i32, b: i32) -> i32 {
    a / b  // Panics on division by zero
}

// ✓ Good
pub fn divide(a: i32, b: i32) -> Result<i32, &'static str> {
    if b == 0 {
        Err("Division by zero")
    } else {
        Ok(a / b)
    }
}
```

**No unwrap outside tests:**

```rust
// ◆ Moderate
pub fn get_config() -> Config {
    fs::read_to_string("config.toml")
        .unwrap()  // Bad: panics on missing file
        .parse()
        .unwrap()
}

// ✓ Good
pub fn get_config() -> Result<Config, ConfigError> {
    let content = fs::read_to_string("config.toml")?;
    let config = content.parse()?;
    Ok(config)
}
```

**Ownership/borrowing:**

```rust
// ◆ Moderate - unnecessary clone
fn process_data(data: Vec<u8>) -> Vec<u8> {
    let copy = data.clone();  // Unnecessary allocation
    transform(copy)
}

// ✓ Good
fn process_data(data: Vec<u8>) -> Vec<u8> {
    transform(data)  // Move ownership
}

// Or if data is needed later:
fn process_data(data: &[u8]) -> Vec<u8> {
    transform(data)  // Borrow
}
```

**Unsafe justification:**

```rust
// ◆◆ Severe - unjustified unsafe
pub fn get_value(ptr: *const u8) -> u8 {
    unsafe { *ptr }
}

// ✓ Good
/// # Safety
///
/// `ptr` must be:
/// - Properly aligned for type `u8`
/// - Non-null
/// - Valid for reads (pointing to initialized memory)
/// - Not accessed concurrently from other threads
pub unsafe fn get_value(ptr: *const u8) -> u8 {
    unsafe { *ptr }
}

// ✓ Better - avoid unsafe if possible
pub fn get_value(slice: &[u8], index: usize) -> Option<u8> {
    slice.get(index).copied()
}
```

### Severity Guidance

- **◆◆** Unjustified unsafe, panics in library code, Send/Sync violations
- **◆** unwrap/expect in production code, unnecessary clones
- **◇** Could use iterators, minor allocation improvements

---

## Severity Summary

### ◆◆ Severe (blocking)

Ship with these → security incidents, runtime failures, data loss.

Examples:
- SQL injection, XSS, auth bypass
- Unhandled errors that crash
- Type assertions that can panic
- Hardcoded secrets
- Unjustified unsafe code (Rust)
- Test failures committed

**Action:** Must fix before merge.

### ◆ Moderate (should fix)

Ship with these → maintenance burden, degraded quality, potential bugs.

Examples:
- Missing null checks
- Poor error messages
- Missing tests
- Significant code duplication
- Performance issues (N+1)
- Missing docs on public APIs

**Action:** Fix before merge unless explicitly accepted as tech debt with tracking issue.

### ◇ Minor (consider addressing)

Ship with these → code could be better, but functional and safe.

Examples:
- Unclear variable names
- Magic numbers
- Missing edge case tests
- Minor performance optimizations
- Documentation improvements
- Code style inconsistencies

**Action:** Optional improvements. Consider batching in refactoring PR.

---

## Review Patterns

### Security-Sensitive Areas

Give extra scrutiny to:
- Authentication/authorization logic
- User input handling (forms, APIs, queries)
- Database queries (SQL injection risk)
- File uploads/downloads
- Cryptographic operations
- Session management
- CORS/CSRF protections

### Common False Positives

**Type safety:** `as unknown as X` sometimes necessary for complex type gymnastics — verify justification comment.

**Error handling:** Not all errors need recovery — sometimes propagating is correct.

**Magic numbers:** Domain constants (HTTP codes, standard ports) don't need extraction.

**Function length:** Pure data transformation can be >50 lines if clear.

### When to Escalate

Flag for senior review if:
- Security implications unclear
- Performance impact uncertain
- Architecture decision embedded
- Breaking change considerations
- Unfamiliar technology or pattern

---

## Checklist Efficiency

### Full Review (default)

Run all categories for:
- Pre-merge reviews
- Critical path changes
- Security-sensitive code
- Public API changes

### Targeted Review

Focus specific categories for:
- **Refactors** → Code Quality, Tests
- **Bug fixes** → Error Handling, Tests, Type Safety
- **Performance work** → Performance, Tests
- **Security patches** → Security, Error Handling
- **Docs** → Documentation

### Quick Sanity Check (not Fresh Eyes)

For trivial changes (typos, formatting), skip formal review. Don't invoke Fresh Eyes skill — use judgment.
