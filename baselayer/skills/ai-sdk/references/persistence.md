# Chat Persistence

Strategies for persisting chat messages with AI SDK v6.

## Core Principle

**Persist `UIMessage[]`, convert to `ModelMessage[]` only at call sites.**

```typescript
// Database stores UIMessage format
const chat = await loadChat(chatId); // Returns UIMessage[]

// Convert only when calling the model
const result = streamText({
  model: openai('gpt-4o'),
  messages: convertToModelMessages(chat.messages),
});
```

## Server-Side Persistence

### onFinish Callback

```typescript
import { streamText, createIdGenerator } from 'ai';

export async function POST(req: Request) {
  const { messages, chatId } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse({
    originalMessages: messages,

    // Generate stable, server-side message IDs
    generateMessageId: createIdGenerator({ prefix: 'msg', size: 16 }),

    // Persist after stream completes
    onFinish: async ({ messages: completeMessages }) => {
      await db.chat.upsert({
        where: { id: chatId },
        update: { messages: completeMessages, updatedAt: new Date() },
        create: { id: chatId, messages: completeMessages },
      });
    },
  });
}
```

### Survive Client Disconnects

Call `consumeStream()` to ensure the stream completes even if the client disconnects:

```typescript
const result = streamText({
  model: openai('gpt-4o'),
  messages: convertToModelMessages(messages),
});

// Start consuming immediately (runs in background)
result.consumeStream();

return result.toUIMessageStreamResponse({
  originalMessages: messages,
  onFinish: async ({ messages }) => {
    await saveChat(chatId, messages);
  },
});
```

## Database Schema

### Drizzle Example

```typescript
import { pgTable, text, jsonb, timestamp, uuid } from 'drizzle-orm/pg-core';

export const chats = pgTable('chats', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  title: text('title'),
  messages: jsonb('messages').$type<UIMessage[]>().notNull().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

### Prisma Example

```prisma
model Chat {
  id        String   @id @default(cuid())
  userId    String
  title     String?
  messages  Json     @default("[]")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
}
```

## Loading Chats

```typescript
// API route to load chat
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const chat = await db.chat.findUnique({
    where: { id: params.id },
  });

  if (!chat) {
    return new Response('Not found', { status: 404 });
  }

  return Response.json({
    id: chat.id,
    messages: chat.messages as UIMessage[],
  });
}
```

```tsx
// Client-side loading
'use client';
import { useChat } from '@ai-sdk/react';
import { useEffect, useState } from 'react';

function Chat({ chatId }: { chatId: string }) {
  const [initialMessages, setInitialMessages] = useState<UIMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/chats/${chatId}`)
      .then((res) => res.json())
      .then((data) => {
        setInitialMessages(data.messages);
        setLoading(false);
      });
  }, [chatId]);

  const { messages, sendMessage } = useChat({
    id: chatId,
    messages: initialMessages,
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  });

  if (loading) return <div>Loading...</div>;

  return <ChatUI messages={messages} onSend={sendMessage} />;
}
```

## Bandwidth Optimization

Send only the last message, load history server-side:

```typescript
// Client: Send only new message
const { sendMessage } = useChat({
  transport: new DefaultChatTransport({
    api: '/api/chat',
    prepareSendMessagesRequest: ({ id, messages }) => ({
      body: {
        chatId: id,
        message: messages.at(-1) // Only send last message
      },
    }),
  }),
});

// Server: Load history from database
export async function POST(req: Request) {
  const { chatId, message } = await req.json();

  // Load existing messages from database
  const chat = await db.chat.findUnique({ where: { id: chatId } });
  const messages = [...(chat?.messages ?? []), message];

  const result = streamText({
    model: openai('gpt-4o'),
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    onFinish: async ({ messages }) => {
      await db.chat.update({
        where: { id: chatId },
        data: { messages },
      });
    },
  });
}
```

## Resumable Streams

Resume interrupted streams on page reload:

```tsx
function Chat({ chatId }: { chatId: string }) {
  const { messages, resumeStream, status } = useChat({
    id: chatId,
    messages: initialMessages,
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  });

  // Resume on mount if there's an incomplete stream
  useEffect(() => {
    const lastMessage = messages.at(-1);
    if (lastMessage?.role === 'assistant' && status === 'ready') {
      // Check if message seems incomplete
      resumeStream();
    }
  }, []);

  return (
    <div>
      {/* ... */}
      {status === 'streaming' && <div>AI is typing...</div>}
      <button onClick={() => resumeStream()}>Resume</button>
    </div>
  );
}
```

## Migration from v4/v5

If migrating existing data, use the dual-write pattern:

1. Create new `messages_v6` table
2. Dual-write to both tables
3. Run background migration
4. Switch reads to v6 schema
5. Remove dual-write
6. Drop old table

See [AI SDK Migration Guide](https://sdk.vercel.ai/docs/migration-guides) for detailed steps.

## Best Practices

**Persistence:**
- Always use `onFinish` for reliable persistence
- Generate server-side message IDs for consistency
- Use `consumeStream()` to complete streams even on disconnect

**Performance:**
- Index by userId for user-specific queries
- Consider pagination for long conversations
- Use bandwidth optimization for mobile clients

**Reliability:**
- Handle concurrent updates with optimistic locking
- Implement retry logic for database failures
- Log persistence errors for debugging
