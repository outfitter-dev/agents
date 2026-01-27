# Scenario Testing Patterns

Common end-to-end scenario patterns with real dependencies.

## Authentication Flows

### Login Success

```typescript
// .scratch/test-auth-login-success.ts
import { db } from '../src/db'
import { api } from '../src/api'
import { hash } from '../src/crypto'

async function testLoginSuccess() {
  // Setup: create real test user
  const password = 'test-password-123'
  const user = await db.users.create({
    email: 'test@example.com',
    password: await hash(password)
  })

  try {
    // Execute: real login request
    const res = await api.post('/auth/login', {
      email: user.email,
      password
    })

    // Verify: actual response
    console.assert(res.status === 200, 'Login should return 200')
    console.assert(res.body.token, 'Should receive JWT token')
    console.assert(res.body.user.id === user.id, 'Should return user data')

    console.log('✓ Login success validated')
  } finally {
    // Cleanup: remove test user
    await db.users.delete({ id: user.id })
  }
}

testLoginSuccess().catch(console.error)
```

scenarios.jsonl entry:

```jsonl
{"name":"auth-login-success","description":"User logs in with valid credentials","setup":"Create test user in database with hashed password","steps":["POST /auth/login with email and password","Receive 200 response","Extract JWT token from response","Verify user data in response"],"expected":"200 OK with JWT token and user object","tags":["auth","jwt","happy-path"],"duration_ms":150}
```

### Login Failure

```typescript
// .scratch/test-auth-login-failure.ts
import { db } from '../src/db'
import { api } from '../src/api'
import { hash } from '../src/crypto'

async function testLoginFailure() {
  const user = await db.users.create({
    email: 'test@example.com',
    password: await hash('correct-password')
  })

  try {
    // Execute: login with wrong password
    const res = await api.post('/auth/login', {
      email: user.email,
      password: 'wrong-password'
    })

    // Verify: rejection
    console.assert(res.status === 401, 'Should return 401 Unauthorized')
    console.assert(!res.body.token, 'Should not issue token')
    console.assert(res.body.error, 'Should include error message')

    console.log('✓ Login failure validated')
  } finally {
    await db.users.delete({ id: user.id })
  }
}

testLoginFailure().catch(console.error)
```

scenarios.jsonl entry:

```jsonl
{"name":"auth-login-invalid","description":"Login fails with incorrect password","setup":"Create test user with known password","steps":["POST /auth/login with wrong password"],"expected":"401 Unauthorized, no token issued, error message present","tags":["auth","error-handling","security"],"duration_ms":100}
```

### Token Validation

```typescript
// .scratch/test-auth-token-validation.ts
import { db } from '../src/db'
import { api } from '../src/api'
import { hash } from '../src/crypto'

async function testTokenValidation() {
  const user = await db.users.create({
    email: 'test@example.com',
    password: await hash('password')
  })

  try {
    // Get real token
    const loginRes = await api.post('/auth/login', {
      email: user.email,
      password: 'password'
    })
    const token = loginRes.body.token

    // Verify: valid token grants access
    const validRes = await api.get('/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
    console.assert(validRes.status === 200, 'Valid token should grant access')
    console.assert(validRes.body.id === user.id, 'Should return correct user')

    // Verify: invalid token denied
    const invalidRes = await api.get('/auth/me', {
      headers: { Authorization: 'Bearer invalid-token' }
    })
    console.assert(invalidRes.status === 401, 'Invalid token should be rejected')

    // Verify: missing token denied
    const missingRes = await api.get('/auth/me')
    console.assert(missingRes.status === 401, 'Missing token should be rejected')

    console.log('✓ Token validation scenarios passed')
  } finally {
    await db.users.delete({ id: user.id })
  }
}

testTokenValidation().catch(console.error)
```

scenarios.jsonl entry:

```jsonl
{"name":"auth-token-validation","description":"JWT token validation for protected endpoints","setup":"Create user and obtain valid JWT token","steps":["GET /auth/me with valid token","GET /auth/me with invalid token","GET /auth/me without token"],"expected":"Valid token: 200 + user data. Invalid: 401. Missing: 401.","tags":["auth","jwt","authorization"],"duration_ms":200}
```

## CRUD Operations

### Create Resource

```typescript
// .scratch/test-crud-create.ts
import { db } from '../src/db'
import { api } from '../src/api'

async function testCreateResource() {
  // Setup: authenticate
  const user = await db.users.create({ email: 'test@example.com' })
  const token = await api.login(user)

  try {
    // Execute: create resource
    const res = await api.post('/api/posts', {
      title: 'Test Post',
      content: 'Test content'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })

    // Verify: resource created
    console.assert(res.status === 201, 'Should return 201 Created')
    console.assert(res.body.id, 'Should return resource ID')
    console.assert(res.body.title === 'Test Post', 'Should store title')

    // Verify: resource in database
    const dbPost = await db.posts.findOne({ id: res.body.id })
    console.assert(dbPost, 'Should exist in database')
    console.assert(dbPost.author_id === user.id, 'Should link to author')

    console.log('✓ Create resource validated')

    // Cleanup
    await db.posts.delete({ id: res.body.id })
  } finally {
    await db.users.delete({ id: user.id })
  }
}

testCreateResource().catch(console.error)
```

scenarios.jsonl entry:

```jsonl
{"name":"crud-create-success","description":"Create new resource via API","setup":"Authenticated user","steps":["POST /api/posts with resource data","Receive 201 Created","Verify resource in database"],"expected":"201 Created with resource ID, resource persisted in database","tags":["crud","create","api"],"duration_ms":120}
```

### Read Resource

```typescript
// .scratch/test-crud-read.ts
import { db } from '../src/db'
import { api } from '../src/api'

async function testReadResource() {
  const user = await db.users.create({ email: 'test@example.com' })
  const post = await db.posts.create({
    title: 'Test Post',
    content: 'Test content',
    author_id: user.id
  })

  try {
    // Execute: read resource
    const res = await api.get(`/api/posts/${post.id}`)

    // Verify: correct data returned
    console.assert(res.status === 200, 'Should return 200 OK')
    console.assert(res.body.id === post.id, 'Should return correct post')
    console.assert(res.body.title === post.title, 'Should include title')
    console.assert(res.body.content === post.content, 'Should include content')
    console.assert(res.body.author.id === user.id, 'Should include author')

    console.log('✓ Read resource validated')
  } finally {
    await db.posts.delete({ id: post.id })
    await db.users.delete({ id: user.id })
  }
}

testReadResource().catch(console.error)
```

scenarios.jsonl entry:

```jsonl
{"name":"crud-read-success","description":"Retrieve existing resource","setup":"Resource exists in database","steps":["GET /api/posts/{id}"],"expected":"200 OK with complete resource data including relations","tags":["crud","read","api"],"duration_ms":80}
```

### Update Resource

```typescript
// .scratch/test-crud-update.ts
import { db } from '../src/db'
import { api } from '../src/api'

async function testUpdateResource() {
  const user = await db.users.create({ email: 'test@example.com' })
  const token = await api.login(user)
  const post = await db.posts.create({
    title: 'Original Title',
    content: 'Original content',
    author_id: user.id
  })

  try {
    // Execute: update resource
    const res = await api.put(`/api/posts/${post.id}`, {
      title: 'Updated Title',
      content: 'Updated content'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })

    // Verify: update successful
    console.assert(res.status === 200, 'Should return 200 OK')
    console.assert(res.body.title === 'Updated Title', 'Should update title')
    console.assert(res.body.content === 'Updated content', 'Should update content')

    // Verify: database updated
    const dbPost = await db.posts.findOne({ id: post.id })
    console.assert(dbPost.title === 'Updated Title', 'Should persist title')
    console.assert(dbPost.content === 'Updated content', 'Should persist content')

    console.log('✓ Update resource validated')
  } finally {
    await db.posts.delete({ id: post.id })
    await db.users.delete({ id: user.id })
  }
}

testUpdateResource().catch(console.error)
```

scenarios.jsonl entry:

```jsonl
{"name":"crud-update-success","description":"Update existing resource","setup":"Resource owned by authenticated user","steps":["PUT /api/posts/{id} with updated fields","Verify response data","Verify database persistence"],"expected":"200 OK with updated data, changes persisted in database","tags":["crud","update","api"],"duration_ms":130}
```

### Delete Resource

```typescript
// .scratch/test-crud-delete.ts
import { db } from '../src/db'
import { api } from '../src/api'

async function testDeleteResource() {
  const user = await db.users.create({ email: 'test@example.com' })
  const token = await api.login(user)
  const post = await db.posts.create({
    title: 'Test Post',
    content: 'Test content',
    author_id: user.id
  })

  try {
    // Execute: delete resource
    const res = await api.delete(`/api/posts/${post.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    // Verify: deletion successful
    console.assert(res.status === 204, 'Should return 204 No Content')

    // Verify: removed from database
    const dbPost = await db.posts.findOne({ id: post.id })
    console.assert(!dbPost, 'Should be removed from database')

    // Verify: subsequent reads fail
    const readRes = await api.get(`/api/posts/${post.id}`)
    console.assert(readRes.status === 404, 'Should return 404 Not Found')

    console.log('✓ Delete resource validated')
  } finally {
    await db.users.delete({ id: user.id })
  }
}

testDeleteResource().catch(console.error)
```

scenarios.jsonl entry:

```jsonl
{"name":"crud-delete-success","description":"Delete owned resource","setup":"Resource owned by authenticated user","steps":["DELETE /api/posts/{id}","Verify 204 response","Verify removal from database","Verify 404 on subsequent read"],"expected":"204 No Content, resource removed, subsequent reads return 404","tags":["crud","delete","api"],"duration_ms":140}
```

## API Integration Patterns

### Third-Party API Call

```typescript
// .scratch/test-stripe-create-customer.ts
import { stripe } from '../src/integrations/stripe'
import { db } from '../src/db'

async function testStripeCustomerCreation() {
  // Setup: test user
  const user = await db.users.create({
    email: 'test@example.com',
    name: 'Test User'
  })

  try {
    // Execute: real Stripe API call (test mode)
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { user_id: user.id }
    })

    // Verify: customer created
    console.assert(customer.id, 'Should receive Stripe customer ID')
    console.assert(customer.email === user.email, 'Should store email')
    console.assert(customer.metadata.user_id === user.id, 'Should store metadata')

    // Verify: stored in database
    await db.users.update({ id: user.id }, {
      stripe_customer_id: customer.id
    })
    const dbUser = await db.users.findOne({ id: user.id })
    console.assert(dbUser.stripe_customer_id === customer.id, 'Should link customer')

    console.log('✓ Stripe customer creation validated')

    // Cleanup: delete Stripe customer
    await stripe.customers.del(customer.id)
  } finally {
    await db.users.delete({ id: user.id })
  }
}

testStripeCustomerCreation().catch(console.error)
```

scenarios.jsonl entry:

```jsonl
{"name":"stripe-customer-create","description":"Create Stripe customer for new user","setup":"Test user in database, Stripe test mode API keys","steps":["Call stripe.customers.create()","Store customer ID in database","Verify linkage"],"expected":"Customer created in Stripe, ID stored in database, metadata linked","tags":["integration","stripe","api"],"env":"test","duration_ms":450}
```

### Webhook Processing

```typescript
// .scratch/test-stripe-webhook.ts
import { api } from '../src/api'
import { stripe } from '../src/integrations/stripe'
import { db } from '../src/db'

async function testStripeWebhook() {
  const user = await db.users.create({ email: 'test@example.com' })
  const customer = await stripe.customers.create({ email: user.email })

  try {
    // Execute: simulate webhook (real Stripe event)
    const event = await stripe.events.create({
      type: 'customer.subscription.created',
      data: {
        object: {
          customer: customer.id,
          status: 'active',
          items: {
            data: [{
              price: { id: 'price_test_123' }
            }]
          }
        }
      }
    })

    // Send to webhook endpoint
    const res = await api.post('/webhooks/stripe', event, {
      headers: {
        'stripe-signature': generateSignature(event)
      }
    })

    // Verify: webhook processed
    console.assert(res.status === 200, 'Webhook should be accepted')

    // Verify: database updated
    const dbUser = await db.users.findOne({ id: user.id })
    console.assert(dbUser.subscription_status === 'active', 'Should update status')

    console.log('✓ Stripe webhook validated')
  } finally {
    await stripe.customers.del(customer.id)
    await db.users.delete({ id: user.id })
  }
}

testStripeWebhook().catch(console.error)
```

scenarios.jsonl entry:

```jsonl
{"name":"stripe-webhook-subscription-created","description":"Process subscription created webhook","setup":"Stripe customer exists, webhook endpoint configured","steps":["Create subscription.created event","POST to /webhooks/stripe","Verify signature","Process event","Update database"],"expected":"200 OK response, user subscription status updated","tags":["integration","stripe","webhook"],"env":"test","duration_ms":600}
```

## Rate Limiting

```typescript
// .scratch/test-rate-limiting.ts
import { api } from '../src/api'

async function testRateLimiting() {
  const ip = '192.168.1.100'

  // Execute: burst of requests
  const responses = await Promise.all(
    Array.from({ length: 15 }, (_, i) =>
      api.get('/api/public/status', {
        headers: { 'X-Forwarded-For': ip }
      }).then(res => ({ attempt: i + 1, status: res.status }))
    )
  )

  // Verify: first N requests succeed
  const successful = responses.filter(r => r.status === 200)
  const rateLimited = responses.filter(r => r.status === 429)

  console.assert(successful.length === 10, 'Should allow 10 requests')
  console.assert(rateLimited.length === 5, 'Should rate-limit remaining')
  console.assert(rateLimited[0].attempt === 11, 'Should start limiting at 11th')

  console.log('✓ Rate limiting validated')
  console.log(`  Successful: ${successful.length}, Rate-limited: ${rateLimited.length}`)
}

testRateLimiting().catch(console.error)
```

scenarios.jsonl entry:

```jsonl
{"name":"rate-limit-ip-burst","description":"IP-based rate limiting under burst load","setup":"Clean rate limit state","steps":["Send 15 requests from same IP","Track response codes"],"expected":"First 10 requests: 200 OK. Remaining 5: 429 Too Many Requests","tags":["rate-limiting","security","api"],"duration_ms":250}
```

## Error Handling

### Validation Errors

```typescript
// .scratch/test-validation-errors.ts
import { api } from '../src/api'
import { db } from '../src/db'

async function testValidationErrors() {
  const user = await db.users.create({ email: 'test@example.com' })
  const token = await api.login(user)

  try {
    // Execute: invalid input
    const res = await api.post('/api/posts', {
      title: '', // empty - should fail validation
      content: 'x'.repeat(10001) // too long - should fail validation
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })

    // Verify: validation error
    console.assert(res.status === 400, 'Should return 400 Bad Request')
    console.assert(res.body.errors, 'Should include errors array')
    console.assert(
      res.body.errors.some(e => e.field === 'title'),
      'Should flag title error'
    )
    console.assert(
      res.body.errors.some(e => e.field === 'content'),
      'Should flag content error'
    )

    // Verify: no resource created
    const posts = await db.posts.findMany({ author_id: user.id })
    console.assert(posts.length === 0, 'Should not create invalid resource')

    console.log('✓ Validation errors handled correctly')
  } finally {
    await db.users.delete({ id: user.id })
  }
}

testValidationErrors().catch(console.error)
```

scenarios.jsonl entry:

```jsonl
{"name":"validation-multiple-errors","description":"Multiple validation errors returned","setup":"Authenticated user","steps":["POST /api/posts with multiple invalid fields"],"expected":"400 Bad Request with errors array listing all validation failures, no resource created","tags":["validation","error-handling","api"],"duration_ms":90}
```

## Template Structure

Generic scenario template:

```typescript
// .scratch/test-{feature}-{scenario}.ts
import { /* real dependencies */ } from '../src'

async function test{FeatureScenario}() {
  // Setup: prepare real state
  const resource = await db.create({ /* test data */ })

  try {
    // Execute: perform real action
    const result = await /* real operation */

    // Verify: assert on actual behavior
    console.assert(/* condition */, 'failure message')

    console.log('✓ {Scenario} validated')
  } finally {
    // Cleanup: restore state
    await db.delete({ id: resource.id })
  }
}

test{FeatureScenario}().catch(console.error)
```

scenarios.jsonl template:

```jsonl
{"name":"feature-scenario","description":"Human-readable summary","setup":"Prerequisites and state","steps":["Action 1","Action 2","Action 3"],"expected":"Success criteria","tags":["category","subcategory"],"env":"test","duration_ms":100}
```

## Common Tags

- `auth` — authentication flows
- `authorization` — permission checks
- `crud` — create, read, update, delete
- `api` — HTTP API endpoints
- `integration` — third-party services
- `webhook` — webhook processing
- `validation` — input validation
- `error-handling` — error scenarios
- `security` — security-sensitive flows
- `rate-limiting` — rate limit enforcement
- `happy-path` — successful flows
- `edge-case` — boundary conditions
- `regression` — bug prevention
