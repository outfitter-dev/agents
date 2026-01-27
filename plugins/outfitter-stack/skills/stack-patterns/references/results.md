# Result Utilities

Operations for working with `Result<T, E>` from `better-result`.

## Creating Results

```typescript
import { Result } from "@outfitter/contracts";

// Success
const ok = Result.ok({ name: "Alice", id: "1" });

// Failure
const err = Result.err(new NotFoundError("user", "123"));
```

## Checking Results

```typescript
// Boolean check
if (result.isOk()) {
  console.log(result.value);  // TypeScript knows type
}

if (result.isErr()) {
  console.log(result.error);  // TypeScript knows error type
}
```

## Accessing Values

```typescript
// Safe access (only after isOk check)
if (result.isOk()) {
  const user = result.value;
}

// Unsafe access (throws if error)
const user = result.unwrap();  // Throws if err!

// With default
const user = result.unwrapOr(defaultUser);

// With default factory
const user = result.unwrapOrElse(() => createDefaultUser());
```

## Pattern Matching

```typescript
const message = result.match({
  ok: (user) => `Found ${user.name}`,
  err: (error) => `Error: ${error.message}`,
});
```

## Transforming Results

### Map (transform success value)

```typescript
const nameResult = result.map((user) => user.name);
// Result<string, Error>
```

### MapErr (transform error)

```typescript
const mappedResult = result.mapErr((error) => new WrappedError(error));
// Result<User, WrappedError>
```

### FlatMap / AndThen (chain operations)

```typescript
const orderResult = getUserResult.flatMap((user) => getOrders(user.id));
// Result<Orders, UserError | OrderError>
```

## Combining Results

### combine2, combine3, etc.

Combine multiple results into a tuple:

```typescript
import { combine2, combine3 } from "@outfitter/contracts";

const result = combine2(userResult, orderResult);
// Result<[User, Order], UserError | OrderError>

if (result.isOk()) {
  const [user, order] = result.value;
}
```

### combineAll

Combine an array of results:

```typescript
import { combineAll } from "@outfitter/contracts";

const results = await Promise.all(ids.map((id) => getUser(id)));
const combined = combineAll(results);
// Result<User[], Error>
```

### combineObject

Combine an object of results:

```typescript
import { combineObject } from "@outfitter/contracts";

const combined = combineObject({
  user: userResult,
  orders: ordersResult,
  settings: settingsResult,
});
// Result<{ user: User; orders: Order[]; settings: Settings }, Error>
```

## Error Recovery

### OrElse (try alternative on error)

```typescript
const result = primaryResult.orElse(() => fallbackResult);
```

### Recover (convert error to success)

```typescript
const result = userResult.recover((error) => {
  if (error._tag === "NotFoundError") {
    return Result.ok(defaultUser);
  }
  return Result.err(error);
});
```

## Async Patterns

### Sequential execution

```typescript
const result = await getUser(id)
  .then((r) => r.isOk() ? getOrders(r.value.id) : Promise.resolve(r));
```

### With async/await

```typescript
async function getUserWithOrders(id: string): Promise<Result<UserWithOrders, Error>> {
  const userResult = await getUser(id);
  if (userResult.isErr()) return userResult;

  const ordersResult = await getOrders(userResult.value.id);
  if (ordersResult.isErr()) return ordersResult;

  return Result.ok({
    user: userResult.value,
    orders: ordersResult.value,
  });
}
```

## Validation Helper

The `createValidator` utility returns `Result`:

```typescript
import { createValidator } from "@outfitter/contracts";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  age: z.number().int().positive(),
});

const validate = createValidator(schema);

const result = validate({ email: "test@example.com", age: 25 });
// Result<{ email: string; age: number }, ValidationError>
```

## Common Patterns

### Early return on error

```typescript
const handler: Handler<Input, Output, Error> = async (input, ctx) => {
  const validateResult = validate(input);
  if (validateResult.isErr()) return validateResult;

  const userResult = await getUser(validateResult.value.userId);
  if (userResult.isErr()) return userResult;

  const orderResult = await createOrder(userResult.value);
  if (orderResult.isErr()) return orderResult;

  return Result.ok(orderResult.value);
};
```

### Collect all errors

```typescript
const errors: ValidationError[] = [];

if (!input.name) errors.push(new ValidationError("Name required"));
if (!input.email) errors.push(new ValidationError("Email required"));

if (errors.length > 0) {
  return Result.err(new ValidationError("Multiple errors", { errors }));
}
```

### Wrap throwing functions

```typescript
function wrapThrowable<T>(fn: () => T): Result<T, InternalError> {
  try {
    return Result.ok(fn());
  } catch (error) {
    return Result.err(new InternalError("Unexpected error", { cause: error }));
  }
}

async function wrapAsync<T>(fn: () => Promise<T>): Promise<Result<T, InternalError>> {
  try {
    return Result.ok(await fn());
  } catch (error) {
    return Result.err(new InternalError("Unexpected error", { cause: error }));
  }
}
```
