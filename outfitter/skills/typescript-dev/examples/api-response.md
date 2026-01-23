# Example: Typing API Responses with Validation

Demonstrates end-to-end type-safe API integration with runtime validation, error handling via Result types, and proper boundary validation.

## The Problem

API responses arrive as untyped JSON. TypeScript can't verify runtime data matches compile-time types. Common failures:

- Backend changes field names
- Null/undefined where expected
- Wrong data types
- Missing required fields
- Extra fields breaking assumptions

## Full Implementation

```typescript
// types.ts - Domain types
type User = {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly role: 'admin' | 'user' | 'guest';
  readonly createdAt: Date;
};

type Post = {
  readonly id: string;
  readonly title: string;
  readonly content: string;
  readonly authorId: string;
  readonly publishedAt: Date | null;
};

// result.ts - Result type for explicit error handling
type Result<T, E = Error> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

// errors.ts - Specific error types
type ApiError =
  | { readonly type: 'not-found'; readonly resource: string; readonly id: string }
  | { readonly type: 'network'; readonly message: string; readonly status?: number }
  | { readonly type: 'validation'; readonly details: string; readonly field?: string }
  | { readonly type: 'unauthorized'; readonly message: string }
  | { readonly type: 'server'; readonly message: string; readonly status: number };

// guards.ts - Type guards for runtime validation
function isUser(value: unknown): value is User {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const obj = value as Record<string, unknown>;

  return (
    typeof obj.id === 'string' &&
    typeof obj.email === 'string' &&
    typeof obj.name === 'string' &&
    (obj.role === 'admin' || obj.role === 'user' || obj.role === 'guest') &&
    obj.createdAt instanceof Date
  );
}

function isPost(value: unknown): value is Post {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const obj = value as Record<string, unknown>;

  return (
    typeof obj.id === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.content === 'string' &&
    typeof obj.authorId === 'string' &&
    (obj.publishedAt === null || obj.publishedAt instanceof Date)
  );
}

// validators.ts - Validation with helpful error messages
function validateUser(data: unknown): Result<User, ApiError> {
  if (typeof data !== 'object' || data === null) {
    return {
      ok: false,
      error: {
        type: 'validation',
        details: 'Expected object, got ' + typeof data
      }
    };
  }

  const obj = data as Record<string, unknown>;

  // Validate each field with specific error messages
  if (typeof obj.id !== 'string') {
    return {
      ok: false,
      error: {
        type: 'validation',
        details: 'User ID must be string',
        field: 'id'
      }
    };
  }

  if (typeof obj.email !== 'string' || !obj.email.includes('@')) {
    return {
      ok: false,
      error: {
        type: 'validation',
        details: 'Invalid email format',
        field: 'email'
      }
    };
  }

  if (typeof obj.name !== 'string' || obj.name.length === 0) {
    return {
      ok: false,
      error: {
        type: 'validation',
        details: 'Name must be non-empty string',
        field: 'name'
      }
    };
  }

  const validRoles = ['admin', 'user', 'guest'] as const;
  if (!validRoles.includes(obj.role as string)) {
    return {
      ok: false,
      error: {
        type: 'validation',
        details: `Role must be one of: ${validRoles.join(', ')}`,
        field: 'role'
      }
    };
  }

  // Parse date string to Date object
  const createdAt = typeof obj.createdAt === 'string'
    ? new Date(obj.createdAt)
    : obj.createdAt;

  if (!(createdAt instanceof Date) || isNaN(createdAt.getTime())) {
    return {
      ok: false,
      error: {
        type: 'validation',
        details: 'Invalid date format',
        field: 'createdAt'
      }
    };
  }

  // All validations passed - safe to construct User
  return {
    ok: true,
    value: {
      id: obj.id,
      email: obj.email,
      name: obj.name,
      role: obj.role as 'admin' | 'user' | 'guest',
      createdAt
    }
  };
}

// api.ts - API client with proper error handling
async function fetchUser(id: string): Promise<Result<User, ApiError>> {
  try {
    const response = await fetch(`/api/users/${id}`);

    // Handle HTTP errors
    if (!response.ok) {
      if (response.status === 404) {
        return {
          ok: false,
          error: {
            type: 'not-found',
            resource: 'user',
            id
          }
        };
      }

      if (response.status === 401 || response.status === 403) {
        return {
          ok: false,
          error: {
            type: 'unauthorized',
            message: 'Authentication required'
          }
        };
      }

      if (response.status >= 500) {
        return {
          ok: false,
          error: {
            type: 'server',
            message: response.statusText,
            status: response.status
          }
        };
      }

      return {
        ok: false,
        error: {
          type: 'network',
          message: response.statusText,
          status: response.status
        }
      };
    }

    // Parse response - treat as unknown
    const data: unknown = await response.json();

    // Validate runtime data
    return validateUser(data);

  } catch (error) {
    // Network errors, JSON parse errors, etc.
    return {
      ok: false,
      error: {
        type: 'network',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
}

// Batch fetching with proper error aggregation
async function fetchUsers(ids: readonly string[]): Promise<Result<readonly User[], ApiError>> {
  const results = await Promise.all(ids.map(fetchUser));

  // Collect all errors
  const errors = results.filter((r): r is { ok: false; error: ApiError } => !r.ok);

  if (errors.length > 0) {
    // Return first error (or aggregate them)
    return errors[0];
  }

  // Extract all successful values
  const users = results
    .filter((r): r is { ok: true; value: User } => r.ok)
    .map(r => r.value);

  return { ok: true, value: users };
}

// component.tsx - React component with proper error handling
function UserProfile({ userId }: { userId: string }) {
  const [state, setState] = React.useState<
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'success'; user: User }
    | { status: 'error'; error: ApiError }
  >({ status: 'idle' });

  React.useEffect(() => {
    setState({ status: 'loading' });

    fetchUser(userId).then(result => {
      if (result.ok) {
        setState({ status: 'success', user: result.value });
      } else {
        setState({ status: 'error', error: result.error });
      }
    });
  }, [userId]);

  switch (state.status) {
    case 'idle':
      return <div>Ready</div>;

    case 'loading':
      return <div>Loading...</div>;

    case 'success':
      return (
        <div>
          <h1>{state.user.name}</h1>
          <p>{state.user.email}</p>
          <p>Role: {state.user.role}</p>
          <p>Joined: {state.user.createdAt.toLocaleDateString()}</p>
        </div>
      );

    case 'error':
      return <ErrorDisplay error={state.error} />;

    default:
      return assertNever(state);
  }
}

function ErrorDisplay({ error }: { error: ApiError }) {
  switch (error.type) {
    case 'not-found':
      return <div>User {error.id} not found</div>;

    case 'network':
      return <div>Network error: {error.message}</div>;

    case 'validation':
      return (
        <div>
          Validation error: {error.details}
          {error.field && ` (field: ${error.field})`}
        </div>
      );

    case 'unauthorized':
      return <div>Unauthorized: {error.message}</div>;

    case 'server':
      return <div>Server error ({error.status}): {error.message}</div>;

    default:
      return assertNever(error);
  }
}

function assertNever(value: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(value)}`);
}
```

## Key Patterns

1. **Unknown at boundaries**: All external data starts as `unknown`
2. **Explicit validation**: Type guards + validators check runtime data
3. **Result types**: All errors visible in type signatures
4. **Discriminated errors**: Specific error types for different failure modes
5. **Exhaustive handling**: `assertNever` ensures all cases covered

## Testing Strategy

```typescript
// __tests__/api.test.ts
import { describe, it, expect, vi } from 'vitest';

describe('fetchUser', () => {
  it('returns user on success', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 'user-1',
        email: 'user@example.com',
        name: 'Test User',
        role: 'user',
        createdAt: '2024-01-01T00:00:00Z'
      })
    });

    const result = await fetchUser('user-1');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.id).toBe('user-1');
      expect(result.value.createdAt).toBeInstanceOf(Date);
    }
  });

  it('returns not-found error for 404', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found'
    });

    const result = await fetchUser('user-1');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.type).toBe('not-found');
      expect(result.error.id).toBe('user-1');
    }
  });

  it('returns validation error for invalid data', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 'user-1',
        email: 'not-an-email', // Invalid
        name: 'Test User',
        role: 'user',
        createdAt: '2024-01-01T00:00:00Z'
      })
    });

    const result = await fetchUser('user-1');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.type).toBe('validation');
      expect(result.error.field).toBe('email');
    }
  });
});
```

## Benefits

- **Compile-time safety**: TypeScript catches type errors
- **Runtime safety**: Validation catches bad data
- **Explicit errors**: All failure modes visible in types
- **Easy debugging**: Specific error types with context
- **Testable**: Pure functions, easy to mock
- **Maintainable**: Changes to API surface in type errors

## Common Pitfalls

**DON'T** trust type assertions:

```typescript
// ❌ Dangerous - no validation
const user = (await response.json()) as User;
```

**DON'T** use `any`:

```typescript
// ❌ Loses all type safety
const data: any = await response.json();
```

**DON'T** throw errors for expected failures:

```typescript
// ❌ Error not visible in return type
if (!response.ok) {
  throw new Error('Request failed');
}
```

**DO** validate at boundaries, use Result types, and handle all error cases exhaustively.
