# TSDoc Patterns

Types document structure. TSDoc documents intent, constraints, and usage patterns.

## Why TSDoc Matters for AI Agents

AI agents parse documentation to understand code semantics that types alone cannot express:

- **Why** code exists, not just **what** it does
- **Constraints** agents would otherwise miss
- **Examples** give concrete patterns to follow
- **@throws** communicates error cases

Well-documented code lets agents work faster with fewer mistakes.

## What to Document

- All exported functions, classes, types, interfaces
- Parameters with constraints or expected patterns
- Return values with non-obvious semantics
- Thrown errors and edge cases
- Related APIs via `@see`

## Function Documentation

```typescript
/**
 * Authenticates user and returns session token.
 *
 * @param credentials - User login credentials
 * @returns Session token valid for 24 hours
 * @throws {AuthenticationError} Invalid credentials
 * @throws {RateLimitError} Too many failed attempts (>5 in 15 min)
 *
 * @example
 * ```ts
 * const token = await authenticate({ email, password });
 * headers.set('Authorization', `Bearer ${token}`);
 * ```
 */
export async function authenticate(
  credentials: Credentials
): Promise<SessionToken> {
  // ...
}
```

## Interface Documentation

```typescript
/**
 * User account with profile information.
 *
 * @remarks
 * Email is unique across the system and used for authentication.
 * The `role` field determines access permissions.
 */
export interface User {
  /** Unique identifier (UUID v4) */
  readonly id: UserId;
  /** Primary email, must be verified */
  email: string;
  /** Display name shown in UI */
  name: string;
  /** Access level - defaults to 'user' on creation */
  role: 'admin' | 'user' | 'guest';
}
```

## Type Documentation

```typescript
/**
 * Result of a validation operation.
 *
 * @typeParam T - The validated data type
 * @typeParam E - The error type (defaults to ValidationError)
 *
 * @example
 * ```ts
 * function validate(data: unknown): ValidationResult<User> {
 *   if (!isUser(data)) {
 *     return { valid: false, errors: [{ field: 'root', message: 'Not a user' }] };
 *   }
 *   return { valid: true, data };
 * }
 * ```
 */
export type ValidationResult<T, E = ValidationError> =
  | { readonly valid: true; readonly data: T }
  | { readonly valid: false; readonly errors: E[] };
```

## Common TSDoc Tags

| Tag | Purpose | Example |
|-----|---------|---------|
| `@param` | Document parameter | `@param id - User's unique identifier` |
| `@returns` | Document return value | `@returns The created user object` |
| `@throws` | Document exceptions | `@throws {NotFoundError} User not found` |
| `@example` | Provide usage example | Code block with typical usage |
| `@remarks` | Additional context | Edge cases, related info |
| `@typeParam` | Document generic params | `@typeParam T - The data type` |
| `@see` | Reference related APIs | `@see {@link createUser}` |
| `@deprecated` | Mark deprecated | `@deprecated Use newMethod instead` |
| `@default` | Document default value | `@default 'user'` |
| `@since` | Version introduced | `@since 2.0.0` |
| `@beta` | Mark as beta | API may change |

## Inline Comments

Use inline comments for non-obvious logic:

```typescript
function calculateDiscount(order: Order): number {
  // Loyalty discount: 5% after 10 orders, 10% after 50
  const loyaltyMultiplier = order.customerOrderCount > 50
    ? 0.10
    : order.customerOrderCount > 10
      ? 0.05
      : 0;

  // Holiday promotion takes precedence over loyalty
  if (order.holidayPromoApplied) {
    return order.total * 0.15;
  }

  return order.total * loyaltyMultiplier;
}
```

## Class Documentation

```typescript
/**
 * Connection pool for database operations.
 *
 * @remarks
 * Connections are lazily created and cached. Call {@link dispose}
 * to release all connections when shutting down.
 *
 * @example
 * ```ts
 * const pool = new ConnectionPool({ maxConnections: 10 });
 * const conn = await pool.acquire();
 * try {
 *   await conn.query('SELECT * FROM users');
 * } finally {
 *   pool.release(conn);
 * }
 * ```
 */
export class ConnectionPool implements Disposable {
  /**
   * Creates a new connection pool.
   * @param options - Pool configuration
   */
  constructor(options: PoolOptions) {}

  /**
   * Acquires a connection from the pool.
   * @returns A database connection
   * @throws {PoolExhaustedError} No connections available after timeout
   */
  async acquire(): Promise<Connection> {}

  /**
   * Releases a connection back to the pool.
   * @param connection - The connection to release
   */
  release(connection: Connection): void {}

  /**
   * Disposes all connections.
   * Called automatically when using `using`.
   */
  [Symbol.dispose](): void {}
}
```

## Constant and Enum Documentation

```typescript
/**
 * HTTP status codes used in API responses.
 *
 * @remarks
 * Only includes codes our API actually returns.
 */
export const HttpStatus = {
  /** Request succeeded */
  OK: 200,
  /** Resource created successfully */
  CREATED: 201,
  /** Request accepted, processing async */
  ACCEPTED: 202,
  /** Request has no content */
  NO_CONTENT: 204,
  /** Invalid request data */
  BAD_REQUEST: 400,
  /** Authentication required */
  UNAUTHORIZED: 401,
  /** Insufficient permissions */
  FORBIDDEN: 403,
  /** Resource not found */
  NOT_FOUND: 404,
  /** Server error */
  INTERNAL_SERVER_ERROR: 500,
} as const;
```

## Module Documentation

Place at top of file:

```typescript
/**
 * User authentication and session management.
 *
 * @remarks
 * This module handles user login, logout, and session validation.
 * Uses JWT tokens with 24-hour expiry.
 *
 * @see {@link auth/middleware} for Express middleware
 * @see {@link auth/strategies} for OAuth providers
 *
 * @packageDocumentation
 */

export * from './authenticate';
export * from './session';
export * from './tokens';
```

## Anti-Patterns

**Redundant documentation**:

```typescript
// Bad - adds no information
/**
 * Gets the user.
 * @param id - The id
 * @returns The user
 */
function getUser(id: string): User {}

// Good - adds context
/**
 * Retrieves user by ID from cache, falling back to database.
 *
 * @param id - UUID of the user
 * @returns User object, or undefined if not found
 * @throws {InvalidIdError} If ID is not a valid UUID
 */
function getUser(id: UserId): User | undefined {}
```

**Missing @throws**:

```typescript
// Bad - caller doesn't know this throws
function parseConfig(path: string): Config {
  const content = fs.readFileSync(path, 'utf-8'); // throws
  return JSON.parse(content); // throws
}

// Good - explicit about failure modes
/**
 * @throws {Error} File not found or not readable
 * @throws {SyntaxError} Invalid JSON
 */
function parseConfig(path: string): Config {}
```

**Stale documentation**:
Keep docs in sync with code. Wrong docs are worse than no docs.

## Tooling

- **TypeDoc**: Generate HTML docs from TSDoc
- **tsdoc.org**: Official TSDoc spec
- **eslint-plugin-tsdoc**: Lint TSDoc syntax
- **@microsoft/api-extractor**: Extract API reports
