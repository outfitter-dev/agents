# Deep Dive: Branded Types

Branded types (also called nominal types or opaque types) use TypeScript's structural type system to create compile-time distinctions between values that have the same runtime representation.

## The Core Problem

TypeScript uses structural typing - two types are compatible if their structure matches:

```typescript
type UserId = string;
type ProductId = string;

const userId: UserId = 'user-123';
const productId: ProductId = 'prod-456';

// These are structurally identical, so TypeScript allows this:
const oops: UserId = productId; // No error!

function getUser(id: UserId): User { /* ... */ }
getUser(productId); // Compiles! Runtime bug waiting to happen
```

This is dangerous because:
- Wrong IDs passed to functions
- Security boundaries violated (sanitized vs unsanitized strings)
- Domain concepts mixed (currencies, units, coordinates)
- Validation bypassed

## The Brand Technique

Create a compile-time-only marker that makes types structurally different:

```typescript
declare const __brand: unique symbol;

type Brand<T, TBrand extends string> = T & {
  readonly [__brand]: TBrand;
};
```

Key elements:
- `unique symbol` - creates a globally unique type that can't be recreated
- `declare` - no runtime code generated
- Intersection `T &` - preserves the base type's methods
- `readonly` - prevents modification
- `TBrand extends string` - human-readable brand name

## Basic Usage

```typescript
type UserId = Brand<string, 'UserId'>;
type ProductId = Brand<string, 'ProductId'>;

// Smart constructors - only way to create branded values
function createUserId(value: string): UserId {
  if (!/^user-\d+$/.test(value)) {
    throw new TypeError(`Invalid user ID: ${value}`);
  }
  return value as UserId;
}

function createProductId(value: string): ProductId {
  if (!/^prod-\d+$/.test(value)) {
    throw new TypeError(`Invalid product ID: ${value}`);
  }
  return value as ProductId;
}

// Now TypeScript prevents mixing
const userId = createUserId('user-123');
const productId = createProductId('prod-456');

// ❌ Type error: ProductId not assignable to UserId
// getUser(productId);

// ✅ Correct
getUser(userId);
```

## Advanced Patterns

### Multi-Level Branding

Combine multiple brands for hierarchical validation:

```typescript
type ValidatedString = Brand<string, 'Validated'>;
type SanitizedHtml = Brand<ValidatedString, 'SanitizedHtml'>;

function validate(input: string): ValidatedString {
  if (input.trim().length === 0) {
    throw new TypeError('Empty string');
  }
  return input as ValidatedString;
}

function sanitizeHtml(input: ValidatedString): SanitizedHtml {
  // Sanitization logic - knows input is already validated
  return escapeHtml(input) as SanitizedHtml;
}

// Must go through both validations:
const raw = '<script>alert("xss")</script>';
const validated = validate(raw);
const safe = sanitizeHtml(validated);

// This is now safe - type guarantees sanitization happened
document.body.innerHTML = safe;
```

### Numeric Brands

Prevent mixing different numeric units:

```typescript
type Meters = Brand<number, 'Meters'>;
type Feet = Brand<number, 'Feet'>;
type Seconds = Brand<number, 'Seconds'>;

function meters(value: number): Meters {
  return value as Meters;
}

function feet(value: number): Feet {
  return value as Feet;
}

function seconds(value: number): Seconds {
  return value as Seconds;
}

// Type-safe conversions
function feetToMeters(ft: Feet): Meters {
  return meters(ft * 0.3048);
}

// Arithmetic requires explicit handling
function addMeters(a: Meters, b: Meters): Meters {
  return meters(a + b); // Safe - same units
}

// ❌ Can't mix units
// const distance = meters(10) + feet(5); // Type error!

// ✅ Must convert first
const distance = addMeters(meters(10), feetToMeters(feet(5)));
```

### Security Boundaries

Use brands to track sanitization/validation:

```typescript
type SanitizedHtml = Brand<string, 'SanitizedHtml'>;
type SafeSql = Brand<string, 'SafeSql'>;
type ValidatedEmail = Brand<string, 'ValidatedEmail'>;
type HashedPassword = Brand<string, 'HashedPassword'>;

// XSS prevention
function sanitizeHtml(raw: string): SanitizedHtml {
  return DOMPurify.sanitize(raw) as SanitizedHtml;
}

function renderHtml(html: SanitizedHtml): void {
  // Type proves sanitization happened
  element.innerHTML = html;
}

// SQL injection prevention
function prepareQuery(template: string, ...params: unknown[]): SafeSql {
  // Parameterized query logic
  return parameterize(template, params) as SafeSql;
}

function executeQuery(sql: SafeSql): Promise<unknown> {
  // Type proves query is safe
  return db.execute(sql);
}

// Email validation
function validateEmail(input: string): ValidatedEmail {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(input)) {
    throw new TypeError('Invalid email');
  }
  return input as ValidatedEmail;
}

// Password hashing
async function hashPassword(plain: string): Promise<HashedPassword> {
  const hashed = await bcrypt.hash(plain, 10);
  return hashed as HashedPassword;
}

// Can't accidentally use plain password in database
function saveUser(email: ValidatedEmail, password: HashedPassword): Promise<void> {
  return db.insert({ email, password });
}

// ❌ This won't compile:
// saveUser('user@example.com', 'plain-password');

// ✅ Must validate and hash:
const email = validateEmail('user@example.com');
const hashed = await hashPassword('plain-password');
await saveUser(email, hashed);
```

### Refinement Types

Brands encode runtime properties in types:

```typescript
type NonEmptyString = Brand<string, 'NonEmpty'>;
type PositiveNumber = Brand<number, 'Positive'>;
type ValidUrl = Brand<string, 'ValidUrl'>;
type HexColor = Brand<string, 'HexColor'>;

function nonEmpty(value: string): NonEmptyString {
  if (value.length === 0) {
    throw new TypeError('String must not be empty');
  }
  return value as NonEmptyString;
}

function positive(value: number): PositiveNumber {
  if (value <= 0) {
    throw new TypeError('Number must be positive');
  }
  return value as PositiveNumber;
}

function validateUrl(value: string): ValidUrl {
  try {
    new URL(value);
    return value as ValidUrl;
  } catch {
    throw new TypeError('Invalid URL');
  }
}

function hexColor(value: string): HexColor {
  if (!/^#[0-9A-Fa-f]{6}$/.test(value)) {
    throw new TypeError('Invalid hex color');
  }
  return value as HexColor;
}

// Functions can require refined types
function setBackgroundColor(color: HexColor): void {
  document.body.style.backgroundColor = color;
}

// ❌ Can't pass unvalidated string
// setBackgroundColor('#gg0000'); // Type error!

// ✅ Must validate first
const color = hexColor('#ff0000');
setBackgroundColor(color);
```

### Phantom Type Parameters

Use type parameters to track state:

```typescript
type Status = 'draft' | 'published' | 'archived';

type Article<S extends Status = Status> = {
  readonly id: string;
  readonly title: string;
  readonly content: string;
  readonly status: S;
};

type DraftArticle = Article<'draft'>;
type PublishedArticle = Article<'published'>;
type ArchivedArticle = Article<'archived'>;

// Functions that only work on specific states
function publish(article: DraftArticle): PublishedArticle {
  return {
    ...article,
    status: 'published'
  };
}

function archive(article: PublishedArticle): ArchivedArticle {
  return {
    ...article,
    status: 'archived'
  };
}

// Type system prevents invalid transitions
const draft: DraftArticle = {
  id: '1',
  title: 'Draft',
  content: 'Content',
  status: 'draft'
};

const published = publish(draft);

// ❌ Can't publish already published article
// const republished = publish(published); // Type error!

// ✅ Can only archive published articles
const archived = archive(published);
```

## Result Types with Brands

Combine with Result pattern for validated parsing:

```typescript
type ParseError = {
  readonly message: string;
  readonly input: string;
};

type Result<T, E = Error> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

type Email = Brand<string, 'Email'>;

function parseEmail(input: string): Result<Email, ParseError> {
  const trimmed = input.trim();

  if (trimmed.length === 0) {
    return {
      ok: false,
      error: { message: 'Email cannot be empty', input }
    };
  }

  if (!trimmed.includes('@')) {
    return {
      ok: false,
      error: { message: 'Email must contain @', input }
    };
  }

  const parts = trimmed.split('@');
  if (parts.length !== 2) {
    return {
      ok: false,
      error: { message: 'Email must have exactly one @', input }
    };
  }

  const [local, domain] = parts;
  if (local.length === 0 || domain.length === 0) {
    return {
      ok: false,
      error: { message: 'Email parts cannot be empty', input }
    };
  }

  if (!domain.includes('.')) {
    return {
      ok: false,
      error: { message: 'Domain must contain a dot', input }
    };
  }

  return { ok: true, value: trimmed as Email };
}

// Usage with error handling
const result = parseEmail('user@example.com');

if (result.ok) {
  sendWelcomeEmail(result.value); // result.value is Email
} else {
  console.error(result.error.message);
}
```

## Testing Strategy

Branded types are zero-cost abstractions - test the smart constructors:

```typescript
import { describe, it, expect } from 'vitest';

describe('createUserId', () => {
  it('accepts valid user IDs', () => {
    expect(() => createUserId('user-123')).not.toThrow();
    expect(() => createUserId('user-0')).not.toThrow();
  });

  it('rejects invalid formats', () => {
    expect(() => createUserId('123')).toThrow('Invalid user ID');
    expect(() => createUserId('user-abc')).toThrow('Invalid user ID');
    expect(() => createUserId('prod-123')).toThrow('Invalid user ID');
  });

  it('rejects empty strings', () => {
    expect(() => createUserId('')).toThrow();
  });
});

describe('parseEmail', () => {
  it('accepts valid emails', () => {
    const result = parseEmail('user@example.com');
    expect(result.ok).toBe(true);
  });

  it('rejects emails without @', () => {
    const result = parseEmail('userexample.com');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toContain('@');
    }
  });

  it('rejects empty emails', () => {
    const result = parseEmail('');
    expect(result.ok).toBe(false);
  });
});
```

## Library Integration

Many TypeScript libraries use brands internally:

**Effect**: Refined types with brands

```typescript
import { Brand } from 'effect';

type PositiveInt = number & Brand.Brand<'PositiveInt'>;

const PositiveInt = Brand.refined<PositiveInt>(
  (n) => Number.isInteger(n) && n > 0,
  (n) => Brand.error(`Expected positive integer, got ${n}`)
);
```

**io-ts**: Runtime type validation

```typescript
import * as t from 'io-ts';

const Email = t.brand(
  t.string,
  (s): s is t.Branded<string, { readonly Email: unique symbol }> =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s),
  'Email'
);
```

## Common Patterns

### API Response Types

```typescript
type ApiResponse<T> = Brand<T, 'ApiResponse'>;

async function fetchApi<T>(url: string): Promise<ApiResponse<T>> {
  const response = await fetch(url);
  const data = await response.json();
  // Validation happens here
  return data as ApiResponse<T>;
}
```

### File Paths

```typescript
type AbsolutePath = Brand<string, 'AbsolutePath'>;
type RelativePath = Brand<string, 'RelativePath'>;

function absolute(path: string): AbsolutePath {
  if (!path.startsWith('/')) {
    throw new TypeError('Path must be absolute');
  }
  return path as AbsolutePath;
}

function relative(path: string): RelativePath {
  if (path.startsWith('/')) {
    throw new TypeError('Path must be relative');
  }
  return path as RelativePath;
}

function readFile(path: AbsolutePath): Promise<string> {
  // Type guarantees absolute path
  return fs.readFile(path, 'utf-8');
}
```

### Temporal Types

```typescript
type IsoDateString = Brand<string, 'IsoDateString'>;
type UnixTimestamp = Brand<number, 'UnixTimestamp'>;

function isoDate(value: string): IsoDateString {
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    throw new TypeError('Invalid ISO date');
  }
  return value as IsoDateString;
}

function unixTimestamp(value: number): UnixTimestamp {
  if (value < 0 || !Number.isInteger(value)) {
    throw new TypeError('Invalid Unix timestamp');
  }
  return value as UnixTimestamp;
}
```

## Performance

Brands are zero-cost - they compile to nothing:

```typescript
// TypeScript
type UserId = Brand<string, 'UserId'>;
const id: UserId = 'user-123' as UserId;

// Compiled JavaScript
const id = 'user-123';
```

Runtime validation only happens in smart constructors, which you control.

## Migration Strategy

1. **Identify primitives representing domain concepts**
   - IDs, emails, URLs, amounts, coordinates, etc.

2. **Create brands incrementally**
   - Start with most error-prone types (IDs, security boundaries)
   - Add brands file-by-file or feature-by-feature

3. **Write smart constructors**
   - Validation logic in one place
   - Easy to test

4. **Update function signatures**
   - Change parameters to branded types
   - TypeScript will show all call sites needing updates

5. **Fix call sites**
   - Add smart constructor calls
   - Runtime errors become compile errors

## Limitations

**Can be circumvented**: Type assertions bypass brands

```typescript
// ❌ Don't do this
const fakeId = 'invalid' as UserId;
```

**Solution**: Use linting rules, code review, smart constructors as single entry point

**Verbose**: Every usage needs smart constructor

```typescript
// Can feel repetitive
const id1 = createUserId('user-1');
const id2 = createUserId('user-2');
const id3 = createUserId('user-3');
```

**Solution**: Worth it for safety. Consider builder patterns or factories for complex cases.

## Summary

Branded types provide compile-time safety for domain concepts without runtime cost. Use them to:

- Prevent mixing similar primitives (IDs, units, currencies)
- Track validation/sanitization state (security)
- Encode runtime invariants in types (non-empty, positive)
- Make illegal states unrepresentable

Combined with smart constructors, Result types, and exhaustive pattern matching, brands are essential for type-safe TypeScript at scale.
