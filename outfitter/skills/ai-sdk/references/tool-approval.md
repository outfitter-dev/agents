# Tool Approval (Human-in-the-Loop)

v6 patterns for requiring user approval before tool execution.

## When to Use

| Scenario | Approval Type |
|----------|---------------|
| Always dangerous (delete, payment) | Static: `needsApproval: true` |
| Conditionally risky (large amounts) | Dynamic: `needsApproval: async (args) => boolean` |
| User preference | Dynamic based on user settings |

## Static Approval

Tool always requires approval:

```typescript
import { tool } from 'ai';
import { z } from 'zod';

const deleteUserTool = tool({
  description: 'Permanently delete a user account',
  inputSchema: z.object({
    userId: z.string(),
    reason: z.string(),
  }),
  needsApproval: true, // Always require
  execute: async ({ userId, reason }) => {
    await deleteUser(userId, reason);
    return { success: true };
  },
});
```

## Dynamic Approval

Approval based on input:

```typescript
const paymentTool = tool({
  description: 'Process a payment',
  inputSchema: z.object({
    amount: z.number(),
    recipient: z.string(),
    currency: z.string().default('USD'),
  }),
  needsApproval: async ({ amount }) => amount > 1000,
  execute: async ({ amount, recipient, currency }) => {
    return await processPayment(amount, recipient, currency);
  },
});
```

## Complex Approval Logic

```typescript
const externalApiTool = tool({
  description: 'Call external API',
  inputSchema: z.object({
    endpoint: z.string(),
    method: z.enum(['GET', 'POST', 'DELETE']),
    body: z.any().optional(),
  }),
  needsApproval: async ({ method, endpoint }) => {
    // Approve all non-GET requests
    if (method !== 'GET') return true;

    // Approve requests to sensitive endpoints
    if (endpoint.includes('/admin')) return true;

    // No approval needed for safe reads
    return false;
  },
  execute: async ({ endpoint, method, body }) => {
    return await fetch(endpoint, { method, body: JSON.stringify(body) });
  },
});
```

## Client-Side Handling

### useChat with Approval

```tsx
'use client';
import { useChat } from '@ai-sdk/react';

function Chat() {
  const { messages, sendMessage, addToolApprovalResponse } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  });

  return (
    <div>
      {messages.map((message) => (
        <Message
          key={message.id}
          message={message}
          onApprove={(id) => addToolApprovalResponse({ id, approved: true })}
          onDeny={(id) => addToolApprovalResponse({ id, approved: false })}
        />
      ))}
    </div>
  );
}
```

### Approval UI Component

```tsx
function ToolInvocation({ invocation, onApprove, onDeny }) {
  switch (invocation.state) {
    case 'approval-requested':
      return (
        <div className="border rounded p-4 bg-yellow-50">
          <h4 className="font-bold">Approval Required</h4>
          <p>Tool: {invocation.toolName}</p>
          <pre className="text-sm bg-gray-100 p-2 rounded">
            {JSON.stringify(invocation.input, null, 2)}
          </pre>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => onApprove(invocation.approval.id)}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Approve
            </button>
            <button
              onClick={() => onDeny(invocation.approval.id)}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Deny
            </button>
          </div>
        </div>
      );

    case 'pending':
      return <div className="text-gray-500">Waiting for tool execution...</div>;

    case 'output-available':
      return (
        <div className="border rounded p-4 bg-green-50">
          <h4 className="font-bold">Tool Result</h4>
          <pre className="text-sm">{JSON.stringify(invocation.output, null, 2)}</pre>
        </div>
      );

    default:
      return null;
  }
}
```

### Rendering Tool Parts in Messages

```tsx
function Message({ message, onApprove, onDeny }) {
  return (
    <div>
      {message.parts.map((part, i) => {
        if (part.type === 'text') {
          return <p key={i}>{part.text}</p>;
        }

        if (part.type === 'tool-invocation') {
          return (
            <ToolInvocation
              key={i}
              invocation={part}
              onApprove={onApprove}
              onDeny={onDeny}
            />
          );
        }

        return null;
      })}
    </div>
  );
}
```

## Server-Side Processing

For complex approval workflows with server-side tool execution:

```typescript
import { processToolCalls } from './tool-processor';

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Check for pending approvals
  const lastMessage = messages.at(-1);
  const hasPendingApprovals = lastMessage?.parts?.some(
    (p) => p.type === 'tool-invocation' && p.state === 'output-available'
  );

  if (hasPendingApprovals) {
    // Process approved tools
    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        const processed = await processToolCalls({
          writer,
          messages,
          tools: myTools,
        }, toolExecuteFunctions);

        // Continue conversation with tool results
        const result = streamText({
          model: openai('gpt-4o'),
          messages: convertToModelMessages(processed),
        });

        writer.merge(result.toUIMessageStream());
      },
      originalMessages: messages,
    });

    return createUIMessageStreamResponse({ stream });
  }

  // Normal flow
  const result = streamText({
    model: openai('gpt-4o'),
    messages: convertToModelMessages(messages),
    tools: myTools,
  });

  return result.toUIMessageStreamResponse({ originalMessages: messages });
}
```

## Best Practices

**Security:**
- Always require approval for destructive operations
- Use dynamic approval for operations with varying risk levels
- Log all approval decisions for audit trails

**UX:**
- Show clear context for what the tool will do
- Display input parameters so users can make informed decisions
- Provide cancel/timeout options for pending approvals

**Error Handling:**
- Handle denied approvals gracefully
- Provide alternative actions when tools are denied
- Don't retry denied tools automatically
