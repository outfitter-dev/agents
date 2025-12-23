---
name: ai-sdk
version: 1.0.0
description: |
  Vercel AI SDK v6 patterns for streaming chat, structured outputs, agents, and tool workflows.
  Load when building AI-powered features with Next.js, React, or Node.js.
triggers:
  - ai sdk
  - vercel ai
  - streaming chat
  - useChat
  - streamText
  - generateObject
  - ToolLoopAgent
  - tool approval
---

# Vercel AI SDK v6

Patterns for building AI-powered applications with the Vercel AI SDK v6.

<when_to_use>

- Building streaming chat UIs
- Structured JSON outputs with Zod schemas
- Multi-step agent workflows with tools
- Tool approval flows (human-in-the-loop)
- Next.js App Router integrations

</when_to_use>

## Version Guard

Target **AI SDK 6.x** APIs. Default packages:

```
ai@^6
@ai-sdk/react@^2
@ai-sdk/openai@^2 (or @ai-sdk/anthropic, etc.)
zod@^3
```

**Avoid v4/v5 holdovers:**
- `StreamingTextResponse` → use `result.toUIMessageStreamResponse()`
- Legacy `Message` shape → use `UIMessage`
- Input-managed `useChat` → use transport-based pattern

## Core Concepts

### Message Types

| Type | Purpose | When to Use |
|------|---------|-------------|
| `UIMessage` | User-facing, persistence | Store in database, render in UI |
| `ModelMessage` | LLM-compatible | Convert at call sites only |

**Rule:** Persist `UIMessage[]`. Convert to `ModelMessage[]` only when calling the model.

### Streaming Patterns

| Function | Use Case |
|----------|----------|
| `streamText` | Streaming text responses |
| `generateText` | Non-streaming text |
| `streamObject` | Streaming JSON with partial updates |
| `generateObject` | Non-streaming JSON |
| `ToolLoopAgent` | Multi-step agent with tools |

## Golden Path: Streaming Chat

### API Route (App Router)

```typescript
// app/api/chat/route.ts
import { openai } from '@ai-sdk/openai';
import { streamText, convertToModelMessages, type UIMessage } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: openai('gpt-4o-mini'),
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    getErrorMessage: (e) =>
      e instanceof Error ? e.message : 'An error occurred',
  });
}
```

### Client Hook

```tsx
'use client';
import { useState } from 'react';
import { useChat, type UIMessage } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';

export function Chat({ initialMessages = [] }: { initialMessages?: UIMessage[] }) {
  const [input, setInput] = useState('');

  const { messages, sendMessage, status, error } = useChat({
    messages: initialMessages,
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage({ role: 'user', content: [{ type: 'text', text: input }] });
      setInput('');
    }
  };

  return (
    <div>
      {messages.map((m) => (
        <div key={m.id}>
          <b>{m.role === 'user' ? 'You' : 'AI'}:</b>
          {m.parts.map((p, i) => (p.type === 'text' ? <span key={i}>{p.text}</span> : null))}
        </div>
      ))}
      {status === 'error' && <div className="text-red-600">{error?.message}</div>}
      <form onSubmit={submit}>
        <input value={input} onChange={(e) => setInput(e.target.value)} />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
```

## Structured Outputs

```typescript
import { generateObject, streamObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const schema = z.object({
  recipe: z.object({
    name: z.string(),
    ingredients: z.array(z.string()),
    steps: z.array(z.string()),
  }),
});

// One-shot JSON
const { object } = await generateObject({
  model: openai('gpt-4o'),
  schema,
  prompt: 'Generate a lasagna recipe.',
});

// Streaming JSON (partial updates)
const { partialObjectStream } = streamObject({
  model: openai('gpt-4o'),
  schema,
  prompt: 'Generate a lasagna recipe.',
});

for await (const partial of partialObjectStream) {
  // Render progressively
}
```

## Tools

### Server-Side Tool Definition

```typescript
import { tool } from 'ai';
import { z } from 'zod';

const searchTool = tool({
  description: 'Search product catalog',
  inputSchema: z.object({ query: z.string() }),
  execute: async ({ query }) => {
    // Implementation
    return [{ id: 'p1', name: 'Example Product' }];
  },
});
```

### Multi-Step Tool Loops

```typescript
import { streamText, stepCountIs } from 'ai';

const result = streamText({
  model: openai('gpt-4o'),
  messages: convertToModelMessages(messages),
  tools: { search: searchTool },
  stopWhen: stepCountIs(6), // Max 6 iterations
  prepareStep: async ({ stepNumber, messages }) =>
    messages.length > 10 ? { messages: messages.slice(-10) } : {},
});

return result.toUIMessageStreamResponse();
```

## v6: ToolLoopAgent

First-class agent abstraction for autonomous multi-step workflows.

### Basic Agent

```typescript
import { ToolLoopAgent, stepCountIs } from 'ai';

const agent = new ToolLoopAgent({
  model: 'anthropic/claude-sonnet-4.5',
  instructions: 'You are a helpful research assistant.',
  tools: {
    search: searchTool,
    calculator: calculatorTool,
  },
  stopWhen: stepCountIs(5),
});

// Non-streaming
const result = await agent.generate({
  prompt: 'What is the weather in NYC?',
});
console.log(result.text);
console.log(result.steps); // All steps taken

// Streaming
const stream = agent.stream({ prompt: 'Research quantum computing.' });
for await (const chunk of stream.textStream) {
  process.stdout.write(chunk);
}
```

### Agent with UI Streaming

```typescript
import { ToolLoopAgent, createAgentUIStream } from 'ai';

const agent = new ToolLoopAgent({ model, instructions, tools });

const stream = await createAgentUIStream({
  agent,
  messages: [{ role: 'user', content: 'What is the weather?' }],
});

for await (const chunk of stream) {
  // UI message chunks
}
```

## v6: Tool Approval (Human-in-the-Loop)

### Static Approval (Always Require)

```typescript
const dangerousTool = tool({
  description: 'Delete user data',
  inputSchema: z.object({ userId: z.string() }),
  needsApproval: true, // Always require approval
  execute: async ({ userId }) => {
    return await deleteUserData(userId);
  },
});
```

### Dynamic Approval (Conditional)

```typescript
const paymentTool = tool({
  description: 'Process payment',
  inputSchema: z.object({
    amount: z.number(),
    recipient: z.string(),
  }),
  needsApproval: async ({ amount }) => amount > 1000, // Only large transactions
  execute: async ({ amount, recipient }) => {
    return await processPayment(amount, recipient);
  },
});
```

### Client-Side Approval UI

```tsx
function ToolApprovalView({ invocation, addToolApprovalResponse }) {
  if (invocation.state === 'approval-requested') {
    return (
      <div>
        <p>Approve action: {invocation.input.description}?</p>
        <button
          onClick={() =>
            addToolApprovalResponse({ id: invocation.approval.id, approved: true })
          }
        >
          Approve
        </button>
        <button
          onClick={() =>
            addToolApprovalResponse({ id: invocation.approval.id, approved: false })
          }
        >
          Deny
        </button>
      </div>
    );
  }

  if (invocation.state === 'output-available') {
    return <div>Result: {JSON.stringify(invocation.output)}</div>;
  }

  return null;
}
```

## Persistence

```typescript
return result.toUIMessageStreamResponse({
  originalMessages: messages,
  generateMessageId: createIdGenerator({ prefix: 'msg', size: 16 }),
  onFinish: async ({ messages: complete }) => {
    await saveChat({ chatId, messages: complete }); // Persist UIMessage[]
  },
});
```

## Error Handling

```typescript
// Server: Surface errors to client
return result.toUIMessageStreamResponse({
  getErrorMessage: (e) =>
    e instanceof Error ? e.message : typeof e === 'string' ? e : JSON.stringify(e),
});

// Client: Handle error state
const { status, error } = useChat({ ... });
if (status === 'error') {
  return <div>Error: {error?.message}</div>;
}
```

## Anti-Patterns

| Avoid | Use Instead |
|-------|-------------|
| `StreamingTextResponse` | `result.toUIMessageStreamResponse()` |
| Persisting `ModelMessage` | Persist `UIMessage[]` |
| Unbounded tool loops | `stopWhen: stepCountIs(N)` |
| Client-only state for long sessions | Add persistence + resumable streams |
| `any` types | Zod schemas + typed `UIMessage` |

<references>

- [agents.md](references/agents.md) - ToolLoopAgent patterns and workflows
- [tool-approval.md](references/tool-approval.md) - Human-in-the-loop approval flows
- [persistence.md](references/persistence.md) - Chat persistence strategies

</references>
