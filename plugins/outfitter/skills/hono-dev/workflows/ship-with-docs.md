# Workflow: Ship API with Documentation

Deploy Hono API with OpenAPI documentation for production.

<prerequisites>

- Hono API with OpenAPI documentation ([add-openapi.md](./add-openapi.md))
- Deployment target identified (Bun standalone, Cloudflare Workers, etc.)
- Environment variables configured

</prerequisites>

<process>

## Step 1: Generate Static OpenAPI Spec

Create a script to export the spec for external tools:

```typescript
// scripts/generate-openapi.ts
import app from '../src/index';

const spec = app.doc('/openapi.json', {
  openapi: '3.1.0',
  info: {
    title: 'My API',
    version: process.env.npm_package_version || '1.0.0',
  },
});

// Fetch the spec from the app
const response = await app.request('/openapi.json');
const openApiSpec = await response.json();

// Write to file
await Bun.write('openapi.json', JSON.stringify(openApiSpec, null, 2));

console.log('OpenAPI spec written to openapi.json');
```

```bash
bun run scripts/generate-openapi.ts
```

## Step 2: Configure CORS for Production

```typescript
// src/middleware/cors.ts
import { cors } from 'hono/cors';

const allowedOrigins = Bun.env.ALLOWED_ORIGINS?.split(',') || [];

export const corsMiddleware = cors({
  origin: (origin) => {
    // Allow requests with no origin (server-to-server)
    if (!origin) return null;

    // Development
    if (Bun.env.NODE_ENV !== 'production') {
      return origin;
    }

    // Production: check against whitelist
    if (allowedOrigins.includes(origin)) {
      return origin;
    }

    return null;
  },
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  credentials: true,
  maxAge: 86400,  // 24 hours
});

// Apply in app
app.use('/api/*', corsMiddleware);
```

## Step 3: Add Request Logging

```typescript
// src/middleware/logging.ts
import { factory } from '../factory';

interface RequestLog {
  timestamp: string;
  requestId: string;
  method: string;
  path: string;
  status: number;
  duration: number;
  userAgent?: string;
  ip?: string;
  userId?: string;
}

export const loggingMiddleware = factory.createMiddleware(async (c, next) => {
  const start = Bun.nanoseconds();
  const requestId = c.get('requestId');

  await next();

  const duration = (Bun.nanoseconds() - start) / 1_000_000;

  const log: RequestLog = {
    timestamp: new Date().toISOString(),
    requestId,
    method: c.req.method,
    path: c.req.path,
    status: c.res.status,
    duration: Math.round(duration),
    userAgent: c.req.header('user-agent'),
    ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
    userId: c.get('user')?.id,
  };

  // JSON logging for production (easy to parse)
  if (Bun.env.NODE_ENV === 'production') {
    console.log(JSON.stringify(log));
  } else {
    console.log(`${log.method} ${log.path} ${log.status} ${log.duration}ms`);
  }
});
```

## Step 4: Set Up Error Tracking

```typescript
// src/middleware/error-tracking.ts
import { factory } from '../factory';

interface ErrorReport {
  timestamp: string;
  requestId: string;
  error: string;
  stack?: string;
  path: string;
  method: string;
  userId?: string;
}

async function reportError(report: ErrorReport) {
  // Send to error tracking service (Sentry, LogRocket, etc.)
  if (Bun.env.ERROR_WEBHOOK_URL) {
    await fetch(Bun.env.ERROR_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report),
    }).catch(console.error);
  }
}

// Enhanced error handler
app.onError(async (err, c) => {
  const requestId = c.get('requestId');
  const isDev = Bun.env.NODE_ENV !== 'production';

  // Only report 5xx errors to tracking
  const isServerError = !(err instanceof HTTPException) || err.status >= 500;

  if (isServerError) {
    await reportError({
      timestamp: new Date().toISOString(),
      requestId,
      error: err.message,
      stack: err.stack,
      path: c.req.path,
      method: c.req.method,
      userId: c.get('user')?.id,
    });
  }

  // Return response
  if (err instanceof HTTPException) {
    return c.json({
      error: err.message,
      requestId,
    }, err.status);
  }

  return c.json({
    error: isDev ? err.message : 'Internal server error',
    requestId,
  }, 500);
});
```

## Step 5: Create Production Server

```typescript
// src/server.ts
import app from './index';

const port = Number(Bun.env.PORT) || 3000;
const hostname = Bun.env.HOSTNAME || '0.0.0.0';

console.log(`Starting server...`);
console.log(`Environment: ${Bun.env.NODE_ENV || 'development'}`);

const server = Bun.serve({
  fetch: app.fetch,
  port,
  hostname,

  // Optional: Configure for production
  development: Bun.env.NODE_ENV !== 'production',

  // TLS (if using HTTPS directly)
  // tls: {
  //   key: Bun.file('./certs/key.pem'),
  //   cert: Bun.file('./certs/cert.pem'),
  // },
});

console.log(`Server running at http://${hostname}:${port}`);
console.log(`API docs available at http://${hostname}:${port}/docs`);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...');
  server.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down...');
  server.stop();
  process.exit(0);
});
```

## Step 6: Build for Deployment

**Option A: Bun Standalone Binary**

```bash
# Build standalone executable
bun build ./src/server.ts --compile --outfile api

# Test locally
./api

# Deploy binary to server
scp api user@server:/opt/api/
```

**Option B: Docker Container**

```dockerfile
# Dockerfile
FROM oven/bun:1 AS build

WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun build ./src/server.ts --compile --outfile api

FROM gcr.io/distroless/cc
COPY --from=build /app/api /api
EXPOSE 3000
CMD ["/api"]
```

```bash
docker build -t my-api .
docker run -p 3000:3000 -e NODE_ENV=production my-api
```

**Option C: Cloudflare Workers**

```typescript
// src/worker.ts
import app from './index';

export default {
  fetch: app.fetch,
};
```

```bash
wrangler deploy
```

## Step 7: Configure Health Checks

```typescript
// Enhanced health check for load balancers
app.get('/health', async (c) => {
  const checks = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: Bun.env.npm_package_version || 'unknown',
    uptime: process.uptime(),
    checks: {} as Record<string, boolean>,
  };

  // Database check
  try {
    const db = c.get('db');
    db.query('SELECT 1').get();
    checks.checks.database = true;
  } catch {
    checks.checks.database = false;
    checks.status = 'degraded';
  }

  // External service check (if applicable)
  // checks.checks.redis = await checkRedis();

  const status = checks.status === 'ok' ? 200 : 503;
  return c.json(checks, status);
});

// Kubernetes liveness probe
app.get('/healthz', (c) => c.text('ok'));

// Kubernetes readiness probe
app.get('/readyz', async (c) => {
  // Check if ready to receive traffic
  const ready = true;  // Add your readiness logic
  return ready ? c.text('ok') : c.text('not ready', 503);
});
```

## Step 8: Verify Deployment

```bash
# Check health
curl https://api.example.com/health | jq .

# Check OpenAPI spec accessible
curl https://api.example.com/openapi.json | jq .openapi

# Verify Swagger UI
open https://api.example.com/docs

# Test an endpoint
curl https://api.example.com/api/users
```

</process>

<anti_patterns>

Avoid:
- **Exposing stack traces in production**: Sanitize error messages
- **Missing CORS for browser clients**: API calls will fail
- **No health checks**: Load balancers can't verify service health
- **Hardcoded secrets**: Use environment variables
- **No graceful shutdown**: Connections dropped mid-request
- **Docs on separate domain**: CORS issues, keep /docs on same origin

</anti_patterns>

<success_criteria>

This workflow is complete when:
- [ ] OpenAPI spec generated and accessible at `/openapi.json`
- [ ] Swagger UI accessible at `/docs`
- [ ] CORS configured for allowed origins
- [ ] Request logging in JSON format (production)
- [ ] Error tracking for 5xx errors
- [ ] Health check returns database/service status
- [ ] Graceful shutdown handles SIGTERM/SIGINT
- [ ] Deployment tested with real requests

</success_criteria>

<next_steps>

After deployment:
- Monitor error tracking service
- Set up alerts for 5xx error spikes
- Configure rate limiting for production load
- Add API versioning strategy for future changes

</next_steps>
