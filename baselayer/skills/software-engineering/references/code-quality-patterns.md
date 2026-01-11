# Code Quality Patterns

Concrete examples for code quality standards.

## Type Safety Examples

**Stringly-typed vs Type-safe:**

```typescript
// Bad: stringly-typed state
type Status = string;

// Good: discriminated union
type Status = 'pending' | 'approved' | 'rejected';

// Better: type-safe with associated data
type Request =
  | { status: 'pending' }
  | { status: 'approved'; by: User; at: Date }
  | { status: 'rejected'; reason: string };
```

## Error Handling Examples

**Explicit error handling:**

```typescript
// Bad: ignoring errors
await saveUser(user);

// Good: explicit handling with Result type
const result = await saveUser(user);
if (result.type === 'error') {
  logger.error('Failed to save user', result.error);
  return { type: 'error', message: 'Could not save user' };
}
```

## Comment Examples

**Why vs What:**

```typescript
// Bad: describes what code does (obvious)
// Set user active to true
user.active = true;

// Good: explains why (non-obvious intent)
// Mark user active to enable login after email verification
user.active = true;
```

**Trade-off documentation:**

```typescript
// Using simple polling instead of WebSocket because:
// - Simpler to implement and maintain
// - Acceptable for current 5-minute update interval
// - Can migrate to WebSocket if requirements tighten
```

## Naming Conventions

| Category | Pattern | Examples |
|----------|---------|----------|
| Functions | Verbs describing action | `calculateTotal`, `validateEmail`, `fetchUser` |
| Variables | Nouns describing data | `userId`, `orderTotal`, `activeUsers` |
| Booleans | Questions | `isValid`, `hasPermission`, `canEdit` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_RETRIES`, `DEFAULT_TIMEOUT` |
| Types/Interfaces | PascalCase | `User`, `OrderRequest`, `AuthConfig` |

## Function Design Guidelines

**Size and complexity:**
- Do one thing well
- 10-30 lines typical, max 50
- 3 parameters ideal, max 5
- Pure when possible (same input = same output)

**Signs a function needs splitting:**
- Multiple levels of nesting
- Multiple responsibilities
- Hard to name clearly
- Hard to test in isolation

## Refactoring Commits

**Keep refactors separate from features:**

```bash
# Good: isolated refactoring commit
git commit -m "refactor: extract user validation logic"
git commit -m "feat: add email verification"

# Bad: mixed changes
git commit -m "feat: add email verification and refactor validation"
```

Separating commits enables easier review, safer reverts, and cleaner history.
