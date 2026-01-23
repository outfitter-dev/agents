# Advanced TypeScript Types

Deep dive into type utilities, guards, and template literal patterns.

## Type Utilities

### DeepReadonly

```typescript
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? DeepReadonly<T[P]>
    : T[P];
};

type User = {
  id: string;
  profile: {
    email: string;
    settings: { theme: string };
  };
};

type ImmutableUser = DeepReadonly<User>;
// All nested properties are readonly
```

### Precise Picks

```typescript
// ❌ Imprecise
type UserSummary = Partial<User>;

// ✅ Precise — only what's needed
type UserSummary = DeepReadonly<Pick<User, 'id' | 'email'>>;
```

### NonNullable Refinement

```typescript
type SafeString = NonNullable<string | null | undefined>; // string

type NonNullableArray<T> = Array<NonNullable<T>>;
```

### Option Type

```typescript
type Option<T> =
  | { readonly some: true; readonly value: T }
  | { readonly some: false };

function fromNullable<T>(value: T | null | undefined): Option<T> {
  if (value === null || value === undefined) {
    return { some: false };
  }
  return { some: true, value };
}

function map<T, U>(option: Option<T>, fn: (value: T) => U): Option<U> {
  if (!option.some) return option;
  return { some: true, value: fn(option.value) };
}

function flatMap<T, U>(option: Option<T>, fn: (value: T) => Option<U>): Option<U> {
  if (!option.some) return option;
  return fn(option.value);
}

function getOrElse<T>(option: Option<T>, defaultValue: T): T {
  return option.some ? option.value : defaultValue;
}
```

## Type Guards

### User-Defined Type Guards

```typescript
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString);
}

function process(data: unknown) {
  if (isStringArray(data)) {
    return data.map(s => s.toUpperCase());
  }
}
```

### Assertion Functions

```typescript
function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== 'string') {
    throw new TypeError('Value must be a string');
  }
}

function process(data: unknown) {
  assertIsString(data);
  return data.toUpperCase(); // TypeScript knows it's string
}
```

### Object Shape Guards

```typescript
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value && typeof value.id === 'string' &&
    'email' in value && typeof value.email === 'string' &&
    'name' in value && typeof value.name === 'string'
  );
}
```

### Discriminated Union Guards

```typescript
type Action =
  | { type: 'add'; value: number }
  | { type: 'remove' };

function isAddAction(action: Action): action is { type: 'add'; value: number } {
  return action.type === 'add';
}

// TS 5.5+ infers this automatically
function isAddActionInferred(action: Action) {
  return action.type === 'add';
}
```

## Template Literal Types

### Basic Patterns

```typescript
type Route = `/${string}`;
type UserRoute = `/user/${string}`;
type ApiRoute = `/api/v${number}/${string}`;

const validRoute: Route = '/home'; // ✅
// const invalid: Route = 'home'; // ❌ Missing leading slash
```

### String Manipulation

```typescript
// Built-in utilities
type Upper = Uppercase<'hello'>; // 'HELLO'
type Lower = Lowercase<'HELLO'>; // 'hello'
type Cap = Capitalize<'hello'>; // 'Hello'
type Uncap = Uncapitalize<'Hello'>; // 'hello'
```

### Pattern Extraction

```typescript
type ExtractRouteParams<T extends string> =
  T extends `${string}:${infer Param}/${infer Rest}`
    ? Param | ExtractRouteParams<`/${Rest}`>
    : T extends `${string}:${infer Param}`
    ? Param
    : never;

type Params = ExtractRouteParams<'/user/:id/post/:postId'>;
// 'id' | 'postId'
```

### Type-Safe Route Builders

```typescript
type RouteParams<T extends string> =
  T extends `${infer Start}:${infer Param}/${infer Rest}`
    ? { [K in Param | keyof RouteParams<Rest>]: string }
    : T extends `${infer Start}:${infer Param}`
    ? { [K in Param]: string }
    : {};

function buildRoute<T extends string>(
  path: T,
  params: RouteParams<T>
): string {
  let result = path as string;
  for (const [key, value] of Object.entries(params)) {
    result = result.replace(`:${key}`, value);
  }
  return result;
}

buildRoute('/user/:id/post/:postId', { id: '123', postId: '456' }); // ✅
// buildRoute('/user/:id', { postId: '456' }); // ❌ Type error
```

### CSS-in-JS Type Safety

```typescript
type CSSProperty = 'margin' | 'padding' | 'border';
type CSSDirection = 'Top' | 'Right' | 'Bottom' | 'Left';
type CSSDirectionalProperty = `${CSSProperty}${CSSDirection}`;
// 'marginTop' | 'marginRight' | ... | 'borderLeft'

const styles: Partial<Record<CSSDirectionalProperty, string>> = {
  marginTop: '10px',
  paddingLeft: '5px'
};
```

## Builder Pattern

```typescript
class UserBuilder {
  private constructor(private readonly data: Partial<User>) {}

  static create(): UserBuilder {
    return new UserBuilder({});
  }

  withId(id: string): this {
    return new UserBuilder({ ...this.data, id }) as this;
  }

  withEmail(email: string): this {
    return new UserBuilder({ ...this.data, email }) as this;
  }

  withName(name: string): this {
    return new UserBuilder({ ...this.data, name }) as this;
  }

  build(): User {
    const { id, email, name } = this.data;

    if (!id || !email || !name) {
      throw new Error('Missing required user fields');
    }

    return { id, email, name };
  }
}

const user = UserBuilder.create()
  .withId('123')
  .withEmail('user@example.com')
  .withName('John Doe')
  .build();
```

## Indexed Access Safety

With `noUncheckedIndexedAccess: true`:

```typescript
const users: User[] = getUsers();
const first = users[0]; // Type: User | undefined

// Must handle undefined
if (first !== undefined) {
  processUser(first);
}

// Or use optional chaining
processUser(first?.id);

// Record access
const config: Record<string, string> = getConfig();
const apiKey = config.apiKey; // Type: string | undefined
```

## Conditional Types

```typescript
// Extract return type
type ReturnOf<T> = T extends (...args: any[]) => infer R ? R : never;

// Extract promise value
type Awaited<T> = T extends Promise<infer U> ? Awaited<U> : T;

// Filter union types
type FilterString<T> = T extends string ? T : never;
type StringsOnly = FilterString<string | number | boolean>; // string

// Distributive conditional
type ToArray<T> = T extends any ? T[] : never;
type Result = ToArray<string | number>; // string[] | number[]
```
