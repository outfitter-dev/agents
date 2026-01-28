# Workflow: Debug Hono Route Chain Type Errors

Diagnose and fix Hono-specific type inference issues.

<prerequisites>

- Hono app with type errors
- Understanding of route chaining
- TypeScript strict mode enabled

</prerequisites>

<process>

## Step 1: Identify the Symptom

Common type error symptoms:

| Symptom | Likely Cause |
|---------|--------------|
| `c.get('user')` returns `unknown` | Env type not applied or chain broken |
| `c.req.param('id')` returns `unknown` | Chain broken before this route |
| RPC client shows wrong routes | AppType exported too early |
| `Cannot find property '$get'` | Route not in AppType, chain broken |
| `Type 'Response' is not assignable` | Handler doesn't return proper response |

## Step 2: Check Chain Continuity

**The most common issue**: Breaking the route chain.

```typescript
// BAD: Chain broken
const app = new Hono();
app.get('/users', handler1);    // Types lost!
app.post('/users', handler2);

// GOOD: Chain intact
const app = new Hono()
  .get('/users', handler1)
  .post('/users', handler2);
```

**Find breaks in your code:**
- Search for assignments followed by `.get()`, `.post()`, etc.
- Look for conditional route additions
- Check for loops that add routes

```typescript
// BAD: Conditional break
const app = new Hono();
if (isDev) {
  app.get('/debug', handler);  // Chain broken!
}
app.get('/users', handler);

// GOOD: Use middleware for conditional logic
const app = new Hono()
  .use('*', async (c, next) => {
    if (isDev && c.req.path === '/debug') {
      return c.json({ debug: true });
    }
    await next();
  })
  .get('/users', handler);
```

## Step 3: Verify Factory Env Type

If using factory pattern, check Env type includes all variables:

```typescript
// Check all c.set() calls have matching Variables
type Env = {
  Variables: {
    requestId: string;
    db: Database;
    user: { id: string; role: string };  // Must match c.set('user', ...)
  };
};

const factory = createFactory<Env>();

// Middleware must match Env
const authMiddleware = factory.createMiddleware(async (c, next) => {
  c.set('user', {
    id: '123',
    role: 'admin',  // Must match Env['Variables']['user']
  });
  await next();
});
```

**Common Env mistakes:**
- Missing variable in type that's used in `c.set()`
- Wrong type in variable definition
- Using base `Hono` instead of `factory.createApp()`

## Step 4: Check AppType Export Timing

```typescript
// BAD: AppType exported before all routes
const app = factory.createApp()
  .get('/users', handler);

export type AppType = typeof app;  // Missing /posts!

app.route('/posts', postsRoute);   // Not in AppType!

// GOOD: AppType after all routes
const app = factory.createApp()
  .get('/users', handler)
  .route('/posts', postsRoute);

export type AppType = typeof app;  // Includes everything
```

## Step 5: Debug Mounted Routes

When using `.route()`, types must flow through:

```typescript
// Route file
export const usersRoute = factory.createApp()
  .get('/', handler)
  .post('/', handler);

// Main file
const app = factory.createApp()
  .route('/users', usersRoute);  // Types preserved

// Verify in client
client.users.$get();  // Should work
client.users.$post({ json: {...} });  // Should work
```

**If routes don't appear in AppType:**
1. Ensure route file uses `factory.createApp()` (not `new Hono()`)
2. Check route is exported properly
3. Verify `.route()` is chained (not separate assignment)

## Step 6: Debug RPC Client Types

```typescript
import type { AppType } from './server';
import { hc } from 'hono/client';

const client = hc<AppType>('http://localhost:3000');

// Check available routes (hover in IDE)
client.  // Should show all routes

// Common issues:
// - Using 'param' when should be 'query'
// - Using 'json' when should be 'form'
// - Missing param for path parameters
```

**RPC key mapping:**
| Server | Client |
|--------|--------|
| `c.req.param('id')` | `{ param: { id: '123' } }` |
| `c.req.query('page')` | `{ query: { page: '1' } }` |
| `c.req.valid('json')` | `{ json: { ... } }` |
| `c.req.header('auth')` | Second arg: `{ headers: { auth: '...' } }` |

## Step 7: Create Minimal Reproduction

If still stuck, isolate the issue:

```typescript
// Minimal test
import { Hono } from 'hono';
import { createFactory } from 'hono/factory';
import { hc } from 'hono/client';

type Env = {
  Variables: {
    test: string;
  };
};

const factory = createFactory<Env>();

const app = factory.createApp()
  .use('*', async (c, next) => {
    c.set('test', 'value');
    await next();
  })
  .get('/test', (c) => {
    const test = c.get('test');  // Should be string
    return c.json({ test });
  });

type AppType = typeof app;

const client = hc<AppType>('http://localhost:3000');
const res = await client.test.$get();  // Should type-check
```

## Step 8: Common Fixes

**Fix 1: Broken chain**
```typescript
// Find and remove variable assignments between routes
const app = new Hono()
  .get('/a', h1)
  .get('/b', h2);  // Keep chained
```

**Fix 2: Wrong Hono constructor**
```typescript
// Replace new Hono() with factory
const app = factory.createApp()
  .get('/users', handler);
```

**Fix 3: Missing Env variable**
```typescript
// Add missing variable to Env type
type Env = {
  Variables: {
    existingVar: string;
    missingVar: number;  // Add this
  };
};
```

**Fix 4: AppType timing**
```typescript
// Move export after all routes
const app = ...
  .route('/last', lastRoute);

export type AppType = typeof app;  // After everything
```

</process>

<anti_patterns>

Avoid:
- **Ignoring TypeScript errors**: They indicate real issues
- **Using `any` to silence errors**: Masks the root cause
- **Casting types**: `as AppType` won't fix the underlying issue
- **Adding routes dynamically**: Breaks static type inference

</anti_patterns>

<success_criteria>

This workflow is complete when:
- [ ] Route chain is unbroken (no variable assignments between routes)
- [ ] All `c.set()` calls match Env['Variables'] types
- [ ] AppType exported after all routes mounted
- [ ] RPC client shows all expected routes
- [ ] No TypeScript errors in route handlers
- [ ] `c.get()` returns properly typed values

</success_criteria>

<cross_reference>

**For systematic debugging methodology**, load the **debugging** skill.
This workflow covers Hono-specific type issues. The debugging skill provides the four-stage framework for general root cause analysis.

</cross_reference>
