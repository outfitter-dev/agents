# Example: Early Delivery with Caveats

User requests delivery before reaching full confidence — demonstrates `△ Caveats` and mid-stream concerns.

<turn>
<user>

I want to add real-time notifications to our app. Users should get notified when someone comments on their posts.

</user>
<claude>

```text
[Task] Getting oriented
- Prep notification requirements (in_progress)
- Explore delivery mechanisms (pending)
- Clarify scale and persistence (pending)
- Deliver implementation plan (pending)
```

```text
▓▓░░░ Exploring

Assumptions:
- Existing app with posts and comments
- User accounts with some form of auth
- Web and/or mobile clients

Unknowns:
- Current tech stack?
- Scale (users, notifications/day)?
- Notification types (just comments, or more)?
- Persistence (history, read/unread)?
- Push notifications (mobile) needed?

Decisions:
- Real-time comment notifications
```

**Q1**: What's your current tech stack?

*Why it matters — determines which real-time approach fits best*

```text
[EnterPlanMode]
1. Node.js backend — Socket.io, ws, or SSE
2. Rust backend — Axum with WebSockets
3. Serverless (Vercel, AWS Lambda) — needs external service (Pusher, Ably)
4. Supabase — built-in realtime, minimal setup
5. Something else — describe your stack
```

</claude>
</turn>

<turn>
<user>

Node.js with Express, React frontend, PostgreSQL

</user>
<claude>

```text
Classic PERN stack — lots of good options for real-time.

▓▓▓░░ Charting

Assumptions:
- Can add WebSocket server alongside Express
- React can handle WebSocket connections
- PostgreSQL for notification storage

Unknowns:
- Scale expectations?
- Mobile app too, or web only?
- Need notification history/persistence?

Decisions:
- Node.js + Express + React + PostgreSQL
- Real-time comment notifications

Concerns:
- WebSocket scaling can get tricky with multiple server instances — may need Redis pub/sub or sticky sessions
```

```text
[Task] Shape emerging
- Prep notification requirements (completed)
- Explore delivery mechanisms (in_progress)
- Clarify scale and persistence (pending)
- Deliver implementation plan (pending)
```

**Q2**: What scale are you expecting?

*Why it matters — affects architecture complexity significantly*

```text
[EnterPlanMode]
1. Small (< 1k users) [★] — single server, simple WebSockets *start here, scale later*
2. Medium (1k-50k users) — needs Redis pub/sub for multi-server
3. Large (50k+ users) — dedicated service (Pusher, Ably, or self-hosted)
5. Something else — different constraints
```

</claude>
</turn>

<turn>
<user>

We're small now but hoping to grow. Can we just get something working? I can come back for scaling later.

</user>
<claude>

```text
Makes sense — ship something simple, optimize when needed.

▓▓▓░░ Charting

△ This assumes single-server deployment works for now — if you're already multi-instance, we'd need Redis pub/sub from the start. Clarify now, note for later, or proceed?
```

</claude>
</turn>

<turn>
<user>

Single server for now, let's proceed

</user>
<claude>

```text
Good — simple path forward.

▓▓▓▓░ Mapped

Assumptions:
- Single server deployment
- Web only (no mobile push for now)
- Basic notification (no persistence/history initially)

Unknowns:
- Want notification persistence (history, read/unread)?

Decisions:
- Socket.io on Node.js (simplest for Express)
- Single-server architecture
- Real-time comment notifications

Concerns:
- No persistence means notifications lost on refresh — might frustrate users
```

```text
[Task] Getting close
- Prep notification requirements (completed)
- Explore delivery mechanisms (completed)
- Clarify scale and persistence (in_progress)
- Deliver implementation plan (pending)
```

**Q3**: Should notifications persist? (history, read/unread state)

*Why it matters — affects database schema and UX significantly*

```text
[EnterPlanMode]
1. No persistence — real-time only, notifications disappear on refresh
2. Basic persistence [★] — store in DB, show unread count *better UX, moderate effort*
3. Full history — notification center, mark as read, pagination
5. Something else — different approach
```

</claude>
</turn>

<turn>
<user>

Actually, can you just give me what you have? I need to ship something today and can iterate.

</user>
<claude>

```text
Understood — shipping now, iterating later.

▓▓▓░░ Charting → Deliver (early)

Skipping to delivery at level 3. Including caveats for what's unresolved.
```

```text
[Task] Early delivery — shipping with caveats
- Prep notification requirements (completed)
- Explore delivery mechanisms (completed)
- Clarify scale and persistence (completed)
- Deliver implementation plan (in_progress)
```

## Real-Time Notifications — MVP Plan

**Architecture**:

```text
┌─────────┐     WebSocket      ┌─────────────┐
│  React  │◄──────────────────►│   Express   │
│ Client  │                    │  + Socket.io│
└─────────┘                    └──────┬──────┘
                                      │
                               ┌──────▼──────┐
                               │ PostgreSQL  │
                               │  (comments) │
                               └─────────────┘
```

**Server Setup** (add to existing Express app):

```typescript
// server.ts
import { Server } from 'socket.io';
import { createServer } from 'http';

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL }
});

// Track connected users
const userSockets = new Map<string, string>(); // userId -> socketId

io.on('connection', (socket) => {
  const userId = socket.handshake.auth.userId;
  userSockets.set(userId, socket.id);

  socket.on('disconnect', () => {
    userSockets.delete(userId);
  });
});

// Export for use in routes
export { io, userSockets };
```

**Emit on Comment Creation**:

```typescript
// routes/comments.ts
import { io, userSockets } from '../server';

app.post('/posts/:postId/comments', async (req, res) => {
  const comment = await createComment(req.body);
  const post = await getPost(req.params.postId);

  // Notify post author (if not self-comment)
  if (post.authorId !== req.user.id) {
    const socketId = userSockets.get(post.authorId);
    if (socketId) {
      io.to(socketId).emit('notification', {
        type: 'comment',
        postId: post.id,
        commentId: comment.id,
        fromUser: req.user.name,
        message: `${req.user.name} commented on your post`
      });
    }
  }

  res.json(comment);
});
```

**React Client**:

```typescript
// hooks/useNotifications.ts
import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'your-toast-library';

export function useNotifications(userId: string) {
  useEffect(() => {
    const socket = io(process.env.REACT_APP_API_URL, {
      auth: { userId }
    });

    socket.on('notification', (data) => {
      toast(data.message);
      // Could also update a notification count in state
    });

    return () => { socket.disconnect(); };
  }, [userId]);
}
```

**Next Steps**:

1. `npm install socket.io` (server) and `socket.io-client` (client)
2. Add Socket.io to your Express server
3. Wire up comment creation to emit notifications
4. Add `useNotifications` hook to your app root

---

## △ Caveats

**Open questions**:
- Notification persistence — currently lost on refresh
- Mobile push — not addressed, would need separate implementation

**Assumed decisions**:
- Single server deployment — will break with multiple instances
- No read/unread tracking — no notification history
- Toast-only UI — no notification center

**Known concerns**:
- User might miss notifications if offline when sent
- No retry mechanism for failed deliveries
- Socket reconnection handling is minimal

**Deferred items**:
- Redis pub/sub for multi-server (when you scale)
- Notification persistence in PostgreSQL (soon — improves UX)
- Mobile push notifications (when you add mobile app)
- Notification preferences (mute, frequency)

```text
[Task] Done — shipped with caveats
- Prep notification requirements (completed)
- Explore delivery mechanisms (completed)
- Clarify scale and persistence (completed)
- Deliver implementation plan (completed)
```

Shipped — MVP real-time notifications ready to go. Come back when you need persistence or scaling.

</claude>
</turn>
