# Workflow: Build Type-Safe Module

Create a new TypeScript module with strict typing from the start.

<when_to_use>

- Creating a new module/package
- Starting a feature with clean types
- Building reusable library code
- Setting up type-safe foundations

</when_to_use>

<required_reading>

**Read these reference files:**
1. references/tsdoc-patterns.md

</required_reading>

<prerequisites>

- Project with TypeScript configured
- Strict mode enabled (see `workflows/migrate-strict.md` if not)

</prerequisites>

<process>

## Step 1: Verify Strict Config

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true
  }
}
```

## Step 2: Define Types First

Before writing implementation, define the types:

```typescript
// types.ts

/**
 * User domain entity.
 * @remarks All fields are readonly to prevent mutation.
 */
export interface User {
  readonly id: UserId;
  readonly email: Email;
  readonly name: string;
  readonly createdAt: Date;
}

/**
 * Branded type for user IDs.
 * Prevents mixing with other string IDs.
 */
export type UserId = Brand<string, 'UserId'>;

/**
 * Result of user operations.
 */
export type UserResult<T> = Result<T, UserError>;

/**
 * Discriminated union of user errors.
 */
export type UserError =
  | { readonly type: 'not_found'; readonly userId: UserId }
  | { readonly type: 'validation'; readonly field: string; readonly message: string }
  | { readonly type: 'duplicate_email'; readonly email: Email };
```

## Step 3: Create Branded Types

```typescript
// brand.ts

declare const __brand: unique symbol;

/**
 * Branded type utility.
 * Creates nominal types from structural primitives.
 */
export type Brand<T, B extends string> = T & { readonly [__brand]: B };

/**
 * Create a branded UserId.
 * @throws TypeError if format is invalid.
 */
export function createUserId(value: string): UserId {
  if (!/^usr_[a-z0-9]{12}$/.test(value)) {
    throw new TypeError(`Invalid UserId format: ${value}`);
  }
  return value as UserId;
}
```

## Step 4: Implement with Type Safety

```typescript
// user-service.ts
import type { User, UserId, UserResult, UserError } from './types';
import { Result } from './result';

/**
 * User service for CRUD operations.
 */
export class UserService {
  /**
   * Get user by ID.
   * @param id - User ID to look up
   * @returns User if found, NotFound error otherwise
   */
  async getUser(id: UserId): Promise<UserResult<User>> {
    const user = await this.repository.findById(id);

    if (!user) {
      return Result.err({ type: 'not_found', userId: id });
    }

    return Result.ok(user);
  }
}
```

## Step 5: Add TSDoc Documentation

```typescript
/**
 * Create a new user in the system.
 *
 * @param input - User creation input (validated externally)
 * @returns Created user with generated ID
 *
 * @throws Never - all errors returned as Result
 *
 * @example
 * ```typescript
 * const result = await userService.createUser({
 *   email: 'user@example.com',
 *   name: 'John Doe',
 * });
 *
 * if (result.ok) {
 *   console.log('Created:', result.value.id);
 * } else {
 *   console.error('Failed:', result.error.type);
 * }
 * ```
 */
export async function createUser(input: CreateUserInput): Promise<UserResult<User>>
```

## Step 6: Export Cleanly

```typescript
// index.ts - Public API

// Export types (type-only imports in consumers)
export type { User, UserId, UserError, UserResult } from './types';

// Export runtime values
export { UserService } from './user-service';
export { createUserId } from './brand';
```

## Step 7: Verify

```bash
# Type check
tsc --noEmit

# No any types
rg ":\s*any" src/my-module/

# All exports documented
# (Manual check: hover over exports, verify TSDoc appears)
```

</process>

<module_structure>

```
src/my-module/
├── index.ts          # Public exports only
├── types.ts          # Type definitions
├── brand.ts          # Branded type utilities
├── result.ts         # Result type (if not using library)
├── my-service.ts     # Implementation
└── __tests__/
    └── my-service.test.ts
```

</module_structure>

<anti_patterns>

Avoid:
- Implementing before defining types
- Using `any` as placeholder
- Exporting internal implementation details
- Missing TSDoc on public API
- Mutable types without reason

</anti_patterns>

<success_criteria>

This workflow is complete when:

- [ ] Strict TypeScript config enabled
- [ ] Types defined before implementation
- [ ] Branded types for domain concepts
- [ ] Result types for fallible operations
- [ ] TSDoc on all public exports
- [ ] Clean index.ts with explicit exports
- [ ] No `any` types
- [ ] Type check passes

</success_criteria>

<next_steps>

- Add validation: `workflows/add-zod-validation.md`
- Add Result types: `workflows/add-result-types.md`
- Write type tests: `workflows/write-type-tests.md`

</next_steps>
