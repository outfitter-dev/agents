# Typed Routes — Complete Examples

Route chaining patterns for full type inference across server and client.

## Basic CRUD API

```typescript
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { Database } from 'bun:sqlite';

// Schemas
const CreatePostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  published: z.boolean().default(false),
});

const UpdatePostSchema = CreatePostSchema.partial();

const QuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  published: z.enum(['true', 'false']).optional(),
});

// Database setup
const db = new Database('blog.db');
db.run(`
  CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    published INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

// Prepared statements
const getAllPosts = db.prepare(`
  SELECT * FROM posts
  WHERE ($published IS NULL OR published = $published)
  ORDER BY created_at DESC
  LIMIT $limit OFFSET $offset
`);

const getPostById = db.prepare('SELECT * FROM posts WHERE id = ?');

const insertPost = db.prepare(`
  INSERT INTO posts (id, title, content, published)
  VALUES (?, ?, ?, ?)
  RETURNING *
`);

const updatePost = db.prepare(`
  UPDATE posts
  SET title = COALESCE(?, title),
      content = COALESCE(?, content),
      published = COALESCE(?, published),
      updated_at = CURRENT_TIMESTAMP
  WHERE id = ?
  RETURNING *
`);

const deletePost = db.prepare('DELETE FROM posts WHERE id = ? RETURNING *');

// ✅ Type-safe routes with chaining
const app = new Hono()
  // List posts with pagination and filtering
  .get('/posts', zValidator('query', QuerySchema), (c) => {
    const { page, limit, published } = c.req.valid('query');
    const offset = (page - 1) * limit;

    const posts = getAllPosts.all({
      $published: published ? (published === 'true' ? 1 : 0) : null,
      $limit: limit,
      $offset: offset,
    });

    const total = db.query('SELECT COUNT(*) as count FROM posts').get() as { count: number };

    return c.json({
      posts,
      pagination: {
        page,
        limit,
        total: total.count,
        totalPages: Math.ceil(total.count / limit),
      },
    });
  })

  // Get single post
  .get('/posts/:id', (c) => {
    const id = c.req.param('id');
    const post = getPostById.get(id);

    if (!post) {
      throw new HTTPException(404, { message: 'Post not found' });
    }

    return c.json({ post });
  })

  // Create post
  .post('/posts', zValidator('json', CreatePostSchema), (c) => {
    const data = c.req.valid('json');

    const post = insertPost.get(
      crypto.randomUUID(),
      data.title,
      data.content,
      data.published ? 1 : 0
    );

    return c.json({ post }, 201);
  })

  // Update post
  .put('/posts/:id', zValidator('json', UpdatePostSchema), (c) => {
    const id = c.req.param('id');
    const data = c.req.valid('json');

    const post = updatePost.get(
      data.title || null,
      data.content || null,
      data.published !== undefined ? (data.published ? 1 : 0) : null,
      id
    );

    if (!post) {
      throw new HTTPException(404, { message: 'Post not found' });
    }

    return c.json({ post });
  })

  // Patch post (partial update)
  .patch('/posts/:id', zValidator('json', UpdatePostSchema), (c) => {
    const id = c.req.param('id');
    const data = c.req.valid('json');

    // Check exists first
    const existing = getPostById.get(id);
    if (!existing) {
      throw new HTTPException(404, { message: 'Post not found' });
    }

    const post = updatePost.get(
      data.title || null,
      data.content || null,
      data.published !== undefined ? (data.published ? 1 : 0) : null,
      id
    );

    return c.json({ post });
  })

  // Delete post
  .delete('/posts/:id', (c) => {
    const id = c.req.param('id');
    const post = deletePost.get(id);

    if (!post) {
      throw new HTTPException(404, { message: 'Post not found' });
    }

    return c.json({ deleted: true, post });
  });

// Export type for RPC client
export type AppType = typeof app;

export default app;
```

## Type-Safe Client Usage

```typescript
// client.ts
import { hc } from 'hono/client';
import type { AppType } from './server';

const client = hc<AppType>('http://localhost:3000');

async function examples() {
  // List posts with pagination
  const listRes = await client.posts.$get({
    query: { page: '1', limit: '10', published: 'true' }
  });

  const listData = await listRes.json();
  // Typed: {
  //   posts: any[];
  //   pagination: { page: number; limit: number; total: number; totalPages: number }
  // }

  console.log(`Found ${listData.posts.length} posts`);
  console.log(`Total pages: ${listData.pagination.totalPages}`);

  // Get single post
  const getRes = await client.posts[':id'].$get({
    param: { id: 'post-123' }
  });

  if (!getRes.ok) {
    console.error('Post not found');
    return;
  }

  const getData = await getRes.json();
  // Typed: { post: any }
  console.log('Post title:', getData.post.title);

  // Create post
  const createRes = await client.posts.$post({
    json: {
      title: 'New Post',
      content: 'Post content here...',
      published: true,
    }
  });

  const createData = await createRes.json();
  // Typed: { post: any }
  const newPostId = createData.post.id;

  // Update post
  const updateRes = await client.posts[':id'].$put({
    param: { id: newPostId },
    json: { title: 'Updated Title' }
  });

  const updateData = await updateRes.json();
  console.log('Updated:', updateData.post.title);

  // Delete post
  const deleteRes = await client.posts[':id'].$delete({
    param: { id: newPostId }
  });

  const deleteData = await deleteRes.json();
  // Typed: { deleted: boolean; post: any }
  console.log('Deleted:', deleteData.deleted);
}
```

## Nested Routes with Path Parameters

```typescript
import { Hono } from 'hono';

const app = new Hono()
  // User routes
  .get('/users/:userId', (c) => {
    const userId = c.req.param('userId');
    return c.json({ userId, name: 'Alice' });
  })

  // User's posts
  .get('/users/:userId/posts', (c) => {
    const userId = c.req.param('userId');
    return c.json({ userId, posts: [] });
  })

  // Specific post for user
  .get('/users/:userId/posts/:postId', (c) => {
    const { userId, postId } = c.req.param();
    // Both typed as string
    return c.json({ userId, postId, title: 'Post' });
  })

  // Post comments
  .get('/users/:userId/posts/:postId/comments', (c) => {
    const { userId, postId } = c.req.param();
    return c.json({ userId, postId, comments: [] });
  })

  // Specific comment
  .get('/users/:userId/posts/:postId/comments/:commentId', (c) => {
    const { userId, postId, commentId } = c.req.param();
    // All typed as string
    return c.json({ userId, postId, commentId, text: 'Comment' });
  });

export type AppType = typeof app;
```

### Client Usage for Nested Routes

```typescript
const client = hc<AppType>('http://localhost:3000');

// Access nested routes
const res = await client.users[':userId'].posts[':postId'].comments[':commentId'].$get({
  param: {
    userId: 'user-123',
    postId: 'post-456',
    commentId: 'comment-789',
  }
});

const data = await res.json();
// Typed: { userId: string; postId: string; commentId: string; text: string }
```

## Complex Query Parameters

```typescript
const SearchSchema = z.object({
  q: z.string().min(1),
  category: z.enum(['tech', 'business', 'lifestyle']).optional(),
  tags: z.array(z.string()).optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  sortBy: z.enum(['price', 'date', 'relevance']).default('relevance'),
  order: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

const app = new Hono()
  .get('/search', zValidator('query', SearchSchema), (c) => {
    const query = c.req.valid('query');
    // Fully typed with all fields and defaults applied

    // Build SQL query dynamically
    const conditions: string[] = ['title LIKE ?'];
    const params: any[] = [`%${query.q}%`];

    if (query.category) {
      conditions.push('category = ?');
      params.push(query.category);
    }

    if (query.tags && query.tags.length > 0) {
      conditions.push(`tags IN (${query.tags.map(() => '?').join(',')})`);
      params.push(...query.tags);
    }

    if (query.minPrice) {
      conditions.push('price >= ?');
      params.push(query.minPrice);
    }

    if (query.maxPrice) {
      conditions.push('price <= ?');
      params.push(query.maxPrice);
    }

    const orderClause = `ORDER BY ${query.sortBy} ${query.order.toUpperCase()}`;
    const limitClause = `LIMIT ${query.limit} OFFSET ${(query.page - 1) * query.limit}`;

    const sql = `
      SELECT * FROM products
      WHERE ${conditions.join(' AND ')}
      ${orderClause}
      ${limitClause}
    `;

    const products = db.prepare(sql).all(...params);

    return c.json({
      products,
      query: {
        q: query.q,
        filters: {
          category: query.category,
          tags: query.tags,
          priceRange: {
            min: query.minPrice,
            max: query.maxPrice,
          },
        },
        sort: { by: query.sortBy, order: query.order },
        pagination: { page: query.page, limit: query.limit },
      },
    });
  });
```

### Client with Complex Query

```typescript
const res = await client.search.$get({
  query: {
    q: 'laptop',
    category: 'tech',
    tags: ['gaming', 'portable'],
    minPrice: '500',
    maxPrice: '2000',
    sortBy: 'price',
    order: 'asc',
    page: '2',
    limit: '50',
  }
});

const data = await res.json();
```

## File Upload with Multipart Form

```typescript
const UploadSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  category: z.enum(['image', 'video', 'document']),
});

const app = new Hono()
  .post('/upload', zValidator('form', UploadSchema), async (c) => {
    const data = c.req.valid('form');
    const body = await c.req.parseBody();

    const file = body.file as File;

    if (!file) {
      throw new HTTPException(400, { message: 'File is required' });
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new HTTPException(400, { message: 'File too large (max 10MB)' });
    }

    // Validate file type
    const allowedTypes = {
      image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      video: ['video/mp4', 'video/webm'],
      document: ['application/pdf', 'application/msword'],
    };

    if (!allowedTypes[data.category].includes(file.type)) {
      throw new HTTPException(400, { message: `Invalid file type for category ${data.category}` });
    }

    // Generate unique filename
    const ext = file.name.split('.').pop();
    const filename = `${crypto.randomUUID()}.${ext}`;
    const filepath = `./uploads/${data.category}/${filename}`;

    // Save file
    await Bun.write(filepath, file);

    // Save metadata to database
    const upload = db.prepare(`
      INSERT INTO uploads (id, filename, original_name, title, description, category, size, mime_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `).get(
      crypto.randomUUID(),
      filename,
      file.name,
      data.title,
      data.description || null,
      data.category,
      file.size,
      file.type
    );

    return c.json({ upload }, 201);
  })

  .get('/uploads/:id', async (c) => {
    const id = c.req.param('id');

    const upload = db.prepare('SELECT * FROM uploads WHERE id = ?').get(id);

    if (!upload) {
      throw new HTTPException(404, { message: 'Upload not found' });
    }

    const filepath = `./uploads/${upload.category}/${upload.filename}`;
    const file = Bun.file(filepath);

    if (!(await file.exists())) {
      throw new HTTPException(404, { message: 'File not found on disk' });
    }

    return c.body(file.stream(), {
      headers: {
        'Content-Type': upload.mime_type,
        'Content-Length': upload.size.toString(),
        'Content-Disposition': `attachment; filename="${upload.original_name}"`,
      },
    });
  });
```

## Middleware in Route Chain

```typescript
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { HTTPException } from 'hono/http-exception';

// Custom auth middleware
const authMiddleware = async (c: Context, next: Next) => {
  const token = c.req.header('authorization')?.replace('Bearer ', '');

  if (!token) {
    throw new HTTPException(401, { message: 'Missing authorization header' });
  }

  // Verify token (simplified)
  const user = await verifyToken(token);

  if (!user) {
    throw new HTTPException(401, { message: 'Invalid token' });
  }

  c.set('user', user);
  await next();
};

// Role-based access control
const requireRole = (role: 'admin' | 'user') => {
  return async (c: Context, next: Next) => {
    const user = c.get('user');

    if (!user) {
      throw new HTTPException(401, { message: 'Unauthorized' });
    }

    if (user.role !== role && user.role !== 'admin') {
      throw new HTTPException(403, { message: 'Insufficient permissions' });
    }

    await next();
  };
};

const app = new Hono()
  // Global middleware
  .use('*', logger())
  .use('*', cors())

  // Public routes
  .get('/health', (c) => c.json({ status: 'ok' }))
  .post('/auth/login', loginHandler)

  // Protected routes
  .use('/api/*', authMiddleware)
  .get('/api/profile', (c) => {
    const user = c.get('user');
    return c.json({ user });
  })

  // Admin-only routes
  .use('/api/admin/*', requireRole('admin'))
  .get('/api/admin/users', (c) => {
    return c.json({ users: [] });
  })
  .delete('/api/admin/users/:id', (c) => {
    return c.json({ deleted: true });
  });
```

## WebSocket Routes

```typescript
import { Hono } from 'hono';
import type { ServerWebSocket } from 'bun';

const app = new Hono()
  .get('/ws', (c) => {
    const success = c.upgrade();

    if (!success) {
      return c.text('WebSocket upgrade failed', 400);
    }

    return undefined; // Upgraded to WebSocket
  });

// WebSocket handlers
const websocket = {
  open(ws: ServerWebSocket) {
    console.log('Client connected');
    ws.send(JSON.stringify({ type: 'connected', timestamp: Date.now() }));
  },

  message(ws: ServerWebSocket, message: string | Buffer) {
    console.log('Received:', message);

    try {
      const data = JSON.parse(message.toString());

      // Echo back
      ws.send(JSON.stringify({
        type: 'echo',
        data,
        timestamp: Date.now(),
      }));

      // Broadcast to all clients
      ws.publish('global', JSON.stringify({
        type: 'broadcast',
        data,
        timestamp: Date.now(),
      }));
    } catch (err) {
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON' }));
    }
  },

  close(ws: ServerWebSocket) {
    console.log('Client disconnected');
  },
};

Bun.serve({
  fetch: app.fetch,
  websocket,
  port: 3000,
});
```

## Streaming Responses

```typescript
const app = new Hono()
  // Server-Sent Events
  .get('/events', (c) => {
    return c.stream(async (stream) => {
      let id = 0;

      const interval = setInterval(() => {
        stream.writeln(`data: ${JSON.stringify({ id: ++id, timestamp: Date.now() })}\n`);
      }, 1000);

      // Cleanup on client disconnect
      stream.onAbort(() => {
        clearInterval(interval);
      });
    }, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  })

  // Large file streaming
  .get('/download/:filename', async (c) => {
    const filename = c.req.param('filename');
    const filepath = `./large-files/${filename}`;
    const file = Bun.file(filepath);

    if (!(await file.exists())) {
      throw new HTTPException(404, { message: 'File not found' });
    }

    return c.body(file.stream(), {
      headers: {
        'Content-Type': file.type,
        'Content-Length': file.size.toString(),
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  })

  // Compressed streaming
  .get('/large-data', (c) => {
    const data = generateLargeDataset(); // Returns iterator

    return c.stream(async (stream) => {
      for await (const chunk of data) {
        await stream.write(JSON.stringify(chunk) + '\n');
      }
    }, {
      headers: {
        'Content-Type': 'application/x-ndjson',
        'Content-Encoding': 'gzip',
      },
    });
  });
```

## Type Inference Gotchas

```typescript
// ❌ Type inference breaks
const app = new Hono();
const route1 = app.get('/users', handler);
const route2 = route1.post('/users', handler); // OK so far
app.get('/posts', handler); // Types lost!

export type AppType = typeof app; // Only Hono base type


// ✅ Keep chain intact
const app = new Hono()
  .get('/users', handler)
  .post('/users', handler)
  .get('/posts', handler);

export type AppType = typeof app; // Full route types


// ❌ Conditional routes break chain
const app = new Hono();

if (isDevelopment) {
  app.get('/debug', debugHandler); // Types lost
}

app.get('/api/users', handler);


// ✅ Use .use() with conditional
const app = new Hono()
  .use('*', (c, next) => {
    if (isDevelopment) {
      // Add debug routes dynamically
    }
    return next();
  })
  .get('/api/users', handler);


// ❌ Variable extraction loses types
const getUserRoute = (app: Hono) => app.get('/users', handler);
const app = new Hono();
getUserRoute(app); // Types lost


// ✅ Return chain from function
const getUserRoute = (app: Hono) => app.get('/users', handler);

const app = getUserRoute(new Hono())
  .post('/users', handler);

export type AppType = typeof app;
```
