# Workflow: Add WebSocket Support

Add WebSocket support to a Bun server with connection lifecycle and room patterns.

<required_reading>

**Read these reference files NOW:**
1. [server-patterns.md](../references/server-patterns.md) - WebSocket server section

</required_reading>

<prerequisites>

- Existing Bun HTTP server (Bun.serve or Hono)
- WebSocket requirements understood (message types, rooms, authentication)
- Client implementation plan (browser, Node.js, etc.)

</prerequisites>

<process>

## Step 1: Define WebSocket Data Type

Create `src/ws/types.ts`:

```typescript
export type WebSocketData = {
  id: string;          // Connection ID
  userId: string;      // Authenticated user ID
  rooms: Set<string>;  // Subscribed rooms
  connectedAt: Date;
};

export type IncomingMessage =
  | { type: 'join'; room: string }
  | { type: 'leave'; room: string }
  | { type: 'broadcast'; room: string; content: string }
  | { type: 'direct'; targetId: string; content: string }
  | { type: 'ping' };

export type OutgoingMessage =
  | { type: 'connected'; id: string }
  | { type: 'joined'; room: string }
  | { type: 'left'; room: string }
  | { type: 'message'; from: string; content: string; room?: string }
  | { type: 'error'; message: string }
  | { type: 'pong' };
```

## Step 2: Create Connection Manager

Create `src/ws/connections.ts`:

```typescript
import type { ServerWebSocket } from 'bun';
import type { WebSocketData } from './types';

class ConnectionManager {
  private connections = new Map<string, ServerWebSocket<WebSocketData>>();
  private userConnections = new Map<string, Set<string>>();  // userId -> connectionIds

  add(ws: ServerWebSocket<WebSocketData>): void {
    const { id, userId } = ws.data;
    this.connections.set(id, ws);

    if (!this.userConnections.has(userId)) {
      this.userConnections.set(userId, new Set());
    }
    this.userConnections.get(userId)!.add(id);
  }

  remove(ws: ServerWebSocket<WebSocketData>): void {
    const { id, userId } = ws.data;
    this.connections.delete(id);

    const userConns = this.userConnections.get(userId);
    if (userConns) {
      userConns.delete(id);
      if (userConns.size === 0) {
        this.userConnections.delete(userId);
      }
    }
  }

  get(id: string): ServerWebSocket<WebSocketData> | undefined {
    return this.connections.get(id);
  }

  getByUserId(userId: string): ServerWebSocket<WebSocketData>[] {
    const ids = this.userConnections.get(userId);
    if (!ids) return [];
    return Array.from(ids)
      .map(id => this.connections.get(id))
      .filter((ws): ws is ServerWebSocket<WebSocketData> => ws !== undefined);
  }

  getCount(): number {
    return this.connections.size;
  }

  broadcast(message: string, exclude?: string): void {
    for (const [id, ws] of this.connections) {
      if (id !== exclude) {
        ws.send(message);
      }
    }
  }
}

export const connections = new ConnectionManager();
```

## Step 3: Configure WebSocket Handlers

Create `src/ws/handlers.ts`:

```typescript
import type { ServerWebSocket } from 'bun';
import type { WebSocketData, IncomingMessage, OutgoingMessage } from './types';
import { connections } from './connections';

function send(ws: ServerWebSocket<WebSocketData>, message: OutgoingMessage): void {
  ws.send(JSON.stringify(message));
}

export const websocketHandlers = {
  open(ws: ServerWebSocket<WebSocketData>) {
    connections.add(ws);
    console.log(`WebSocket connected: ${ws.data.id} (user: ${ws.data.userId})`);

    send(ws, { type: 'connected', id: ws.data.id });
  },

  message(ws: ServerWebSocket<WebSocketData>, raw: string | Buffer) {
    try {
      const message = JSON.parse(raw.toString()) as IncomingMessage;

      switch (message.type) {
        case 'ping':
          send(ws, { type: 'pong' });
          break;

        case 'join':
          ws.subscribe(message.room);
          ws.data.rooms.add(message.room);
          send(ws, { type: 'joined', room: message.room });
          break;

        case 'leave':
          ws.unsubscribe(message.room);
          ws.data.rooms.delete(message.room);
          send(ws, { type: 'left', room: message.room });
          break;

        case 'broadcast':
          if (!ws.data.rooms.has(message.room)) {
            send(ws, { type: 'error', message: `Not in room: ${message.room}` });
            return;
          }
          ws.publish(message.room, JSON.stringify({
            type: 'message',
            from: ws.data.userId,
            content: message.content,
            room: message.room,
          } satisfies OutgoingMessage));
          break;

        case 'direct':
          const target = connections.get(message.targetId);
          if (!target) {
            send(ws, { type: 'error', message: 'Target not found' });
            return;
          }
          send(target, {
            type: 'message',
            from: ws.data.userId,
            content: message.content,
          });
          break;

        default:
          send(ws, { type: 'error', message: 'Unknown message type' });
      }
    } catch (err) {
      send(ws, { type: 'error', message: 'Invalid message format' });
    }
  },

  close(ws: ServerWebSocket<WebSocketData>) {
    // Unsubscribe from all rooms
    for (const room of ws.data.rooms) {
      ws.unsubscribe(room);
    }

    connections.remove(ws);
    console.log(`WebSocket disconnected: ${ws.data.id}`);
  },
};
```

## Step 4: Add Upgrade Route

Update `src/index.ts`:

```typescript
import type { ServerWebSocket } from 'bun';
import type { WebSocketData } from './ws/types';
import { websocketHandlers } from './ws/handlers';

// If using Hono, handle upgrade in fetch
const app = new Hono()
  // ... other routes ...

Bun.serve<WebSocketData>({
  port: env.PORT,

  fetch(req, server) {
    const url = new URL(req.url);

    // WebSocket upgrade
    if (url.pathname === '/ws') {
      // Authenticate (extract from query param or header)
      const userId = url.searchParams.get('userId');
      if (!userId) {
        return new Response('userId required', { status: 400 });
      }

      // Optional: Validate token
      // const token = url.searchParams.get('token');
      // if (!validateToken(token)) {
      //   return new Response('Invalid token', { status: 401 });
      // }

      const success = server.upgrade(req, {
        data: {
          id: crypto.randomUUID(),
          userId,
          rooms: new Set<string>(),
          connectedAt: new Date(),
        },
      });

      return success ? undefined : new Response('Upgrade failed', { status: 500 });
    }

    // Handle HTTP with Hono
    return app.fetch(req);
  },

  websocket: websocketHandlers,
});
```

## Step 5: Add Connection Stats Endpoint

```typescript
import { connections } from './ws/connections';

app.get('/ws/stats', (c) => {
  return c.json({
    connections: connections.getCount(),
    timestamp: new Date().toISOString(),
  });
});
```

## Step 6: Verify WebSocket Works

```bash
# Start server
bun run --watch src/index.ts

# Test with websocat (install: brew install websocat)
websocat "ws://localhost:3000/ws?userId=user-123"

# Or test with JavaScript
node -e "
const ws = new WebSocket('ws://localhost:3000/ws?userId=test');
ws.on('open', () => {
  console.log('Connected');
  ws.send(JSON.stringify({ type: 'ping' }));
});
ws.on('message', (data) => console.log('Received:', data.toString()));
"
```

Expected flow:
1. Connect -> Receive `{"type":"connected","id":"..."}`
2. Send `{"type":"ping"}` -> Receive `{"type":"pong"}`
3. Send `{"type":"join","room":"chat"}` -> Receive `{"type":"joined","room":"chat"}`

</process>

<cross_references>

**For authentication:** Validate tokens before upgrade to prevent unauthorized connections

**For scaling:** Consider Redis pub/sub for multi-instance WebSocket (Bun's native pub/sub is single-instance)

</cross_references>

<anti_patterns>

Avoid:
- Not cleaning up on disconnect (memory leak)
- Sending binary when client expects text (or vice versa)
- Blocking in message handler (use async patterns)
- No heartbeat/ping mechanism (stale connections accumulate)
- Trusting client-provided userId without authentication
- Unbounded room subscriptions (DoS vector)

</anti_patterns>

<success_criteria>

This workflow is complete when:
- [ ] WebSocket upgrade works at `/ws` endpoint
- [ ] Connection opens and receives `connected` message
- [ ] Ping/pong heartbeat works
- [ ] Room join/leave/broadcast works
- [ ] Direct messaging between connections works
- [ ] Connections clean up properly on close
- [ ] `/ws/stats` shows active connection count

</success_criteria>
